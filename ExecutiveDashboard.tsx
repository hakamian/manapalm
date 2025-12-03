


import React, { useMemo } from 'react';
import { User, CommunityProject, TimelineEvent, MentorshipRequest, AdminKPIs, FunnelStep } from './types.ts';
import { useAnimatedValue } from './utils/hooks.ts';
import { heritagePriceMap } from './utils/heritage.ts';
import { ChartPieIcon, UsersIcon, HandshakeIcon, BanknotesIcon, ArrowLeftIcon } from './components/icons.tsx';

const StatCard: React.FC<{ title: string, value: string | number, trend: 'rising' | 'stable' | 'falling', icon: React.FC<any> }> = ({ title, value, trend, icon: Icon }) => {
    const trendInfo = {
        rising: { icon: '▲', color: 'text-green-500' },
        stable: { icon: '●', color: 'text-stone-500' },
        falling: { icon: '▼', color: 'text-red-500' },
    };
    return (
        <div className="bg-white dark:bg-stone-800/50 p-6 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50">
            <div className="flex justify-between items-start">
                <h3 className="font-semibold text-stone-600 dark:text-stone-300">{title}</h3>
                <Icon className="w-8 h-8 text-amber-500 bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-full" />
            </div>
            <p className="text-4xl font-bold mt-2">{value}</p>
            <div className={`flex items-center gap-1 text-sm font-semibold mt-1 ${trendInfo[trend].color}`}>
                <span>{trendInfo[trend].icon}</span>
                <span>{trend === 'rising' ? 'صعودی' : trend === 'falling' ? 'نزولی' : 'پایدار'}</span>
            </div>
        </div>
    );
};

const FunnelChart: React.FC<{ data: FunnelStep[] }> = ({ data }) => {
    if (data.length === 0) return null;
    const maxVal = data[0].value;

    return (
        <div className="space-y-1">
            {data.map((step, index) => {
                const width = (step.value / maxVal) * 100;
                const conversion = index > 0 ? ((step.value / data[index - 1].value) * 100).toFixed(1) : null;

                return (
                    <div key={step.name} className="relative text-center">
                        {conversion && (
                            <div className="text-xs text-stone-500 dark:text-stone-400 mb-1">
                                <span>▼ </span>
                                <span>{conversion}% تبدیل</span>
                            </div>
                        )}
                        <div className="relative w-full h-10 bg-amber-100 dark:bg-amber-900/30 rounded-md flex items-center justify-center" style={{ width: `${width}%`, margin: '0 auto' }}>
                            <div className="z-10 text-sm font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                                <span>{step.name}</span>
                                <span className="text-xs font-normal">({step.value.toLocaleString('fa-IR')})</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

interface ExecutiveDashboardProps {
    allUsers: User[];
    allProjects: CommunityProject[];
    allInsights: TimelineEvent[];
    mentorshipRequests: MentorshipRequest[];
    setActiveTab: (tab: 'executive' | 'operations' | 'growth') => void;
    setActiveSubTab: (subTab: 'users' | 'mentorship' | 'ai-insights' | 'ai-coach') => void;
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ allUsers, allProjects, allInsights, mentorshipRequests, setActiveTab, setActiveSubTab }) => {
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

    const funnelData: FunnelStep[] = useMemo(() => {
        const activeUsers = allUsers.filter(u => u.timeline && u.timeline.length > 1).length;
        const firstPurchaseUsers = allUsers.filter(u => u.timeline && u.timeline.some(e => e.type === 'palm_planted')).length;
        return [
            { name: 'کل اعضا', value: allUsers.length },
            { name: 'اعضای فعال', value: activeUsers },
            { name: 'اولین مشارکت', value: firstPurchaseUsers },
        ];
    }, [allUsers]);

    // FIX: Correctly access the 'value' property of the 'investmentFlow' object for calculation.
    const animatedInvestment = useAnimatedValue(kpis.investmentFlow.value / 1000000, 1500);

    const pendingInsightsCount = allInsights.filter(i => i.status === 'pending').length;
    const pendingRequestsCount = mentorshipRequests.filter(r => r.status === 'pending').length;
    const urgentActions = [
        { count: pendingRequestsCount, label: 'درخواست مربی‌گری', subTab: 'mentorship' as const },
        { count: pendingInsightsCount, label: 'تامل در انتظار تایید', subTab: 'ai-insights' as const },
    ].filter(a => a.count > 0);

    const handleActionClick = (subTab: 'mentorship' | 'ai-insights') => {
        setActiveTab('operations');
        setActiveSubTab(subTab);
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="رشد اعضا (۳۰ روز اخیر)" value={kpis.userGrowth.value} trend={kpis.userGrowth.trend} icon={UsersIcon} />
                <StatCard title="تعامل جامعه (۳۰ روز اخیر)" value={kpis.engagementScore.value} trend={kpis.engagementScore.trend} icon={HandshakeIcon} />
                <StatCard title="سرمایه اجتماعی (۳۰ روز اخیر)" value={`${animatedInvestment.toLocaleString('fa-IR')} م`} trend={kpis.investmentFlow.trend} icon={BanknotesIcon} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-stone-800/50 p-6 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50">
                    <h3 className="text-xl font-bold mb-4">اقدامات فوری</h3>
                    {urgentActions.length > 0 ? (
                        <div className="space-y-3">
                            {urgentActions.map(action => (
                                <div key={action.label} className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <div>
                                        <span className="font-bold text-lg text-amber-700 dark:text-amber-200">{action.count.toLocaleString('fa-IR')}</span>
                                        <span className="mr-2 text-stone-700 dark:text-stone-200">{action.label}</span>
                                    </div>
                                    <button onClick={() => handleActionClick(action.subTab)} className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                        <span>بررسی</span>
                                        <ArrowLeftIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-center text-stone-500 py-8">هیچ اقدام فوری‌ای وجود ندارد.</p>}
                </div>

                <div className="bg-white dark:bg-stone-800/50 p-6 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50">
                    <h3 className="text-xl font-bold mb-4 text-center">قیف تبدیل کاربر</h3>
                    <FunnelChart data={funnelData} />
                </div>
            </div>
        </div>
    );
};

export default ExecutiveDashboard;