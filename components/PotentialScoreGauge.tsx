import React from 'react';

interface PotentialScoreGaugeProps {
    score: number;
    rationale: string;
}

const PotentialScoreGauge: React.FC<PotentialScoreGaugeProps> = ({ score, rationale }) => {
    const getScoreColor = (s: number) => {
        if (s > 75) return '#22c55e'; // green-500
        if (s > 40) return '#f59e0b'; // amber-500
        return '#ef4444'; // red-500
    };

    const color = getScoreColor(score);
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="group relative flex items-center justify-center w-12 h-12">
            <svg className="w-full h-full" viewBox="0 0 44 44">
                {/* Background circle */}
                <circle
                    className="text-stone-200 dark:text-stone-700"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="22"
                    cy="22"
                />
                {/* Progress arc */}
                <circle
                    className="transition-all duration-500 ease-in-out"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke={color}
                    fill="transparent"
                    r={radius}
                    cx="22"
                    cy="22"
                    transform="rotate(-90 22 22)"
                />
                {/* Text */}
                <text
                    x="50%"
                    y="50%"
                    dy=".3em"
                    textAnchor="middle"
                    className="text-sm font-bold fill-current text-stone-700 dark:text-stone-200"
                >
                    {score}
                </text>
            </svg>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 w-max max-w-xs bg-stone-900 text-white text-xs rounded-lg py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                {rationale}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-stone-900"></div>
            </div>
        </div>
    );
};

export default PotentialScoreGauge;