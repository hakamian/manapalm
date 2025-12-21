import React, { useState, useEffect } from 'react';
import { CommunityPost } from '../../types';
import { analyzeCommunitySentimentAndTopics } from '../../services/geminiService';
import { supabase } from '../../services/supabaseClient';
import {
    SparklesIcon, MegaphoneIcon, PencilSquareIcon, ClockIcon,
    CheckCircleIcon, ArrowPathIcon, CpuChipIcon, BoltIcon,
    ExclamationTriangleIcon, ArrowDownTrayIcon
} from '../icons';
import '../../styles/admin-dashboard.css';

interface ContentFactoryDashboardProps {
    posts: CommunityPost[];
}

interface AgentTask {
    id: string;
    type: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    payload: any;
    result?: string;
    created_at: string;
}

const ModernContentFactoryDashboard: React.FC<ContentFactoryDashboardProps> = ({ posts }) => {
    const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
    const [isLoadingTopics, setIsLoadingTopics] = useState(false);
    const [agentQueue, setAgentQueue] = useState<AgentTask[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load initial tasks and Setup Realtime Subscription
    useEffect(() => {
        if (!supabase) return;

        const fetchTasks = async () => {
            const { data } = await supabase
                .from('agent_tasks')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (data) {
                setAgentQueue(data as AgentTask[]);
            }
        };

        fetchTasks();

        const channel = supabase
            .channel('agent_tasks_updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'agent_tasks' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setAgentQueue(prev => [payload.new as AgentTask, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setAgentQueue(prev => prev.map(task =>
                            task.id === payload.new.id ? (payload.new as AgentTask) : task
                        ));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleFetchTopics = async () => {
        setIsLoadingTopics(true);
        try {
            const result = await analyzeCommunitySentimentAndTopics(posts.slice(0, 30).map(p => p.text));
            setTrendingTopics(result.trendingTopics);
        } catch (e) {
            console.error("Trend analysis failed", e);
        } finally {
            setIsLoadingTopics(false);
        }
    };

    const dispatchAgentTask = async (topic: string) => {
        if (!supabase) {
            alert("اتصال به پایگاه داده برقرار نیست.");
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('agent_tasks')
                .insert({
                    type: 'generate_article',
                    status: 'pending',
                    payload: { topic: topic, tone: 'professional' },
                    created_at: new Date().toISOString()
                });

            if (error) throw error;
        } catch (e: any) {
            console.error("Error dispatching task:", e);
            alert(`خطا در ثبت سفارش: ${e.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExport = () => {
        const report = {
            generatedAt: new Date().toISOString(),
            trendingTopics,
            agentQueue
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `content-factory-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    bg: 'rgba(245, 158, 11, 0.1)',
                    border: 'rgba(245, 158, 11, 0.3)',
                    color: '#f59e0b',
                    label: 'در صف انتظار...',
                    icon: ClockIcon
                };
            case 'processing':
                return {
                    bg: 'rgba(59, 130, 246, 0.1)',
                    border: 'rgba(59, 130, 246, 0.3)',
                    color: '#3b82f6',
                    label: 'ایجنت در حال نگارش...',
                    icon: ArrowPathIcon
                };
            case 'completed':
                return {
                    bg: 'rgba(16, 185, 129, 0.1)',
                    border: 'rgba(16, 185, 129, 0.3)',
                    color: '#10b981',
                    label: 'تکمیل شد',
                    icon: CheckCircleIcon
                };
            case 'failed':
                return {
                    bg: 'rgba(239, 68, 68, 0.1)',
                    border: 'rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    label: 'خطا در اجرا',
                    icon: ExclamationTriangleIcon
                };
            default:
                return {
                    bg: 'var(--admin-bg-tertiary)',
                    border: 'var(--admin-border)',
                    color: 'var(--admin-text-secondary)',
                    label: 'نامشخص',
                    icon: ClockIcon
                };
        }
    };

    // Stats
    const stats = {
        pending: agentQueue.filter(t => t.status === 'pending').length,
        processing: agentQueue.filter(t => t.status === 'processing').length,
        completed: agentQueue.filter(t => t.status === 'completed').length,
        failed: agentQueue.filter(t => t.status === 'failed').length
    };

    return (
        <div className="admin-container" style={{ padding: '2rem' }}>
            {/* Header */}
            <div className="admin-animate-fade-in" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="admin-heading-1" style={{ marginBottom: '0.5rem' }}>
                            کارخانه محتوا
                        </h1>
                        <p className="admin-body" style={{ color: 'var(--admin-text-tertiary)' }}>
                            تولید محتوای هوشمند با ایجنت‌های AI و پایش بلادرنگ
                        </p>
                    </div>
                    <button onClick={handleExport} className="admin-btn admin-btn-ghost">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        خروجی گزارش
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div
                className="admin-animate-fade-in"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}
            >
                <div className="admin-stat-card" style={{ '--gradient': 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' } as React.CSSProperties}>
                    <p className="admin-label">در انتظار</p>
                    <h3 className="admin-heading-2" style={{ marginTop: '0.5rem' }}>{stats.pending}</h3>
                </div>
                <div className="admin-stat-card" style={{ '--gradient': 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' } as React.CSSProperties}>
                    <p className="admin-label">در حال پردازش</p>
                    <h3 className="admin-heading-2" style={{ marginTop: '0.5rem' }}>{stats.processing}</h3>
                </div>
                <div className="admin-stat-card" style={{ '--gradient': 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' } as React.CSSProperties}>
                    <p className="admin-label">تکمیل شده</p>
                    <h3 className="admin-heading-2" style={{ marginTop: '0.5rem' }}>{stats.completed}</h3>
                </div>
                <div className="admin-stat-card" style={{ '--gradient': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' } as React.CSSProperties}>
                    <p className="admin-label">خطا</p>
                    <h3 className="admin-heading-2" style={{ marginTop: '0.5rem' }}>{stats.failed}</h3>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Trend Radar */}
                <div
                    className="admin-card admin-animate-slide-in"
                    style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                        border: '2px solid rgba(59, 130, 246, 0.2)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
                        <div
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                                padding: '0.75rem',
                                borderRadius: 'var(--admin-radius-lg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <CpuChipIcon className="w-6 h-6" style={{ color: 'white' }} />
                        </div>
                        <div>
                            <h3 className="admin-heading-3">رادار موضوعات</h3>
                            <p className="admin-caption">تحلیل هوشمند نیازهای جامعه</p>
                        </div>
                    </div>

                    <button
                        onClick={handleFetchTopics}
                        disabled={isLoadingTopics}
                        className="admin-btn admin-btn-primary"
                        style={{ width: '100%', marginBottom: '1.5rem' }}
                    >
                        {isLoadingTopics ? (
                            <>
                                <ArrowPathIcon className="w-5 h-5 admin-animate-spin" />
                                <span>ایجنت تحلیلگر در حال اسکن...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                شناسایی موضوعات داغ
                            </>
                        )}
                    </button>

                    {trendingTopics.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <SparklesIcon className="w-4 h-4" style={{ color: 'var(--admin-amber)' }} />
                                <span className="admin-label">پیشنهادات هوش مصنوعی:</span>
                            </div>
                            {trendingTopics.map((topic, i) => (
                                <div
                                    key={i}
                                    className="admin-card"
                                    style={{
                                        padding: '1rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'var(--admin-bg-tertiary)',
                                        border: '1px solid var(--admin-border)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--admin-border)';
                                    }}
                                >
                                    <span className="admin-body" style={{ fontWeight: 500 }}>{topic}</span>
                                    <button
                                        onClick={() => dispatchAgentTask(topic)}
                                        disabled={isSubmitting}
                                        className="admin-btn admin-btn-success"
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                                    >
                                        <BoltIcon className="w-4 h-4" />
                                        تولید محتوا
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '2rem',
                                background: 'var(--admin-bg-tertiary)',
                                borderRadius: 'var(--admin-radius-lg)',
                                border: '2px dashed var(--admin-border)'
                            }}
                        >
                            <p className="admin-body" style={{ color: 'var(--admin-text-muted)' }}>
                                هنوز موضوعی شناسایی نشده است.
                            </p>
                        </div>
                    )}
                </div>

                {/* Agent Queue */}
                <div
                    className="admin-card admin-animate-slide-in"
                    style={{
                        padding: '1.5rem',
                        position: 'relative',
                        overflow: 'hidden',
                        animationDelay: '100ms'
                    }}
                >
                    {/* Glow Effect */}
                    <div style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '-50px',
                        width: '150px',
                        height: '150px',
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                        pointerEvents: 'none'
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)', position: 'relative', zIndex: 1 }}>
                        <div
                            style={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                                padding: '0.75rem',
                                borderRadius: 'var(--admin-radius-lg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <MegaphoneIcon className="w-6 h-6" style={{ color: 'white' }} />
                        </div>
                        <div>
                            <h3 className="admin-heading-3">خط تولید محتوا</h3>
                            <p className="admin-caption">وضعیت زنده ایجنت‌ها (Realtime)</p>
                        </div>
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                        {agentQueue.length === 0 ? (
                            <div
                                style={{
                                    textAlign: 'center',
                                    padding: '3rem',
                                    background: 'var(--admin-bg-tertiary)',
                                    borderRadius: 'var(--admin-radius-lg)',
                                    border: '2px dashed var(--admin-border)'
                                }}
                            >
                                <PencilSquareIcon className="w-10 h-10" style={{ margin: '0 auto 1rem', color: 'var(--admin-text-muted)' }} />
                                <p className="admin-body" style={{ color: 'var(--admin-text-muted)' }}>
                                    صف پردازش خالی است.
                                </p>
                                <p className="admin-caption">
                                    یک موضوع انتخاب کنید تا ایجنت‌ها شروع کنند.
                                </p>
                            </div>
                        ) : (
                            agentQueue.map((task) => {
                                const config = getStatusConfig(task.status);
                                const StatusIcon = config.icon;

                                return (
                                    <div
                                        key={task.id}
                                        className="admin-card admin-animate-fade-in"
                                        style={{
                                            padding: '1rem',
                                            background: config.bg,
                                            border: `1px solid ${config.border}`
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                            <span className="admin-body" style={{ fontWeight: 600 }}>
                                                تولید مقاله: {task.payload?.topic || 'موضوع نامشخص'}
                                            </span>
                                            <span className="admin-caption" style={{ fontFamily: 'monospace' }}>
                                                {new Date(task.created_at).toLocaleTimeString('fa-IR')}
                                            </span>
                                        </div>

                                        <div
                                            className="admin-badge"
                                            style={{
                                                background: config.bg,
                                                border: `1px solid ${config.border}`,
                                                color: config.color,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <StatusIcon
                                                className={`w-3 h-3 ${task.status === 'processing' ? 'admin-animate-spin' : ''}`}
                                            />
                                            {config.label}
                                        </div>

                                        {task.status === 'processing' && (
                                            <div style={{ marginTop: '0.75rem', width: '100%', height: '4px', background: 'var(--admin-bg-primary)', borderRadius: '9999px', overflow: 'hidden' }}>
                                                <div
                                                    style={{
                                                        width: '50%',
                                                        height: '100%',
                                                        background: config.color,
                                                        animation: 'progress-indeterminate 1.5s infinite ease-in-out',
                                                        borderRadius: '9999px'
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {task.result && (
                                            <div
                                                style={{
                                                    marginTop: '0.75rem',
                                                    padding: '0.75rem',
                                                    background: 'rgba(0, 0, 0, 0.2)',
                                                    borderRadius: 'var(--admin-radius-sm)',
                                                    border: '1px solid var(--admin-border)'
                                                }}
                                            >
                                                <p className="admin-caption" style={{ lineHeight: '1.5' }}>
                                                    &gt; {task.result}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes progress-indeterminate {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
        </div>
    );
};

export default ModernContentFactoryDashboard;
