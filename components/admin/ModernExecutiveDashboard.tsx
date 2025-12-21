import React, { useMemo, useState } from 'react';
import { User, CommunityProject, TimelineEvent, MentorshipRequest, AdminKPIs, FunnelStep, MorningBriefing } from '../../types';
import { useAnimatedValue } from '../../utils/hooks';
import { heritagePriceMap } from '../../utils/heritage';
import {
    ChartPieIcon, UsersIcon, HandshakeIcon, BanknotesIcon, ArrowLeftIcon,
    ArrowUpIcon, ArrowDownIcon, SparklesIcon, BoltIcon, XMarkIcon,
    ArrowDownTrayIcon, ClockIcon
} from '../icons';
import { generateMorningBriefing } from '../../services/geminiService';
import '../../styles/admin-dashboard.css';

// Modern Stat Card with enhanced design
const ModernStatCard: React.FC<{
    title: string,
    value: string | number,
    trend: 'rising' | 'stable' | 'falling',
    icon: React.FC<any>,
    gradient: string,
    change?: number
}> = ({ title, value, trend, icon: Icon, gradient, change }) => {
    const trendConfig = {
        rising: { icon: ArrowUpIcon, color: '#10b981', label: 'صعودی' },
        stable: { icon: null, color: '#6b7280', label: 'پایدار' },
        falling: { icon: ArrowDownIcon, color: '#ef4444', label: 'نزولی' },
    };

    const config = trendConfig[trend];
    const TrendIcon = config.icon;

    return (
        <div
            className="admin-stat-card"
            style={{ '--gradient': gradient } as React.CSSProperties}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p className="admin-label" style={{ marginBottom: '0.5rem' }}>
                        {title}
                    </p>
                    <h2 className="admin-heading-2" style={{ marginBottom: '0.75rem', fontSize: '2rem' }}>
                        {value}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {TrendIcon && <TrendIcon className="w-4 h-4" style={{ color: config.color }} />}
                        <span className="admin-caption" style={{ color: config.color }}>
                            {config.label}
                            {change && ` (${change > 0 ? '+' : ''}${change}%)`}
                        </span>
                    </div>
                </div>
                <div
                    style={{
                        background: gradient,
                        padding: '0.75rem',
                        borderRadius: 'var(--admin-radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Icon className="w-6 h-6" style={{ color: 'white' }} />
                </div>
            </div>
        </div>
    );
};

// Enhanced Funnel Chart
const ModernFunnelChart: React.FC<{ data: FunnelStep[] }> = ({ data }) => {
    if (data.length === 0) return null;
    const maxVal = data[0].value;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.map((step, index) => {
                const width = (step.value / maxVal) * 100;
                const conversion = index > 0 ? ((step.value / data[index - 1].value) * 100).toFixed(1) : null;

                return (
                    <div key={step.name}>
                        {conversion && (
                            <div style={{
                                textAlign: 'center',
                                fontSize: '0.75rem',
                                color: 'var(--admin-text-muted)',
                                marginBottom: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}>
                                <span>▼</span>
                                <span>{conversion}% تبدیل</span>
                            </div>
                        )}
                        <div
                            style={{
                                width: `${width}%`,
                                margin: '0 auto',
                                height: '48px',
                                background: 'var(--admin-gradient-primary)',
                                borderRadius: 'var(--admin-radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                color: 'white',
                                fontWeight: 700
                            }}>
                                <span>{step.name}</span>
                                <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                                    ({step.value.toLocaleString('fa-IR')})
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Enhanced Morning Briefing Card
const ModernMorningBriefingCard: React.FC<{ data: MorningBriefing, onClose: () => void }> = ({ data, onClose }) => {
    return (
        <div className="admin-card admin-animate-fade-in" style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
            border: '2px solid rgba(139, 92, 246, 0.3)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Glow effect */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, var(--admin-purple), transparent)'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        background: 'var(--admin-gradient-primary)',
                        padding: '1rem',
                        borderRadius: 'var(--admin-radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <BoltIcon className="w-8 h-8" style={{ color: 'white' }} />
                    </div>
                    <div>
                        <h2 className="admin-heading-2" style={{ marginBottom: '0.25rem' }}>
                            پنل فرماندهی صبحگاهی
                        </h2>
                        <p className="admin-caption" style={{ color: 'var(--admin-purple)' }}>
                            {data.summary}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="admin-btn-icon"
                    style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                >
                    <XMarkIcon className="w-5 h-5" style={{ color: '#ef4444' }} />
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem'
            }}>
                {data.priorities.map((item, idx) => {
                    const statusConfig = {
                        critical: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', label: 'بحرانی' },
                        warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b', label: 'هشدار' },
                        opportunity: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', color: '#3b82f6', label: 'فرصت' }
                    };
                    const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.opportunity;

                    return (
                        <div
                            key={idx}
                            className="admin-card"
                            style={{
                                padding: '1.5rem',
                                background: config.bg,
                                border: `1px solid ${config.border}`,
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = `0 10px 30px ${config.border}`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span
                                    className="admin-badge"
                                    style={{
                                        background: config.bg,
                                        color: config.color,
                                        border: `1px solid ${config.border}`,
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    {config.label}
                                </span>
                                <span style={{
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    color: 'var(--admin-text-muted)'
                                }}>
                                    0{idx + 1}
                                </span>
                            </div>

                            <h3 className="admin-heading-3" style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>
                                {item.title}
                            </h3>
                            <p className="admin-body" style={{
                                fontSize: '0.875rem',
                                color: 'var(--admin-text-secondary)',
                                marginBottom: '1rem',
                                lineHeight: '1.6'
                            }}>
                                {item.description}
                            </p>

                            <div style={{
                                paddingTop: '1rem',
                                borderTop: `1px dashed ${config.border}`
                            }}>
                                <p className="admin-label" style={{ marginBottom: '0.5rem' }}>
                                    اقدام پیشنهادی:
                                </p>
                                <p style={{
                                    fontWeight: 700,
                                    color: config.color,
                                    fontSize: '0.875rem'
                                }}>
                                    {item.recommendedAction}
                                </p>
                            </div>
                        </div>
                    );
                })}
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

const ModernExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
    allUsers,
    allProjects,
    allInsights,
    mentorshipRequests,
    setActiveTab,
    setActiveSubTab
}) => {
    const [briefing, setBriefing] = useState<MorningBriefing | null>(null);
    const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    // Calculate date ranges
    const dateRanges = useMemo(() => {
        const now = new Date();
        const ranges = {
            '7d': 7,
            '30d': 30,
            '90d': 90
        };
        const days = ranges[timeRange];
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const prevStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

        return { startDate, prevStartDate };
    }, [timeRange]);

    const kpis: AdminKPIs = useMemo(() => {
        const { startDate, prevStartDate } = dateRanges;

        const newUsers = allUsers.filter(u => new Date(u.joinDate) > startDate).length;
        const prevNewUsers = allUsers.filter(u =>
            new Date(u.joinDate) > prevStartDate && new Date(u.joinDate) <= startDate
        ).length;

        const engagementEvents = allInsights.filter(i =>
            new Date(i.date) > startDate &&
            ['palm_planted', 'reflection', 'course_completed'].includes(i.type)
        ).length;
        const prevEngagementEvents = allInsights.filter(i =>
            new Date(i.date) > prevStartDate &&
            new Date(i.date) <= startDate &&
            ['palm_planted', 'reflection', 'course_completed'].includes(i.type)
        ).length;

        const investmentFlow = allUsers.reduce((sum, u) => {
            return sum + (u.timeline || []).reduce((userSum, e) => {
                if (new Date(e.date) > startDate && e.type === 'palm_planted') {
                    return userSum + (heritagePriceMap.get(e.details.id) || 0);
                }
                return userSum;
            }, 0);
        }, 0);

        const prevInvestmentFlow = allUsers.reduce((sum, u) => {
            return sum + (u.timeline || []).reduce((userSum, e) => {
                if (new Date(e.date) > prevStartDate && new Date(e.date) <= startDate && e.type === 'palm_planted') {
                    return userSum + (heritagePriceMap.get(e.details.id) || 0);
                }
                return userSum;
            }, 0);
        }, 0);

        const userGrowthChange = prevNewUsers > 0 ? ((newUsers - prevNewUsers) / prevNewUsers * 100) : 0;
        const engagementChange = prevEngagementEvents > 0 ? ((engagementEvents - prevEngagementEvents) / prevEngagementEvents * 100) : 0;
        const investmentChange = prevInvestmentFlow > 0 ? ((investmentFlow - prevInvestmentFlow) / prevInvestmentFlow * 100) : 0;

        return {
            userGrowth: {
                value: newUsers,
                trend: newUsers > prevNewUsers ? 'rising' : newUsers < prevNewUsers ? 'falling' : 'stable',
                change: Math.round(userGrowthChange)
            },
            engagementScore: {
                value: engagementEvents,
                trend: engagementEvents > prevEngagementEvents ? 'rising' : engagementEvents < prevEngagementEvents ? 'falling' : 'stable',
                change: Math.round(engagementChange)
            },
            investmentFlow: {
                value: investmentFlow,
                trend: investmentFlow > prevInvestmentFlow ? 'rising' : investmentFlow < prevInvestmentFlow ? 'falling' : 'stable',
                change: Math.round(investmentChange)
            },
        };
    }, [allUsers, allInsights, dateRanges]);

    const funnelData: FunnelStep[] = useMemo(() => {
        const activeUsers = allUsers.filter(u => u.timeline && u.timeline.length > 1).length;
        const firstPurchaseUsers = allUsers.filter(u =>
            u.timeline && u.timeline.some(e => e.type === 'palm_planted')
        ).length;
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
            const dashboardSnapshot = {
                kpis,
                funnelData,
                urgentActions,
                totalUsers: allUsers.length,
                pendingRequests: pendingRequestsCount,
                last24hActivity: allInsights.filter(i =>
                    new Date(i.date).getTime() > Date.now() - 86400000
                ).length
            };

            const result = await generateMorningBriefing(dashboardSnapshot);
            setBriefing(result);
        } catch (error) {
            console.error("Failed to generate briefing", error);
        } finally {
            setIsGeneratingBriefing(false);
        }
    };

    const handleExportReport = () => {
        const report = {
            generatedAt: new Date().toISOString(),
            timeRange,
            kpis,
            funnelData,
            urgentActions
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `executive-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    return (
        <div className="admin-container" style={{ padding: '2rem' }}>
            {/* Header with Time Range Selector */}
            <div className="admin-animate-fade-in" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h1 className="admin-heading-1" style={{ marginBottom: '0.5rem' }}>
                            داشبورد اجرایی
                        </h1>
                        <p className="admin-body" style={{ color: 'var(--admin-text-tertiary)' }}>
                            نمای کلی عملکرد و KPI های کلیدی
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {/* Time Range Selector */}
                        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--admin-bg-tertiary)', padding: '0.25rem', borderRadius: 'var(--admin-radius-md)' }}>
                            {(['7d', '30d', '90d'] as const).map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={timeRange === range ? 'admin-btn admin-btn-primary' : 'admin-btn admin-btn-ghost'}
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                >
                                    {range === '7d' ? '7 روز' : range === '30d' ? '30 روز' : '90 روز'}
                                </button>
                            ))}
                        </div>

                        {/* Export Button */}
                        <button
                            onClick={handleExportReport}
                            className="admin-btn admin-btn-ghost"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            خروجی
                        </button>
                    </div>
                </div>
            </div>

            {/* Morning Briefing Section */}
            {!briefing ? (
                <button
                    onClick={handleGenerateBriefing}
                    disabled={isGeneratingBriefing}
                    className="admin-card admin-animate-fade-in"
                    style={{
                        width: '100%',
                        padding: '2rem',
                        marginBottom: '2rem',
                        cursor: 'pointer',
                        border: '2px dashed var(--admin-glass-border)',
                        background: isGeneratingBriefing ? 'var(--admin-bg-tertiary)' : 'var(--admin-bg-secondary)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        if (!isGeneratingBriefing) {
                            e.currentTarget.style.borderColor = 'var(--admin-purple)';
                            e.currentTarget.style.background = 'var(--admin-bg-tertiary)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--admin-glass-border)';
                        e.currentTarget.style.background = 'var(--admin-bg-secondary)';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                        <div
                            className={isGeneratingBriefing ? 'admin-animate-pulse' : ''}
                            style={{
                                background: 'var(--admin-gradient-primary)',
                                padding: '1rem',
                                borderRadius: 'var(--admin-radius-lg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <SparklesIcon className="w-8 h-8" style={{ color: 'white' }} />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h3 className="admin-heading-3" style={{ marginBottom: '0.5rem' }}>
                                {isGeneratingBriefing ? 'در حال تحلیل داده‌های استراتژیک...' : 'دریافت گزارش فرماندهی صبحگاهی'}
                            </h3>
                            <p className="admin-caption">
                                {isGeneratingBriefing ? 'هوش مصنوعی در حال اسکن وضعیت کل پلتفرم است.' : 'تحلیل ۳ اولویت حیاتی روز توسط هوش مصنوعی'}
                            </p>
                        </div>
                    </div>
                </button>
            ) : (
                <ModernMorningBriefingCard data={briefing} onClose={() => setBriefing(null)} />
            )}

            {/* KPI Cards */}
            <div
                className="admin-animate-fade-in"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}
            >
                <ModernStatCard
                    title={`رشد اعضا (${timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} روز اخیر)`}
                    value={kpis.userGrowth.value}
                    trend={kpis.userGrowth.trend}
                    icon={UsersIcon}
                    gradient="linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
                    change={kpis.userGrowth.change}
                />
                <ModernStatCard
                    title={`تعامل جامعه (${timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} روز اخیر)`}
                    value={kpis.engagementScore.value}
                    trend={kpis.engagementScore.trend}
                    icon={HandshakeIcon}
                    gradient="linear-gradient(135deg, #10b981 0%, #14b8a6 100%)"
                    change={kpis.engagementScore.change}
                />
                <ModernStatCard
                    title={`سرمایه اجتماعی (${timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} روز اخیر)`}
                    value={`${animatedInvestment.toLocaleString('fa-IR')} م`}
                    trend={kpis.investmentFlow.trend}
                    icon={BanknotesIcon}
                    gradient="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                    change={kpis.investmentFlow.change}
                />
            </div>

            {/* Funnel and Urgent Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Urgent Actions */}
                <div className="admin-card admin-animate-slide-in" style={{ padding: '1.5rem' }}>
                    <h3 className="admin-heading-3" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
                        اقدامات فوری
                    </h3>
                    {urgentActions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {urgentActions.map(action => (
                                <div
                                    key={action.label}
                                    className="admin-card"
                                    style={{
                                        padding: '1rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'var(--admin-bg-tertiary)',
                                        border: '1px solid var(--admin-border)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'var(--admin-gradient-warning)',
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '0.875rem'
                                        }}>
                                            {action.count.toLocaleString('fa-IR')}
                                        </span>
                                        <span className="admin-body">{action.label}</span>
                                    </div>
                                    <button
                                        onClick={() => handleActionClick(action.subTab)}
                                        className="admin-btn admin-btn-primary"
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                    >
                                        <span>بررسی</span>
                                        <ArrowLeftIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p className="admin-body" style={{ color: 'var(--admin-text-muted)' }}>
                                هیچ اقدام فوری‌ای وجود ندارد. همه چیز آرام است.
                            </p>
                        </div>
                    )}
                </div>

                {/* Funnel Chart */}
                <div className="admin-card admin-animate-slide-in" style={{ padding: '1.5rem', animationDelay: '100ms' }}>
                    <h3 className="admin-heading-3" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)', textAlign: 'center' }}>
                        قیف تبدیل کاربر
                    </h3>
                    <div style={{ padding: '0 1rem' }}>
                        <ModernFunnelChart data={funnelData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModernExecutiveDashboard;
