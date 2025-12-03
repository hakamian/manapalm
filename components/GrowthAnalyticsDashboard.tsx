
import React, { useMemo, useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { User, TimelineEvent, Course } from '../types.ts';
// FIX: Corrected import path for heritageItems.
import { heritageItems } from '../utils/heritage.ts';
import SimpleBarChart from './SimpleBarChart.tsx';
import { UsersIcon, ChartPieIcon, SparklesIcon, TargetIcon, TrendingUpIcon, SitemapIcon, LightBulbIcon } from './icons.tsx';

// Data copied from CoursesPage.tsx to avoid modifying it
const coursesData: Course[] = [
    {
        id: '1',
        title: 'دوره جامع کوچینگ معنا',
        shortDescription: 'سفری عمیق به درون برای کشف معنای شخصی و حرفه‌ای زندگی.',
        longDescription: 'در این دوره، با استفاده از ابزارهای کوچینگ و روانشناسی مثبت‌گرا، شما را در مسیری هدایت می‌کنیم تا ارزش‌ها، رسالت و چشم‌انداز زندگی خود را کشف کنید. این دوره به شما کمک می‌کند تا با وضوح و انگیزه بیشتری در مسیر اهداف خود قدم بردارید.',
        instructor: 'دکتر حمید حکیمیان',
        duration: '۸ هفته',
        level: 'متوسط',
        tags: ['کوچینگ', 'معنای زندگی', 'توسعه فردی', 'personal'],
        imageUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=2940&auto=format&fit=crop',
        price: 850000,
    },
    {
        id: '2',
        title: 'کارآفرینی اجتماعی و کسب‌وکار پایدار',
        shortDescription: 'یاد بگیرید چگونه یک کسب‌وکار سودده با تأثیر مثبت اجتماعی و محیط‌زیستی خلق کنید.',
        longDescription: 'این دوره شما را با اصول کارآفرینی اجتماعی، مدل‌های کسب‌وکار پایدار، و استراتژی‌های ایجاد تأثیر مثبت آشنا می‌کند. از ایده تا اجرا، گام به گام با شما همراه خواهیم بود تا کسب‌وکار معنامحور خود را راه‌اندازی کنید.',
        instructor: 'تیم نخلستان معنا',
        duration: '۶ هفته',
        level: 'مقدماتی',
        tags: ['کارآفرینی', 'کسب‌وکار اجتماعی', 'پایداری', 'business'],
        imageUrl: 'https://images.unsplash.com/photo-1521737852577-684897f092a2?q=80&w=2942&auto=format&fit=crop',
        price: 600000,
    },
    {
        id: '5',
        title: 'سفر ۶ روزه کوچینگ معنا',
        shortDescription: 'یک اردوی حضوری عمیق و تحول‌آفرین برای بازآفرینی داستان زندگی شما.',
        longDescription: 'این دوره که گل سرسبد دوره‌های ماست، یک اردوی ۶ روزه در اقامتگاه بوم‌گردی نخلستان معنا است. در این سفر، به دور از دنیای دیجیتال، با راهنمایی دکتر حکیمیان و در جمعی صمیمی، عمیق‌ترین لایه‌های وجودی خود را کاوش کرده و با یک نقشه راه جدید برای زندگی معنادار بازخواهید گشت. (این دوره شامل بورسیه برای اعضای واجد شرایط است)',
        instructor: 'دکتر حمید حکیمیان',
        duration: '۶ روز حضوری',
        level: 'پیشرفته',
        tags: ['کوچینگ', 'معنای زندگی', 'توسعه فردی', 'personal'],
        imageUrl: 'https://images.unsplash.com/photo-1505521899797-0353a2a45d5a?q=80&w=2940&auto=format&fit=crop',
        price: 6500000,
        isRetreat: true,
    },
    {
        id: '3',
        title: 'اصول باغبانی و پرورش نخل',
        shortDescription: 'دانش عملی برای کاشت، نگهداری و به ثمر رساندن نخل خرما.',
        longDescription: 'یک دوره عملی که شما را با تمام جنبه‌های پرورش نخل، از انتخاب نهال تا برداشت محصول، آشنا می‌کند. این دوره برای علاقه‌مندان به کشاورزی و کسانی که می‌خواهند ارتباط عمیق‌تری با طبیعت برقرار کنند، طراحی شده است.',
        instructor: 'مهندس کشاورزی محلی',
        duration: '۴ جلسه عملی',
        level: 'مقدماتی',
        tags: ['کشاورزی', 'نخل', 'باغبانی', 'practical'],
        imageUrl: 'https://images.unsplash.com/photo-1585253139176-354311b1353f?q=80&w=2940&auto=format&fit=crop',
        price: 450000,
    },
     {
        id: '4',
        title: 'رهبری معنامحور در سازمان',
        shortDescription: 'چگونه به عنوان یک رهبر، فرهنگ معنا و هدفمندی را در تیم خود ایجاد کنیم.',
        longDescription: 'این دوره پیشرفته برای مدیران و رهبران سازمان‌ها طراحی شده است. در این دوره می‌آموزید که چگونه با ترویج معنا در محیط کار، انگیزه، تعهد و بهره‌وری تیم خود را به شکل چشمگیری افزایش دهید.',
        instructor: 'دکتر حمید حکیمیان',
        duration: '۵ هفته',
        level: 'پیشرفته',
        tags: ['رهبری', 'مدیریت', 'فرهنگ سازمانی', 'business'],
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2940&auto=format&fit=crop',
        price: 1200000,
    }
];

const ChartContainer: React.FC<{ title: string, children: React.ReactNode, icon: React.FC<any>, id?: string }> = ({ title, children, icon: Icon, id }) => (
    <div id={id} className="bg-white dark:bg-stone-800/50 p-6 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon className="w-6 h-6 text-amber-500" />
            {title}
        </h3>
        {children}
    </div>
);

const LineChart: React.FC<{ data: { label: string, value: number }[] }> = ({ data }) => {
    if (!data || data.length === 0) return <p className="text-center text-stone-500 py-10">داده‌ای برای نمایش وجود ندارد.</p>;
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
        <div className="flex justify-around items-end h-64 bg-stone-50 dark:bg-stone-800 p-4 rounded-lg border dark:border-stone-700">
            {data.map((point, index) => (
                <div key={index} className="flex flex-col items-center h-full w-[8%]" title={`${point.label}: ${point.value}`}>
                    <div className="flex-grow flex items-end w-full">
                        <div 
                            className="w-full bg-amber-500 rounded-t-md hover:bg-amber-400 transition-all duration-300"
                            style={{ height: `${(point.value / maxValue) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-xs mt-2 text-stone-500 dark:text-stone-400 transform -rotate-45">{point.label}</span>
                </div>
            ))}
        </div>
    );
};

const TopListItem: React.FC<{ name: string, count: number, index: number }> = ({ name, count, index }) => (
     <li className="flex justify-between items-center text-sm p-2 rounded-md even:bg-stone-50 dark:even:bg-stone-700/50">
        <div className="flex items-center gap-3">
            <span className="font-bold text-stone-400 w-5">{index + 1}</span>
            <span className="font-semibold text-stone-700 dark:text-stone-200">{name}</span>
        </div>
        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{count.toLocaleString('fa-IR')}</span>
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

const SegmentCard: React.FC<SegmentCardProps> = ({ id, icon: Icon, title, description, count, sampleUsers, suggestedAction, color, onAnalyzePath, isAnalyzing }) => (
    <div id={id} className={`p-4 rounded-lg border-l-4 bg-stone-50 dark:bg-stone-800 flex flex-col`} style={{ borderColor: color }}>
        <div className="flex items-center gap-3">
            <Icon className="w-8 h-8" style={{ color }} />
            <div>
                <h4 className="font-bold">{title} ({count.toLocaleString('fa-IR')})</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">{description}</p>
            </div>
        </div>
        <div className="mt-3 text-xs">
            <p className="font-semibold">نمونه کاربران:</p>
            <p className="text-stone-600 dark:text-stone-300 truncate">{sampleUsers.map(u => u.name).join('، ')}</p>
        </div>
         <div className="mt-3 text-xs p-2 bg-stone-100 dark:bg-stone-700/50 rounded flex-grow">
            <p className="font-semibold">اقدام پیشنهادی:</p>
            <p className="text-stone-600 dark:text-stone-300">{suggestedAction}</p>
        </div>
        <div className="mt-4 pt-3 border-t border-dashed dark:border-stone-700/50">
            <button 
                onClick={onAnalyzePath} 
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 px-4 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-600 disabled:opacity-50 transition-colors"
            >
                <SitemapIcon className="w-5 h-5" />
                {isAnalyzing ? 'در حال تحلیل...' : 'تحلیل مسیر'}
            </button>
        </div>
    </div>
);

const UserLifecycleFunnel: React.FC<{
    stages: { name: string; count: number; conversion?: number; color: string; id: string }[];
    churn: { count: number; rate: number };
}> = ({ stages, churn }) => {
    const handleStageClick = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-2 md:gap-0">
                {stages.map((stage, index) => (
                    <React.Fragment key={stage.name}>
                        <button
                            onClick={() => handleStageClick(stage.id)}
                            className="relative flex flex-col items-center justify-center text-center p-4 h-28 w-40 md:w-48 bg-stone-100 dark:bg-stone-800 rounded-lg hover:shadow-lg hover:scale-105 transition-all"
                        >
                            <div className="absolute -top-px h-1 w-1/2" style={{ backgroundColor: stage.color }}></div>
                            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">{stage.name}</span>
                            <span className="text-3xl font-bold my-1">{stage.count.toLocaleString('fa-IR')}</span>
                            <span className="text-xs text-stone-500 dark:text-stone-400">کاربر</span>
                        </button>

                        {stage.conversion !== undefined && (
                            <div className="flex flex-col items-center mx-1 md:mx-4 w-20">
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">{stage.conversion.toFixed(1)}%</span>
                                <div className="text-green-500">→</div>
                                <span className="text-xs text-stone-500 dark:text-stone-400">تبدیل</span>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
             <div className="flex items-center gap-4 text-sm text-red-500 dark:text-red-400">
                <span>↓</span>
                <span className="font-bold">{churn.count.toLocaleString('fa-IR')} کاربر در معرض خطر ({churn.rate.toFixed(1)}%)</span>
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
            .slice(-12) // Last 12 months
            .map(([label, value]) => ({ label: new Date(label).toLocaleDateString('fa-IR', { month: 'short' }), value }));
    }, [allUsers]);

    const engagementDistribution = useMemo(() => {
        const counts: { [key: string]: number } = {
            'کاشت نخل': 0,
            'تامل': 0,
            'اقدام خلاقانه': 0,
            'تکمیل دوره': 0
        };

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
        
        return Object.entries(counts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([id, count]) => ({
                name: heritageItems.find(h => h.id === id)?.title || id,
                count
            }));
    }, [allInsights]);

    const popularCourses = useMemo(() => {
        const counts: { [key: string]: number } = {};
        allUsers.forEach(user => {
            (user.purchasedCourseIds || []).forEach(courseId => {
                 if (!counts[courseId]) counts[courseId] = 0;
                 counts[courseId]++;
            });
        });

        return Object.entries(counts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([id, count]) => ({
                name: coursesData.find(c => c.id === id)?.title || id,
                count
            }));
    }, [allUsers]);

    const userSegments = useMemo(() => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const sortedByPoints = [...allUsers].sort((a, b) => b.points - a.points);
        const championCount = Math.max(1, Math.floor(allUsers.length * 0.05));
        const champions = sortedByPoints.slice(0, championCount);

        const newUsers = allUsers.filter(u => new Date(u.joinDate) > oneMonthAgo);
        const risingStars = newUsers.filter(u => (u.timeline?.length || 0) > 2);
        
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const atRisk = allUsers.filter(u => {
            const sortedTimeline = [...(u.timeline || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const lastEventDate = sortedTimeline[0] ? new Date(sortedTimeline[0].date) : new Date(u.joinDate);
            return lastEventDate < sixtyDaysAgo && new Date(u.joinDate) < sixtyDaysAgo;
        });

        return { newUsers, risingStars, champions, atRisk };
    }, [allUsers]);
    
    const analysisPrompts: Record<SegmentType, string> = {
        champions: 'You are a user behavior analyst. Analyze the user journey timelines of a platform\'s most successful users ("Champions") to identify the "Golden Path" - the most common sequence of key actions that leads to high engagement.',
        risingStars: 'You are a user onboarding specialist. Analyze the timelines of promising new users ("Rising Stars") to identify their "First Mile Golden Path" - the earliest positive signals and actions they take. Focus on what we should encourage in the onboarding process.',
        atRisk: 'You are a user retention expert. Analyze the timelines of inactive users ("At-Risk") to identify the "Path to Churn". Find the common drop-off points or key actions they failed to take compared to successful users. The goal is to find anti-patterns to prevent churn.'
    };

    const handleAnalyzePath = async (segment: SegmentType) => {
        setIsAnalyzing(prev => ({ ...prev, [segment]: true }));
        setAnalysisResults(prev => ({ ...prev, [segment]: null }));
        setAnalysisError(prev => ({ ...prev, [segment]: null }));

        let usersForAnalysis: User[];
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
            events: (user.timeline || [])
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 10) // Limit to early journey
                .map(event => event.type)
        }));

        const systemInstruction = `${analysisPrompts[segment]} Your analysis should:
        1. Identify a common, sequential pattern of 3-4 key events.
        2. Derive a single, powerful "Key Insight" from this pattern.
        3. Propose a concrete, "Suggested Action" for the platform admins.
        You MUST respond ONLY with a JSON object that matches this exact schema. All text content MUST be in Persian.`;
        
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
                            sequence: { type: Type.STRING, description: "The discovered path sequence, e.g., 'Step 1 -> Step 2'" },
                            insight: { type: Type.STRING, description: "The key insight derived from the path." },
                            suggestion: { type: Type.STRING, description: "The suggested action for admins." }
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
                {error && <p className="text-center text-red-500 py-8">{error}</p>}
                {result && (
                    <div className="space-y-4 text-sm">
                        <div>
                            <h4 className="font-bold">توالی کشف‌شده:</h4>
                            <p className="p-3 bg-stone-100 dark:bg-stone-700/50 rounded-lg mt-1 font-mono text-center tracking-wider">{result.sequence}</p>
                        </div>
                        <div>
                            <h4 className="font-bold">بینش کلیدی:</h4>
                            <p className="p-3 bg-stone-100 dark:bg-stone-700/50 rounded-lg mt-1 italic">"{result.insight}"</p>
                        </div>
                        <div>
                            <h4 className="font-bold">اقدام پیشنهادی:</h4>
                            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg mt-1">
                                <LightBulbIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p>{result.suggestion}</p>
                            </div>
                        </div>
                    </div>
                )}
            </ChartContainer>
        );
    };

    // FIX: Add a return statement to the component to render JSX.
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
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <SegmentCard 
                    id="champions"
                    icon={TargetIcon}
                    title="قهرمانان"
                    description="۵٪ برتر کاربران از نظر امتیاز"
                    count={userSegments.champions.length}
                    sampleUsers={userSegments.champions.slice(0,3)}
                    suggestedAction="ایجاد فرصت‌های مربی‌گری و پروژه‌های ویژه برای حفظ انگیزه."
                    color="#f59e0b"
                    onAnalyzePath={() => handleAnalyzePath('champions')}
                    isAnalyzing={isAnalyzing.champions}
                />
                 <SegmentCard 
                    id="rising-stars"
                    icon={TrendingUpIcon}
                    title="ستاره‌های نوظهور"
                    description="کاربران جدید با تعامل بالا"
                    count={userSegments.risingStars.length}
                    sampleUsers={userSegments.risingStars.slice(0,3)}
                    suggestedAction="راهنمایی هدفمند برای تبدیل شدن به اعضای بلندمدت."
                    color="#8b5cf6"
                    onAnalyzePath={() => handleAnalyzePath('risingStars')}
                    isAnalyzing={isAnalyzing.risingStars}
                />
                 <SegmentCard 
                    id="at-risk"
                    icon={LightBulbIcon}
                    title="کاربران در معرض خطر"
                    description="بیش از ۶۰ روز بدون فعالیت"
                    count={userSegments.atRisk.length}
                    sampleUsers={userSegments.atRisk.slice(0,3)}
                    suggestedAction="اجرای کمپین‌های بازیابی و یادآوری برای فعال‌سازی مجدد."
                    color="#ef4444"
                    onAnalyzePath={() => handleAnalyzePath('atRisk')}
                    isAnalyzing={isAnalyzing.atRisk}
                />
            </div>

            {renderAnalysisResult('champions', 'تحلیل مسیر طلایی قهرمانان')}
            {renderAnalysisResult('risingStars', 'تحلیل مسیر اولیه ستاره‌های نوظهور')}
            {renderAnalysisResult('atRisk', 'تحلیل مسیر منتهی به ریزش')}
        </div>
    );
};

export default GrowthAnalyticsDashboard;
