'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/AppContext';
import DataTable from '@/components/admin-v2/ui/DataTable';
import {
    ShoppingBagIcon,
    EyeIcon,
    ClockIcon,
    CheckCircleIcon,
    TruckIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
    pending: { label: 'در انتظار', color: 'text-amber-500 bg-amber-500/10', icon: ClockIcon },
    paid: { label: 'پرداخت شده', color: 'text-blue-500 bg-blue-500/10', icon: CheckCircleIcon },
    processing: { label: 'در حال پردازش', color: 'text-purple-500 bg-purple-500/10', icon: TruckIcon },
    shipped: { label: 'ارسال شده', color: 'text-cyan-500 bg-cyan-500/10', icon: TruckIcon },
    completed: { label: 'تکمیل شده', color: 'text-emerald-500 bg-emerald-500/10', icon: CheckCircleIcon },
    cancelled: { label: 'لغو شده', color: 'text-red-500 bg-red-500/10', icon: XCircleIcon },
};

export default function OrdersPage() {
    const { orders = [], allUsers = [] } = useAppState();
    const router = useRouter();

    const getUserName = (userId: string) => {
        const user = allUsers.find(u => u.id === userId);
        return user?.fullName || 'کاربر ناشناس';
    };

    const columns = [
        {
            key: 'id',
            title: 'شماره سفارش',
            sortable: true,
            render: (value: string) => (
                <span className="font-mono text-xs bg-white/5 px-2 py-1 rounded">
                    #{value?.slice(-8) || 'N/A'}
                </span>
            ),
        },
        {
            key: 'userId',
            title: 'مشتری',
            sortable: true,
            render: (value: string) => getUserName(value),
        },
        {
            key: 'items',
            title: 'محصولات',
            render: (items: any[]) => (
                <span className="text-stone-400">{items?.length || 0} محصول</span>
            ),
        },
        {
            key: 'total',
            title: 'مبلغ',
            sortable: true,
            render: (value: number) => (
                <span className="font-medium">{(value || 0).toLocaleString('fa-IR')} تومان</span>
            ),
        },
        {
            key: 'status',
            title: 'وضعیت',
            sortable: true,
            render: (value: string) => {
                const config = statusConfig[value] || statusConfig.pending;
                const Icon = config.icon;
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {config.label}
                    </span>
                );
            },
        },
        {
            key: 'date',
            title: 'تاریخ',
            sortable: true,
            render: (value: string) => {
                if (!value) return '-';
                try {
                    return new Date(value).toLocaleDateString('fa-IR');
                } catch {
                    return value;
                }
            },
        },
        {
            key: 'actions',
            title: 'عملیات',
            render: (_: any, order: any) => (
                <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    <EyeIcon className="w-3.5 h-3.5" />
                    مشاهده
                </Link>
            ),
        },
    ];

    // Stats
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const processingCount = orders.filter(o => o.status === 'processing' || o.status === 'paid').length;
    const completedCount = orders.filter(o => o.status === 'completed').length;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">مدیریت سفارشات</h1>
                    <p className="text-stone-500 text-sm mt-1">مشاهده و مدیریت تمامی سفارشات</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-stone-500 text-xs">کل سفارشات</p>
                    <p className="text-xl font-bold text-white mt-1">{orders.length}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-amber-500 text-xs">در انتظار</p>
                    <p className="text-xl font-bold text-amber-400 mt-1">{pendingCount}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-blue-500 text-xs">در حال پردازش</p>
                    <p className="text-xl font-bold text-blue-400 mt-1">{processingCount}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-emerald-500 text-xs">تکمیل شده</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1">{completedCount}</p>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <DataTable
                    data={orders}
                    columns={columns}
                    searchPlaceholder="جستجو در سفارشات..."
                    pageSize={10}
                    onRowClick={(order) => router.push(`/admin/orders/${order.id}`)}
                    emptyMessage="سفارشی ثبت نشده است"
                    emptyIcon={ShoppingBagIcon}
                />
            </div>
        </div>
    );
}
