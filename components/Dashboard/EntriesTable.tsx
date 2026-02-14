import { PortfolioEntry } from "@/types";
import { format, parseISO } from "date-fns";
import { ArrowDown, ArrowUp, Trash2, Pencil } from "lucide-react";

interface EntriesTableProps {
    entries: PortfolioEntry[];
    onDelete: (id: string) => void;
    onEdit?: (entry: PortfolioEntry) => void;
    limit?: number;
}

export function EntriesTable({ entries, onDelete, onEdit, limit }: EntriesTableProps) {
    // Sort descending by date
    const sortedEntries = [...entries].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const displayedEntries = limit ? sortedEntries.slice(0, limit) : sortedEntries;

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-950 text-gray-200 uppercase font-medium border-b border-gray-800">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Total Equity</th>
                            <th className="px-6 py-4 text-right">Net Inflow</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {displayedEntries.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No entries found. start by adding a snapshot.
                                </td>
                            </tr>
                        ) : (
                            displayedEntries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">
                                        {format(parseISO(entry.date), 'MMMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-200">
                                        €{entry.equity.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center gap-1 ${entry.netInflow > 0 ? 'text-emerald-400' :
                                            entry.netInflow < 0 ? 'text-red-400' : 'text-gray-400'
                                            }`}>
                                            {entry.netInflow > 0 ? '+' : ''}
                                            €{entry.netInflow.toLocaleString()}
                                            {entry.netInflow > 0 && <ArrowUp size={14} />}
                                            {entry.netInflow < 0 && <ArrowDown size={14} />}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(entry)}
                                                className="text-gray-500 hover:text-blue-400 transition-colors p-1"
                                                title="Edit Entry"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onDelete(entry.id)}
                                            className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                            title="Delete Entry"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
