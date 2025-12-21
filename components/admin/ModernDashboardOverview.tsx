import React, { useMemo } from 'react';
import { User, Order, CommunityPost } from '../../types';
import {
    UsersIcon,
    BanknotesIcon,
    ShoppingCartIcon,
    BoxIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ChartBarIcon,
    ClockIcon
} from '../icons';
import '../../styles/admin-dashboard.css';

interface ModernDashboardOverviewProps {
    users: User[];
    orders: Order[];
    posts: CommunityPost[];
}

interface StatCardData {
    title: string;
    value: string | number;
    change: number;
    icon: React.FC<any>;
    gradient: string;
    trend: 'up' | 'down';
}

const ModernDashboardOverview: React.FC<ModernDashboardOverviewProps> = ({
    users,
    orders,
    posts
}) => {

    // Calculate statistics
    const stats = useMemo(() => {
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.isAdmin !== true).length; // Non-admin users
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = orders.length;
        const completedOrders = orders.filter(o => o.status.toLowerCase().includes('deliver') || o.status.toLowerCase().includes('تحویل')).length;

        return {
            totalUsers,
            activeUsers,
            totalRevenue,
            totalOrders,
            completedOrders,
            totalPosts: posts.length
        };
    }, [users, orders, posts]);

    // Recent orders (last 10)
    const recentOrders = useMemo(() => {
        return [...orders]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);
    }, [orders]);

    const statCards: StatCardData[] = [
        {
            title: 'کل کاربران',
            value: stats.totalUsers.toLocaleString('fa-IR'),
            change: 12,
            icon: UsersIcon,
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            trend: 'up'
        },
        {
            title: 'درآمد کل',
            value: `${(stats.totalRevenue / 1000000).toFixed(1)} میلیون`,
            change: 8,
            icon: BanknotesIcon,
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            trend: 'up'
        },
        {
            title: 'سفارشات',
            value: stats.totalOrders.toLocaleString('fa-IR'),
            change: 15,
            icon: ShoppingCartIcon,
            gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
            trend: 'up'
        },
        {
            title: 'پست‌های انجمن',
            value: stats.totalPosts.toLocaleString('fa-IR'),
            change: -3,
            icon: BoxIcon,
            gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            trend: 'down'
        }
    ];

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            pending: { label: 'در انتظار', className: 'admin-badge admin-badge-warning' },
            processing: { label: 'در حال پردازش', className: 'admin-badge admin-badge-info' },
            shipped: { label: 'ارسال شده', className: 'admin-badge admin-badge-purple' },
            delivered: { label: 'تحویل داده شده', className: 'admin-badge admin-badge-success' },
            cancelled: { label: 'لغو شده', className: 'admin-badge admin-badge-danger' }
        };
        return statusMap[status] || statusMap.pending;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    const getUserName = (userId: string) => {
        const user = users.find(u => u.id === userId);
        return user?.name || 'کاربر ناشناس';
    };

    return (
        <div className="admin-container" style={{ padding: '2rem' }}>
            {/* Header */}
            <div className="admin-animate-fade-in" style={{ marginBottom: '2rem' }}>
                <h1 className="admin-heading-1" style={{ marginBottom: '0.5rem' }}>
                    داشبورد مدیریت
                </h1>
                <p className="admin-body" style={{ color: 'var(--admin-text-tertiary)' }}>
                    خوش آمدید! نمای کلی از عملکرد پلتفرم نخلستان معنا
                </p>
            </div>

            {/* Stats Grid */}
            <div
                className="admin-animate-fade-in"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}
            >
                {statCards.map((stat, index) => (
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
                                <h2 className="admin-heading-2" style={{ marginBottom: '0.75rem', fontSize: '2rem' }}>
                                    {stat.value}
                                </h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {stat.trend === 'up' ? (
                                        <ArrowUpIcon className="w-4 h-4" style={{ color: '#10b981' }} />
                                    ) : (
                                        <ArrowDownIcon className="w-4 h-4" style={{ color: '#ef4444' }} />
                                    )}
                                    <span
                                        className="admin-caption"
                                        style={{ color: stat.trend === 'up' ? '#10b981' : '#ef4444' }}
                                    >
                                        {Math.abs(stat.change)}% نسبت به ماه قبل
                                    </span>
                                </div>
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

            {/* Recent Orders Table */}
            <div className="admin-animate-slide-in" style={{ animationDelay: '400ms' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 className="admin-heading-3">سفارشات اخیر</h2>
                        <p className="admin-caption" style={{ marginTop: '0.25rem' }}>
                            آخرین سفارشات ثبت شده در سیستم
                        </p>
                    </div>
                    <button className="admin-btn admin-btn-ghost">
                        <ChartBarIcon className="w-4 h-4" />
                        مشاهده همه
                    </button>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>شناسه سفارش</th>
                                <th>مشتری</th>
                                <th>تعداد آیتم</th>
                                <th>مبلغ (تومان)</th>
                                <th>وضعیت</th>
                                <th>تاریخ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                                        <p className="admin-body" style={{ color: 'var(--admin-text-muted)' }}>
                                            هیچ سفارشی یافت نشد
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => {
                                    const statusBadge = getStatusBadge(order.status);
                                    return (
                                        <tr key={order.id}>
                                            <td>
                                                <span className="admin-caption" style={{ fontFamily: 'monospace', color: 'var(--admin-purple)' }}>
                                                    #{order.id.slice(0, 8)}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 500, color: 'var(--admin-text-primary)' }}>
                                                    {getUserName(order.userId)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="admin-caption">
                                                    {order.items.length} آیتم
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 600, color: 'var(--admin-green)', fontFamily: 'monospace' }}>
                                                    {order.total.toLocaleString('fa-IR')}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={statusBadge.className}>
                                                    {statusBadge.label}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <ClockIcon className="w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} />
                                                    <span className="admin-caption">
                                                        {formatDate(order.date)}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Stats */}
            <div
                className="admin-animate-fade-in"
                style={{
                    marginTop: '2rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}
            >
                <div className="admin-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <p className="admin-label" style={{ marginBottom: '0.5rem' }}>کاربران فعال</p>
                    <h3 className="admin-heading-2" style={{ color: 'var(--admin-green)' }}>
                        {stats.activeUsers.toLocaleString('fa-IR')}
                    </h3>
                </div>
                <div className="admin-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <p className="admin-label" style={{ marginBottom: '0.5rem' }}>سفارشات تکمیل شده</p>
                    <h3 className="admin-heading-2" style={{ color: 'var(--admin-blue)' }}>
                        {stats.completedOrders.toLocaleString('fa-IR')}
                    </h3>
                </div>
                <div className="admin-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <p className="admin-label" style={{ marginBottom: '0.5rem' }}>نرخ تبدیل</p>
                    <h3 className="admin-heading-2" style={{ color: 'var(--admin-purple)' }}>
                        {stats.totalOrders > 0
                            ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)
                            : '0'}%
                    </h3>
                </div>
            </div>
        </div>
    );
};

export default ModernDashboardOverview;
