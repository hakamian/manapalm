'use client';

import React, { useState } from 'react';
import {
    Cog6ToothIcon,
    GlobeAltIcon,
    CreditCardIcon,
    DevicePhoneMobileIcon,
    KeyIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';

import { useAppState, useAppDispatch } from '@/AppContext';
import { dbAdapter } from '@/services/dbAdapter';

export default function SettingsPage() {
    const { appSettings, products } = useAppState();
    const dispatch = useAppDispatch();
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [tempRate, setTempRate] = useState(appSettings.usdToTomanRate?.toString() || '');

    const handleBulkPriceUpdate = async () => {
        const newRate = parseInt(tempRate);
        if (isNaN(newRate)) return;

        setIsSaving(true);
        try {
            // Calculate updated products for DB
            const oldRate = appSettings.usdToTomanRate || 1;
            const ratio = newRate / oldRate;
            const updatedProducts = products.map(p => ({
                ...p,
                price: p.basePrice ? Math.round(p.basePrice * newRate) : Math.round(p.price * ratio)
            }));

            // Persist to DB
            if (dbAdapter.isLive()) {
                await dbAdapter.bulkUpdateProducts(updatedProducts);
            }

            // Dispatch to local state
            dispatch({ type: 'BULK_UPDATE_PRICES_BY_RATE', payload: { newRate } });

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error("Failed to bulk update prices", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }, 1000);
    };

    const tabs = [
        { id: 'general', label: 'عمومی', icon: GlobeAltIcon },
        { id: 'payment', label: 'پرداخت', icon: CreditCardIcon },
        { id: 'sms', label: 'پیامک', icon: DevicePhoneMobileIcon },
        { id: 'api', label: 'API', icon: KeyIcon },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">تنظیمات سیستم</h1>
                <p className="text-stone-500 text-sm mt-1">پیکربندی عمومی و سرویس‌های خارجی</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Tabs Sidebar */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${activeTab === tab.id
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'hover:bg-white/5 text-stone-400'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-6">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-white">تنظیمات عمومی و نرخ ارز</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-emerald-400 font-bold">مدیریت نرخ ارز (دلار/ریال)</h3>
                                            <p className="text-stone-500 text-xs mt-1">نرخ پایه برای محاسبه خودکار قیمت تمامی محصولات</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-stone-500 text-[10px] block">نرخ فعلی سیستم</span>
                                            <span className="text-white font-mono font-bold">{(appSettings.usdToTomanRate || 0).toLocaleString('fa-IR')} ریال</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <input
                                            type="number"
                                            value={tempRate}
                                            onChange={(e) => setTempRate(e.target.value)}
                                            placeholder="نرخ جدید (مثلا ۶۰۰,۰۰۰)"
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-emerald-500/50"
                                        />
                                        <button
                                            onClick={handleBulkPriceUpdate}
                                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all active:scale-95"
                                        >
                                            به‌روزرسانی کل قیمت‌ها
                                        </button>
                                    </div>
                                    <p className="text-amber-500/80 text-[10px] mt-2 italic">
                                        * با کلیک بر روی این دکمه، قیمت ریالی تمامی محصولات و انواع نخل بر اساس نسبت تغییر نرخ دلار به‌روزرسانی خواهد شد.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">نام سایت</label>
                                    <input
                                        type="text"
                                        defaultValue="نخلستان معنا"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">ایمیل پشتیبانی</label>
                                    <input
                                        type="email"
                                        defaultValue="support@manapalm.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">شماره تماس</label>
                                    <input
                                        type="text"
                                        defaultValue="۰۲۱-۱۲۳۴۵۶۷۸"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payment' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-white">تنظیمات درگاه پرداخت</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">Merchant ID (زرین‌پال)</label>
                                    <input
                                        type="text"
                                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 rounded bg-white/5 border-white/10 text-emerald-500" />
                                    <span className="text-stone-400">حالت Sandbox (تست)</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sms' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-white">تنظیمات پیامک</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">API Key (SMS.ir)</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">Template ID (OTP)</label>
                                    <input
                                        type="text"
                                        placeholder="123456"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'api' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-white">کلیدهای API</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">Supabase URL</label>
                                    <input
                                        type="text"
                                        placeholder="https://xxx.supabase.co"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">OpenRouter API Key</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">Cloudinary Cloud Name</label>
                                    <input
                                        type="text"
                                        placeholder="cloud_name"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    در حال ذخیره...
                                </>
                            ) : saved ? (
                                <>
                                    <CheckIcon className="w-4 h-4" />
                                    ذخیره شد
                                </>
                            ) : (
                                'ذخیره تنظیمات'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
