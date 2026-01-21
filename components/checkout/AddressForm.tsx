'use client';

import React, { useState, useEffect } from 'react';
import { PhysicalAddress, DigitalAddress } from '../../types';
import { IRAN_PROVINCES } from '../../services/infrastructure/shippingService';

interface AddressFormProps {
    type: 'physical' | 'digital' | 'both';
    initialPhysical?: PhysicalAddress;
    initialDigital?: DigitalAddress;
    onPhysicalChange?: (address: PhysicalAddress) => void;
    onDigitalChange?: (address: DigitalAddress) => void;
    errors?: string[];
}

const AddressForm: React.FC<AddressFormProps> = ({
    type,
    initialPhysical,
    initialDigital,
    onPhysicalChange,
    onDigitalChange,
    errors = []
}) => {
    const [physical, setPhysical] = useState<PhysicalAddress>(initialPhysical || {
        recipientName: '',
        phone: '',
        province: '',
        city: '',
        fullAddress: '',
        postalCode: '',
        plaque: '',
        floor: ''
    });

    const [digital, setDigital] = useState<DigitalAddress>(initialDigital || {
        email: '',
        phone: '',
        telegramId: ''
    });

    const updatePhysical = (field: keyof PhysicalAddress, value: string) => {
        const updated = { ...physical, [field]: value };
        setPhysical(updated);
        onPhysicalChange?.(updated);
    };

    const updateDigital = (field: keyof DigitalAddress, value: string) => {
        const updated = { ...digital, [field]: value };
        setDigital(updated);
        onDigitalChange?.(updated);
    };

    const showPhysical = type === 'physical' || type === 'both';
    const showDigital = type === 'digital' || type === 'both';

    return (
        <div className="space-y-8">
            {/* Physical Address Section */}
            {showPhysical && (
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">آدرس پستی</h3>
                            <p className="text-sm text-gray-400">برای ارسال محصولات فیزیکی (خرما، صنایع دستی)</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Recipient Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">نام گیرنده *</label>
                            <input
                                type="text"
                                value={physical.recipientName}
                                onChange={(e) => updatePhysical('recipientName', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                placeholder="نام و نام خانوادگی"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">شماره تماس *</label>
                            <input
                                type="tel"
                                value={physical.phone}
                                onChange={(e) => updatePhysical('phone', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-left dir-ltr"
                                placeholder="09123456789"
                                dir="ltr"
                            />
                        </div>

                        {/* Province */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">استان *</label>
                            <select
                                value={physical.province}
                                onChange={(e) => updatePhysical('province', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            >
                                <option value="" className="bg-gray-900">انتخاب استان</option>
                                {IRAN_PROVINCES.map(p => (
                                    <option key={p} value={p} className="bg-gray-900">{p}</option>
                                ))}
                            </select>
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">شهر *</label>
                            <input
                                type="text"
                                value={physical.city}
                                onChange={(e) => updatePhysical('city', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                placeholder="نام شهر"
                            />
                        </div>

                        {/* Full Address */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">آدرس کامل *</label>
                            <textarea
                                value={physical.fullAddress}
                                onChange={(e) => updatePhysical('fullAddress', e.target.value)}
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                                placeholder="خیابان، کوچه، پلاک، واحد..."
                            />
                        </div>

                        {/* Postal Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">کد پستی *</label>
                            <input
                                type="text"
                                value={physical.postalCode}
                                onChange={(e) => updatePhysical('postalCode', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-left dir-ltr"
                                placeholder="1234567890"
                                dir="ltr"
                                maxLength={10}
                            />
                        </div>

                        {/* Plaque & Floor */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">پلاک</label>
                                <input
                                    type="text"
                                    value={physical.plaque || ''}
                                    onChange={(e) => updatePhysical('plaque', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                    placeholder="۱۲"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">طبقه</label>
                                <input
                                    type="text"
                                    value={physical.floor || ''}
                                    onChange={(e) => updatePhysical('floor', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                    placeholder="۳"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Digital Address Section */}
            {showDigital && (
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">آدرس مجازی</h3>
                            <p className="text-sm text-gray-400">برای دریافت سند دیجیتال نخل کاشته شده</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">ایمیل</label>
                            <input
                                type="email"
                                value={digital.email || ''}
                                onChange={(e) => updateDigital('email', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-left dir-ltr"
                                placeholder="example@email.com"
                                dir="ltr"
                            />
                        </div>

                        {/* Phone for SMS */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">شماره موبایل (برای SMS)</label>
                            <input
                                type="tel"
                                value={digital.phone}
                                onChange={(e) => updateDigital('phone', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-left dir-ltr"
                                placeholder="09123456789"
                                dir="ltr"
                            />
                        </div>

                        {/* Telegram ID (Optional) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">آیدی تلگرام (اختیاری)</label>
                            <input
                                type="text"
                                value={digital.telegramId || ''}
                                onChange={(e) => updateDigital('telegramId', e.target.value.replace('@', ''))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-left dir-ltr"
                                placeholder="username"
                                dir="ltr"
                            />
                            <p className="text-xs text-gray-500 mt-2">سند نخل شما از طریق ربات تلگرام نیز ارسال خواهد شد.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Messages */}
            {errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-red-400 font-medium mb-2">لطفاً موارد زیر را اصلاح کنید:</p>
                            <ul className="text-red-300 text-sm space-y-1">
                                {errors.map((error, i) => (
                                    <li key={i}>• {error}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressForm;
