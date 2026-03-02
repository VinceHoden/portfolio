import { differenceInDays } from 'date-fns';

/**
 * Calculates the XIRR (Extended Internal Rate of Return) for a series of cash flows.
 * Uses the Newton-Raphson method to find the root of the NPV function.
 * 
 * @param cashFlows Array of { amount, date } objects. 
 *                  Inflows (investments) should be negative, 
 *                  Outflows (withdrawals/current value) should be positive.
 * @param guess Initial guess for the rate (default 0.1).
 * @returns Annualized return rate (decimal), e.g., 0.05 for 5%.
 */

interface CashFlow {
    amount: number;
    date: string | Date;
}

export function calculateXIRR(cashFlows: CashFlow[], guess: number = 0.1): number {
    if (cashFlows.length < 2) return 0;

    const maxIterations = 100;
    const tolerance = 1e-6;
    let rate = guess;

    // Pre-process dates to numbers (days from first date)
    const sortedFlows = [...cashFlows].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstDate = new Date(sortedFlows[0].date);

    const flows = sortedFlows.map(flow => ({
        amount: flow.amount,
        days: differenceInDays(new Date(flow.date), firstDate)
    }));

    if (flows[flows.length - 1].days === 0) {
        return 0; // Cannot calculate annualized return for 0 duration
    }

    for (let i = 0; i < maxIterations; i++) {
        let npv = 0;
        let dNpv = 0; // Derivative of NPV

        for (const flow of flows) {
            // Avoid division by zero or negative base if rate <= -1
            // We assume rate > -1 for practical portfolios
            const factor = Math.pow(1 + rate, flow.days / 365);
            npv += flow.amount / factor;
            dNpv -= (flow.days / 365) * flow.amount / (factor * (1 + rate));
        }

        if (Math.abs(npv) < tolerance) {
            return rate;
        }

        if (Math.abs(dNpv) < tolerance) {
            // Derivative too close to zero, method fails
            return rate;
        }

        const newRate = rate - npv / dNpv;

        // Safety check for wild divergence?
        if (Math.abs(newRate - rate) < tolerance) {
            return newRate;
        }

        rate = newRate;
    }

    return rate; // Return best guess after max iterations
}

/**
 * Calculates future value projection based on monthly compounding.
 */
export function calculateProjection(
    initialPrincipal: number,
    monthlyContribution: number,
    annualReturnPercent: number,
    years: number,
    inflationRate?: number
) {
    const r = annualReturnPercent / 100;
    const n = 12; // Monthly compounding
    const totalMonths = years * 12;

    const data = [];

    for (let t = 0; t <= totalMonths; t++) {
        const timeInYears = t / 12;
        // FV of Principal: P * (1 + r/n)^(nt)
        const futurePrincipal = initialPrincipal * Math.pow(1 + r / n, n * timeInYears);

        // FV of Contributions: PMT * [ ((1 + r/n)^(nt) - 1) / (r/n) ]
        let futureContributions = 0;
        if (r !== 0) {
            futureContributions = monthlyContribution * (Math.pow(1 + r / n, n * timeInYears) - 1) / (r / n);
        } else {
            futureContributions = monthlyContribution * n * timeInYears;
        }

        const totalValue = futurePrincipal + futureContributions;
        const invested = initialPrincipal + (monthlyContribution * t);

        // Real Value Calculation (Inflation Adjusted)
        // PV = FV / (1 + i)^n
        // n is in years
        let realValue = totalValue;
        if (inflationRate && inflationRate > 0) {
            realValue = totalValue / Math.pow(1 + inflationRate / 100, timeInYears);
        }

        data.push({
            month: t,
            year: timeInYears,
            value: totalValue,
            realValue: realValue,
            invested: invested,
            gain: totalValue - invested
        });
    }

    return data;
}

/**
 * Calculates the number of months until the portfolio reaches the target value.
 */
export function calculateTimeUntilTarget(
    currentEquity: number,
    monthlyContribution: number,
    annualReturnPercent: number,
    target: number
): { months: number, year: number, month: number } | null {
    if (currentEquity >= target) return { months: 0, year: new Date().getFullYear(), month: new Date().getMonth() };

    const r = annualReturnPercent / 100 / 12;
    // FV = P * (1+r)^n + PMT * [ ((1+r)^n - 1) / r ]
    // Solve for n? Iterative is acceptable and simpler given likely inputs.

    // Safety break if return is too low and target too high
    if (monthlyContribution <= 0 && annualReturnPercent <= 0 && currentEquity < target) return null;

    let equity = currentEquity;
    let months = 0;
    const maxMonths = 1200; // 100 years cap

    while (equity < target && months < maxMonths) {
        equity = equity * (1 + r) + monthlyContribution;
        months++;
    }

    if (months >= maxMonths) return null; // Unreachable in reasonable time

    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + months);

    return {
        months,
        year: futureDate.getFullYear(),
        month: futureDate.getMonth()
    };
}
