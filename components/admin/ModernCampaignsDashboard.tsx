import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../AppContext';
import { Campaign } from '../../types';
import { generateCampaignIdea } from '../../services/geminiService';
import { SparklesIcon, ArrowDownTrayIcon, CheckCircleIcon, ClockIcon, TrophyIcon } from '../icons';
import '../../styles/admin-dashboard.css';

interface CampaignsDashboardProps {
    campaign: Campaign;
    platformData: any;
}

const ModernCampaignsDashboard: React.FC<CampaignsDashboardProps> = ({ campaign, platformData }) => {
    const dispatch = useAppDispatch();
    const [editableCampaign, setEditableCampaign] = useState<Campaign>(campaign);
    const [suggestedCampaign, setSuggestedCampaign] = useState<Campaign | null>(null);
    const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => setEditableCampaign(campaign), [campaign]);

    const handleGenerateCampaign = async () => {
        setIsGeneratingCampaign(true);
        setSuggestedCampaign(null);
        setError(null);
        try {
            const result = await generateCampaignIdea(platformData);
            setSuggestedCampaign({ ...result, id: `suggested-${Date.now()}`, current: 0 });
        } catch (e) {
            console.error(e);
            setError("خطا در تولید ایده کمپین. لطفا دوباره تلاش کنید.");
        } finally {
            setIsGeneratingCampaign(false);
        }
    };

    const handleExport = () => {
        const report = {
            generatedAt: new Date().toISOString(),
            currentCampaign: editableCampaign,
            suggestedCampaign,
            pastCampaigns
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `campaigns-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const pastCampaigns = [
        { id: 'past1', title: 'کمپین روز پدر', goal: 50, current: 62, unit: 'نخل', status: 'موفق' },
        { id: 'past2', title: 'کمپین بهاره', goal: 200, current: 150, unit: 'نخل', status: 'پایان یافته' }
    ];

    const progressPercentage = editableCampaign.goal > 0
        ? Math.min(100, (editableCampaign.current / editableCampaign.goal) * 100)
        : 0;

    return (
        <div className="admin-container" style={{ padding: '2rem' }}>
            {/* Header */}
            <div className="admin-animate-fade-in" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="admin-heading-1" style={{ marginBottom: '0.5rem' }}>
                            مدیریت کمپین‌ها
                        </h1>
                        <p className="admin-body" style={{ color: 'var(--admin-text-tertiary)' }}>
                            ایجاد و مدیریت کمپین‌های تبلیغاتی با کمک هوش مصنوعی
                        </p>
                    </div>
                    <button onClick={handleExport} className="admin-btn admin-btn-ghost">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        خروجی گزارش
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div
                className="admin-animate-fade-in"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}
            >
                <div className="admin-stat-card" style={{ '--gradient': 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' } as React.CSSProperties}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p className="admin-label">کمپین فعال</p>
                            <h3 className="admin-heading-3" style={{ marginTop: '0.5rem' }}>{editableCampaign.title}</h3>
                        </div>
                        <SparklesIcon className="w-8 h-8" style={{ color: 'var(--admin-purple)' }} />
                    </div>
                </div>

                <div className="admin-stat-card" style={{ '--gradient': 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' } as React.CSSProperties}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p className="admin-label">پیشرفت</p>
                            <h3 className="admin-heading-2" style={{ marginTop: '0.5rem' }}>
                                {progressPercentage.toFixed(0)}%
                            </h3>
                        </div>
                        <CheckCircleIcon className="w-8 h-8" style={{ color: 'var(--admin-green)' }} />
                    </div>
                </div>

                <div className="admin-stat-card" style={{ '--gradient': 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' } as React.CSSProperties}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p className="admin-label">کمپین‌های گذشته</p>
                            <h3 className="admin-heading-2" style={{ marginTop: '0.5rem' }}>
                                {pastCampaigns.length}
                            </h3>
                        </div>
                        <ClockIcon className="w-8 h-8" style={{ color: 'var(--admin-amber)' }} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* AI Campaign Generator */}
                <div
                    className="admin-card admin-animate-slide-in"
                    style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                        border: '2px solid rgba(139, 92, 246, 0.3)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div
                            style={{
                                background: 'var(--admin-gradient-primary)',
                                padding: '0.75rem',
                                borderRadius: 'var(--admin-radius-lg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <SparklesIcon className="w-6 h-6" style={{ color: 'white' }} />
                        </div>
                        <div>
                            <h3 className="admin-heading-3">مولد کمپین هوشمند</h3>
                            <p className="admin-caption">ایده‌پردازی با هوش مصنوعی</p>
                        </div>
                    </div>

                    <p className="admin-body" style={{ marginBottom: '1.5rem', color: 'var(--admin-text-secondary)' }}>
                        از هوش مصنوعی بخواهید با تحلیل داده‌های سایت، یک ایده کمپین جدید و خلاقانه برای شما طراحی کند.
                    </p>

                    <button
                        onClick={handleGenerateCampaign}
                        disabled={isGeneratingCampaign}
                        className="admin-btn admin-btn-primary"
                        style={{ width: '100%', marginBottom: '1rem' }}
                    >
                        {isGeneratingCampaign ? (
                            <span className="admin-animate-pulse">در حال ایده‌پردازی...</span>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                ایده کمپین جدید بساز
                            </>
                        )}
                    </button>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--admin-radius-md)',
                            marginBottom: '1rem'
                        }}>
                            <p className="admin-body" style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>
                        </div>
                    )}

                    {suggestedCampaign && (
                        <div
                            className="admin-card admin-animate-fade-in"
                            style={{
                                padding: '1.25rem',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            <h4 className="admin-heading-3" style={{ color: 'var(--admin-green)', marginBottom: '0.75rem' }}>
                                {suggestedCampaign.title}
                            </h4>
                            <p className="admin-body" style={{ marginBottom: '1rem', fontSize: '0.875rem', lineHeight: '1.6' }}>
                                {suggestedCampaign.description}
                            </p>
                            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                                <div>
                                    <p className="admin-label">هدف</p>
                                    <p className="admin-body" style={{ fontWeight: 600 }}>
                                        {suggestedCampaign.goal.toLocaleString('fa-IR')} {suggestedCampaign.unit}
                                    </p>
                                </div>
                                <div>
                                    <p className="admin-label">پاداش</p>
                                    <p className="admin-body" style={{ fontWeight: 600 }}>
                                        {suggestedCampaign.rewardPoints?.toLocaleString('fa-IR')} امتیاز
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditableCampaign(suggestedCampaign)}
                                className="admin-btn admin-btn-success"
                                style={{ width: '100%' }}
                            >
                                فعالسازی این کمپین
                            </button>
                        </div>
                    )}
                </div>

                {/* Current Campaign Management */}
                <div className="admin-card admin-animate-slide-in" style={{ padding: '1.5rem', animationDelay: '100ms' }}>
                    <h3 className="admin-heading-3" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
                        مدیریت کمپین فعلی
                    </h3>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="admin-label">پیشرفت کمپین</span>
                            <span className="admin-body" style={{ fontWeight: 600 }}>
                                {editableCampaign.current.toLocaleString('fa-IR')} / {editableCampaign.goal.toLocaleString('fa-IR')}
                            </span>
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
                                    width: `${progressPercentage}%`,
                                    height: '100%',
                                    background: progressPercentage >= 100
                                        ? 'var(--admin-gradient-success)'
                                        : 'var(--admin-gradient-primary)',
                                    transition: 'width 0.5s ease',
                                    borderRadius: '9999px'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>عنوان</label>
                            <input
                                type="text"
                                value={editableCampaign.title}
                                onChange={e => setEditableCampaign(p => ({ ...p, title: e.target.value }))}
                                className="admin-input"
                            />
                        </div>
                        <div>
                            <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>توضیحات</label>
                            <textarea
                                value={editableCampaign.description}
                                onChange={e => setEditableCampaign(p => ({ ...p, description: e.target.value }))}
                                rows={2}
                                className="admin-input"
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>هدف</label>
                                <input
                                    type="number"
                                    value={editableCampaign.goal}
                                    onChange={e => setEditableCampaign(p => ({ ...p, goal: Number(e.target.value) }))}
                                    className="admin-input"
                                />
                            </div>
                            <div>
                                <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>پیشرفت فعلی</label>
                                <input
                                    type="number"
                                    value={editableCampaign.current}
                                    onChange={e => setEditableCampaign(p => ({ ...p, current: Number(e.target.value) }))}
                                    className="admin-input"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => dispatch({ type: 'UPDATE_CAMPAIGN', payload: editableCampaign })}
                        className="admin-btn admin-btn-success"
                        style={{ width: '100%', marginTop: '1.5rem' }}
                    >
                        <CheckCircleIcon className="w-5 h-5" />
                        ذخیره تغییرات کمپین
                    </button>
                </div>
            </div>

            {/* Past Campaigns */}
            <div className="admin-card admin-animate-fade-in" style={{ padding: '1.5rem', animationDelay: '200ms' }}>
                <h3 className="admin-heading-3" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
                    <TrophyIcon className="w-5 h-5" style={{ display: 'inline', marginLeft: '0.5rem', color: 'var(--admin-amber)' }} />
                    تاریخچه کمپین‌ها
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {pastCampaigns.map(c => {
                        const campaignProgress = c.goal > 0 ? (c.current / c.goal) * 100 : 0;
                        const isSuccessful = campaignProgress >= 100;

                        return (
                            <div
                                key={c.id}
                                className="admin-card"
                                style={{
                                    padding: '1rem',
                                    background: 'var(--admin-bg-tertiary)',
                                    border: '1px solid var(--admin-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '1rem'
                                }}
                            >
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h4 className="admin-body" style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                                        {c.title}
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{
                                            flex: 1,
                                            height: '8px',
                                            background: 'var(--admin-bg-primary)',
                                            borderRadius: '9999px',
                                            overflow: 'hidden',
                                            maxWidth: '150px'
                                        }}>
                                            <div
                                                style={{
                                                    width: `${Math.min(100, campaignProgress)}%`,
                                                    height: '100%',
                                                    background: isSuccessful ? '#10b981' : '#f59e0b',
                                                    borderRadius: '9999px'
                                                }}
                                            />
                                        </div>
                                        <span className="admin-caption">
                                            {c.current.toLocaleString('fa-IR')} / {c.goal.toLocaleString('fa-IR')}
                                        </span>
                                    </div>
                                </div>
                                <span
                                    className="admin-badge"
                                    style={{
                                        background: c.status === 'موفق' ? 'rgba(16, 185, 129, 0.1)' : 'var(--admin-bg-tertiary)',
                                        color: c.status === 'موفق' ? '#10b981' : 'var(--admin-text-secondary)',
                                        border: c.status === 'موفق' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--admin-border)'
                                    }}
                                >
                                    {c.status}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ModernCampaignsDashboard;
