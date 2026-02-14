import { PortfolioEntry } from "@/types";

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export function validatePortfolioData(entries: PortfolioEntry[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!entries || entries.length === 0) {
        return { isValid: true, errors: [], warnings: ["No entries found. Start by adding a snapshot."] };
    }

    // Sort by date ascending
    const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Check for duplicate dates
    const dates = new Set<string>();
    sorted.forEach(entry => {
        if (dates.has(entry.date)) {
            errors.push(`Duplicate entry found for date: ${entry.date}`);
        }
        dates.add(entry.date);
    });

    // Check for negative equity (unless it's a debt portfolio, but usually equity >= 0)
    sorted.forEach(entry => {
        if (entry.equity < 0) {
            warnings.push(`Negative equity recorded on ${entry.date}: €${entry.equity}`);
        }
    });

    // Check for suspicious spikes (> 100% gain in a month without inflow)
    for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];

        // Simple return check: (End - Start - NetFlow) / Start
        const previousEquity = prev.equity;
        const netInflow = curr.netInflow;
        const gain = curr.equity - previousEquity - netInflow;

        if (previousEquity > 0) {
            const returnPct = gain / previousEquity;
            if (returnPct > 0.5) { // Warning if > 50% gain in one month
                warnings.push(`Unusual high return (>50%) detected on ${curr.date}. Check for typo.`);
            }
            if (returnPct < -0.5) { // Warning if > 50% loss
                warnings.push(`Unusual large loss (>50%) detected on ${curr.date}. Check for typo.`);
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
