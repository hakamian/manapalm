
import React, { useMemo, useState } from 'react';
import { User, CommunityProject, TimelineEvent, MentorshipRequest, AdminKPIs, FunnelStep, MorningBriefing } from '../../types';
import { useAnimatedValue } from '../../utils/hooks';
import { heritagePriceMap } from '../../utils/heritage';
import {
    ChartPieIcon, UsersIcon, HandshakeIcon, BanknotesIcon, ArrowLeftIcon,
    ArrowUpIcon, ArrowDownIcon, SparklesIcon, BoltIcon, XMarkIcon,
    GlobeIcon, ArrowPathIcon, TrophyIcon, HeartIcon
} from '../icons';
import { generateMorningBriefing } from '../../services/geminiService';

const StatCard: React.FC<{ title: string, value: string | number, trend: 'rising' | 'stable' | 'falling', icon: React.FC<any>, color?: string }> = ({ title, value, trend, icon: Icon, color = "amber" }) => {
    const trendInfo = {
        rising: { icon: <ArrowUpIcon className="w-3 h-3" />, color: 'text-green-400', bg: 'bg-green-400/10' },
        stable: { icon: '●', color: 'text-gray-500', bg: 'bg-gray-500/10' },
        falling: { icon: <ArrowDownIcon className="w-3 h-3" />, color: 'text-red-400', bg: 'bg-red-400/10' },
    };

    const colors: any = {
        amber: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
        green: 'bg-green-400/10 text-green-400 border-green-400/20',
        indigo: 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20',
        rose: 'bg-rose-400/10 text-rose-400 border-rose-400/20',
    };

    return (
        <div className="glass-card p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${colors[color]} border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${trendInfo[trend].bg} ${trendInfo[trend].color}`}>
                    {trendInfo[trend].icon}
                    {trend === 'rising' ? '+12%' : trend === 'falling' ? '-4%' : '0%'}
                </div>
            </div>
            <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-1">{title}</h3>
            <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
        </div>
    );
};

