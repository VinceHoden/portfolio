import { PortfolioEntry, ProjectionParams } from "@/types";

const STORAGE_KEYS = {
    ENTRIES: 'portfolio_entries',
    PROJECTION_PARAMS: 'portfolio_projection_params',
};

export const saveEntries = (entries: PortfolioEntry[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
};

export const loadEntries = (): PortfolioEntry[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('Failed to parse entries', e);
        return [];
    }
};

export const saveProjectionParams = (params: ProjectionParams) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PROJECTION_PARAMS, JSON.stringify(params));
};

export const loadProjectionParams = (): ProjectionParams | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTION_PARAMS);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('Failed to parse projection params', e);
        return null;
    }
};
