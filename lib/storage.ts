import { PortfolioEntry, ProjectionParams } from '@/types';

// Keys for local storage
const ENTRIES_KEY = 'portfolio_entries';
const SETTINGS_KEY = 'portfolio_settings';

// Helper to check if we're running in the browser
const isBrowser = typeof window !== 'undefined';

export const storage = {
    loadEntries: (): PortfolioEntry[] => {
        if (!isBrowser) return [];
        try {
            const data = localStorage.getItem(ENTRIES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load entries from local storage:', error);
            return [];
        }
    },

    saveEntries: (entries: PortfolioEntry[]) => {
        if (!isBrowser) return;
        try {
            localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
        } catch (error) {
            console.error('Failed to save entries to local storage:', error);
        }
    },

    loadProjectionParams: (): ProjectionParams | null => {
        if (!isBrowser) return null;
        try {
            const data = localStorage.getItem(SETTINGS_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load settings from local storage:', error);
            return null;
        }
    },

    saveProjectionParams: (params: ProjectionParams) => {
        if (!isBrowser) return;
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(params));
        } catch (error) {
            console.error('Failed to save settings to local storage:', error);
        }
    }
};
