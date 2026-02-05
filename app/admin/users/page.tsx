'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/AppContext';
import DataTable from '@/components/admin-v2/ui/DataTable';
import {
    UsersIcon,
    ShieldCheckIcon,
    SparklesIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';

export default function UsersPage() {
    const { allUsers = [] } = useAppState();
    const router = useRouter();

    const columns = [
        {
            key: 'avatar',
            title: '',
            className: 'w-12',
            render: (_: any, user: any) => (
                <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {user.fullName?.charAt(0) || user.email?.charAt(0) || '?'}
                </div>
            ),
        },
        {
            key: 'fullName',
            title: 'نام کامل',
            sortable: true,
            render: (value: string, user: any) => (
                <div>
                    <p className="font-medium text-white">{value || 'بدون نام'}</p>
                    <p className="text-xs text-stone-500">{user.email || '-'}</p>
                </div>
            ),
        },
        {
            key: 'phone',
            title: 'موبایل',
            sortable: true,
            render: (value: string) => (
                <span className="font-mono text-stone-400">{value || '-'}</span>
            ),
        },
        {
            key: 'level',
            title: 'سطح',
            sortable: true,
            render: (value: string) => (
                <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-400 rounded-lg">
                    {value || 'جوانه'}
                </span>
            ),
        },
        {
            key: 'points',
            title: 'امتیاز',
            sortable: true,
            render: (value: number, user: any) => (
                <div className="text-sm">
                    <span className="text-emerald-500">{value || 0} برکت</span>
                    <span className="text-stone-600 mx-1">|</span>
                    <span className="text-amber-500">{user.manaPoints || 0} معنا</span>
                </div>
            ),
        },
        {
            key: 'roles',
            title: 'نقش',
            render: (_: any, user: any) => (
                <div className="flex items-center gap-1">
                    {user.isAdmin && (
                        <span className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded-lg">ادمین</span>
                    )}
                    {user.isGuardian && (
                        <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg">نگهبان</span>
                    )}
                    {user.isGroveKeeper && (
                        <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg">کشتزاردار</span>
                    )}
                    {!user.isAdmin && !user.isGuardian && !user.isGroveKeeper && (
                        <span className="text-xs text-stone-600">کاربر عادی</span>
                    )}
                </div>
            ),
        },
        {
            key: 'actions',
            title: 'عملیات',
            render: (_: any, user: any) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/users/${user.id}`);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-all"
                >
                    <EyeIcon className="w-3.5 h-3.5" />
                    مشاهده
                </button>
            ),
        },
    ];

    // Stats
    const admins = allUsers.filter(u => u.isAdmin).length;
    const guardians = allUsers.filter(u => u.isGuardian).length;
    const groveKeepers = allUsers.filter(u => u.isGroveKeeper).length;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">مدیریت کاربران</h1>
                <p className="text-stone-500 text-sm mt-1">مشاهده و مدیریت اعضای نخلستان معنا</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-stone-500 text-xs">کل کاربران</p>
                    <p className="text-xl font-bold text-white mt-1">{allUsers.length}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-500 text-xs">مدیران</p>
                    <p className="text-xl font-bold text-red-400 mt-1">{admins}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-blue-500 text-xs">نگهبانان</p>
                    <p className="text-xl font-bold text-blue-400 mt-1">{guardians}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-emerald-500 text-xs">کشتزارداران</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1">{groveKeepers}</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <DataTable
                    data={allUsers}
                    columns={columns}
                    searchPlaceholder="جستجو در کاربران..."
                    pageSize={10}
                    onRowClick={(user) => router.push(`/admin/users/${user.id}`)}
                    emptyMessage="کاربری ثبت نشده است"
                    emptyIcon={UsersIcon}
                />
            </div>
        </div>
    );
}
