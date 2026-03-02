"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, Settings, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: History, label: 'History', href: '/history' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

interface SidebarProps {
    onAddEntry: () => void;
}

export function Sidebar({ onAddEntry }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-white tracking-tight">Portfol.io</h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            )}
                        >
                            <Icon size={20} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={onAddEntry}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <PlusCircle size={20} />
                    Add Entry
                </button>
            </div>
        </aside>
    );
}
