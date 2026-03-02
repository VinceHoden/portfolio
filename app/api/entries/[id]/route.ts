import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { date, equity, netInflow, description } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const updatedEntry = await db.updateEntry(id, {
            date: date ? new Date(date) : undefined,
            equity: equity !== undefined ? Number(equity) : undefined,
            netInflow: netInflow !== undefined ? Number(netInflow) : undefined,
            description: description !== undefined ? description : undefined,
        });

        if (!updatedEntry) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        return NextResponse.json({
            ...updatedEntry,
            date: updatedEntry.date.toISOString().split('T')[0],
        });
    } catch (error) {
        console.error('Error updating entry:', error);
        return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const success = await db.deleteEntry(id);

        if (!success) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting entry:', error);
        return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }
}
