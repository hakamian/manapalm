import React, { useMemo } from 'react';
import { User, Order } from '../../types';
import {
    ChartBarIcon,
    UsersIcon,
    ShoppingCartIcon,
    BanknotesIcon,
    ArrowUpIcon,
    ArrowDownIcon
} from '../icons';
import '../../styles/admin-dashboard.css';

interface ModernAnalyticsDashboardProps {
    users: User[];
    orders: Order[];
}

interface MetricCard {
    title: string;
    value: string | number;
    change: number;
    trend: 'up' | 'down';
    icon: React.FC<any>;
    gradient: string;
}

const ModernAnalyticsDashboard: React.FC<ModernAnalyticsDashboardProps> = ({
    users,
    orders
}) => {

    // Calculate analytics
    const analytics = useMemo(() => {
        const totalUsers = users.length;
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate growth (mock data for now)
        const userGrowth = 12.5;
        const orderGrowth = 8.3;
        const revenueGrowth = 15.7;
        const avgOrderGrowth = 5.2;

        // Revenue by month (mock data)
        const monthlyRevenue = [
            { month: 'فروردین', revenue: 12500000 },
            { month: 'اردیبهشت', revenue: 15200000 },
            { month: 'خرداد', revenue: 18900000 },
            { month: 'تیر', revenue: 22100000 },
            { month: 'مرداد', revenue: 19800000 },
            { month: 'شهریور', revenue: 25600000 }
        ];

        return {
            totalUsers,
            totalOrders,
            totalRevenue,
            avgOrderValue,
            userGrowth,
            orderGrowth,
            revenueGrowth,
            avgOrderGrowth,
            monthlyRevenue
        };
    }, [users, orders]);

    const metrics: MetricCard[] = [
        {
            title: 'کل کاربران',
            value: analytics.totalUsers.toLocaleString('fa-IR'),
            change: analytics.userGrowth,
            trend: 'up',
            icon: UsersIcon,
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
        },
        {
            title: 'کل سفارشات',
            value: analytics.totalOrders.toLocaleString('fa-IR'),
            change: analytics.orderGrowth,
            trend: 'up',
            icon: ShoppingCartIcon,
            gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)'
        },
        {
            title: 'درآمد کل',
            value: `${(analytics.totalRevenue / 1000000).toFixed(1)} میلیون`,
            change: analytics.revenueGrowth,
            trend: 'up',
            icon: BanknotesIcon,
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
        },
        {
            title: 'میانگین سفارش',
            value: `${(analytics.avgOrderValue / 1000).toFixed(0)}K`,
            change: analytics.avgOrderGrowth,
            trend: 'up',
            icon: ChartBarIcon,
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
        }
    ];

    const formatCurrency = (amount: number) => {
        return (amount / 1000000).toFixed(1) + ' میلیون تومان';
    };

    return (
        <div className="admin-container" style={{ padding: '2rem' }}>
            {/* Header */}
            <div className="admin-animate-fade-in" style={{ marginBottom: '2rem' }}>
                <h1 className="admin-heading-1" style={{ marginBottom: '0.5rem' }}>
                    آنالیتیکس و گزارشات
                </h1>
                <p className="admin-body" style={{ color: 'var(--admin-text-tertiary)' }}>
                    تحلیل عملکرد و روندهای کسب‌وکار
                </p>
            </div>

            {/* Metrics Grid */}
            <div
                className="admin-animate-fade-in"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}
            >
                {metrics.map((metric, index) => (
                    <div
                        key={index}
                        className="admin-stat-card"
                        style={{
                            '--gradient': metric.gradient,
                            animationDelay: `${index * 100}ms`
                        } as React.CSSProperties}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p className="admin-label" style={{ marginBottom: '0.5rem' }}>
                                    {metric.title}
                                </p>
                                <h2 className="admin-heading-2" style={{ marginBottom: '0.75rem', fontSize: '2rem' }}>
                                    {metric.value}
                                </h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {metric.trend === 'up' ? (
                                        <ArrowUpIcon className="w-4 h-4" style={{ color: '#10b981' }} />
                                    ) : (
                                        <ArrowDownIcon className="w-4 h-4" style={{ color: '#ef4444' }} />
                                    )}
                                    <span
                                        className="admin-caption"
                                        style={{ color: metric.trend === 'up' ? '#10b981' : '#ef4444' }}
                                    >
                                        {Math.abs(metric.change)}% نسبت به ماه قبل
                                    </span>
                                </div>
                            </div>
                            <div
                                style={{
                                    background: metric.gradient,
                                    padding: '0.75rem',
                                    borderRadius: 'var(--admin-radius-lg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <metric.icon className="w-6 h-6" style={{ color: 'white' }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Monthly Revenue Chart */}
            <div className="admin-card admin-animate-slide-in" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 className="admin-heading-3" style={{ marginBottom: '0.25rem' }}>درآمد ماهانه</h2>
                    <p className="admin-caption">روند درآمد در 6 ماه اخیر</p>
                </div>

                {/* Simple Bar Chart */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px' }}>
                    {analytics.monthlyRevenue.map((data, index) => {
                        const maxRevenue = Math.max(...analytics.monthlyRevenue.map(m => m.revenue));
                        const height = (data.revenue / maxRevenue) * 100;

                        return (
                            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <div
                                    style={{
                                        width: '100%',
                                        height: `${height}%`,
                                        background: 'var(--admin-gradient-success)',
                                        borderRadius: 'var(--admin-radius-md)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(16, 185, 129, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute',
                                        top: '-2rem',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: 'var(--admin-text-secondary)',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {formatCurrency(data.revenue)}
                                    </div>
                                </div>
                                <span className="admin-caption" style={{ fontSize: '0.75rem' }}>
                                    {data.month}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Additional Stats */}
            <div className="admin-card admin-animate-fade-in" style={{ padding: '1.5rem', animationDelay: '200ms' }}>
                <h2 className="admin-heading-3" style={{ marginBottom: '1.5rem' }}>آمار تفصیلی</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    <div>
                        <p className="admin-label" style={{ marginBottom: '0.5rem' }}>نرخ تبدیل</p>
                        <h3 className="admin-heading-2" style={{ color: 'var(--admin-green)' }}>
                            {((analytics.totalOrders / analytics.totalUsers) * 100).toFixed(1)}%
                        </h3>
                        <p className="admin-caption" style={{ marginTop: '0.25rem' }}>
                            از کاربران خرید کرده‌اند
                        </p>
                    </div>

                    <div>
                        <p className="admin-label" style={{ marginBottom: '0.5rem' }}>میانگین آیتم در سفارش</p>
                        <h3 className="admin-heading-2" style={{ color: 'var(--admin-blue)' }}>
                            {(orders.reduce((sum, o) => sum + o.items.length, 0) / analytics.totalOrders || 0).toFixed(1)}
                        </h3>
                        <p className="admin-caption" style={{ marginTop: '0.25rem' }}>
                            آیتم در هر سفارش
                        </p>
                    </div>

                    <div>
                        <p className="admin-label" style={{ marginBottom: '0.5rem' }}>ارزش طول عمر مشتری</p>
                        <h3 className="admin-heading-2" style={{ color: 'var(--admin-purple)' }}>
                            {formatCurrency(analytics.totalRevenue / analytics.totalUsers || 0)}
                        </h3>
                        <p className="admin-caption" style={{ marginTop: '0.25rem' }}>
                            به ازای هر کاربر
                        </p>
                    </div>

                    <div>
                        <p className="admin-label" style={{ marginBottom: '0.5rem' }}>رشد ماهانه</p>
                        <h3 className="admin-heading-2" style={{ color: 'var(--admin-green)' }}>
                            +{analytics.revenueGrowth}%
                        </h3>
                        <p className="admin-caption" style={{ marginTop: '0.25rem' }}>
                            نسبت به ماه قبل
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModernAnalyticsDashboard;
