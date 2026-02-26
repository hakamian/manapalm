'use client';

import React from 'react';
import { SparklesIcon as Rocket, GlobeAltIcon as Globe, ShieldCheckIcon as ShieldCheck, HeartIcon as HeartHandshake, CheckBadgeIcon as Award } from '@heroicons/react/24/outline';
import { YoungPalmIcon as Leaf } from '../icons-garden';
import { useAppDispatch } from '../../AppContext';
import { View } from '../../types';

interface PricingTier {
    id: string;
    title: string;
    subtitle: string;
    priceNahal: number;
    priceRial: string;
    features: string[];
    icon: React.ElementType;
    isPopular?: boolean;
    buttonText: string;
}

const pricingTiers: PricingTier[] = [
    {
        id: 'startup',
        title: 'کسب‌وکار نوپا (Landing)',
        subtitle: 'طراحی مدرن و سریع برای شروع حضور آنلاین شما.',
        priceNahal: 2,
        priceRial: '۲,۰۰۰,۰۰۰',
        features: [
            'صفحه لندینگ مدرن (Next.js 14)',
            'سئو پایه',
            'فرم تماس با ما',
            'ریسپانسیو موبایل و تبلت',
            'هاست و دامین رایگان (سال اول)'
        ],
        icon: Rocket,
        buttonText: 'مشاوره و شروع همکاری'
    },
    {
        id: 'professional',
        title: 'فروشگاه حرفه‌ای و اپلیکیشن',
        subtitle: 'سیستم جامع فروش آنلاین برای گسترش بازار هدف شما به کل ایران.',
        priceNahal: 12,
        priceRial: '۱۲,۰۰۰,۰۰۰',
        features: [
            'وب‌اپلیکیشن پیشرونده (PWA)',
            'درگاه پرداخت اختصاصی',
            'سیستم انبارداری و مدیریت سفارشات',
            'ورود با پیامک (OTP)',
            'سبد خرید پیشرفته'
        ],
        icon: Globe,
        isPopular: true,
        buttonText: 'مشاوره و ساخت اپلیکیشن'
    },
    {
        id: 'digital-transformation',
        title: 'تحول دیجیتال و هوش مصنوعی',
        subtitle: 'بهینه‌سازی فرآیندها با هوش مصنوعی برای کاهش هزینه‌های عملیاتی شما.',
        priceNahal: 6,
        priceRial: '۶,۰۰۰,۰۰۰',
        features: [
            'طراحی سیستم‌های اتوماسیون قطعی',
            'اتصال به API',
            'توسعه بات‌های هوشمند صوتی و متنی',
            'داشبورد مدیریتی جامع و آنالیز داده',
            'یکپارچگی با ابزارهای سازمانی'
        ],
        icon: ShieldCheck,
        buttonText: 'ارتقای هوشمند کسب‌وکار'
    },
    {
        id: 'enterprise',
        title: 'پیمان استراتژیک (Enterprise)',
        subtitle: 'راهکارهای زیرساختی و اختصاصی برای سازمان‌های بزرگ.',
        priceNahal: 25,
        priceRial: '۲۵,۰۰۰,۰۰۰',
        features: [
            'معماری مقیاس‌پذیر Microservices',
            'تیم فنی تمام‌وقت و پشتیبانی ویژه ۲۴/۷',
            'طراحی دیتابیس سطح سازمان',
            'امکانات مدیریت پرسنل و شعب',
            'رعایت استانداردهای امنیتی'
        ],
        icon: Award,
        buttonText: 'دریافت پروپوزال'
    }
];

const ServicePricingSection: React.FC = () => {
    const dispatch = useAppDispatch();

    const handleNavigateToContact = () => {
        dispatch({ type: 'SET_VIEW', payload: View.Contact });
    };

    return (
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden" dir="rtl">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 font-pinar tracking-tight">
                        سرمایه‌گذاری روی <span className="text-emerald-600">رشد معنادار</span> کسب‌وکارتان
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 font-dana leading-relaxed">
                        با هر پروژه‌ای که ما برای شما انجام می‌دهیم، بخشی از درآمد مستقیماً صرف حمایت از سیستم‌های اجتماعی و توسعه محیط زیست می‌شود.
                    </p>

                    {/* Supportive Packages Banners */}
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-stretch mt-8">
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex-1 shadow-sm flex items-start gap-4">
                            <div className="bg-amber-100 text-amber-600 p-2 rounded-xl shrink-0">
                                <Rocket className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <h4 className="font-bold text-amber-900 text-sm mb-1 font-pinar">حمایت استارتاپی (ویژه دهه هشتادی‌ها)</h4>
                                <p className="text-xs text-amber-700 font-dana leading-relaxed">تخفیف‌های ویژه نقدی، هاست رایگان، یا پرداخت‌های منعطف برای جوانان پرانگیزه.</p>
                            </div>
                        </div>

                        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 flex-1 shadow-sm flex items-start gap-4">
                            <div className="bg-pink-100 text-pink-600 p-2 rounded-xl shrink-0">
                                <HeartHandshake className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <h4 className="font-bold text-pink-900 text-sm mb-1 font-pinar">بسته رویش (ویژه بانوان کارآفرین)</h4>
                                <p className="text-xs text-pink-700 font-dana leading-relaxed">یک ماه پشتیبانی اختصاصی رایگان اضافه و تخفیفات حمایتی برای تشویق استقلال مالی بانوان.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-6">
                    {pricingTiers.map((tier) => (
                        <div
                            key={tier.id}
                            className={`relative bg-white rounded-3xl p-8 flex flex-col h-full border transition-all duration-300 ${tier.isPopular
                                ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 scale-100 lg:scale-105 z-10'
                                : 'border-gray-200 shadow-lg shadow-gray-200/50 hover:border-emerald-300 hover:shadow-xl'
                                }`}
                        >
                            {tier.isPopular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full font-pinar shadow-md">
                                        پیشنهاد ویژه تیم
                                    </span>
                                </div>
                            )}

                            <div className="mb-6 text-center">
                                <div className="w-16 h-16 mx-auto bg-green-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 shadow-inner">
                                    <tier.icon className="w-8 h-8" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 font-pinar">{tier.title}</h3>
                                <p className="text-sm text-gray-500 min-h-[40px] font-dana">{tier.subtitle}</p>
                            </div>

                            {/* Price Banner */}
                            <div className="mb-8 py-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-emerald-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <span className="text-3xl font-black text-emerald-700 font-dana-fa">{tier.priceNahal}</span>
                                        <span className="text-emerald-600 font-bold font-pinar">نهال</span>
                                        <Leaf className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div className="text-xs text-emerald-600/70 font-dana-fa">معادل {tier.priceRial} تومان</div>
                                </div>
                            </div>

                            <div className="flex-1">
                                <ul className="space-y-4 mb-8">
                                    {tier.features.map((feature, index) => (
                                        <li key={index} className="flex items-start text-sm text-gray-700 font-dana">
                                            <svg
                                                className="w-5 h-5 text-emerald-500 ml-3 shrink-0"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="leading-relaxed">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={handleNavigateToContact}
                                className={`w-full py-4 px-6 rounded-xl font-bold font-pinar text-sm transition-all duration-300 shadow-md ${tier.isPopular
                                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5'
                                    : 'bg-white text-emerald-700 border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-lg'
                                    }`}
                            >
                                {tier.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicePricingSection;
