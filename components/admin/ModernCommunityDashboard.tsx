import React, { useState } from 'react';
import { CommunityPost } from '../../types';
import { analyzeCommunitySentimentAndTopics } from '../../services/geminiService';
import { HeartIcon, SparklesIcon, ArrowDownTrayIcon, ArrowUpIcon, ArrowDownIcon } from '../icons';
import '../../styles/admin-dashboard.css';

interface CommunityDashboardProps {
    posts: CommunityPost[];
}

const ModernCommunityDashboard: React.FC<CommunityDashboardProps> = ({ posts }) => {
    const [communityAnalysis, setCommunityAnalysis] = useState<{
        sentiment: {
            score: number;
            label: string;
            trend: 'rising' | 'stable' | 'falling';
            mood: 'happy' | 'concerned' | 'neutral' | 'needs_motivation' | 'angry';
            summary: string;
        };
        trendingTopics: string[]
    } | null>(null);
    const [isAnalyzingCommunity, setIsAnalyzingCommunity] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyzeCommunity = async () => {
        setIsAnalyzingCommunity(true);
        setError(null);
        try {
            const result = await analyzeCommunitySentimentAndTopics(posts.slice(0, 20).map(p => p.text));
            setCommunityAnalysis(result);
        } catch (err) {
            console.error(err);
            setError('خطا در تحلیل نبض جامعه.');
        } finally {
            setIsAnalyzingCommunity(false);
        }
    };

    const handleExport = () => {
        const report = {
            generatedAt: new Date().toISOString(),
            totalPosts: posts.length,
            analysis: communityAnalysis,
            recentPosts: posts.slice(0, 20)
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `community-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const getMoodConfig = (mood: string) => {
        switch (mood) {
            case 'happy':
                return { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', color: '#10b981', icon: '😄' };
            case 'concerned':
                return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b', icon: '😟' };
            case 'angry':
                return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', icon: '😠' };
            case 'needs_motivation':
                return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b', icon: '🔋' };
            default:
                return { bg: 'var(--admin-bg-tertiary)', border: 'var(--admin-border)', color: 'var(--admin-text-secondary)', icon: '😐' };
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'rising': return <ArrowUpIcon className="w-5 h-5" style={{ color: '#10b981' }} />;
            case 'falling': return <ArrowDownIcon className="w-5 h-5" style={{ color: '#ef4444' }} />;
            default: return <span style={{ color: 'var(--admin-text-muted)' }}>●</span>;
        }
    };

    return (
        <div className="admin-container" style={{ padding: '2rem' }}>
            {/* Header */}
            <div className="admin-animate-fade-in" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="admin-heading-1" style={{ marginBottom: '0.5rem' }}>
                            نبض جامعه
                        </h1>
                        <p className="admin-body" style={{ color: 'var(--admin-text-tertiary)' }}>
                            تحلیل هوشمند حال و هوای فعلی نخلستان
                        </p>
                    </div>
                    <button onClick={handleExport} className="admin-btn admin-btn-ghost">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        خروجی گزارش
                    </button>
                </div>
            </div>

            {/* Community Pulse Widget */}
            <div
                className="admin-card admin-animate-fade-in"
                style={{
                    padding: '2rem',
                    marginBottom: '2rem',
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                    border: '2px solid rgba(239, 68, 68, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Glow Effect */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div
                                className="admin-animate-pulse"
                                style={{
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--admin-radius-lg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <HeartIcon className="w-8 h-8" style={{ color: 'white' }} filled />
                            </div>
                            <div>
                                <h3 className="admin-heading-2">Community Pulse</h3>
                                <p className="admin-caption">تحلیل احساسات و دغدغه‌های جامعه</p>
                            </div>
                        </div>
                        <button
                            onClick={handleAnalyzeCommunity}
                            disabled={isAnalyzingCommunity}
                            className="admin-btn admin-btn-primary"
                        >
                            {isAnalyzingCommunity ? (
                                <span className="admin-animate-pulse">در حال گوش دادن...</span>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5" />
                                    گرفتن نبض
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div
                            className="admin-card"
                            style={{
                                padding: '1rem',
                                marginBottom: '1rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                textAlign: 'center'
                            }}
                        >
                            <p className="admin-body" style={{ color: '#ef4444' }}>{error}</p>
                        </div>
                    )}

                    {communityAnalysis ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                            {/* Mood Card */}
                            <div
                                className="admin-card"
                                style={{
                                    padding: '2rem',
                                    background: getMoodConfig(communityAnalysis.sentiment.mood).bg,
                                    border: `2px solid ${getMoodConfig(communityAnalysis.sentiment.mood).border}`,
                                    textAlign: 'center'
                                }}
                            >
                                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>
                                    {getMoodConfig(communityAnalysis.sentiment.mood).icon}
                                </span>
                                <h4
                                    className="admin-heading-2"
                                    style={{
                                        color: getMoodConfig(communityAnalysis.sentiment.mood).color,
                                        marginBottom: '0.5rem'
                                    }}
                                >
                                    {communityAnalysis.sentiment.label}
                                </h4>
                                <p className="admin-body" style={{ color: 'var(--admin-text-secondary)' }}>
                                    {communityAnalysis.sentiment.summary}
                                </p>
                            </div>

                            {/* Stats Card */}
                            <div className="admin-card" style={{ padding: '1.5rem' }}>
                                <h4 className="admin-label" style={{ marginBottom: '1.5rem' }}>
                                    شاخص‌های کلیدی
                                </h4>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span className="admin-body">امتیاز احساسی</span>
                                        <span style={{ fontWeight: 700 }}>{communityAnalysis.sentiment.score}/100</span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '12px',
                                        background: 'var(--admin-bg-tertiary)',
                                        borderRadius: '9999px',
                                        overflow: 'hidden'
                                    }}>
                                        <div
                                            style={{
                                                width: `${communityAnalysis.sentiment.score}%`,
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)',
                                                transition: 'width 1s ease',
                                                borderRadius: '9999px'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div
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
                                    <span className="admin-body">روند تغییرات</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {getTrendIcon(communityAnalysis.sentiment.trend)}
                                        <span className="admin-caption">
                                            {communityAnalysis.sentiment.trend === 'rising' ? 'صعودی' :
                                                communityAnalysis.sentiment.trend === 'falling' ? 'نزولی' : 'پایدار'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Topics Card */}
                            <div className="admin-card" style={{ padding: '1.5rem' }}>
                                <h4 className="admin-label" style={{ marginBottom: '1rem' }}>
                                    دغدغه‌های اصلی
                                </h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {communityAnalysis.trendingTopics.map((topic, i) => (
                                        <span
                                            key={i}
                                            className="admin-badge"
                                            style={{
                                                background: 'var(--admin-bg-tertiary)',
                                                border: '1px solid var(--admin-border)',
                                                padding: '0.5rem 0.75rem',
                                                cursor: 'default'
                                            }}
                                        >
                                            # {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '3rem',
                                background: 'var(--admin-bg-tertiary)',
                                borderRadius: 'var(--admin-radius-lg)',
                                border: '2px dashed var(--admin-border)'
                            }}
                        >
                            <p className="admin-body" style={{ color: 'var(--admin-text-muted)' }}>
                                برای مشاهده وضعیت روحی جامعه، دکمه «گرفتن نبض» را بزنید.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="admin-card admin-animate-slide-in" style={{ padding: '1.5rem' }}>
                <h3 className="admin-heading-3" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
                    آخرین زمزمه‌های کانون
                </h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {posts.slice(0, 10).map(post => (
                        <div
                            key={post.id}
                            className="admin-card"
                            style={{
                                padding: '1rem',
                                background: 'var(--admin-bg-tertiary)',
                                border: '1px solid var(--admin-border)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--admin-glass-border)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--admin-border)';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--admin-blue)' }}>
                                    {post.authorName}
                                </span>
                                <span className="admin-caption">
                                    {new Date(post.timestamp).toLocaleDateString('fa-IR')}
                                </span>
                            </div>
                            <p className="admin-body" style={{ lineHeight: '1.7', marginBottom: '0.75rem' }}>
                                {post.text}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <HeartIcon className="w-4 h-4" style={{ color: '#ef4444' }} />
                                <span className="admin-caption">{post.likes} پسند</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModernCommunityDashboard;
