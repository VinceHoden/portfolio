"use client";

import { useState, useEffect, useMemo } from 'react';
import { PortfolioEntry, ProjectionParams } from '@/types';
import { calculateXIRR } from '@/lib/finance';
import { storage } from '@/lib/storage';

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
        const load = async () => {
            const loadedEntries = storage.loadEntries();
            const loadedParams = storage.loadProjectionParams();

            setEntries(loadedEntries);
            if (loadedParams) {
                setProjectionParams(loadedParams);
            }
            setIsLoaded(true);
        };
        load();
    }, []);

    const saveSettings = async (newParams: ProjectionParams) => {
        storage.saveProjectionParams(newParams);
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
        // Generate an ID if one isn't provided, since we are purely client side now
        const entryWithId = { ...entry, id: entry.id || crypto.randomUUID() };

        setEntries(prev => {
            const newEntries = [...prev, entryWithId].sort((a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            storage.saveEntries(newEntries);
            return newEntries;
        });
    };

    const removeEntry = async (id: string) => {
        setEntries(prev => {
            const newEntries = prev.filter(e => e.id !== id);
            storage.saveEntries(newEntries);
            return newEntries;
        });
    };

    const updateEntry = async (updated: PortfolioEntry) => {
        setEntries(prev => {
            const newEntries = prev.map(e => e.id === updated.id ? updated : e)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            storage.saveEntries(newEntries);
            return newEntries;
        });
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
