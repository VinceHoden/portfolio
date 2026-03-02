import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const entries = await db.getEntries();

        // Convert Date objects to YYYY-MM-DD strings for frontend consistency
        const formattedEntries = entries.map(entry => ({
            ...entry,
            date: entry.date.toISOString().split('T')[0],
        }));

        return NextResponse.json(formattedEntries);
    } catch (error) {
        console.error('Error fetching entries:', error);
        return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { date, equity, netInflow, description } = body;

        // Basic validation
        if (!date || equity === undefined || netInflow === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newEntry = await db.createEntry({
            date: new Date(date), // Expect YYYY-MM-DD
            equity: Number(equity),
            netInflow: Number(netInflow),
            description: description || '',
        });

        return NextResponse.json({
            ...newEntry,
            date: newEntry.date.toISOString().split('T')[0],
        });
    } catch (error) {
        console.error('Error creating entry:', error);
        return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
    }
}
