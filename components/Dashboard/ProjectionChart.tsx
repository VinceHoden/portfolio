import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ProjectionData {
    month: number;
    year: number;
    value: number;
    realValue?: number;
    invested: number;
    gain: number;
}

interface ProjectionChartProps {
    data: ProjectionData[];
}

export function ProjectionChart({ data }: ProjectionChartProps) {
    return (
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis
                        dataKey="year"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(val) => `${new Date().getFullYear() + Math.floor(val)}`}
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickMargin={10}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickFormatter={(val) => `€${val / 1000}k`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                        formatter={(value: number | string) => [`€${Math.round(Number(value)).toLocaleString()}`, ""]}
                        labelFormatter={(label) => `Year ${new Date().getFullYear() + Math.floor(Number(label))}`}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={false}
                        name="Projected Value"
                    />
                    <Line
                        type="monotone"
                        dataKey="realValue"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                        name="Real Value (Inflation adjusted)"
                    />
                    <Line
                        type="monotone"
                        dataKey="invested"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Principal invested"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
