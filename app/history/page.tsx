"use client";

import { usePortfolio } from "@/hooks/usePortfolio";
import { AppLayout } from "@/components/Layout/AppLayout";
import { EntriesTable } from "@/components/Dashboard/EntriesTable";
import { AddEntryForm } from "@/components/Dashboard/AddEntryForm";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { PortfolioEntry } from "@/types";

export default function HistoryPage() {
    const { entries, addEntry, removeEntry, updateEntry } = usePortfolio();
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<PortfolioEntry | undefined>(undefined);

    const handleEditEntry = (entry: PortfolioEntry) => {
        setEditingEntry(entry);
        setIsAddEntryOpen(true);
    };

    const handleSaveEntry = (entry: PortfolioEntry) => {
        if (editingEntry) {
            updateEntry(entry);
        } else {
            addEntry(entry);
        }
        setEditingEntry(undefined);
        setIsAddEntryOpen(false);
    };

    const handleCloseEntryForm = () => {
        setEditingEntry(undefined);
        setIsAddEntryOpen(false);
    };

    // Filtered Entries
    const filteredEntries = useMemo(() => {
        return entries.filter(entry =>
            entry.date.includes(searchTerm) ||
            entry.equity.toString().includes(searchTerm)
        );
    }, [entries, searchTerm]);

    // Yearly Breakdown Calculation
    const yearlyStats = useMemo(() => {
        const stats: Record<string, { start: number, end: number, invested: number, gain: number }> = {};

        // entries are already sorted chronologically
        const sorted = entries;

        // Group by year
        const entriesByYear: Record<string, typeof entries> = {};
        sorted.forEach(e => {
            const y = e.date.substring(0, 4);
            if (!entriesByYear[y]) entriesByYear[y] = [];
            entriesByYear[y].push(e);
        });

        const years = Object.keys(entriesByYear).sort();

        let previousYearEndEquity = 0;

        years.forEach(year => {
            const yearEntries = entriesByYear[year];
            const endEquity = yearEntries[yearEntries.length - 1].equity;
            const netInvested = yearEntries.reduce((sum, e) => sum + e.netInflow, 0);

            // Gain = (End - Start) - Net Inflow
            const gain = (endEquity - previousYearEndEquity) - netInvested;

            stats[year] = {
                start: previousYearEndEquity,
                end: endEquity,
                invested: netInvested,
                gain: gain
            };

            previousYearEndEquity = endEquity;
        });

        return Object.entries(stats).sort((a, b) => b[0].localeCompare(a[0])); // Descending years
    }, [entries]);

    const downloadCSV = () => {
        const headers = ["Date,Equity,Net Inflow"];
        const rows = entries.map(e => `${e.date},${e.equity},${e.netInflow}`);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "portfolio_history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AppLayout onAddEntry={() => { setEditingEntry(undefined); setIsAddEntryOpen(true); }}>
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">History</h1>
                        <p className="text-gray-400 mt-1">Full ledger of your portfolio snapshots.</p>
                    </div>
                    <button
                        onClick={downloadCSV}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors self-start md:self-auto"
                    >
                        <Download size={18} /> Download CSV
                    </button>
                </div>

                {/* Yearly Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {yearlyStats.map(([year, stat]) => (
                        <div key={year} className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
                            <h3 className="text-lg font-semibold text-white mb-2">{year}</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Net Invested</span>
                                    <span className="text-white">€{stat.invested.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Market Gain/Loss</span>
                                    <span className={`${stat.gain >= 0 ? 'text-emerald-400' : 'text-red-400'} font-medium`}>
                                        {stat.gain >= 0 ? '+' : ''}€{stat.gain.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-gray-800 pt-2 mt-2">
                                    <span className="text-gray-400">Year End Equity</span>
                                    <span className="text-white font-bold">€{stat.end.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Full Ledger */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">All Entries</h2>
                        <input
                            type="text"
                            placeholder="Search by date..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-900 border border-gray-800 text-white px-4 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <EntriesTable
                        entries={filteredEntries}
                        onDelete={removeEntry}
                        onEdit={handleEditEntry}
                    />
                </div>
            </div>

            <AddEntryForm
                isOpen={isAddEntryOpen}
                onClose={handleCloseEntryForm}
                onSave={handleSaveEntry}
                initialData={editingEntry}
            />
        </AppLayout>
    );
}
