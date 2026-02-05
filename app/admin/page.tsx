'use client';

import React from 'react';
import Link from 'next/link';
import { useAppState } from '@/AppContext';
import StatCard from '@/components/admin-v2/ui/StatCard';
import {
    ShoppingBagIcon,
    CurrencyDollarIcon,
    UsersIcon,
    SparklesIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ClockIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
    const { orders = [], allUsers = [] } = useAppState();

    // Calculate stats
    const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalPalms = orders.reduce((acc, order) => acc + (order.deeds?.length || 0), 0);

    const stats = [
        {
            title: 'درآمد کل',
            value: `${(totalRevenue / 10000000).toFixed(1)} میلیون`,
            subValue: 'تومان',
            icon: CurrencyDollarIcon,
            trend: '+12%',
            trendUp: true,
            color: 'emerald',
        },
        {
            title: 'کل سفارشات',
            value: orders.length.toString(),
            subValue: 'سفارش',
            icon: ShoppingBagIcon,
            trend: '+5%',
            trendUp: true,
            color: 'blue',
        },
        {
            title: 'کاربران',
            value: allUsers.length.toString(),
            subValue: 'کاربر',
            icon: UsersIcon,
            trend: '+8%',
            trendUp: true,
            color: 'purple',
        },
        {
            title: 'نخل‌های کاشته شده',
            value: totalPalms.toString(),
            subValue: 'نخل',
            icon: SparklesIcon,
            trend: '+15%',
            trendUp: true,
            color: 'amber',
        },
    ];

    const recentOrders = orders.slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">داشبورد مدیریت</h1>
                    <p className="text-stone-500 text-sm mt-1">خلاصه وضعیت نخلستان معنا</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-500">
                    <ClockIcon className="w-4 h-4" />
                    <span>آخرین بروزرسانی: همین الان</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                    <h2 className="text-lg font-semibold text-white mb-4">دسترسی سریع</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/admin/orders" className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5 group">
                            <ShoppingBagIcon className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                            <span className="text-sm text-stone-400">سفارشات</span>
                            {pendingOrders > 0 && (
                                <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">{pendingOrders} در انتظار</span>
                            )}
                        </Link>
                        <Link href="/admin/products" className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5 group">
                            <SparklesIcon className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="text-sm text-stone-400">محصولات</span>
                        </Link>
                        <Link href="/admin/users" className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5 group">
                            <UsersIcon className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                            <span className="text-sm text-stone-400">کاربران</span>
                        </Link>
                        <Link href="/admin/messages" className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5 group">
                            <CurrencyDollarIcon className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                            <span className="text-sm text-stone-400">پیام‌ها</span>
                        </Link>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">آخرین سفارشات</h2>
                        <Link href="/admin/orders" className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors">
                            مشاهده همه
                        </Link>
                    </div>

                    {recentOrders.length > 0 ? (
                        <div className="space-y-3">
                            {recentOrders.map((order, idx) => (
                                <div key={order.id || idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${order.status === 'completed' ? 'bg-emerald-500/20' :
                                                order.status === 'pending' ? 'bg-amber-500/20' : 'bg-blue-500/20'
                                            }`}>
                                            {order.status === 'completed' ? (
                                                <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                                            ) : (
                                                <ClockIcon className="w-5 h-5 text-amber-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">سفارش #{order.id?.slice(-6) || idx}</p>
                                            <p className="text-xs text-stone-500">{order.items?.length || 0} محصول</p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-white">{(order.total || 0).toLocaleString('fa-IR')} تومان</p>
                                        <p className={`text-xs ${order.status === 'completed' ? 'text-emerald-500' :
                                                order.status === 'pending' ? 'text-amber-500' : 'text-blue-500'
                                            }`}>
                                            {order.status === 'completed' ? 'تکمیل شده' :
                                                order.status === 'pending' ? 'در انتظار' : 'در حال پردازش'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-stone-500">
                            <ShoppingBagIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>سفارشی ثبت نشده است</p>
                        </div>
                    )}
                </div>
            </div>

            {/* System Status */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-emerald-400 font-medium">سیستم فعال</span>
                    <span className="text-stone-500 text-sm">• تمامی سرویس‌ها در حال اجرا هستند</span>
                </div>
            </div>
        </div>
    );
}
