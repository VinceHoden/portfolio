import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const settings = await db.getSettings();
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const settings = await db.upsertSettings({
            annualReturn: body.annualReturn,
            monthlyContribution: body.monthlyContribution,
            years: body.years,
            target: body.target,
            retirementAge: body.retirementAge,
            currentAge: body.currentAge,
            inflationRate: body.inflationRate,
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error saving settings:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
