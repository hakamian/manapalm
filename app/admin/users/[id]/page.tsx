'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppState } from '@/AppContext';
import {
    ArrowRightIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    SparklesIcon,
    ShoppingBagIcon,
    MapPinIcon,
    XCircleIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { allUsers = [], orders = [] } = useAppState();

    const userId = params?.id as string;
    const user = useMemo(() => allUsers.find(u => u.id === userId), [allUsers, userId]);
    const userOrders = useMemo(() => orders.filter(o => o.userId === userId), [orders, userId]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <XCircleIcon className="w-16 h-16 text-stone-600 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">کاربر یافت نشد</h2>
                <p className="text-stone-500 mb-6">کاربر مورد نظر وجود ندارد.</p>
                <button onClick={() => router.push('/admin/users')} className="text-emerald-500 hover:text-emerald-400">
                    بازگشت به لیست کاربران
                </button>
            </div>
        );
    }

    const totalSpent = userOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const totalPalms = userOrders.reduce((acc, o) => acc + (o.deeds?.length || 0), 0);

    return (
        <div className="space-y-6">
            {/* Back Button & Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                    <ArrowRightIcon className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                        {user.fullName?.charAt(0) || '?'}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">{user.fullName || 'بدون نام'}</h1>
                        <p className="text-stone-500 text-sm">{user.email || 'بدون ایمیل'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                            <p className="text-emerald-500 text-xs">امتیاز برکت</p>
                            <p className="text-2xl font-bold text-emerald-400 mt-1">{user.points || 0}</p>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                            <p className="text-amber-500 text-xs">امتیاز معنا</p>
                            <p className="text-2xl font-bold text-amber-400 mt-1">{user.manaPoints || 0}</p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                            <p className="text-blue-500 text-xs">تعداد سفارشات</p>
                            <p className="text-2xl font-bold text-blue-400 mt-1">{userOrders.length}</p>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                            <p className="text-purple-500 text-xs">نخل‌ها</p>
                            <p className="text-2xl font-bold text-purple-400 mt-1">{totalPalms}</p>
                        </div>
                    </div>

                    {/* Orders History */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4">تاریخچه خریدها</h3>
                        {userOrders.length > 0 ? (
                            <div className="space-y-3">
                                {userOrders.slice(0, 5).map((order, idx) => (
                                    <div key={order.id || idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <ShoppingBagIcon className="w-5 h-5 text-stone-500" />
                                            <div>
                                                <p className="text-sm font-medium text-white">سفارش #{order.id?.slice(-6)}</p>
                                                <p className="text-xs text-stone-500">{order.items?.length || 0} محصول</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-white">{(order.total || 0).toLocaleString('fa-IR')} تومان</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-stone-500 py-8">سفارشی ثبت نشده</p>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4">اطلاعات تماس</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <PhoneIcon className="w-5 h-5 text-stone-500" />
                                <span className="text-stone-400 font-mono">{user.phone || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <EnvelopeIcon className="w-5 h-5 text-stone-500" />
                                <span className="text-stone-400">{user.email || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CalendarIcon className="w-5 h-5 text-stone-500" />
                                <span className="text-stone-400 text-sm">
                                    عضویت: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fa-IR') : 'نامشخص'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Roles */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4">نقش‌ها</h3>
                        <div className="flex flex-wrap gap-2">
                            {user.isAdmin && (
                                <span className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium">
                                    مدیر سیستم
                                </span>
                            )}
                            {user.isGuardian && (
                                <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-xl text-sm font-medium">
                                    نگهبان
                                </span>
                            )}
                            {user.isGroveKeeper && (
                                <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-sm font-medium">
                                    کشتزاردار
                                </span>
                            )}
                            <span className="px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-xl text-sm font-medium">
                                {user.level || 'جوانه'}
                            </span>
                        </div>
                    </div>

                    {/* Total Spent */}
                    <div className="bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 border border-emerald-500/20 rounded-2xl p-5">
                        <p className="text-stone-400 text-sm">مجموع خریدها</p>
                        <p className="text-2xl font-bold text-white mt-1">{totalSpent.toLocaleString('fa-IR')} تومان</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
