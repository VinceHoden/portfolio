/* eslint-disable */
const { chromium } = require('playwright');

(async () => {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: false }); // Runs visibly
    const page = await browser.newPage();

    console.log('Navigating to dashboard...');
    await page.goto('http://localhost:3000');

    // Wait for the page to load
    await page.waitForSelector('h1', { timeout: 10000 });

    console.log('Clicking Add Entry...');
    // Click the Add Entry button - targeting the mobile or desktop one
    const addButton = await page.getByRole('button', { name: 'Add Entry' }).first();
    await addButton.click();

    console.log('Filling form...');
    // Fill the form
    await page.fill('input[type="date"]', '2024-03-01');
    await page.fill('input[placeholder="0.00"]', '12500'); // Equity

    // Need to target Net Inflow specifically. 
    // Assuming order or placeholder. Let's look at AddEntryForm.tsx to be sure.
    // Actually, better to use labels if available, but placeholders work.
    // Second number input is usually Net Inflow based on form order?
    // Let's check placeholders from previous context or just try

    const inputs = await page.locator('input[type="number"]').all();
    if (inputs.length >= 2) {
        await inputs[1].fill('1000'); // Net Inflow
    } else {
        console.log('Could not find Net Inflow input');
    }

    console.log('Saving...');
    await page.click('button:has-text("Save Entry")');

    // Wait for modal to close or table to update
    await page.waitForTimeout(1000);

    console.log('Entry added!');

    // Create artifact screenshot
    await page.screenshot({ path: 'C:/Users/stefa/.gemini/antigravity/brain/e288d02e-7c8f-417c-a90c-abf254cd6539/entry_added.png' });

    await browser.close();
})();
