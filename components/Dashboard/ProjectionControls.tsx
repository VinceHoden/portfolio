import { ProjectionParams } from "@/types";

interface ProjectionControlsProps {
    params: ProjectionParams;
    onChange: (params: ProjectionParams) => void;
}

export function ProjectionControls({ params, onChange }: ProjectionControlsProps) {
    const handleChange = (key: keyof ProjectionParams, value: number) => {
        onChange({ ...params, [key]: value });
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Projection Parameters</h3>

            <div className="space-y-6">
                {/* Annual Return */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Annual Return</span>
                        <span className="text-white font-medium">{params.annualReturn}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="20"
                        step="0.5"
                        value={params.annualReturn}
                        onChange={(e) => handleChange('annualReturn', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Conservative (0%)</span>
                        <span>Aggressive (20%)</span>
                    </div>
                </div>

                {/* Monthly Contribution */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Monthly Contribution</span>
                        <span className="text-white font-medium">€{params.monthlyContribution.toLocaleString()}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={params.monthlyContribution}
                        onChange={(e) => handleChange('monthlyContribution', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                {/* Years */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Years to Grow</span>
                        <span className="text-white font-medium">{params.years} Years</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="40"
                        step="1"
                        value={params.years}
                        onChange={(e) => onChange({ ...params, years: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                {/* Inflation Rate Slider */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Est. Inflation Rate</span>
                        <span className="text-white font-medium">{params.inflationRate || 0}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={params.inflationRate || 0}
                        onChange={(e) => onChange({ ...params, inflationRate: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Adjusts projection for purchasing power.</p>
                </div>
            </div>
        </div>
    );
}
