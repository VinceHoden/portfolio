const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Verify JSON Data Persistence', () => {
    const dataFilePath = path.join(process.cwd(), 'data.json');

    test.afterAll(() => {
        // Cleanup the test data.json file if it exists, to avoid dirtying local dev workspace
        if (fs.existsSync(dataFilePath)) {
            fs.unlinkSync(dataFilePath);
        }
    });

    test('should create data.json with default settings on startup', async ({ request }) => {
        // Calling the API should trigger data.json creation
        const response = await request.get('/api/settings');
        expect(response.ok()).toBeTruthy();

        expect(fs.existsSync(dataFilePath)).toBe(true);

        const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
        expect(data.settings).toBeDefined();
        expect(data.settings.annualReturn).toBe(7);
        expect(data.entries.length).toBe(0);
    });

    test('should persist new entries', async ({ request }) => {
        // 1. Create a new entry
        const newEntryResponse = await request.post('/api/entries', {
            data: {
                date: '2026-03-02',
                equity: 15000,
                netInflow: 1000,
                description: 'Test Persistence Entry'
            }
        });

        expect(newEntryResponse.ok()).toBeTruthy();
        const createdEntry = await newEntryResponse.json();

        // 2. Read the file directly to verify it was written
        const fileData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
        expect(fileData.entries.length).toBe(1);
        expect(fileData.entries[0].equity).toBe(15000);

        // 3. Fetch from API to verify the server is reading it correctly
        const fetchResponse = await request.get('/api/entries');
        const fetchedEntries = await fetchResponse.json();

        expect(fetchedEntries.length).toBe(1);
        expect(fetchedEntries[0].id).toBe(createdEntry.id);
    });
});
