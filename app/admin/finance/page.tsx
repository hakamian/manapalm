'use client';

import React, { useMemo } from 'react';
import { useAppState } from '@/AppContext';
import {
    CurrencyDollarIcon,
    ArrowTrendingUpIcon,
    CalendarIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

export default function FinancePage() {
    const { orders = [] } = useAppState();

    const stats = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'paid');

        const todayRevenue = completedOrders
            .filter(o => new Date(o.date) >= today)
            .reduce((acc, o) => acc + (o.total || 0), 0);

        const thisMonthRevenue = completedOrders
            .filter(o => new Date(o.date) >= thisMonth)
            .reduce((acc, o) => acc + (o.total || 0), 0);

        const lastMonthRevenue = completedOrders
            .filter(o => {
                const d = new Date(o.date);
                return d >= lastMonth && d <= lastMonthEnd;
            })
            .reduce((acc, o) => acc + (o.total || 0), 0);

        const totalRevenue = completedOrders.reduce((acc, o) => acc + (o.total || 0), 0);
        const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

        return {
            todayRevenue,
            thisMonthRevenue,
            lastMonthRevenue,
            totalRevenue,
            avgOrderValue,
            completedOrders: completedOrders.length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
        };
    }, [orders]);

    const recentTransactions = orders
        .filter(o => o.status === 'completed' || o.status === 'paid')
        .slice(0, 10);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">گزارشات مالی</h1>
                <p className="text-stone-500 text-sm mt-1">خلاصه درآمد و تراکنش‌ها</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                        <CurrencyDollarIcon className="w-8 h-8 text-emerald-500" />
                        <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">امروز</span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-4">{stats.todayRevenue.toLocaleString('fa-IR')}</p>
                    <p className="text-sm text-stone-400">تومان</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                        <CalendarIcon className="w-8 h-8 text-blue-500" />
                        <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">این ماه</span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-4">{stats.thisMonthRevenue.toLocaleString('fa-IR')}</p>
                    <p className="text-sm text-stone-400">تومان</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                        <ArrowTrendingUpIcon className="w-8 h-8 text-purple-500" />
                        <span className="text-xs text-purple-500 bg-purple-500/10 px-2 py-1 rounded-full">میانگین</span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-4">{Math.round(stats.avgOrderValue).toLocaleString('fa-IR')}</p>
                    <p className="text-sm text-stone-400">تومان / سفارش</p>
                </div>

                <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                        <CheckCircleIcon className="w-8 h-8 text-amber-500" />
                        <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">کل</span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-4">{stats.totalRevenue.toLocaleString('fa-IR')}</p>
                    <p className="text-sm text-stone-400">تومان</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Comparison */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">مقایسه ماهانه</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-stone-400">ماه جاری</span>
                                <span className="text-white font-medium">{stats.thisMonthRevenue.toLocaleString('fa-IR')} تومان</span>
                            </div>
                            <div className="w-full h-3 bg-stone-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all"
                                    style={{ width: `${Math.min((stats.thisMonthRevenue / (stats.lastMonthRevenue || 1)) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-stone-400">ماه گذشته</span>
                                <span className="text-white font-medium">{stats.lastMonthRevenue.toLocaleString('fa-IR')} تومان</span>
                            </div>
                            <div className="w-full h-3 bg-stone-800 rounded-full overflow-hidden">
                                <div className="h-full bg-stone-600 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Stats */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">وضعیت سفارشات</h3>
                    <div className="flex items-center justify-around">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                            </div>
                            <p className="text-2xl font-bold text-white">{stats.completedOrders}</p>
                            <p className="text-xs text-stone-500">تکمیل شده</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                <XCircleIcon className="w-8 h-8 text-amber-500" />
                            </div>
                            <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
                            <p className="text-xs text-stone-500">در انتظار</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">آخرین تراکنش‌ها</h3>
                {recentTransactions.length > 0 ? (
                    <div className="space-y-3">
                        {recentTransactions.map((order, idx) => (
                            <div key={order.id || idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                        <CurrencyDollarIcon className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">سفارش #{order.id?.slice(-6)}</p>
                                        <p className="text-xs text-stone-500">
                                            {order.date ? new Date(order.date).toLocaleDateString('fa-IR') : '-'}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-emerald-500">
                                    +{(order.total || 0).toLocaleString('fa-IR')} تومان
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-stone-500 py-8">تراکنشی ثبت نشده</p>
                )}
            </div>
        </div>
    );
}
