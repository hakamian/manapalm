
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from './icons.tsx';

interface SentimentTrendProps {
    trend?: 'stable' | 'rising' | 'falling';
}

const TrendArrowStable: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
    </svg>
);

const SentimentTrend: React.FC<SentimentTrendProps> = ({ trend }) => {
    if (!trend) return null;

    const trendInfo = {
        rising: { Icon: ArrowUpIcon, text: 'روند صعودی', color: 'text-green-400 bg-green-900/20 border-green-900/50' },
        falling: { Icon: ArrowDownIcon, text: 'روند نزولی', color: 'text-red-400 bg-red-900/20 border-red-900/50' },
        stable: { Icon: TrendArrowStable, text: 'وضعیت پایدار', color: 'text-gray-400 bg-gray-700/50 border-gray-600' },
    };

    const { Icon, text, color } = trendInfo[trend];

    return (
        <div className={`flex items-center justify-center gap-2 mt-3 p-2 rounded-lg border ${color}`}>
            <Icon className="w-4 h-4" />
            <span className="font-semibold text-xs">{text}</span>
        </div>
    );
};

export default SentimentTrend;
