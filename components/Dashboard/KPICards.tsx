import { ArrowUpRight, ArrowDownRight, Euro, Percent, Wallet, TrendingUp, Target, Calendar, Anchor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateTimeUntilTarget } from "@/lib/finance";

interface KPICardsProps {
    totalEquity: number;
    netInvested: number;
    totalReturn: number;
    xirr: number;
    projectionParams: import("@/types").ProjectionParams;
}

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

export function KPICards({ totalEquity, netInvested, totalReturn, xirr, projectionParams }: KPICardsProps) {
    const target = projectionParams.target;

    const progress = target && target > 0 ? (totalEquity / target) * 100 : 0;

    // Financial Freedom Calculation
    const timeToFreedom = target ? calculateTimeUntilTarget(
        totalEquity,
        projectionParams.monthlyContribution,
        projectionParams.annualReturn,
        target
    ) : null;

    // Retirement Age Calculation
    const retirementAge = projectionParams.retirementAge;
    const currentAge = projectionParams.currentAge;

    const calculateFutureValue = (p: number, pmt: number, rAnnual: number, years: number) => {
        const r = rAnnual / 100 / 12;
        const n = years * 12;
        if (r === 0) return p + (pmt * n);
        return p * Math.pow(1 + r, n) + pmt * ((Math.pow(1 + r, n) - 1) / r);
    };

    let projectedRetirementAttributes: { value: number } | null = null;
    let retirementIncome = 0;

    if (retirementAge && currentAge && retirementAge > currentAge) {
        const yearsRemaining = retirementAge - currentAge;
        const fv = calculateFutureValue(
            totalEquity,
            projectionParams.monthlyContribution,
            projectionParams.annualReturn,
            yearsRemaining
        );
        projectedRetirementAttributes = { value: fv };
        retirementIncome = (fv * 0.04) / 12;
    }

    // Safe Withdrawal Rate (4% Rule)
    const swrMonthly = (totalEquity * 0.04) / 12;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Total Equity */}
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl shadow-sm hover:border-blue-500/30 transition-colors flex flex-col h-full">
                <div className="flex items-center gap-3 mb-2 h-14">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <Wallet size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-400">Total Equity</span>
                </div>
                <div className="mt-2 min-h-[3.5rem]">
                    <span className="text-3xl font-bold text-white tracking-tight">{formatCurrency(totalEquity)}</span>
                    {timeToFreedom && (
                        <div className="mt-1">
                            <div className="group relative inline-flex items-center gap-1.5 text-xs text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 cursor-help">
                                <Calendar size={12} />
                                <span>
                                    Freedom: {timeToFreedom.year > new Date().getFullYear() + 100
                                        ? "Lifetime?"
                                        : `${new Date(0, timeToFreedom.month).toLocaleString('default', { month: 'short' })} ${timeToFreedom.year}`}
                                </span>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-2 py-1.5 bg-gray-900 text-gray-200 text-xs rounded-lg shadow-xl border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                                    Estimated date to reach your target based on current equity, contributions, and return.
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-700"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Goal: Monetary Target */}
                {target && (
                    <div className="mt-4 pt-3 border-t border-gray-800">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Goal: {formatCurrency(target)}</span>
                            <span className="text-blue-400">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Goal: Retirement Age */}
                {retirementAge && projectedRetirementAttributes && (
                    <div className="mt-4 pt-3 border-t border-gray-800">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Forecast @ {retirementAge}</span>
                            <span className="text-blue-400">{formatCurrency(projectedRetirementAttributes.value)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${Math.min((totalEquity / projectedRetirementAttributes.value) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Net Invested */}
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl shadow-sm hover:border-emerald-500/30 transition-colors flex flex-col h-full">
                <div className="flex items-center gap-3 mb-2 h-14">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                        <ArrowUpRight size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-400">Net Invested</span>
                </div>
                <div className="mt-2">
                    <span className="text-3xl font-bold text-white tracking-tight">{formatCurrency(netInvested)}</span>
                </div>
            </div>

            {/* Total Return */}
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl shadow-sm hover:border-purple-500/30 transition-colors flex flex-col h-full">
                <div className="flex items-center gap-3 mb-2 h-14">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                        <TrendingUp size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-400">Total Profit/Loss</span>
                </div>
                <div className="mt-2 min-h-[3.5rem]">
                    <span className={`text-3xl font-bold tracking-tight ${totalReturn >= 0 ? 'text-white' : 'text-red-400'}`}>
                        {totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn)}
                    </span>
                    <div className="mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${totalReturn >= 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                            {netInvested > 0 ? ((totalReturn / netInvested) * 100).toFixed(2) : '0.00'}%
                        </span>
                    </div>
                </div>
            </div>

            {/* XIRR */}
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl shadow-sm hover:border-amber-500/30 transition-colors flex flex-col h-full">
                <div className="flex items-center gap-3 mb-2 h-14">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                        <Target size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-400">Internal Rate of Return</span>
                </div>
                <div className="mt-2">
                    <span className={`text-3xl font-bold tracking-tight ${xirr >= 0 ? 'text-white' : 'text-red-400'}`}>
                        {(xirr * 100).toFixed(2)}%
                    </span>
                    <span className="text-xs text-gray-500 ml-2">Annualized</span>
                </div>
            </div>

            {/* Passive Income */}
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl shadow-sm hover:border-cyan-500/30 transition-colors flex flex-col h-full">
                <div className="flex items-center gap-3 mb-2 h-14">
                    <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500">
                        <Anchor size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-400">Monthly Passive Income</span>
                </div>
                <div className="mt-2 min-h-[3.5rem]">
                    <span className="text-3xl font-bold text-white tracking-tight">{formatCurrency(swrMonthly)}</span>
                    <span className="text-xs text-gray-500 ml-2 block mt-1">@ 4% Safe Withdrawal</span>
                </div>

                {/* Goal: Monetary Target */}
                {target && (
                    <div className="mt-4 pt-3 border-t border-gray-800">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Freedom Goal</span>
                            <span className="text-cyan-400">{formatCurrency((target * 0.04) / 12)}/mo</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyan-600 rounded-full"
                                style={{ width: `${Math.min(((swrMonthly) / ((target * 0.04) / 12)) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Goal: Retirement Age */}
                {retirementAge && retirementIncome > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-800">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Forecast @ {retirementAge}</span>
                            <span className="text-cyan-400">{formatCurrency(retirementIncome)}/mo</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyan-600 rounded-full"
                                style={{ width: `${Math.min((swrMonthly / retirementIncome) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
