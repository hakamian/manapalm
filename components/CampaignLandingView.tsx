
import React, { useState } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View } from '../types';
import { motion } from 'framer-motion';
import PlantingRitualModal from './PlantingRitualModal';
import { ArrowLeftIcon, SparklesIcon, ClockIcon, GlobeAltIcon, RocketLaunchIcon, CheckBadgeIcon } from './icons';

const CampaignLandingView: React.FC = () => {
    const { user, products } = useAppState();
    const dispatch = useAppDispatch();
    const [isRitualOpen, setIsRitualOpen] = useState(false);
    const [hasPlanted, setHasPlanted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleStartFlow = () => {
        if (!user) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
        } else if (!hasPlanted) {
            setIsRitualOpen(true);
        } else {
            scrollToRequestForm();
        }
    };

    const handleRitualComplete = () => {
        setIsRitualOpen(false);
        setHasPlanted(true);
        // Optional: Trigger a small confetti or toast
        dispatch({ type: 'SHOW_POINTS_TOAST', payload: { points: 100, action: 'تعهد سبز', type: 'mana' } });
        setTimeout(() => {
            scrollToRequestForm();
        }, 500);
    };

    const scrollToRequestForm = () => {
        document.getElementById('request-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmitRequest = () => {
        setLoading(true);
        // Find the campaign product
        const campaignProduct = products.find(p => p.id === 'campaign_website_service');

        if (campaignProduct) {
            // Using ADD_TO_CART then PLACE_ORDER simulation or direct logic?
            // Since we want a direct "Request" feel, we might assume the user 'buys' this 0-price item.
            // For now, let's simulate adding to cart and opening checkout or direct success.
            // Since price is 0, we can add to cart and maybe auto-checkout logic needs to exist.
            // Simplified: Add to cart -> Open Cart. 
            // Better: Add to cart -> Checkout View (User confirms).

            // Dispatch action to add to cart
            dispatch({
                type: 'ADD_TO_CART',
                payload: { product: campaignProduct, quantity: 1 }
            });

            setTimeout(() => {
                setLoading(false);
                dispatch({ type: 'TOGGLE_CART', payload: true });
            }, 800);
        } else {
            console.error("Campaign product not found!");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-20 pt-24 overflow-x-hidden">
            <PlantingRitualModal
                isOpen={isRitualOpen}
                onClose={() => setIsRitualOpen(false)}
                onComplete={handleRitualComplete}
            />

            {/* Hero Section */}
            <section className="relative px-6 py-20 text-center container mx-auto max-w-5xl">
                <div className="absolute top-0 right-10 w-72 h-72 bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-semibold mb-6">
                        کمپین ویژه نخلستان معنا
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-green-100 to-green-200">
                        وقتِ شما برای <span className="text-green-400 font-serif italic">معنا</span> است،
                        <br className="hidden md:block" />
                        بقیه را به <span className="text-blue-400">هوش مصنوعی</span> بسپارید.
                    </h1>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        ما کنارتان هستیم تا با ابزارهای مدرن، کارهای زمان‌بر را حذف کنیم.
                        <br />
                        یک سایت حرفه‌ای تا آخر هفته داشته باشید و به آنچه واقعاً مهم است برسید.
                    </p>

                    <button
                        onClick={handleStartFlow}
                        className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-8 rounded-full text-lg shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all hover:scale-105"
                    >
                        <span>شروع سفر دیجیتال</span>
                        <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    {!user && (
                        <p className="mt-4 text-sm text-gray-500">برای شروع ابتدا وارد شوید یا ثبت‌نام کنید.</p>
                    )}
                </motion.div>
            </section>

            {/* Offerings Grid */}
            <section className="px-6 py-12 container mx-auto">
                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Offering 1: Web Design */}
                    <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-2xl hover:bg-gray-800/80 transition-all group">
                        <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <GlobeAltIcon className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">طراحی سایت حرفه‌ای</h3>
                        <p className="text-gray-400 mb-6">
                            نیاز نیست ماه‌ها درگیر طراحی باشید. تیم متخصص ما با کمک AI، سایت شما را با استاندارد جهانی طراحی و تا پایان هفته تحویل می‌دهد.
                        </p>
                        <ul className="space-y-3 mb-8 text-gray-300">
                            <li className="flex items-center gap-2"><CheckBadgeIcon className="w-5 h-5 text-green-500" /> طراحی واکنش‌گرا (ریسپانسیو)</li>
                            <li className="flex items-center gap-2"><CheckBadgeIcon className="w-5 h-5 text-green-500" /> بهینه برای SEO</li>
                            <li className="flex items-center gap-2"><CheckBadgeIcon className="w-5 h-5 text-green-500" /> اتصال به درگاه پرداخت</li>
                        </ul>
                    </div>

                    {/* Offering 2: AI Agents */}
                    <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-2xl hover:bg-gray-800/80 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded-bl-xl border-l border-b border-yellow-500/20">
                            به زودی
                        </div>
                        <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <RocketLaunchIcon className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">ایجنت‌های هوشمند (n8n)</h3>
                        <p className="text-gray-400 mb-6">
                            کارهای تکراری را به ربات‌ها بسپارید. ایجنت‌های ما ایمیل‌ها را پاسخ می‌دهند، محتوا تولید می‌کنند و مشتریان را مدیریت می‌کنند.
                        </p>
                        <ul className="space-y-3 mb-8 text-gray-300 opacity-60">
                            <li className="flex items-center gap-2"><ClockIcon className="w-5 h-5 text-gray-500" /> صرفه‌جویی ۲۰ ساعت در هفته</li>
                            <li className="flex items-center gap-2"><ClockIcon className="w-5 h-5 text-gray-500" /> پشتیبانی ۲۴ ساعته خودکار</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Request Form Area */}
            <section id="request-form" className="px-6 py-20 bg-black/20 mt-10">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold mb-8">آماده‌اید بار اضافی را زمین بگذارید؟</h2>

                    {hasPlanted ? (
                        <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-green-500/30 p-8 rounded-3xl shadow-2xl">
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                                    <SparklesIcon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-green-400">تعهد شما ثبت شد</h3>
                                <p className="text-gray-400 mt-2">حالا نوبت ماست که به وعده خود عمل کنیم.</p>
                            </div>

                            <div className="text-right bg-gray-800/50 p-6 rounded-xl border border-gray-700 mb-8">
                                <h4 className="font-bold mb-2 text-white">درخواست طراحی سایت</h4>
                                <p className="text-sm text-gray-400 mb-4">با کلیک بر روی دکمه زیر، درخواست شما به سبد خرید اضافه می‌شود (هزینه: ۰ تومان). پس از نهایی کردن سفارش، کارشناسان ما با شما تماس خواهند گرفت.</p>
                                <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center">
                                            <GlobeAltIcon className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">پکیج طراحی سایت (کمپین معنا)</div>
                                            <div className="text-xs text-blue-300">ویژه کارآفرینان</div>
                                        </div>
                                    </div>
                                    <div className="text-green-400 font-bold">رایگان</div>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmitRequest}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <span className="animate-pulse">در حال ثبت...</span>
                                ) : (
                                    <>
                                        <span>ثبت درخواست نهایی</span>
                                        <ArrowLeftIcon className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">برای ثبت درخواست، ابتدا باید «شروع سفر دیجیتال» را در بالای صفحه بزنید و تعهد خود را بکارید.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default CampaignLandingView;
