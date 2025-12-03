
import React from 'react';

interface ChartData {
    label: string;
    value: number;
}

interface SimpleBarChartProps {
    data: ChartData[];
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data }) => {
    if (!data) {
        return <div className="text-center text-gray-500 py-4">داده‌ای برای نمایش وجود ندارد.</div>;
    }

    const maxValue = Math.max(...data.map(item => item.value), 0);
    // More vibrant colors for dark mode
    const colors = ['bg-amber-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];

    return (
        <div className="space-y-4" role="list" aria-label="Bar chart">
            {data.map((item, index) => (
                <div key={item.label} className="flex items-center gap-3 text-sm" role="listitem">
                    <div className="w-24 md:w-32 truncate text-gray-300 text-right font-medium" title={item.label}>
                        {item.label}
                    </div>
                    <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                        <div
                            className={`${colors[index % colors.length]} h-6 rounded-full flex items-center justify-end px-2 text-white text-xs font-bold transition-all duration-1000 ease-out shadow-sm`}
                            style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                            role="progressbar"
                            aria-valuenow={item.value}
                            aria-valuemin={0}
                            aria-valuemax={maxValue}
                            aria-label={item.label}
                        >
                           {(item.value / maxValue) * 100 > 10 ? item.value : ''}
                        </div>
                    </div>
                     <span className="w-8 font-bold text-gray-400 text-xs">
                         {(item.value / maxValue) * 100 <= 10 ? item.value : ''}
                     </span>
                </div>
            ))}
        </div>
    );
};

export default SimpleBarChart;
