"use client";

import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
    children: React.ReactNode;
    onAddEntry?: () => void;
}

export function AppLayout({ children, onAddEntry }: AppLayoutProps) {
    const handleAddEntry = onAddEntry || (() => { });

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex font-sans">
            <Sidebar onAddEntry={handleAddEntry} />

            <div className="lg:pl-64 flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