const FunnelChart: React.FC<{ data: FunnelStep[] }> = ({ data }) => {
    if (data.length === 0) return null;
    const maxVal = data[0].value;

    return (
        <div className="space-y-6 py-4">
            {data.map((step, index) => {
                const width = (step.value / maxVal) * 100;
                const colors = [
                    'from-green-500 to-green-600',
                    'from-emerald-600 to-emerald-700',
                    'from-teal-700 to-teal-800',
                ];

                return (
                    <div key={step.name} className="relative">
                        <div className="flex justify-between items-end mb-2 px-1">
                            <span className="text-sm font-bold text-stone-300">{step.name}</span>
                            <span className="text-xs font-black text-stone-500">{step.value.toLocaleString('fa-IR')} نفر</span>
                        </div>
                        <div className="w-full bg-stone-900 h-3 rounded-full overflow-hidden border border-white/5">
                            <div
                                className={`h-full bg-gradient-to-l ${colors[index % colors.length]} rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,197,94,0.3)]`}
                                style={{ width: `${width}%` }}
                            ></div>
                        </div>
                        {index < data.length - 1 && (
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-black text-stone-600 flex items-center gap-1">
                                <ArrowDownIcon className="w-3 h-3" />
                                {((data[index + 1].value / step.value) * 100).toFixed(0)}% تبدیل
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const MorningBriefingCard: React.FC<{ data: MorningBriefing, onClose: () => void }> = ({ data, onClose }) => {
    return (
        <div className="mb-8 glass-panel rounded-[2.5rem] border-2 border-green-500/30 p-1 shadow-[0_40px_100px_rgba(0,0,0,0.6)] animate-fade-in-down relative">
            {/* Glowing Orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>

            <div className="bg-[#050505]/60 backdrop-blur-3xl rounded-[2.3rem] p-8 relative overflow-hidden">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-green-500 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                            <BoltIcon className="w-9 h-9 text-black" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black bg-green-500 text-black px-2 py-0.5 rounded-md uppercase tracking-widest">Live Analysis</span>
                                <h2 className="text-3xl font-black text-white tracking-tight">پنل فرماندهی صبحگاهی</h2>
                            </div>
                            <p className="text-stone-400 text-lg font-medium">{data.summary}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><XMarkIcon className="w-7 h-7" /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.priorities.map((item, idx) => (
                        <div key={idx} className={`group p-6 rounded-[2rem] border transition-all duration-500 hover:-translate-y-2 ${item.status === 'critical' ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/50' :
                                item.status === 'warning' ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/50' :
                                    'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/50'
                            }`}>
                            <div className="flex justify-between items-center mb-4">
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] border ${item.status === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                        item.status === 'warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                    }`}>
                                    {item.status === 'critical' ? 'CRITICAL' : item.status === 'warning' ? 'WARNING' : 'OPPORTUNITY'}
                                </span>
                                <span className="text-xs text-stone-600 font-black">#0{idx + 1}</span>
                            </div>
                            <h3 className="font-black text-xl text-white mb-2 leading-tight">{item.title}</h3>
                            <p className="text-sm text-stone-400 mb-6 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">{item.description}</p>

                            <div className={`pt-4 border-t border-white/5 flex flex-col gap-2`}>
                                <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Recommended Action</span>
                                <div className={`text-sm font-bold ${item.status === 'critical' ? 'text-red-300' :
                                        item.status === 'warning' ? 'text-amber-300' :
                                            'text-blue-300'
                                    } bg-white/5 p-3 rounded-xl border border-white/5`}>
                                    {item.recommendedAction}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface ExecutiveDashboardProps {
    allUsers: User[];
    allProjects: CommunityProject[];
    allInsights: TimelineEvent[];
    mentorshipRequests: MentorshipRequest[];
    setActiveTab: (tab: any) => void;
    setActiveSubTab: (subTab: any) => void;
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ allUsers, allProjects, allInsights, mentorshipRequests, setActiveTab, setActiveSubTab }) => {
    const [briefing, setBriefing] = useState<MorningBriefing | null>(null);
    const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);

    const kpis: AdminKPIs = useMemo(() => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

        const newUsers = allUsers.filter(u => new Date(u.joinDate) > oneMonthAgo).length;
        const prevNewUsers = allUsers.filter(u => new Date(u.joinDate) > twoMonthsAgo && new Date(u.joinDate) <= oneMonthAgo).length;

        const engagementEvents = allInsights.filter(i => new Date(i.date) > oneMonthAgo && ['palm_planted', 'reflection', 'course_completed'].includes(i.type)).length;

        const investmentFlow = allUsers.reduce((sum, u) => {
            return sum + (u.timeline || []).reduce((userSum, e) => {
                if (new Date(e.date) > oneMonthAgo && e.type === 'palm_planted') {
                    return userSum + (heritagePriceMap.get(e.details.id) || 0);
                }
                return userSum;
            }, 0);
        }, 0);

        return {
            userGrowth: { value: newUsers, trend: newUsers > prevNewUsers ? 'rising' : 'stable' },
            engagementScore: { value: engagementEvents, trend: 'rising' },
            investmentFlow: { value: investmentFlow, trend: 'rising' },
        };
    }, [allUsers, allInsights]);

    const globalStats = useMemo(() => {
        const totalMana = allUsers.reduce((sum, u) => sum + (u.manaPoints || 0), 0);
        const totalBarkat = allUsers.reduce((sum, u) => sum + (u.points || 0), 0);
        const totalPalms = allInsights.filter(i => i.type === 'palm_planted').length;
        return { totalMana, totalBarkat, totalPalms };
    }, [allUsers, allInsights]);

    const funnelData: FunnelStep[] = useMemo(() => {
        const activeUsers = allUsers.filter(u => u.timeline && u.timeline.length > 1).length;
        const firstPurchaseUsers = allUsers.filter(u => u.timeline && u.timeline.some(e => e.type === 'palm_planted')).length;
        return [
            { name: 'ایجاد حساب', value: allUsers.length },
            { name: 'تعامل فعال', value: activeUsers },
            { name: 'مشارکت اقتصادی', value: firstPurchaseUsers },
        ];
    }, [allUsers]);

    const animatedInvestment = useAnimatedValue(kpis.investmentFlow.value / 1000000, 1500);

    const pendingInsightsCount = allInsights.filter(i => i.status === 'pending').length;
    const pendingRequestsCount = mentorshipRequests.filter(r => r.status === 'pending').length;
    const urgentActions = [
        { count: pendingRequestsCount, label: 'درخواست مربی‌گری', subTab: 'mentorship' as const, color: 'indigo' },
        { count: pendingInsightsCount, label: 'تاملات در انتظار تایید', subTab: 'ai-insights' as const, color: 'green' },
    ].filter(a => a.count > 0);

    const handleActionClick = (subTab: 'mentorship' | 'ai-insights') => {
        if (subTab === 'mentorship') setActiveTab('ai_think_tank');
        else setActiveTab('ai_reports');
    };

    const handleGenerateBriefing = async () => {
        setIsGeneratingBriefing(true);
        try {
            const dashboardSnapshot = { kpis, funnelData, urgentActions, totalUsers: allUsers.length, pendingRequests: pendingRequestsCount, last24hActivity: allInsights.filter(i => new Date(i.date).getTime() > Date.now() - 86400000).length };
            const result = await generateMorningBriefing(dashboardSnapshot);
            setBriefing(result);
        } catch (error) { console.error(error); } finally { setIsGeneratingBriefing(false); }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header / Briefing Trigger */}
            {!briefing ? (
                <div className="glass-panel p-8 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <div className="relative z-10 text-center md:text-right">
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-2">خوش آمدید، <span className="text-green-500">ادمین</span></h2>
                        <p className="text-stone-500 font-bold max-w-md">وضعیت سیستم در بالاترین سطح پایداری است. امروز ۱۲ کاربر جدید به نخلستان پیوسته‌اند.</p>
                    </div>

                    <button
                        onClick={handleGenerateBriefing}
                        disabled={isGeneratingBriefing}
                        className="relative z-10 min-w-[300px] h-16 bg-white text-black rounded-3xl font-black text-lg shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isGeneratingBriefing ? (
                            <ArrowPathIcon className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <SparklesIcon className="w-6 h-6" />
                                <span>گزارش فرماندهی روز</span>
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <MorningBriefingCard data={briefing} onClose={() => setBriefing(null)} />
            )}

            {/* Core KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="رشد اعضا" value={kpis.userGrowth.value.toLocaleString('fa-IR')} trend={kpis.userGrowth.trend} icon={UsersIcon} color="green" />
                <StatCard title="سرمایه در گردش" value={`${animatedInvestment.toLocaleString('fa-IR')} م`} trend={kpis.investmentFlow.trend} icon={BanknotesIcon} color="amber" />
                <StatCard title="نخل‌های کاشته شده" value={globalStats.totalPalms.toLocaleString('fa-IR')} trend="rising" icon={GlobeIcon} color="rose" />
                <StatCard title="گردش مانا" value={globalStats.totalMana.toLocaleString('fa-IR')} trend="rising" icon={SparklesIcon} color="indigo" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Urgent Actions - Column 2 */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <BoltIcon className="w-5 h-5 text-amber-500" />
                            اقدامات فوری
                        </h3>
                        <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md font-black tracking-widest uppercase">Action Required</span>
                    </div>
                    {urgentActions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {urgentActions.map(action => (
                                <div key={action.label} className="glass-card p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 ${action.color === 'indigo' ? 'bg-indigo-500 text-white' : 'bg-green-500 text-black'
                                            }`}>
                                            <span className="text-2xl font-black">{action.count}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white">{action.label}</h4>
                                            <p className="text-xs text-stone-500 font-bold mt-0.5">در انتظار بررسی مدیریت</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleActionClick(action.subTab)}
                                        className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                                    >
                                        <ArrowLeftIcon className="w-5 h-5 text-stone-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-panel p-10 rounded-[2rem] border border-dashed border-white/10 text-center">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HeartIcon className="w-8 h-8 text-green-500 opacity-50" />
                            </div>
                            <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">All Clear</p>
                        </div>
                    )}

                    {/* Quick Economy Pulse */}
                    <div className="glass-panel p-6 rounded-[2rem] border border-white/5">
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <ChartPieIcon className="w-4 h-4 text-indigo-400" />
                            تعادل اقتصاد معنا
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase text-stone-500 mb-2">
                                    <span>Circulating Mana</span>
                                    <span>{globalStats.totalMana.toLocaleString('fa-IR')} M</span>
                                </div>
                                <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full w-[65%] shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase text-stone-500 mb-2">
                                    <span>Barkat Liquidity</span>
                                    <span>{globalStats.totalBarkat.toLocaleString('fa-IR')} B</span>
                                </div>
                                <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full w-[45%] shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conversion Funnel - Column 3 */}
                <div className="lg:col-span-3">
                    <div className="glass-panel p-8 rounded-[3rem] border border-white/5 h-full relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/20 to-transparent"></div>
                        <h3 className="text-lg font-black text-white uppercase tracking-widest mb-10 flex items-center justify-center gap-2">
                            <TrophyIcon className="w-5 h-5 text-amber-500" />
                            قیف تبدیل و وفاداری
                        </h3>
                        <FunnelChart data={funnelData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecutiveDashboard;
