"use client";

import { useState } from 'react';
import { PortfolioEntry } from '@/types';
import { X } from 'lucide-react';

interface AddEntryFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: PortfolioEntry) => void;
    initialData?: PortfolioEntry;
}

export function AddEntryForm({ isOpen, onClose, onSave, initialData }: AddEntryFormProps) {
    const [date, setDate] = useState(() => initialData?.date ?? new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
    const [equity, setEquity] = useState(() => initialData?.equity.toString() ?? '');
    const [netInflow, setNetInflow] = useState(() => initialData?.netInflow.toString() ?? '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !equity || !netInflow) return;

        const newEntry: PortfolioEntry = {
            id: initialData ? initialData.id : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36)),
            date,
            equity: parseFloat(equity),
            netInflow: parseFloat(netInflow),
        };

        // Basic validation before saving
        if (parseFloat(equity) < 0) {
            if (!confirm("You are entering a negative equity value. Are you sure?")) return;
        }

        onSave(newEntry);

        // Reset form
        if (!initialData) {
            setEquity('');
            setNetInflow('');
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-xl shadow-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">
                    {initialData ? 'Edit Monthly Snapshot' : 'Add Monthly Snapshot'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Total Equity</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">€</span>
                            <input
                                type="number"
                                step="0.01"
                                required
                                placeholder="0.00"
                                value={equity}
                                onChange={(e) => setEquity(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Current total value of your portfolio</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Net Inflow</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">€</span>
                            <input
                                type="number"
                                step="0.01"
                                required
                                placeholder="0.00"
                                value={netInflow}
                                onChange={(e) => setNetInflow(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Deposits (+) or Withdrawals (-) this month</p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-800 text-gray-300 py-2 rounded-lg font-medium hover:bg-gray-700 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            {initialData ? 'Update Entry' : 'Save Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
