
import React, { useState } from 'react';
import { AdminReport, TimelineEvent, KeyTheme, CommunityProject, ProjectUpdate } from '../../types.ts';
import { generateAdminInsights } from '../../utils/ai_analysis.ts';
import { SparklesIcon, LightBulbIcon, MegaphoneIcon, ArrowPathIcon } from '../icons.tsx';
import ThemeInsightsModal from '../ThemeInsightsModal.tsx';
import AIDraftModal from '../AIDraftModal.tsx';
import SimpleBarChart from '../SimpleBarChart.tsx';
import SentimentTrend from '../SentimentTrend.tsx';

interface AIInsightsDashboardProps {
    allInsights: TimelineEvent[];
    allProjects: CommunityProject[];
    onUpdateInsightStatus: (insightId: string, status: 'approved' | 'rejected') => void;
    onAddProjectUpdate: (projectId: string, update: Omit<ProjectUpdate, 'date'>) => void;
}

const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({ allInsights, allProjects, onUpdateInsightStatus, onAddProjectUpdate }) => {
    const [report, setReport] = useState<AdminReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<KeyTheme | null>(null);
    const [themeForDraft, setThemeForDraft] = useState<KeyTheme | null>(null);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setError(null);
        const generatedReport = await generateAdminInsights(allInsights);
        if (generatedReport) {
            setReport(generatedReport);
        } else {
            setError("خطا در تولید گزارش. لطفا دوباره تلاش کنید.");
        }
        setIsLoading(false);
    };

    if (!report && !isLoading && !error) {
        return (
            <div className="text-center p-10 bg-gray-800 rounded-2xl border border-gray-700 shadow-lg">
                <div className="bg-gray-700/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                     <SparklesIcon className="w-10 h-10 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">تحلیل هوشمند جامعه</h3>
                <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                    نبض جامعه را با یک کلیک در دست بگیرید. هوش مصنوعی تاملات کاربران را تحلیل کرده و گزارش مدیریتی دقیقی از احساسات و موضوعات داغ به شما ارائه می‌دهد.
                </p>
                <button
                    onClick={handleGenerateReport}
                    className="mt-8 bg-amber-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-amber-600 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
                >
                    <SparklesIcon className="w-5 h-5" />
                    شروع تحلیل و تولید گزارش
                </button>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className="text-center p-20">
                <div className="animate-pulse flex flex-col items-center">
                    <SparklesIcon className="w-16 h-16 text-amber-400 mb-4" />
                    <p className="text-xl font-semibold text-white">در حال تحلیل تاملات جامعه...</p>
                    <p className="text-sm text-gray-500 mt-2">لطفاً شکیبا باشید</p>
                </div>
            </div>
        );
    }

    if (error) {
         return <div className="text-center p-10 bg-red-900/20 rounded-xl border border-red-900/50 text-red-400">{error}</div>;
    }

    if (report) {
        const chartData = report.keyThemes?.map(theme => ({
            label: theme.theme,
            value: theme.count,
        })) || [];

        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex justify-end">
                    <button onClick={handleGenerateReport} className="text-sm text-amber-500 font-semibold hover:text-amber-400 flex items-center gap-1 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 hover:border-amber-500/50 transition-all">
                        <ArrowPathIcon className="w-4 h-4" /> بازسازی گزارش
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                        <h4 className="font-bold text-lg text-white mb-4 border-b border-gray-700 pb-2">احساسات کلی جامعه</h4>
                        <div className="flex flex-col items-center py-4">
                            <SentimentTrend trend={report.sentiment.trend} />
                            <span className="font-extrabold text-3xl mt-4 text-white">{report.sentiment.label}</span>
                            <div className="w-full bg-gray-700 rounded-full h-3 mt-4 overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full transition-all duration-1000" 
                                    style={{ width: `${report.sentiment.score * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">امتیاز احساسی: {report.sentiment.score}</p>
                        </div>
                    </div>
                    <div className="md:col-span-2 bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                        <h4 className="font-bold text-lg text-white mb-6 border-b border-gray-700 pb-2">توزیع موضوعات کلیدی</h4>
                        <SimpleBarChart data={chartData} />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                        <h4 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                            <LightBulbIcon className="w-5 h-5 text-yellow-400" />
                            پیشنهادهای هوشمند
                        </h4>
                        <div className="space-y-4">
                            {report.actionableSuggestions?.map((item, index) => (
                                 <div key={index} className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                                    <p className="text-gray-200 font-semibold text-sm mb-1">{item.suggestion}</p>
                                    <p className="text-xs text-gray-400">{item.reasoning}</p>
                                 </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-4">جزئیات موضوعات</h3>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {report.keyThemes?.map((theme, index) => (
                                <div key={index} className="bg-gray-700/40 p-4 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-bold text-sm text-white">{theme.theme}</h5>
                                        <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">{theme.count} تامل</span>
                                    </div>
                                    <p className="text-xs text-gray-400 italic mb-3 leading-relaxed">"{theme.summary}"</p>
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => setSelectedTheme(theme)} className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded-lg transition-colors">مشاهده تاملات</button>
                                        <button onClick={() => setThemeForDraft(theme)} className="text-xs bg-amber-600/20 text-amber-400 border border-amber-600/50 hover:bg-amber-600/30 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                                           <MegaphoneIcon className="w-3 h-3" /> نگارش اطلاعیه
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {selectedTheme && (
                    <ThemeInsightsModal
                        isOpen={!!selectedTheme}
                        onClose={() => setSelectedTheme(null)}
                        theme={selectedTheme}
                        allInsights={allInsights}
                        onUpdateInsightStatus={onUpdateInsightStatus}
                    />
                )}
                {themeForDraft && (
                    <AIDraftModal
                        isOpen={!!themeForDraft}
                        onClose={() => setThemeForDraft(null)}
                        theme={themeForDraft}
                        allProjects={allProjects}
                        onAddProjectUpdate={onAddProjectUpdate}
                    />
                )}
            </div>
        );
    }

    return null;
};

export default AIInsightsDashboard;
