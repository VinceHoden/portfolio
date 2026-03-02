import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { PortfolioEntry } from '@/types';
import { format, parseISO } from 'date-fns';

interface GrowthChartProps {
    data: PortfolioEntry[];
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: { value: number | string }[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 border border-gray-700 p-3 rounded shadow-lg text-sm">
                <p className="text-gray-300 mb-2">{format(parseISO(label || ''), 'MMM yyyy')}</p>
                <div className="space-y-1">
                    <p className="text-blue-400">
                        Invested: <span className="font-bold text-white">€{Number(payload[0].value).toLocaleString()}</span>
                    </p>
                    <p className="text-emerald-400">
                        Market Gains: <span className="font-bold text-white">€{Number(payload[1].value).toLocaleString()}</span>
                    </p>
                    <p className="text-gray-400 border-t border-gray-700 pt-1 mt-1">
                        Total: <span className="font-bold text-white">€{(Number(payload[0].value) + Number(payload[1].value)).toLocaleString()}</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export function GrowthChart({ data }: GrowthChartProps) {
    // Pre-process data to calculate cumulative invested using reduce to avoid mutation during map
    // Actually, we can just do a standard loop or reduce
    const chartData = data.reduce((acc, entry) => {
        const previousInvested = acc.length > 0 ? acc[acc.length - 1].invested : 0;
        const currentInvested = previousInvested + entry.netInflow;
        const gains = entry.equity - currentInvested;

        acc.push({
            date: entry.date,
            invested: currentInvested,
            equity: entry.equity,
            gains: gains
        });
        return acc;
    }, [] as Array<{ date: string; invested: number; equity: number; gains: number }>);

    // Pre-process data to calculate cumulative invested using reduce to avoid mutation during map

    return (
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorGains" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(str) => format(parseISO(str), 'dd MMM yyyy')}
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickMargin={10}
                        minTickGap={30}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickFormatter={(val) => `€${val / 1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="invested"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="url(#colorInvested)"
                        name="Net Invested"
                    />
                    <Area
                        type="monotone"
                        dataKey="gains"
                        stackId="1"
                        stroke="#10b981"
                        fill="url(#colorGains)"
                        name="Market Gains"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
