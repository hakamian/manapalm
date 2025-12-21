import React, { useMemo } from 'react';
import { User, MentorshipRequest } from '../../types';
import {
    UsersIcon, ClockIcon, TrophyIcon, ArrowDownTrayIcon,
    CheckCircleIcon, XMarkIcon, UserCircleIcon
} from '../icons';
import '../../styles/admin-dashboard.css';

interface MentorshipDashboardProps {
    allUsers: User[];
    mentorshipRequests: MentorshipRequest[];
    onRespondToRequest?: (requestId: string, response: 'accepted' | 'rejected') => void;
}

const ModernMentorshipDashboard: React.FC<MentorshipDashboardProps> = ({
    allUsers,
    mentorshipRequests,
    onRespondToRequest
}) => {
    const pendingRequestsCount = useMemo(() =>
        mentorshipRequests.filter(r => r.status === 'pending').length,
        [mentorshipRequests]
    );

    const activePairsCount = useMemo(() =>
        allUsers.reduce((count, user) => count + (user.menteeIds?.length || 0), 0),
        [allUsers]
    );

    const topMentors = useMemo(() =>
        allUsers
            .filter(u => u.isGuardian && (u.menteeIds?.length || 0) > 0)
            .sort((a, b) => (b.menteeIds?.length || 0) - (a.menteeIds?.length || 0))
            .slice(0, 5),
        [allUsers]
    );

    const pendingRequests = useMemo(() =>
        mentorshipRequests.filter(r => r.status === 'pending'),
        [mentorshipRequests]
    );

    const handleExport = () => {
        const report = {
            generatedAt: new Date().toISOString(),
            stats: {
                pendingRequests: pendingRequestsCount,
                activePairs: activePairsCount,
                activeMentors: topMentors.length
            },
            topMentors: topMentors.map(m => ({ id: m.id, name: m.name, mentees: m.menteeIds?.length || 0 })),
            pendingRequests
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `mentorship-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const stats = [
        {
            title: 'درخواست در انتظار',
            value: pendingRequestsCount,
            icon: ClockIcon,
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            color: 'var(--admin-amber)'
        },
        {
            title: 'روابط مربی‌گری فعال',
            value: activePairsCount,
            icon: UsersIcon,
            gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
            color: 'var(--admin-green)'
        },
        {
            title: 'مربی فعال',
            value: topMentors.length,
            icon: TrophyIcon,
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
            color: 'var(--admin-blue)'
        }
    ];

    return (
        <div className="admin-container" style={{ padding: '2rem' }}>
            {/* Header */}
            <div className="admin-animate-fade-in" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="admin-heading-1" style={{ marginBottom: '0.5rem' }}>
                            مدیریت مربی‌گری
                        </h1>
                        <p className="admin-body" style={{ color: 'var(--admin-text-tertiary)' }}>
                            نظارت بر روابط مربی و رهجو
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
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}
            >
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="admin-stat-card"
                        style={{
                            '--gradient': stat.gradient,
                            animationDelay: `${index * 100}ms`
                        } as React.CSSProperties}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p className="admin-label" style={{ marginBottom: '0.5rem' }}>
                                    {stat.title}
                                </p>
                                <h2 className="admin-heading-2" style={{ fontSize: '2.5rem' }}>
                                    {stat.value.toLocaleString('fa-IR')}
                                </h2>
                            </div>
                            <div
                                style={{
                                    background: stat.gradient,
                                    padding: '0.75rem',
                                    borderRadius: 'var(--admin-radius-lg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <stat.icon className="w-6 h-6" style={{ color: 'white' }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Pending Requests */}
                <div className="admin-card admin-animate-slide-in" style={{ padding: '1.5rem' }}>
                    <h3 className="admin-heading-3" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
                        درخواست‌های در انتظار
                    </h3>
                    {pendingRequests.length > 0 ? (
                        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {pendingRequests.map(request => (
                                <div
                                    key={request.id}
                                    className="admin-card"
                                    style={{
                                        padding: '1rem',
                                        background: 'rgba(245, 158, 11, 0.05)',
                                        border: '1px solid rgba(245, 158, 11, 0.2)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <UserCircleIcon className="w-10 h-10" />
                                            <div>
                                                <p className="admin-body" style={{ fontWeight: 600 }}>
                                                    {request.menteeName}
                                                </p>
                                                <p className="admin-caption">
                                                    سطح: {request.menteeLevel}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="admin-badge admin-badge-warning">در انتظار</span>
                                    </div>
                                    {onRespondToRequest && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => onRespondToRequest(request.id, 'accepted')}
                                                className="admin-btn admin-btn-success"
                                                style={{ flex: 1, padding: '0.5rem' }}
                                            >
                                                <CheckCircleIcon className="w-4 h-4" />
                                                تایید
                                            </button>
                                            <button
                                                onClick={() => onRespondToRequest(request.id, 'rejected')}
                                                className="admin-btn admin-btn-danger"
                                                style={{ flex: 1, padding: '0.5rem' }}
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                                رد
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <CheckCircleIcon className="w-12 h-12" style={{ margin: '0 auto 1rem', color: 'var(--admin-green)' }} />
                            <p className="admin-body" style={{ color: 'var(--admin-text-muted)' }}>
                                هیچ درخواست در انتظاری وجود ندارد
                            </p>
                        </div>
                    )}
                </div>

                {/* Top Mentors */}
                <div className="admin-card admin-animate-slide-in" style={{ padding: '1.5rem', animationDelay: '100ms' }}>
                    <h3 className="admin-heading-3" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
                        فعال‌ترین مربیان (نگهبانان)
                    </h3>
                    {topMentors.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {topMentors.map((mentor, index) => (
                                <div
                                    key={mentor.id}
                                    className="admin-card"
                                    style={{
                                        padding: '1rem',
                                        background: 'var(--admin-bg-tertiary)',
                                        border: '1px solid var(--admin-border)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                background: index === 0 ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
                                                    : index === 1 ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                                                        : index === 2 ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                                                            : 'var(--admin-bg-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                fontSize: '0.875rem',
                                                color: 'white'
                                            }}
                                        >
                                            {index + 1}
                                        </span>
                                        <img
                                            src={mentor.profileImageUrl || `https://ui-avatars.com/api/?name=${mentor.name}&background=8b5cf6&color=fff&size=64`}
                                            alt={mentor.name}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <span className="admin-body" style={{ fontWeight: 600 }}>
                                            {mentor.name}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <span style={{ fontWeight: 700, color: 'var(--admin-amber)', fontSize: '1.25rem' }}>
                                            {(mentor.menteeIds?.length || 0).toLocaleString('fa-IR')}
                                        </span>
                                        <span className="admin-caption" style={{ marginRight: '0.25rem' }}> رهجو</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p className="admin-body" style={{ color: 'var(--admin-text-muted)' }}>
                                هنوز هیچ مربی فعالی وجود ندارد
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModernMentorshipDashboard;
