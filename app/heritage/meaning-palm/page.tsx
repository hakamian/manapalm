'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAppState, useAppDispatch } from '../../../AppContext';
import { CartItem, HeritageItem } from '../../../types';
import { heritageItems } from '../../../utils/heritage';
import PlantingRitualModal from '../../../components/PlantingRitualModal';
import {
    StarIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
    MapPinIcon,
    CalendarIcon,
    TruckIcon,
    DocumentTextIcon,
    GlobeAltIcon,
    ChevronLeftIcon
} from '../../../components/icons';

// Get the Meaning Palm item
const meaningPalm = heritageItems.find(item => item.id === 'meaning_palm')!;

export default function MeaningPalmPage() {
    const { user: currentUser } = useAppState();
    const dispatch = useAppDispatch();
    const [showRitualModal, setShowRitualModal] = useState(false);

    const handleAddToCart = (item: HeritageItem, details?: { recipient: string; message: string; isAnonymous: boolean; pointsApplied: number }) => {
        const cartItem: CartItem = {
            id: item.id,
            productId: item.id,
            name: item.title,
            price: item.price,
            quantity: 1,
            image: `https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=800&auto=format&fit=crop`,
            stock: 999,
            type: 'heritage',
            popularity: 100,
            dateAdded: new Date().toISOString(),
            deedDetails: details ? {
                name: details.recipient,
                intention: item.title,
                message: details.message
            } : undefined
        };
        dispatch({ type: 'ADD_TO_CART', payload: { product: cartItem, quantity: 1, deedDetails: cartItem.deedDetails } });
        dispatch({ type: 'TOGGLE_CART', payload: true });
    };

    const handleRitualComplete = (item: HeritageItem, details: { recipient: string; message: string; isAnonymous: boolean; pointsApplied: number }) => {
        if (!currentUser) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
            return;
        }
        handleAddToCart(item, details);
        setShowRitualModal(false);
    };

    const handleStartPurchase = () => {
        setShowRitualModal(true);
    };

    const features = [
        { icon: '🌴', title: 'نخل بالغ و ثمرده', description: 'نخل خرما با سن ۸ تا ۱۲ سال، آماده برداشت محصول' },
        { icon: '📍', title: 'موقعیت GPS', description: 'مختصات دقیق نخل شما در نخلستان با قابلیت ردیابی' },
        { icon: '📜', title: 'گواهی مالکیت', description: 'گواهی رسمی کاشت با تمام مشخصات نخل و مالک' },
        { icon: '🌾', title: 'محصول سالانه', description: '۷۰ تا ۱۰۰ کیلوگرم خرمای ارگانیک در هر فصل برداشت' },
        { icon: '🛡️', title: 'بیمه و نگهداری', description: 'بیمه کامل نخل و نگهداری تخصصی توسط کشاورزان محلی' },
        { icon: '📦', title: 'ارسال محصول', description: 'امکان ارسال محصول خرما یا تبدیل به فرآورده‌های جانبی' },
    ];

    const steps = [
        { step: 1, title: 'انتخاب و خرید', description: 'ثبت نیت و تکمیل خرید آنلاین' },
        { step: 2, title: 'کاشت و ثبت', description: 'کاشت نخل در نخلستان و ثبت موقعیت' },
        { step: 3, title: 'صدور گواهی', description: 'ارسال گواهی کاشت با عکس و مختصات' },
        { step: 4, title: 'دریافت محصول', description: 'برداشت و ارسال خرما در فصل حاصلخیزی' },
    ];

    return (
        <main className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 dark:from-stone-950 dark:to-stone-900">
            {/* Hero Section */}
            <section className="relative py-16 md:py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-amber-900/20 dark:from-cyan-950/50 dark:to-amber-950/50" />
                <div className="container mx-auto px-4 relative z-10">
                    {/* Breadcrumb */}
                    <nav className="mb-8">
                        <Link href="/heritage" className="inline-flex items-center text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors">
                            <ChevronLeftIcon className="w-5 h-5 ml-1 rotate-180" />
                            بازگشت به تالار میراث
                        </Link>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Product Image */}
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl ring-4 ring-amber-400/50">
                                <img
                                    src="https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=800&auto=format&fit=crop"
                                    alt="نخل معنا - نخل بالغ خرما"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Badge */}
                            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-2 rounded-full font-bold shadow-lg">
                                ✨ پرفروش‌ترین
                            </div>
                        </motion.div>

                        {/* Product Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="space-y-6"
                        >
                            <div>
                                <span className="inline-block bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                                    نخل میراث پریمیوم
                                </span>
                                <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-white mb-4">
                                    {meaningPalm.title}
                                </h1>
                                <p className="text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
                                    {meaningPalm.description}
                                </p>
                                <p className="mt-4 text-stone-700 dark:text-stone-300 leading-relaxed">
                                    نمادی از تعهد شما به یافتن و زندگی کردن بر اساس معنای شخصی‌تان. این نخل بالغ و ثمرده، سال‌ها مراقبت شده تا اکنون بتواند میزبان داستان شما باشد.
                                </p>
                            </div>

                            {/* Price */}
                            <div className="bg-white dark:bg-stone-800/50 rounded-2xl p-6 shadow-lg border border-stone-200 dark:border-stone-700">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-extrabold text-green-600 dark:text-green-400">
                                        {meaningPalm.price.toLocaleString('fa-IR')}
                                    </span>
                                    <span className="text-lg text-stone-600 dark:text-stone-400">تومان</span>
                                </div>
                                <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                                    مبلغ سرمایه‌گذاری اجتماعی: <span className="font-bold text-green-600">{(meaningPalm.price * 0.9).toLocaleString('fa-IR')} تومان</span>
                                </p>
                                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-6">
                                    <StarIcon className="w-5 h-5" />
                                    <span className="font-semibold">هدیه: {meaningPalm.points.toLocaleString('fa-IR')} امتیاز معنا</span>
                                </div>

                                <button
                                    onClick={handleStartPurchase}
                                    className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-cyan-600/30 transition-all transform hover:scale-[1.02] text-lg"
                                >
                                    🌴 شروع فرآیند کاشت
                                </button>

                                <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-4">
                                    امکان پرداخت قسطی تا ۱۲ ماه
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white dark:bg-stone-900">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-stone-900 dark:text-white mb-12">
                        این نخل شامل چه چیزهایی می‌شود؟
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-6 border border-stone-200 dark:border-stone-700 hover:shadow-lg transition-shadow"
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-stone-600 dark:text-stone-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-16 bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-stone-900 dark:text-white mb-12">
                        مراحل کاشت نخل معنا
                    </h2>
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {steps.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.15 }}
                                    viewport={{ once: true }}
                                    className="relative text-center"
                                >
                                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-white text-2xl font-bold">
                                        {item.step}
                                    </div>
                                    <h3 className="font-bold text-stone-900 dark:text-white mb-2">{item.title}</h3>
                                    <p className="text-sm text-stone-600 dark:text-stone-400">{item.description}</p>
                                    {index < steps.length - 1 && (
                                        <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-transparent -z-10" />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-cyan-900 to-teal-900 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        آماده‌اید داستان خود را بکارید؟
                    </h2>
                    <p className="text-lg text-cyan-100 mb-8 max-w-2xl mx-auto">
                        نخل معنا فقط یک درخت نیست، میراثی زنده است که داستان شما را برای نسل‌ها حفظ می‌کند.
                    </p>
                    <button
                        onClick={handleStartPurchase}
                        className="bg-white text-cyan-900 font-bold py-4 px-10 rounded-full shadow-xl hover:bg-cyan-50 transition-colors text-lg"
                    >
                        🌴 شروع کاشت نخل معنا
                    </button>
                </div>
            </section>

            {/* Planting Ritual Modal */}
            {showRitualModal && (
                <PlantingRitualModal
                    isOpen={showRitualModal}
                    onClose={() => setShowRitualModal(false)}
                    user={currentUser}
                    item={meaningPalm}
                    onComplete={handleRitualComplete}
                />
            )}
        </main>
    );
}
