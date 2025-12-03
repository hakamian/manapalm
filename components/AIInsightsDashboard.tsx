import React, { useState } from 'react';
import { AdminReport, TimelineEvent, KeyTheme, CommunityProject, ProjectUpdate } from '../types.ts';
import { generateAdminInsights } from '../utils/ai_analysis.ts';
import { SparklesIcon, LightBulbIcon, MegaphoneIcon } from './icons.tsx';
import ThemeInsightsModal from './ThemeInsightsModal.tsx';
import AIDraftModal from './AIDraftModal.tsx';
import SimpleBarChart from './SimpleBarChart.tsx';
import SentimentTrend from './SentimentTrend.tsx';

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
            <div className="text-center p-8 bg-stone-50 dark:bg-stone-800 rounded-lg">
                <h3 className="text-xl font-bold">تحلیل هوشمند جامعه</h3>
                <p className="text-stone-500 dark:text-stone-400 mt-2">نبض جامعه را با یک کلیک در دست بگیرید. هوش مصنوعی تاملات کاربران را تحلیل کرده و گزارش مدیریتی به شما ارائه می‌دهد.</p>
                <button
                    onClick={handleGenerateReport}
                    className="mt-6 bg-amber-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 mx-auto"
                >
                    <SparklesIcon className="w-5 h-5" />
                    شروع تحلیل و تولید گزارش
                </button>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className="text-center p-8">
                <div className="animate-pulse">
                    <SparklesIcon className="w-12 h-12 text-amber-400 mx-auto" />
                    <p className="mt-2 font-semibold">در حال تحلیل تاملات جامعه...</p>
                </div>
            </div>
        );
    }

    if (error) {
         return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    if (report) {
        const chartData = report.keyThemes?.map(theme => ({
            label: theme.theme,
            value: theme.count,
        })) || [];

        return (
            <div className="space-y-8">
                 <button onClick={handleGenerateReport} className="text-sm text-amber-600 font-semibold hover:underline">بازسازی گزارش</button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-stone-50 dark:bg-stone-800 p-6 rounded-lg">
                        <h4 className="font-bold text-lg">احساسات کلی جامعه</h4>
                        <SentimentTrend trend={report.sentiment.trend} />
                        <div className="flex items-center gap-3 mt-2">
                             <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-4">
                                <div className="bg-green-500 h-4 rounded-full" style={{ width: `${report.sentiment.score * 100}%` }}></div>
                            </div>
                        </div>
                        <span className="font-semibold text-sm mt-2 block text-center">{report.sentiment.label}</span>
                    </div>
                    <div className="md:col-span-2 bg-stone-50 dark:bg-stone-800 p-6 rounded-lg">
                        <h4 className="font-bold text-lg mb-3">توزیع موضوعات کلیدی</h4>
                        <SimpleBarChart data={chartData} />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg">
                        <h4 className="font-bold text-lg">پیشنهادهای هوشمند</h4>
                        {report.actionableSuggestions?.map((item, index) => (
                             <div key={index} className="flex items-start gap-2 mt-3 text-sm">
                                <LightBulbIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <p><span className="font-semibold">{item.suggestion}:</span> {item.reasoning}</p>
                             </div>
                        ))}
                    </div>

                    <div className="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg">
                        <h3 className="text-lg font-bold mb-4">جزئیات موضوعات</h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {report.keyThemes?.map((theme, index) => (
                                <div key={index} className="bg-stone-100 dark:bg-stone-700/50 p-3 rounded-lg">
                                    <h5 className="font-bold text-sm">{theme.theme}</h5>
                                    <p className="text-xs text-stone-600 dark:text-stone-300 italic mt-1">"{theme.summary}"</p>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => setSelectedTheme(theme)} className="text-xs bg-stone-200 dark:bg-stone-600 px-2 py-0.5 rounded-md hover:bg-stone-300 dark:hover:bg-stone-500">مشاهده ({(theme.insightIds || []).length})</button>
                                        <button onClick={() => setThemeForDraft(theme)} className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-md hover:bg-amber-200 dark:hover:bg-amber-800 flex items-center gap-1">
                                           <MegaphoneIcon className="w-3 h-3" /> نگارش
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