
import React from 'react';

interface ChartData {
    label: string;
    value: number;
}

interface BarChartDisplayProps {
    title: string;
    data: ChartData[];
}

const BarChartDisplay: React.FC<BarChartDisplayProps> = ({ title, data }) => {
    const maxValue = Math.max(...data.map(item => item.value), 0);
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

    return (
        <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-xl" aria-label={`Bar chart: ${title}`}>
            <h4 className="font-bold text-sm text-center mb-4 text-gray-200">{title}</h4>
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={item.label} className="flex items-center gap-3 text-xs">
                        <div className="w-20 text-right truncate text-gray-400" title={item.label}>{item.label}</div>
                        <div className="flex-1 bg-gray-700 rounded-sm h-5">
                            <div
                                className="h-5 rounded-sm flex items-center justify-end px-2 text-white font-bold text-[10px] transition-all duration-500"
                                style={{
                                    width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                                    backgroundColor: colors[index % colors.length]
                                }}
                                role="progressbar"
                                aria-valuenow={item.value}
                                aria-valuemin={0}
                                aria-valuemax={maxValue}
                                aria-label={`${item.label}: ${item.value}`}
                            >
                                {item.value > 0 && (item.value / maxValue) * 100 > 15 ? item.value : ''}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BarChartDisplay;
