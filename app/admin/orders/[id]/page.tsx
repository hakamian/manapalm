'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppState, useAppDispatch } from '@/AppContext';
import {
    ArrowRightIcon,
    ClockIcon,
    CheckCircleIcon,
    TruckIcon,
    XCircleIcon,
    UserIcon,
    PhoneIcon,
    MapPinIcon,
    EnvelopeIcon,
    CubeIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'در انتظار پرداخت', color: 'text-amber-500', bgColor: 'bg-amber-500' },
    paid: { label: 'پرداخت شده', color: 'text-blue-500', bgColor: 'bg-blue-500' },
    processing: { label: 'در حال پردازش', color: 'text-purple-500', bgColor: 'bg-purple-500' },
    shipped: { label: 'ارسال شده', color: 'text-cyan-500', bgColor: 'bg-cyan-500' },
    completed: { label: 'تکمیل شده', color: 'text-emerald-500', bgColor: 'bg-emerald-500' },
    cancelled: { label: 'لغو شده', color: 'text-red-500', bgColor: 'bg-red-500' },
};

const statusFlow = ['pending', 'paid', 'processing', 'shipped', 'completed'];

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { orders = [], allUsers = [] } = useAppState();
    const dispatch = useAppDispatch();

    const orderId = params?.id as string;
    const order = useMemo(() => orders.find(o => o.id === orderId), [orders, orderId]);
    const customer = useMemo(() => allUsers.find(u => u.id === order?.userId), [allUsers, order]);

    const [trackingCode, setTrackingCode] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <XCircleIcon className="w-16 h-16 text-stone-600 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">سفارش یافت نشد</h2>
                <p className="text-stone-500 mb-6">سفارش مورد نظر وجود ندارد یا حذف شده است.</p>
                <Link href="/admin/orders" className="text-emerald-500 hover:text-emerald-400">
                    بازگشت به لیست سفارشات
                </Link>
            </div>
        );
    }

    const currentStatusIndex = statusFlow.indexOf(order.status || 'pending');

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        // In a real app, this would call an API
        dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId: order.id, status: newStatus } });
        setTimeout(() => setIsUpdating(false), 500);
    };

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
                <div>
                    <h1 className="text-xl font-bold text-white">جزئیات سفارش</h1>
                    <p className="text-stone-500 text-sm font-mono">#{order.id?.slice(-8)}</p>
                </div>
                <div className="mr-auto">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${statusConfig[order.status || 'pending']?.color} bg-white/5`}>
                        <span className={`w-2 h-2 rounded-full ${statusConfig[order.status || 'pending']?.bgColor}`}></span>
                        {statusConfig[order.status || 'pending']?.label}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Timeline */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4">وضعیت سفارش</h3>
                        <div className="flex items-center justify-between">
                            {statusFlow.map((status, idx) => {
                                const config = statusConfig[status];
                                const isActive = idx <= currentStatusIndex;
                                const isCurrent = status === order.status;
                                return (
                                    <React.Fragment key={status}>
                                        <button
                                            onClick={() => handleStatusChange(status)}
                                            disabled={isUpdating}
                                            className={`flex flex-col items-center gap-2 group ${isUpdating ? 'opacity-50' : ''}`}
                                        >
                                            <div className={`
                                                w-10 h-10 rounded-full flex items-center justify-center transition-all
                                                ${isActive ? config.bgColor : 'bg-stone-800'}
                                                ${isCurrent ? 'ring-4 ring-white/20' : ''}
                                                group-hover:scale-110
                                            `}>
                                                <CheckCircleIcon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-600'}`} />
                                            </div>
                                            <span className={`text-xs ${isActive ? config.color : 'text-stone-600'}`}>
                                                {config.label}
                                            </span>
                                        </button>
                                        {idx < statusFlow.length - 1 && (
                                            <div className={`flex-grow h-1 mx-2 rounded ${idx < currentStatusIndex ? 'bg-emerald-500' : 'bg-stone-800'}`}></div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    {/* Products */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4">محصولات سفارش</h3>
                        <div className="space-y-3">
                            {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                                    <div className="w-16 h-16 bg-stone-800 rounded-lg flex items-center justify-center overflow-hidden">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <CubeIcon className="w-8 h-8 text-stone-600" />
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-medium text-white">{item.name}</p>
                                        <p className="text-sm text-stone-500">تعداد: {item.quantity}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-white">{(item.price * item.quantity).toLocaleString('fa-IR')} تومان</p>
                                    </div>
                                </div>
                            )) || (
                                    <p className="text-stone-500 text-center py-4">محصولی ثبت نشده</p>
                                )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                            <span className="text-stone-400">مجموع</span>
                            <span className="text-xl font-bold text-white">{(order.total || 0).toLocaleString('fa-IR')} تومان</span>
                        </div>
                    </div>

                    {/* Palms/Deeds */}
                    {order.deeds && order.deeds.length > 0 && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                            <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5" />
                                نخل‌های این سفارش
                            </h3>
                            <div className="space-y-2">
                                {order.deeds.map((deed: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                        <span className="text-white">{deed.palmName || deed.type || 'نخل معنا'}</span>
                                        <span className="text-xs text-emerald-500 font-mono">{deed.id?.slice(-8)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4">اطلاعات مشتری</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <UserIcon className="w-5 h-5 text-stone-500" />
                                <span className="text-white">{customer?.fullName || 'ناشناس'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <PhoneIcon className="w-5 h-5 text-stone-500" />
                                <span className="text-stone-400 font-mono">{customer?.phone || order.userId || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <EnvelopeIcon className="w-5 h-5 text-stone-500" />
                                <span className="text-stone-400">{customer?.email || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4">آدرس ارسال</h3>
                        {order.physical_address ? (
                            <div className="space-y-2 text-stone-400">
                                <p>{order.physical_address.province} - {order.physical_address.city}</p>
                                <p className="flex items-start gap-2">
                                    <MapPinIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    {order.physical_address.fullAddress}
                                </p>
                                <p className="text-xs text-stone-500">کد پستی: {order.physical_address.postalCode}</p>
                            </div>
                        ) : (
                            <p className="text-stone-500">آدرسی ثبت نشده</p>
                        )}
                    </div>

                    {/* Tracking Code */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4">کد رهگیری</h3>
                        <input
                            type="text"
                            placeholder="کد رهگیری مرسوله..."
                            value={trackingCode}
                            onChange={(e) => setTrackingCode(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm 
                                       placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/50 mb-3"
                        />
                        <button className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors">
                            ثبت کد رهگیری
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
