"use client";

import { useState, useEffect, useMemo } from 'react';
import { PortfolioEntry, ProjectionParams } from '@/types';
import { calculateXIRR } from '@/lib/finance';

const DEFAULT_PROJECTION_PARAMS: ProjectionParams = {
    annualReturn: 7,
    monthlyContribution: 1000,
    years: 10,
    inflationRate: 2.5, // Default inflation assumption
};

export function usePortfolio() {
    const [entries, setEntries] = useState<PortfolioEntry[]>([]);
    const [projectionParams, setProjectionParams] = useState<ProjectionParams>(DEFAULT_PROJECTION_PARAMS);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load data on mount - ensure this runs only on client to match server HTML (empty initially)
    useEffect(() => {
        const loadedEntries = storage.loadEntries();
        const loadedParams = storage.loadProjectionParams();

        setEntries(loadedEntries);
        if (loadedParams) {
            setProjectionParams(loadedParams);
        }
        setIsLoaded(true);
    }, []);

    // Persist data on change
    // Note: In a real app, we might want to debounce these or only save on explicit actions (like "Save" button or blur)
    // For now, we'll keep the auto-save behavior but debounce it slightly essentially by relying on the add/remove functions to trigger updates.
    // However, the original code used useEffect to save *whenever* state changed.
    // To match that with an API, we should probably only trigger API calls in the modifier functions (addEntry, etc.) 
    // rather than watching state, to avoid effect loops. 
    // BUT, for `projectionParams` (settings), valid updates usually come from the settings page inputs.
    // Let's implement specific savers.

    const saveSettings = async (newParams: ProjectionParams) => {
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newParams),
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    // Watch projectionParams for changes and save (debounce could be added here if needed)
    useEffect(() => {
        if (isLoaded) {
            const timeoutId = setTimeout(() => {
                saveSettings(projectionParams);
            }, 500); // 500ms debounce
            return () => clearTimeout(timeoutId);
        }
    }, [projectionParams, isLoaded]);


    const addEntry = async (entry: PortfolioEntry) => {
        // Optimistic update
        setEntries(prev => {
            const newEntries = [...prev, entry].sort((a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            return newEntries;
        });

        try {
            const res = await fetch('/api/entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry),
            });
            if (res.ok) {
                const savedEntry = await res.json();
                // Update with server response (e.g. to get real ID if we generated a temp one, though we generate UUIDs client side mostly? 
                // Actually Prisma generates UUIDs. The frontend currently might generate IDs.
                // Let's trust the server ID.
                setEntries(prev => prev.map(e => e.id === entry.id ? savedEntry : e));
            }
        } catch (error) {
            console.error('Failed to add entry:', error);
            // Revert on failure? For now just log.
        }
    };

    const removeEntry = async (id: string) => {
        setEntries(prev => prev.filter(e => e.id !== id));
        try {
            await fetch(`/api/entries/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to delete entry:', error);
        }
    };

    const updateEntry = async (updated: PortfolioEntry) => {
        setEntries(prev => prev.map(e => e.id === updated.id ? updated : e)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        );
        try {
            await fetch(`/api/entries/${updated.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
            });
        } catch (error) {
            console.error('Failed to update entry:', error);
        }
    };

    // KPI Calculations
    const stats = useMemo(() => {
        if (entries.length === 0) {
            return {
                totalEquity: 0,
                netInvested: 0,
                totalReturn: 0,
                xirr: 0,
            };
        }

        // Entries are maintained in sorted chronological order
        const sortedEntries = entries;
        const lastEntry = sortedEntries[sortedEntries.length - 1];

        // Total Equity
        const totalEquity = lastEntry.equity;

        // Total Net Invested = Sum of all Net Inflows
        const netInvested = sortedEntries.reduce((sum, e) => sum + e.netInflow, 0);

        // Total Profit/Loss
        const totalReturn = totalEquity - netInvested;

        // XIRR Calculation
        // Cash Flows:
        // For each entry, we have a Net Inflow.
        // Inflow > 0 means we put money IN (Investment). XIRR requires Investment to be negative.
        // Inflow < 0 means we took money OUT (Withdrawal). XIRR requires Withdrawal to be positive.
        // So CashFlow = -1 * netInflow.

        // Terminal Value:
        // We treat the current Equity as if we withdrew it all today.
        // This happens at the date of the last entry.

        const xirrFlows = sortedEntries.map(e => ({
            amount: -e.netInflow,
            date: e.date
        }));

        // Add Terminal Value check
        // If the last entry has a net inflow, that flow is already in `xirrFlows`.
        // The EQUITY at that same date is the positive terminal value.
        // We can push a separate flow for the terminal value at the same date.

        xirrFlows.push({
            amount: totalEquity,
            date: lastEntry.date
        });

        // Remove 0 flows to optimize? No, keep dates.

        const xirr = calculateXIRR(xirrFlows);

        return {
            totalEquity,
            netInvested,
            totalReturn,
            xirr,
        };
    }, [entries]);

    return {
        entries,
        projectionParams,
        setProjectionParams,
        addEntry,
        removeEntry,
        updateEntry,
        stats,
        isLoaded
    };
}
