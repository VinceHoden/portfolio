import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await db.importData(body);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error importing data:', error);
        return NextResponse.json({ error: 'Failed to import data' }, { status: 500 });
    }
}
