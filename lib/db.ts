import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

export type PortfolioEntry = {
    id: string;
    date: Date;
    equity: number;
    netInflow: number;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type ProjectionParams = {
    id: number;
    annualReturn: number;
    monthlyContribution: number;
    years: number;
    target: number | null;
    retirementAge: number | null;
    currentAge: number | null;
    inflationRate: number | null;
    updatedAt: Date;
};

export type DBData = {
    entries: PortfolioEntry[];
    settings: ProjectionParams;
};

const defaultData: DBData = {
    entries: [],
    settings: {
        id: 1,
        annualReturn: 7,
        monthlyContribution: 1000,
        years: 10,
        target: null,
        retirementAge: null,
        currentAge: null,
        inflationRate: 2.5,
        updatedAt: new Date(),
    }
};

// Helper to revive dates from JSON
function reviveData(data: any): DBData {
    return {
        entries: data.entries.map((e: any) => ({
            ...e,
            date: new Date(e.date),
            createdAt: new Date(e.createdAt),
            updatedAt: new Date(e.updatedAt),
        })),
        settings: {
            ...data.settings,
            updatedAt: new Date(data.settings.updatedAt),
        }
    };
}

let isWriting = false;
let writeQueue: (() => void)[] = [];

async function acquireLock(): Promise<void> {
    if (!isWriting) {
        isWriting = true;
        return;
    }
    return new Promise(resolve => writeQueue.push(resolve));
}

function releaseLock() {
    if (writeQueue.length > 0) {
        const next = writeQueue.shift();
        if (next) next();
    } else {
        isWriting = false;
    }
}

async function readDataInternal(): Promise<DBData> {
    try {
        const fileContent = await fs.readFile(dataFilePath, 'utf-8');
        return reviveData(JSON.parse(fileContent));
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            await writeDataInternal(defaultData);
            return defaultData;
        }
        throw error;
    }
}

async function writeDataInternal(data: DBData): Promise<void> {
    const tempFilePath = `${dataFilePath}.tmp.${Date.now()}`;
    await fs.writeFile(tempFilePath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempFilePath, dataFilePath);
}

// Global wrap for DB operations to ensure they are atomic
async function withLock<T>(operation: () => Promise<T>): Promise<T> {
    await acquireLock();
    try {
        return await operation();
    } finally {
        releaseLock();
    }
}

export const db = {
    async getEntries(): Promise<PortfolioEntry[]> {
        return withLock(async () => {
            const data = await readDataInternal();
            return data.entries.sort((a, b) => a.date.getTime() - b.date.getTime());
        });
    },

    async createEntry(entryData: Omit<PortfolioEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<PortfolioEntry> {
        return withLock(async () => {
            const data = await readDataInternal();
            const newEntry: PortfolioEntry = {
                ...entryData,
                id: crypto.randomUUID(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            data.entries.push(newEntry);
            await writeDataInternal(data);
            return newEntry;
        });
    },

    async updateEntry(id: string, entryData: Partial<Omit<PortfolioEntry, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PortfolioEntry | null> {
        return withLock(async () => {
            const data = await readDataInternal();
            const index = data.entries.findIndex(e => e.id === id);

            if (index === -1) return null;

            const updatedEntry = {
                ...data.entries[index],
                ...entryData,
                updatedAt: new Date(),
            };

            data.entries[index] = updatedEntry;
            await writeDataInternal(data);
            return updatedEntry;
        });
    },

    async deleteEntry(id: string): Promise<boolean> {
        return withLock(async () => {
            const data = await readDataInternal();
            const initialLength = data.entries.length;
            data.entries = data.entries.filter(e => e.id !== id);

            if (data.entries.length < initialLength) {
                await writeDataInternal(data);
                return true;
            }
            return false;
        });
    },

    async getSettings(): Promise<ProjectionParams> {
        return withLock(async () => {
            const data = await readDataInternal();
            return data.settings;
        });
    },

    async upsertSettings(settingsData: Omit<ProjectionParams, 'id' | 'updatedAt'>): Promise<ProjectionParams> {
        return withLock(async () => {
            const data = await readDataInternal();
            const updatedSettings: ProjectionParams = {
                ...data.settings,
                ...settingsData,
                id: 1, // Singleton
                updatedAt: new Date(),
            };
            data.settings = updatedSettings;
            await writeDataInternal(data);
            return updatedSettings;
        });
    },

    async clearAll(): Promise<void> {
        return withLock(async () => {
            await writeDataInternal(defaultData);
        });
    },

    async importData(importedData: any): Promise<void> {
        return withLock(async () => {
            const newDbData = reviveData({
                entries: importedData.entries || [],
                settings: importedData.projectionParams || importedData.settings || defaultData.settings
            });
            await writeDataInternal(newDbData);
        });
    }
};
