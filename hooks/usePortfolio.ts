"use client";

import { useState, useEffect, useMemo } from 'react';
import { PortfolioEntry, ProjectionParams } from '@/types';
import * as storage from '@/lib/storage';
import { calculateXIRR } from '@/lib/finance';

const DEFAULT_PROJECTION_PARAMS: ProjectionParams = {
    annualReturn: 7,
    monthlyContribution: 1000,
    years: 10,
    inflationRate: 2.5, // Default inflation assumption
};

export function usePortfolio() {
    const [entries, setEntries] = useState<PortfolioEntry[]>(() => storage.loadEntries());
    const [projectionParams, setProjectionParams] = useState<ProjectionParams>(() => {
        const loadedParams = storage.loadProjectionParams();
        return loadedParams ?? DEFAULT_PROJECTION_PARAMS;
    });
    const isLoaded = true;

    // Persist data on change
    useEffect(() => {
        if (isLoaded) {
            storage.saveEntries(entries);
        }
    }, [entries, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            storage.saveProjectionParams(projectionParams);
        }
    }, [projectionParams, isLoaded]);

    const addEntry = (entry: PortfolioEntry) => {
        setEntries(prev => {
            const newEntries = [...prev, entry].sort((a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            return newEntries;
        });
    };

    const removeEntry = (id: string) => {
        setEntries(prev => prev.filter(e => e.id !== id));
    };

    const updateEntry = (updated: PortfolioEntry) => {
        setEntries(prev => prev.map(e => e.id === updated.id ? updated : e)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        );
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

        // Sort just in case
        const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
