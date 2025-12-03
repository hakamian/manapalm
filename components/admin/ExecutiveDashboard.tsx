
import React, { useMemo, useState } from 'react';
import { User, CommunityProject, TimelineEvent, MentorshipRequest, AdminKPIs, FunnelStep, MorningBriefing } from '../../types';
import { useAnimatedValue } from '../../utils/hooks';
import { heritagePriceMap } from '../../utils/heritage';
import { ChartPieIcon, UsersIcon, HandshakeIcon, BanknotesIcon, ArrowLeftIcon, ArrowUpIcon, ArrowDownIcon, SparklesIcon, BoltIcon, XMarkIcon } from '../icons';
import { generateMorningBriefing } from '../../services/geminiService';

const StatCard: React.FC<{ title: string, value: string | number, trend: 'rising' | 'stable' | 'falling', icon: React.FC<any> }> = ({ title, value, trend, icon: Icon }) => {
    const trendInfo = {
        rising: { icon: <ArrowUpIcon className="w-4 h-4" />, color: 'text-green-400' },
        stable: { icon: '●', color: 'text-gray-500' },
        falling: { icon: <ArrowDownIcon className="w-4 h-4" />, color: 'text-red-400' },
    };
    return (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-gray-600 transition-colors shadow-lg">
            <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-400">{title}</h3>
                <div className="p-2 rounded-full bg-gray-700/50">
                    <Icon className="w-6 h-6 text-amber-400" />
                </div>
            </div>
            <p className="text-3xl font-bold mt-3 text-white">{value}</p>
            <div className={`flex items-center gap-1 text-xs font-semibold mt-2 ${trendInfo[trend].color}`}>
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
        <div className="space-y-3">
            {data.map((step, index) => {
                const width = (step.value / maxVal) * 100;
                const conversion = index > 0 ? ((step.value / data[index - 1].value) * 100).toFixed(1) : null;

                return (
                    <div key={step.name} className="relative text-center">
                        {conversion && (
                            <div className="text-[10px] text-gray-500 mb-1 flex justify-center items-center gap-1">
                                <span>▼</span>
                                <span>{conversion}% تبدیل</span>
                            </div>
                        )}
                        <div 
                            className="relative h-10 bg-gradient-to-r from-amber-900/40 to-amber-800/40 rounded-lg border border-amber-700/30 flex items-center justify-center transition-all duration-500" 
                            style={{ width: `${width}%`, margin: '0 auto' }}
                        >
                            <div className="z-10 text-sm font-bold text-amber-100 flex items-center gap-2 px-2 whitespace-nowrap">
                                <span>{step.name}</span>
                                <span className="text-xs font-normal text-amber-300/80">({step.value.toLocaleString('fa-IR')})</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const MorningBriefingCard: React.FC<{ data: MorningBriefing, onClose: () => void }> = ({ data, onClose }) => {
    return (
        <div className="mb-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border-2 border-amber-500/50 p-1 shadow-[0_0_50px_rgba(245,158,11,0.15)] animate-fade-in-down">
            <div className="bg-gray-900/90 backdrop-blur-md rounded-[22px] p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
                
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-500/20 rounded-full border border-amber-500/30">
                            <BoltIcon className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">پنل فرماندهی صبحگاهی</h2>
                            <p className="text-amber-400/80 text-sm">{data.summary}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><XMarkIcon className="w-6 h-6"/></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.priorities.map((item, idx) => (
                        <div key={idx} className={`p-5 rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.02] ${
                            item.status === 'critical' ? 'bg-red-950/30 border-red-500/50' : 
                            item.status === 'warning' ? 'bg-amber-950/30 border-amber-500/50' : 
                            'bg-blue-950/30 border-blue-500/50'
                        }`}>
                            <div className="flex justify-between items-center mb-3">
                                <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                                    item.status === 'critical' ? 'bg-red-500/20 text-red-400' : 
                                    item.status === 'warning' ? 'bg-amber-500/20 text-amber-400' : 
                                    'bg-blue-500/20 text-blue-400'
                                }`}>
                                    {item.status === 'critical' ? 'بحرانی' : item.status === 'warning' ? 'هشدار' : 'فرصت'}
                                </span>
                                <span className="text-xs text-gray-500 font-mono">0{idx + 1}</span>
                            </div>
                            <h3 className="font-bold text-lg text-white mb-2">{item.title}</h3>
                            <p className="text-sm text-gray-400 mb-4 leading-relaxed min-h-[40px]">{item.description}</p>
                            <div className={`mt-auto pt-3 border-t border-dashed ${
                                 item.status === 'critical' ? 'border-red-500/30' : 
                                 item.status === 'warning' ? 'border-amber-500/30' : 
                                 'border-blue-500/30'
                            }`}>
                                <p className="text-xs font-semibold text-gray-300 mb-1">اقدام پیشنهادی:</p>
                                <p className={`text-sm font-bold ${
                                    item.status === 'critical' ? 'text-red-300' : 
                                    item.status === 'warning' ? 'text-amber-300' : 
                                    'text-blue-300'
                                }`}>{item.recommendedAction}</p>
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

    const funnelData: FunnelStep[] = useMemo(() => {
        const activeUsers = allUsers.filter(u => u.timeline && u.timeline.length > 1).length;
        const firstPurchaseUsers = allUsers.filter(u => u.timeline && u.timeline.some(e => e.type === 'palm_planted')).length;
        return [
            { name: 'کل اعضا', value: allUsers.length },
            { name: 'اعضای فعال', value: activeUsers },
            { name: 'اولین مشارکت', value: firstPurchaseUsers },
        ];
    }, [allUsers]);

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

    const handleGenerateBriefing = async () => {
        setIsGeneratingBriefing(true);
        try {
            // Prepare a data snapshot for the AI
            const dashboardSnapshot = {
                kpis,
                funnelData,
                urgentActions,
                totalUsers: allUsers.length,
                pendingRequests: pendingRequestsCount,
                last24hActivity: allInsights.filter(i => new Date(i.date).getTime() > Date.now() - 86400000).length
            };
            
            const result = await generateMorningBriefing(dashboardSnapshot);
            setBriefing(result);
        } catch (error) {
            console.error("Failed to generate briefing", error);
        } finally {
            setIsGeneratingBriefing(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Morning Briefing Section */}
            {!briefing ? (
                <button 
                    onClick={handleGenerateBriefing}
                    disabled={isGeneratingBriefing}
                    className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700 rounded-2xl p-8 flex items-center justify-center gap-4 transition-all group shadow-lg hover:shadow-amber-900/20"
                >
                    <div className={`p-4 rounded-full bg-amber-500/10 border border-amber-500/30 group-hover:bg-amber-500/20 transition-colors ${isGeneratingBriefing ? 'animate-pulse' : ''}`}>
                        <SparklesIcon className="w-8 h-8 text-amber-400" />
                    </div>
                    <div className="text-right">
                        <h3 className="text-xl font-bold text-white group-hover:text-amber-100 transition-colors">
                            {isGeneratingBriefing ? 'در حال تحلیل داده‌های استراتژیک...' : 'دریافت گزارش فرماندهی صبحگاهی'}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                            {isGeneratingBriefing ? 'هوش مصنوعی در حال اسکن وضعیت کل پلتفرم است.' : 'تحلیل ۳ اولویت حیاتی روز توسط هوش مصنوعی'}
                        </p>
                    </div>
                </button>
            ) : (
                <MorningBriefingCard data={briefing} onClose={() => setBriefing(null)} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="رشد اعضا (۳۰ روز اخیر)" value={kpis.userGrowth.value} trend={kpis.userGrowth.trend} icon={UsersIcon} />
                <StatCard title="تعامل جامعه (۳۰ روز اخیر)" value={kpis.engagementScore.value} trend={kpis.engagementScore.trend} icon={HandshakeIcon} />
                <StatCard title="سرمایه اجتماعی (۳۰ روز اخیر)" value={`${animatedInvestment.toLocaleString('fa-IR')} م`} trend={kpis.investmentFlow.trend} icon={BanknotesIcon} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold mb-6 text-white border-b border-gray-700 pb-4">اقدامات فوری</h3>
                    {urgentActions.length > 0 ? (
                        <div className="space-y-3">
                            {urgentActions.map(action => (
                                <div key={action.label} className="flex justify-between items-center p-4 bg-gray-700/40 rounded-xl border border-gray-600 hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-sm">
                                            {action.count.toLocaleString('fa-IR')}
                                        </span>
                                        <span className="text-gray-200">{action.label}</span>
                                    </div>
                                    <button onClick={() => handleActionClick(action.subTab)} className="text-xs font-semibold bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg flex items-center gap-1 transition-colors">
                                        <span>بررسی</span>
                                        <ArrowLeftIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-center text-gray-500 py-12 italic">هیچ اقدام فوری‌ای وجود ندارد. همه چیز آرام است.</p>}
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold mb-8 text-white text-center border-b border-gray-700 pb-4">قیف تبدیل کاربر</h3>
                    <div className="px-4">
                        <FunnelChart data={funnelData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecutiveDashboard;
