import React from 'react';
import { BrainCircuitIcon } from './icons.tsx';

interface AIInsightCardProps {
    isLoading: boolean;
    insightText: string | null;
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({ isLoading, insightText }) => {
    return (
        <div className="bg-gradient-to-br from-stone-800 to-stone-900 dark:from-stone-800 dark:to-stone-800/80 p-6 rounded-2xl shadow-lg border border-stone-700/50 text-white">
            <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-full">
                    <BrainCircuitIcon className="w-8 h-8 text-amber-300" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-amber-200">آینه هوشمند</h2>
                    {isLoading ? (
                        <div className="space-y-2 mt-2 animate-pulse">
                            <div className="h-4 bg-stone-700 rounded w-5/6"></div>
                            <div className="h-4 bg-stone-700 rounded w-3/4"></div>
                        </div>
                    ) : insightText ? (
                        <blockquote className="mt-2">
                            <p className="italic text-stone-200 leading-relaxed">"{insightText}"</p>
                        </blockquote>
                    ) : (
                         <p className="italic text-stone-400 mt-2">مربی معنا در حال استراحت است. لطفاً بعداً دوباره تلاش کنید.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIInsightCard;