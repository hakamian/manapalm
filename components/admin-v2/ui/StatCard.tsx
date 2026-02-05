'use client';

import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface StatCardProps {
    title: string;
    value: string;
    subValue?: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: string;
    trendUp?: boolean;
    color: 'emerald' | 'blue' | 'purple' | 'amber' | 'red';
}

const colorClasses = {
    emerald: {
        bg: 'bg-emerald-500/10',
        icon: 'text-emerald-400',
        border: 'border-emerald-500/20',
    },
    blue: {
        bg: 'bg-blue-500/10',
        icon: 'text-blue-400',
        border: 'border-blue-500/20',
    },
    purple: {
        bg: 'bg-purple-500/10',
        icon: 'text-purple-400',
        border: 'border-purple-500/20',
    },
    amber: {
        bg: 'bg-amber-500/10',
        icon: 'text-amber-400',
        border: 'border-amber-500/20',
    },
    red: {
        bg: 'bg-red-500/10',
        icon: 'text-red-400',
        border: 'border-red-500/20',
    },
};

export default function StatCard({ title, value, subValue, icon: Icon, trend, trendUp, color }: StatCardProps) {
    const colors = colorClasses[color];

    return (
        <div className={`relative overflow-hidden bg-white/5 border ${colors.border} rounded-2xl p-5 backdrop-blur-sm hover:bg-white/[0.07] transition-all group`}>
            {/* Background Glow */}
            <div className={`absolute -top-10 -left-10 w-32 h-32 ${colors.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>

            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-stone-500 text-sm font-medium">{title}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-bold text-white">{value}</span>
                        {subValue && <span className="text-sm text-stone-500">{subValue}</span>}
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                            {trendUp ? (
                                <ArrowTrendingUpIcon className="w-3 h-3" />
                            ) : (
                                <ArrowTrendingDownIcon className="w-3 h-3" />
                            )}
                            <span>{trend} از ماه قبل</span>
                        </div>
                    )}
                </div>
                <div className={`${colors.bg} p-3 rounded-xl`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
            </div>
        </div>
    );
}
