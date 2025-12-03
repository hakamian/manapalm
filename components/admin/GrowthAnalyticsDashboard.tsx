
import React, { useMemo, useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { User, TimelineEvent, Course } from '../../types.ts';
import { heritageItems } from '../../utils/heritage.ts';
import SimpleBarChart from '../SimpleBarChart.tsx';
import { UsersIcon, ChartPieIcon, TargetIcon, TrendingUpIcon, SitemapIcon, LightBulbIcon } from '../icons.tsx';
import GrowthAutomationEngine from './GrowthAutomationEngine.tsx';

// Data copied from CoursesPage.tsx
const coursesData: Course[] = [
    { id: '1', title: 'دوره جامع کوچینگ معنا', shortDescription: 'سفری عمیق به درون', longDescription: '', instructor: 'دکتر حکیمیان', duration: '۸ هفته', level: 'متوسط', tags: ['کوچینگ'], imageUrl: '', price: 850000 },
    { id: '2', title: 'کارآفرینی اجتماعی', shortDescription: 'کسب‌وکار پایدار', longDescription: '', instructor: 'تیم نخلستان', duration: '۶ هفته', level: 'مقدماتی', tags: ['کارآفرینی'], imageUrl: '', price: 600000 },
    { id: '5', title: 'سفر ۶ روزه کوچینگ', shortDescription: 'اردوی حضوری', longDescription: '', instructor: 'دکتر حکیمیان', duration: '۶ روز', level: 'پیشرفته', tags: ['کوچینگ'], imageUrl: '', price: 6500000, isRetreat: true },
    { id: '3', title: 'اصول باغبانی نخل', shortDescription: 'دانش عملی', longDescription: '', instructor: 'مهندس محلی', duration: '۴ جلسه', level: 'مقدماتی', tags: ['کشاورزی'], imageUrl: '', price: 450000 },
    { id: '4', title: 'رهبری معنامحور', shortDescription: 'فرهنگ سازمانی', longDescription: '', instructor: 'دکتر حکیمیان', duration: '۵ هفته', level: 'پیشرفته', tags: ['رهبری'], imageUrl: '', price: 1200000 }
];

const ChartContainer: React.FC<{ title: string, children: React.ReactNode, icon: React.FC<any>, id?: string }> = ({ title, children, icon: Icon, id }) => (
    <div id={id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg hover:border-gray-600 transition-colors">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white border-b border-gray-700 pb-4">
            <Icon className="w-6 h-6 text-amber-400" />
            {title}
        </h3>
        {children}
    </div>
);

const LineChart: React.FC<{ data: { label: string, value: number }[] }> = ({ data }) => {
    if (!data || data.length === 0) return <p className="text-center text-gray-500 py-10">داده‌ای برای نمایش وجود ندارد.</p>;
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
        <div className="flex justify-around items-end h-64 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
            {data.map((point, index) => (
                <div key={index} className="flex flex-col items-center h-full w-[8%] group" title={`${point.label}: ${point.value}`}>
                    <div className="flex-grow flex items-end w-full">
                        <div 
                            className="w-full bg-gradient-to-t from-amber-700 to-amber-500 rounded-t-md opacity-80 group-hover:opacity-100 transition-all duration-300"
                            style={{ height: `${(point.value / maxValue) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] mt-2 text-gray-400 transform -rotate-45 origin-top-left whitespace-nowrap">{point.label}</span>
                </div>
            ))}
        </div>
    );
};

const TopListItem: React.FC<{ name: string, count: number, index: number }> = ({ name, count, index }) => (
     <li className="flex justify-between items-center text-sm p-3 rounded-lg even:bg-gray-700/30 hover:bg-gray-700/60 transition-colors">
        <div className="flex items-center gap-3">
            <span className={`font-bold w-6 text-center rounded ${index < 3 ? 'text-amber-400' : 'text-gray-500'}`}>{index + 1}</span>
            <span className="font-medium text-gray-200">{name}</span>
        </div>
        <span className="font-mono font-bold text-green-400">{count.toLocaleString('fa-IR')}</span>
    </li>
);

interface SegmentCardProps {
    id: string;
    icon: React.FC<any>;
    title: string;
    description: string;
    count: number;
    sampleUsers: User[];
    suggestedAction: string;
    color: string;
    onAnalyzePath: () => void;
    isAnalyzing?: boolean;
}

const SegmentCard: React.FC<SegmentCardProps> = ({ id, icon: Icon, title, description, count, sampleUsers, suggestedAction, color, onAnalyzePath, isAnalyzing }) => {
    const borderColor = color; 
    
    return (
        <div id={id} className="p-5 rounded-xl bg-gray-800 border-r-4 flex flex-col shadow-lg h-full" style={{ borderRightColor: borderColor }}>
            <div className="flex items-center gap-4 mb-3">
                <div className="p-2 rounded-lg bg-gray-700/50">
                    <Icon className="w-8 h-8" style={{ color }} />
                </div>
                <div>
                    <h4 className="font-bold text-lg text-white">{title} <span className="text-sm font-normal text-gray-400">({count.toLocaleString('fa-IR')})</span></h4>
                    <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                </div>
            </div>
            
            <div className="mb-4 space-y-3 flex-grow">
                <div className="text-xs">
                    <p className="font-semibold text-gray-500 mb-1">نمونه کاربران:</p>
                    <div className="flex flex-wrap gap-1">
                        {sampleUsers.map(u => (
                            <span key={u.id} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-[10px]">{u.name}</span>
                        ))}
                    </div>
                </div>
                 <div className="text-xs p-3 bg-gray-700/30 rounded border border-gray-700">
                    <p className="font-semibold text-gray-400 mb-1">اقدام پیشنهادی:</p>
                    <p className="text-gray-300 leading-relaxed">{suggestedAction}</p>
                </div>
            </div>

            <div className="mt-auto pt-3 border-t border-gray-700/50">
                <button 
                    onClick={onAnalyzePath} 
                    disabled={isAnalyzing}
                    className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                    <SitemapIcon className={`w-4 h-4 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                    {isAnalyzing ? 'در حال تحلیل...' : 'تحلیل مسیر'}
                </button>
            </div>
        </div>
    );
}

const UserLifecycleFunnel: React.FC<{
    stages: { name: string; count: number; conversion?: number; color: string; id: string }[];
    churn: { count: number; rate: number };
}> = ({ stages, churn }) => {
    const handleStageClick = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <div className="flex flex-col items-center gap-6 py-6">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-0">
                {stages.map((stage, index) => (
                    <React.Fragment key={stage.name}>
                        <button
                            onClick={() => handleStageClick(stage.id)}
                            className="relative flex flex-col items-center justify-center text-center p-4 w-36 md:w-48 bg-gray-900 border border-gray-700 rounded-xl hover:border-amber-500 hover:shadow-amber-900/20 transition-all group"
                        >
                            <div className="absolute -top-1 h-1 w-1/2 rounded-full" style={{ backgroundColor: stage.color }}></div>
                            <span className="text-xs font-semibold text-gray-400 uppercase mb-2 group-hover:text-white transition-colors">{stage.name}</span>
                            <span className="text-2xl font-bold text-white">{stage.count.toLocaleString('fa-IR')}</span>
                            <span className="text-[10px] text-gray-500">کاربر</span>
                        </button>

                        {stage.conversion !== undefined && (
                            <div className="flex flex-col items-center mx-2 text-gray-600">
                                <span className="text-sm font-bold text-green-500">{stage.conversion.toFixed(1)}%</span>
                                <div className="text-gray-600 text-xl">→</div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-900/50 rounded-full text-red-300 text-sm">
                <span>↓</span>
                <span className="font-semibold">{churn.count.toLocaleString('fa-IR')} کاربر در معرض خطر ({churn.rate.toFixed(1)}%)</span>
            </div>
        </div>
    );
};


type AnalysisResult = { sequence: string; insight: string; suggestion:string };
type SegmentType = 'champions' | 'risingStars' | 'atRisk';

interface GrowthAnalyticsDashboardProps {
    allUsers: User[];
    allInsights: TimelineEvent[];
}

const GrowthAnalyticsDashboard: React.FC<GrowthAnalyticsDashboardProps> = ({ allUsers, allInsights }) => {
    const [isAnalyzing, setIsAnalyzing] = useState({ champions: false, risingStars: false, atRisk: false });
    const [analysisResults, setAnalysisResults] = useState<Record<SegmentType, AnalysisResult | null>>({ champions: null, risingStars: null, atRisk: null });
    const [analysisError, setAnalysisError] = useState<Record<SegmentType, string | null>>({ champions: null, risingStars: null, atRisk: null });

    // ... (Logic for monthlyGrowth, engagementDistribution, popularHeritage, popularCourses)
     const monthlyGrowth = useMemo(() => {
        const months: { [key: string]: number } = {};
        allUsers.forEach(user => {
            const joinDate = new Date(user.joinDate);
            const monthKey = `${joinDate.getFullYear()}-${String(joinDate.getMonth() + 1).padStart(2, '0')}`;
            if (!months[monthKey]) {
                months[monthKey] = 0;
            }
            months[monthKey]++;
        });
        
        return Object.entries(months)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-12) 
            .map(([label, value]) => ({ label: new Date(label).toLocaleDateString('fa-IR', { month: 'short' }), value }));
    }, [allUsers]);

    const engagementDistribution = useMemo(() => {
        const counts: { [key: string]: number } = { 'کاشت نخل': 0, 'تامل': 0, 'اقدام خلاقانه': 0, 'تکمیل دوره': 0 };
        allInsights.forEach(event => {
            if (event.type === 'palm_planted') counts['کاشت نخل']++;
            else if (event.type === 'reflection') counts['تامل']++;
            else if (event.type === 'creative_act') counts['اقدام خلاقانه']++;
            else if (event.type === 'course_completed') counts['تکمیل دوره']++;
        });
        return Object.entries(counts).map(([label, value]) => ({ label, value }));
    }, [allInsights]);
    
    const popularHeritage = useMemo(() => {
        const counts: { [key: string]: number } = {};
        allInsights.forEach(event => {
            if (event.type === 'palm_planted' && event.details.id) {
                if (!counts[event.details.id]) counts[event.details.id] = 0;
                counts[event.details.id]++;
            }
        });
        return Object.entries(counts).sort(([,a], [,b]) => b - a).slice(0, 5).map(([id, count]) => ({ name: heritageItems.find(h => h.id === id)?.title || id, count }));
    }, [allInsights]);

    const popularCourses = useMemo(() => {
        const counts: { [key: string]: number } = {};
        allUsers.forEach(user => {
            (user.purchasedCourseIds || []).forEach(courseId => {
                 if (!counts[courseId]) counts[courseId] = 0;
                 counts[courseId]++;
            });
        });
        return Object.entries(counts).sort(([,a], [,b]) => b - a).slice(0, 5).map(([id, count]) => ({ name: coursesData.find(c => c.id === id)?.title || id, count }));
    }, [allUsers]);

    const userSegments = useMemo(() => {
        const oneMonthAgo = new Date(); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const sortedByPoints = [...allUsers].sort((a, b) => b.points - a.points);
        const championCount = Math.max(1, Math.floor(allUsers.length * 0.05));
        const champions = sortedByPoints.slice(0, championCount);
        const newUsers = allUsers.filter(u => new Date(u.joinDate) > oneMonthAgo);
        const risingStars = newUsers.filter(u => (u.timeline?.length || 0) > 2);
        const sixtyDaysAgo = new Date(); sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const atRisk = allUsers.filter(u => {
            const sortedTimeline = [...(u.timeline || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const lastEventDate = sortedTimeline[0] ? new Date(sortedTimeline[0].date) : new Date(u.joinDate);
            return lastEventDate < sixtyDaysAgo && new Date(u.joinDate) < sixtyDaysAgo;
        });
        return { newUsers, risingStars, champions, atRisk };
    }, [allUsers]);
    
    const analysisPrompts: Record<SegmentType, string> = {
        champions: 'You are a user behavior analyst. Analyze the user journey timelines of a platform\'s most successful users ("Champions") to identify the "Golden Path".',
        risingStars: 'You are a user onboarding specialist. Analyze the timelines of promising new users ("Rising Stars") to identify their "First Mile Golden Path".',
        atRisk: 'You are a user retention expert. Analyze the timelines of inactive users ("At-Risk") to identify the "Path to Churn".'
    };

    const handleAnalyzePath = async (segment: SegmentType) => {
        setIsAnalyzing(prev => ({ ...prev, [segment]: true }));
        setAnalysisResults(prev => ({ ...prev, [segment]: null }));
        setAnalysisError(prev => ({ ...prev, [segment]: null }));

        let usersForAnalysis: User[] = [];
        switch(segment) {
            case 'champions': usersForAnalysis = userSegments.champions; break;
            case 'risingStars': usersForAnalysis = userSegments.risingStars; break;
            case 'atRisk': usersForAnalysis = userSegments.atRisk; break;
        }

        if (usersForAnalysis.length === 0) {
            setAnalysisError(prev => ({ ...prev, [segment]: "کاربری در این بخش برای تحلیل وجود ندارد." }));
            setIsAnalyzing(prev => ({ ...prev, [segment]: false }));
            return;
        }

        const timelines = usersForAnalysis.map(user => ({
            userId: user.id,
            events: (user.timeline || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 10).map(event => event.type)
        }));

        const systemInstruction = `${analysisPrompts[segment]} Your analysis should: 1. Identify a common, sequential pattern of 3-4 key events. 2. Derive a single, powerful "Key Insight". 3. Propose a concrete, "Suggested Action". Respond ONLY with a JSON matching the schema. All text in Persian.`;
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: `Analyze these user timelines:\n${JSON.stringify(timelines)}`,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            sequence: { type: Type.STRING },
                            insight: { type: Type.STRING },
                            suggestion: { type: Type.STRING }
                        },
                        required: ['sequence', 'insight', 'suggestion']
                    }
                }
            });
            const result = JSON.parse(response.text);
            setAnalysisResults(prev => ({ ...prev, [segment]: result }));
        } catch (error) {
            console.error(`${segment} path analysis failed:`, error);
            setAnalysisError(prev => ({ ...prev, [segment]: "خطا در تحلیل مسیر. لطفا دوباره تلاش کنید." }));
        } finally {
            setIsAnalyzing(prev => ({ ...prev, [segment]: false }));
        }
    };

    const renderAnalysisResult = (segment: SegmentType, title: string) => {
        const isLoading = isAnalyzing[segment];
        const error = analysisError[segment];
        const result = analysisResults[segment];

        if (!isLoading && !error && !result) return null;

        return (
             <ChartContainer title={title} icon={SitemapIcon}>
                {isLoading && (
                     <div className="text-center p-8">
                        <div className="animate-pulse flex flex-col items-center">
                            <SitemapIcon className="w-12 h-12 text-amber-400" />
                            <p className="mt-2 font-semibold">در حال تحلیل تاریخچه کاربران...</p>
                        </div>
                    </div>
                )}
                {error && <p className="text-center text-red-400 py-8 bg-red-900/10 rounded-lg">{error}</p>}
                {result && (
                    <div className="space-y-4 text-sm">
                        <div className="bg-gray-700/50 p-4 rounded-lg border-r-4 border-amber-500">
                            <h4 className="font-bold text-amber-400 mb-2">توالی کشف‌شده:</h4>
                            <p className="font-mono text-gray-300 tracking-wider bg-gray-800 p-2 rounded">{result.sequence}</p>
                        </div>
                        <div className="bg-gray-700/50 p-4 rounded-lg border-r-4 border-blue-500">
                            <h4 className="font-bold text-blue-400 mb-2">بینش کلیدی:</h4>
                            <p className="italic text-gray-300">"{result.insight}"</p>
                        </div>
                        <div className="bg-gray-700/50 p-4 rounded-lg border-r-4 border-green-500">
                            <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2"><LightBulbIcon className="w-4 h-4"/> اقدام پیشنهادی:</h4>
                            <p className="text-gray-200">{result.suggestion}</p>
                        </div>
                    </div>
                )}
            </ChartContainer>
        );
    };

    return (
        <div className="space-y-8">
            <ChartContainer title="رشد ماهانه کاربران" icon={UsersIcon}>
                <LineChart data={monthlyGrowth} />
            </ChartContainer>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="توزیع انواع تعامل" icon={ChartPieIcon}>
                    <SimpleBarChart data={engagementDistribution} />
                </ChartContainer>
                <div className="space-y-8">
                    <ChartContainer title="محبوب‌ترین میراث‌ها" icon={TrendingUpIcon}>
                        <ul className="space-y-1">
                            {popularHeritage.map((item, index) => <TopListItem key={item.name} {...item} index={index} />)}
                        </ul>
                    </ChartContainer>
                    <ChartContainer title="محبوب‌ترین دوره‌ها" icon={TrendingUpIcon}>
                         <ul className="space-y-1">
                            {popularCourses.map((item, index) => <TopListItem key={item.name} {...item} index={index} />)}
                        </ul>
                    </ChartContainer>
                </div>
            </div>

             <ChartContainer title="قیف سفر کاربر" icon={SitemapIcon}>
                <UserLifecycleFunnel
                    stages={[
                        { name: "کاربران جدید", count: userSegments.newUsers.length, color: '#3b82f6', id: 'rising-stars' },
                        { name: "ستاره‌های نوظهور", count: userSegments.risingStars.length, conversion: userSegments.newUsers.length > 0 ? (userSegments.risingStars.length / userSegments.newUsers.length) * 100 : 0, color: '#8b5cf6', id: 'rising-stars' },
                        { name: "قهرمانان", count: userSegments.champions.length, conversion: allUsers.length > 0 ? (userSegments.champions.length / allUsers.length) * 100 : 0, color: '#f59e0b', id: 'champions' }
                    ]}
                    churn={{ count: userSegments.atRisk.length, rate: allUsers.length > 0 ? (userSegments.atRisk.length / allUsers.length) * 100 : 0 }}
                />
            </ChartContainer>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <SegmentCard 
                    id="champions" icon={TargetIcon} title="قهرمانان" description="۵٪ برتر کاربران از نظر امتیاز" count={userSegments.champions.length} sampleUsers={userSegments.champions.slice(0,3)} suggestedAction="ایجاد فرصت‌های مربی‌گری و پروژه‌های ویژه برای حفظ انگیزه." color="#f59e0b" onAnalyzePath={() => handleAnalyzePath('champions')} isAnalyzing={isAnalyzing.champions}
                />
                 <SegmentCard 
                    id="rising-stars" icon={TrendingUpIcon} title="ستاره‌های نوظهور" description="کاربران جدید با تعامل بالا" count={userSegments.risingStars.length} sampleUsers={userSegments.risingStars.slice(0,3)} suggestedAction="راهنمایی هدفمند برای تبدیل شدن به اعضای بلندمدت." color="#8b5cf6" onAnalyzePath={() => handleAnalyzePath('risingStars')} isAnalyzing={isAnalyzing.risingStars}
                />
                 <SegmentCard 
                    id="at-risk" icon={LightBulbIcon} title="کاربران در معرض خطر" description="بیش از ۶۰ روز بدون فعالیت" count={userSegments.atRisk.length} sampleUsers={userSegments.atRisk.slice(0,3)} suggestedAction="اجرای کمپین‌های بازیابی و یادآوری برای فعال‌سازی مجدد." color="#ef4444" onAnalyzePath={() => handleAnalyzePath('atRisk')} isAnalyzing={isAnalyzing.atRisk}
                />
            </div>

            {renderAnalysisResult('champions', 'تحلیل مسیر طلایی قهرمانان')}
            {renderAnalysisResult('risingStars', 'تحلیل مسیر اولیه ستاره‌های نوظهور')}
            {renderAnalysisResult('atRisk', 'تحلیل مسیر منتهی به ریزش')}

            <GrowthAutomationEngine />
        </div>
    );
};

export default GrowthAnalyticsDashboard;
