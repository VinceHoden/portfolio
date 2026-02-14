
export interface PortfolioEntry {
    id: string;
    date: string; // ISO 8601 YYYY-MM-DD
    equity: number;     // Total Portfolio Value at this date
    netInflow: number; // Net Deposit (+) or Withdrawal (-) during this period
    description?: string;
}

export interface ProjectionParams {
    annualReturn: number; // percentage, e.g. 7.5
    monthlyContribution: number;
    years: number;
    target?: number; // Financial Freedom Target (Monetary)
    retirementAge?: number; // Target Retirement Age
    currentAge?: number; // Current Age (Required if retirementAge is set)
    inflationRate?: number; // Estimated Annual Inflation
}
