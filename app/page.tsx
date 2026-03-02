"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/Layout/AppLayout';
import { KPICards } from '@/components/Dashboard/KPICards';
import { GrowthChart } from '@/components/Dashboard/GrowthChart';
import { ProjectionChart } from '@/components/Dashboard/ProjectionChart';
import { ProjectionControls } from '@/components/Dashboard/ProjectionControls';
import { EntriesTable } from '@/components/Dashboard/EntriesTable';
import { AddEntryForm } from '@/components/Dashboard/AddEntryForm';
import { usePortfolio } from '@/hooks/usePortfolio';
import { calculateProjection } from '@/lib/finance';
import { validatePortfolioData } from '@/lib/validation';
import { Plus } from 'lucide-react';

import { PortfolioEntry } from '@/types';

export default function DashboardPage() {
  const {
    entries,
    addEntry,
    removeEntry,
    updateEntry,
    stats,
    projectionParams,
    setProjectionParams,
    isLoaded
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<'history' | 'projection'>('history');
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

  // Calculate Projection Data on the fly
  const projectionData = useMemo(() => {
    // Current Principal = Current Total Equity
    const currentPrincipal = stats.totalEquity;

    return calculateProjection(
      currentPrincipal,
      projectionParams.monthlyContribution,
      projectionParams.annualReturn,
      projectionParams.years,
      projectionParams.inflationRate
    );
  }, [stats.totalEquity, projectionParams]);

  const validationResult = useMemo(() => validatePortfolioData(entries), [entries]);

  if (!isLoaded) return <div className="flex h-screen items-center justify-center text-gray-500">Loading portfolio...</div>;

  return (
    <AppLayout onAddEntry={() => { setEditingEntry(undefined); setIsAddEntryOpen(true); }}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-gray-400 mt-1">Track your net worth and forecast your financial freedom.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setEditingEntry(undefined); setIsAddEntryOpen(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors lg:hidden"
            >
              <Plus size={18} /> Add Entry
            </button>
          </div>
        </div>

        {/* Validation Alerts */}
        {validationResult.warnings.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-yellow-900/50 rounded text-yellow-500 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /></svg>
              </div>
              <div>
                <h4 className="text-yellow-500 font-medium text-sm">Data Integrity Check</h4>
                <ul className="list-disc list-inside text-sm text-yellow-400/80 mt-1 space-y-0.5">
                  {validationResult.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* KPIs */}
        <KPICards {...stats} projectionParams={projectionParams} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Charts Section (Left Col - Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'history'
                      ? 'bg-gray-700 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    History
                  </button>
                  <button
                    onClick={() => setActiveTab('projection')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'projection'
                      ? 'bg-gray-700 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    Projection
                  </button>
                </div>
              </div>

              {activeTab === 'history' ? (
                entries.length > 0 ? (
                  <GrowthChart data={entries} />
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-gray-500">
                    No data to display. Add your first entry.
                  </div>
                )
              ) : (
                <ProjectionChart data={projectionData} />
              )}
            </div>

            {/* Recent Entries Table */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Recent Entries</h3>
                <Link
                  href="/history"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View All
                </Link>
              </div>
              <EntriesTable
                entries={entries}
                onDelete={removeEntry}
                onEdit={handleEditEntry}
                limit={10}
              />
            </div>
          </div>

          {/* Controls Section (Right Col - Span 1) */}
          <div className="space-y-6">
            <ProjectionControls
              params={projectionParams}
              onChange={setProjectionParams}
            />

            {/* Quick Tips or Info could go here */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-2">Did you know?</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Increasing your monthly contribution by just €500 can significantly reduce the time to reach your financial goals due to the power of compound interest.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isAddEntryOpen && (
        <AddEntryForm
          key={editingEntry?.id ?? "new-entry"}
          isOpen={isAddEntryOpen}
          onClose={handleCloseEntryForm}
          onSave={handleSaveEntry}
          initialData={editingEntry}
        />
      )}
    </AppLayout>
  );
}
