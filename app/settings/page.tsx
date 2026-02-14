"use client";

import { usePortfolio } from "@/hooks/usePortfolio";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Download, Upload, Trash2, Moon, Euro, Target } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const { entries, projectionParams, setProjectionParams } = usePortfolio();
    const [importData, setImportData] = useState("");

    const handleExport = () => {
        const dataStr = JSON.stringify({ entries, projectionParams }, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = () => {
        if (!importData) return;
        try {
            const data = JSON.parse(importData);
            if (data.entries && Array.isArray(data.entries)) {
                if (confirm("This will overwrite your current data. Are you sure?")) {
                    localStorage.setItem("portfolio_entries", JSON.stringify(data.entries));
                    if (data.projectionParams) {
                        localStorage.setItem("projection_params", JSON.stringify(data.projectionParams));
                    }
                    window.location.reload();
                }
            } else {
                alert("Invalid data format");
            }
        } catch {
            alert("Invalid JSON");
        }
    };

    const handleClearData = () => {
        if (confirm("ARE YOU SURE? This will permanently delete all your data.")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                    <p className="text-gray-400 mt-1">Configure your preferences and manage your data.</p>
                </div>

                <div className="grid gap-6">
                    {/* General Preferences */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Preferences</h2>
                        <div className="space-y-4">
                            {/* Goal Settings */}
                            <div className="p-4 bg-gray-950/50 rounded-lg space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-800 rounded-lg text-blue-400">
                                        <Target size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">Financial Freedom Goal</h3>
                                        <p className="text-sm text-gray-500">Set either a target amount OR a target retirement age.</p>
                                    </div>
                                </div>

                                {/* Option A: Monetary Target */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Target Portfolio Value</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">€</span>
                                        <input
                                            type="number"
                                            value={projectionParams.target || ''}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                setProjectionParams({
                                                    ...projectionParams,
                                                    target: val,
                                                    retirementAge: undefined, // Clear retirement age if target is set
                                                    currentAge: projectionParams.currentAge // Keep current age if desired, or clear? content says exclusive setting.
                                                });
                                            }}
                                            placeholder="e.g. 1000000"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                                            disabled={!!projectionParams.retirementAge}
                                        />
                                    </div>
                                    {projectionParams.retirementAge && (
                                        <p className="text-xs text-yellow-500">Clear retirement age to set a monetary target.</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-gray-600 text-sm font-medium before:h-px before:flex-1 before:bg-gray-800 after:h-px after:flex-1 after:bg-gray-800">
                                    OR
                                </div>

                                {/* Option B: Retirement Age */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Current Age</label>
                                        <input
                                            type="number"
                                            value={projectionParams.currentAge || ''}
                                            onChange={(e) => setProjectionParams({ ...projectionParams, currentAge: parseFloat(e.target.value) })}
                                            placeholder="e.g. 30"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Target Retirement Age</label>
                                        <input
                                            type="number"
                                            value={projectionParams.retirementAge || ''}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                setProjectionParams({
                                                    ...projectionParams,
                                                    retirementAge: val,
                                                    target: undefined // Clear target if retirement age is set
                                                });
                                            }}
                                            placeholder="e.g. 60"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                                            disabled={!!projectionParams.target}
                                        />
                                    </div>
                                </div>
                                {projectionParams.target && (
                                    <p className="text-xs text-yellow-500 text-center">Clear monetary target to set a retirement age.</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-950/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                                        <Euro size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">Currency</h3>
                                        <p className="text-sm text-gray-500">Currently set to Euro (€)</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Fixed (EUR)</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-950/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                                        <Moon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">Theme</h3>
                                        <p className="text-sm text-gray-500">Currently using Dark Mode</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Fixed (Dark)</span>
                            </div>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Data Management</h2>

                        <div className="space-y-6">
                            {/* Export */}
                            <div>
                                <h3 className="text-white font-medium mb-2">Export Data</h3>
                                <p className="text-sm text-gray-400 mb-3">Download a backup of your portfolio data (JSON).</p>
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Download size={18} /> Export Backup
                                </button>
                            </div>

                            <hr className="border-gray-800" />

                            {/* Import */}
                            <div>
                                <h3 className="text-white font-medium mb-2">Import Data</h3>
                                <p className="text-sm text-gray-400 mb-3">Paste your JSON backup data below to restore.</p>
                                <textarea
                                    value={importData}
                                    onChange={(e) => setImportData(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-gray-300 font-mono h-32 focus:ring-2 focus:ring-blue-600 outline-none mb-3"
                                    placeholder='Paste JSON here...'
                                />
                                <button
                                    onClick={handleImport}
                                    disabled={!importData}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Upload size={18} /> Restore Data
                                </button>
                            </div>

                            <hr className="border-gray-800" />

                            {/* Danger Zone */}
                            <div>
                                <h3 className="text-red-500 font-medium mb-2">Danger Zone</h3>
                                <p className="text-sm text-gray-400 mb-3">Permanently delete all local data. This cannot be undone.</p>
                                <button
                                    onClick={handleClearData}
                                    className="flex items-center gap-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-500 px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} /> Clear All Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
