import React, { useState, useEffect } from 'react';
import { SparklesIcon, ChartBarIcon, ArrowTrendingUpIcon, ExclamationTriangleIcon, BoltIcon } from '../../components/icons';
import { generateStrategicAdvice, getStoreStats } from '@/services/geminiService';

interface Advice {
    id: string;
    title: string;
    type: 'inventory' | 'marketing' | 'performance';
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
    action: string;
}

const AutoCEOView: React.FC = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [adviceList, setAdviceList] = useState<Advice[]>([]);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            // Fetch real stats from Supabase
            const stats = await getStoreStats();
            const result = await generateStrategicAdvice(stats);
            setAdviceList(result);
            setHasAnalyzed(true);
        } catch (error) {
            console.error("Error generating advice:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white pt-24 pb-24">
            <div className="container mx-auto px-6">
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-900/30 rounded-full mb-4 ring-1 ring-indigo-500/50">
                        <BoltIcon className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        مدیر عامل خودکار (Auto-CEO)
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        هوش مصنوعی که کسب‌وکارتان را تحلیل می‌کند و پیشنهادات استراتژیک می‌دهد.
                    </p>
                </div>

                {!hasAnalyzed ? (
                    <div className="max-w-xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
                        <ChartBarIcon className="w-16 h-16 text-gray-700 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-2">آماده تحلیل داده‌ها؟</h3>
                        <p className="text-gray-400 mb-8">
                            سیستم آماده است تا آخرین آمارهای فروش، رفتار کاربران و وضعیت انبار را بررسی کند.
                        </p>
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <SparklesIcon className="w-6 h-6 animate-spin" />
                                    در حال تحلیل کسب‌وکار...
                                </>
                            ) : (
                                <>
                                    <BoltIcon className="w-6 h-6" />
                                    شروع تحلیل استراتژیک
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <SparklesIcon className="w-6 h-6 text-yellow-400" />
                                نتایج تحلیل هوشمند
                            </h2>
                            <button onClick={handleAnalyze} className="text-sm text-indigo-400 hover:text-indigo-300">
                                تحلیل مجدد
                            </button>
                        </div>

                        <div className="grid gap-6">
                            {adviceList.map((advice) => (
                                <div key={advice.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all flex items-start gap-4">
                                    <div className={`p-3 rounded-lg flex-shrink-0 ${advice.priority === 'high' ? 'bg-red-900/20 text-red-400' :
                                        advice.priority === 'medium' ? 'bg-yellow-900/20 text-yellow-400' :
                                            'bg-blue-900/20 text-blue-400'
                                        }`}>
                                        {advice.priority === 'high' ? <ExclamationTriangleIcon className="w-6 h-6" /> :
                                            advice.priority === 'medium' ? <ArrowTrendingUpIcon className="w-6 h-6" /> :
                                                <ChartBarIcon className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-white">{advice.title}</h3>
                                            <span className={`text-xs px-2 py-1 rounded capitalize ${advice.priority === 'high' ? 'bg-red-900/50 text-red-200' :
                                                advice.priority === 'medium' ? 'bg-yellow-900/50 text-yellow-200' :
                                                    'bg-blue-900/50 text-blue-200'
                                                }`}>
                                                {advice.priority} Priority
                                            </span>
                                        </div>
                                        <p className="text-gray-400 mb-4 leading-relaxed">{advice.reasoning}</p>
                                        <button className="text-sm font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                            اجرای پیشنهاد: {advice.action} →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutoCEOView;
