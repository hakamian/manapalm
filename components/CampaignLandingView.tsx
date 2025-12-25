
import React, { useState, useRef } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import PlantingRitualModal from './PlantingRitualModal';
import {
    ArrowLeftIcon, SparklesIcon, ClockIcon, GlobeAltIcon, RocketLaunchIcon,
    CheckBadgeIcon, PaperClipIcon, PhotoIcon, PhoneIcon, UserCircleIcon, BriefcaseIcon
} from './icons';

interface RequestFormData {
    businessName: string;
    industry: string;
    socialLink: string;
    phone: string;
    description: string;
    logo: string | null; // Base64
}

const CampaignLandingView: React.FC = () => {
    const { user, products } = useAppState();
    const dispatch = useAppDispatch();
    const [isRitualOpen, setIsRitualOpen] = useState(false);
    const [hasPlanted, setHasPlanted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [requestSubmitted, setRequestSubmitted] = useState(false);

    // Form State
    const [formData, setFormData] = useState<RequestFormData>({
        businessName: '',
        industry: '',
        socialLink: '',
        phone: user?.phone || '',
        description: '',
        logo: null
    });

    // File Input Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        dispatch({ type: 'SHOW_POINTS_TOAST', payload: { points: 100, action: 'تعهد سبز', type: 'mana' } });
        setTimeout(() => {
            scrollToRequestForm();
        }, 500);
    };

    const scrollToRequestForm = () => {
        document.getElementById('request-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500 * 1024) {
                alert('حجم فایل باید کمتر از ۵۰۰ کیلوبایت باشد.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitRequest = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const campaignProduct = products.find(p => p.id === 'campaign_website_service');

        if (campaignProduct) {
            // Construct Order Metadata/Details
            const orderDetails = {
                ...formData,
                requestDate: new Date().toISOString(),
                plan: '3-5 pages starter',
                promise: 'Call by tomorrow'
            };

            // Dispatch Order Logic
            // We put the details in 'deedDetails' property of action as a carrier for metadata
            dispatch({
                type: 'ADD_TO_CART',
                payload: {
                    product: campaignProduct,
                    quantity: 1,
                    deedDetails: orderDetails // Passing form data as metadata
                }
            });

            // Simulate API Call delay
            setTimeout(async () => {
                setLoading(false);
                setRequestSubmitted(true);

                // Send Confirmation SMS
                try {
                    const { smsService } = await import('../services/smsService');
                    // Using the provided Template ID
                    await smsService.sendTemplateSms(formData.phone, 738447, [
                        { name: "Name", value: formData.businessName }
                    ]);
                    console.log("SMS Sent Successfully");
                } catch (err) {
                    console.error("Failed to send SMS:", err);
                    // Don't block UI success
                }
            }, 1500);
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
                        یک سایت حرفه‌ای <span className="text-white font-bold">۳ تا ۵ صفحه‌ای</span> تا آخر هفته تحویل بگیرید.
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
                            سایت ۳ تا ۵ صفحه‌ای شامل صفحه اصلی، درباره ما، خدمات و تماس. طراحی شده با اصول UI/UX مدرن.
                        </p>
                        <ul className="space-y-3 mb-8 text-gray-300">
                            <li className="flex items-center gap-2"><CheckBadgeIcon className="w-5 h-5 text-green-500" /> شامل ۳ تا ۵ صفحه استاندارد</li>
                            <li className="flex items-center gap-2"><CheckBadgeIcon className="w-5 h-5 text-green-500" /> ریسپانسیو و موبایل فرندلی</li>
                            <li className="flex items-center gap-2"><CheckBadgeIcon className="w-5 h-5 text-green-500" /> تحویل فوری (تا پایان هفته)</li>
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
                            کارهای تکراری را به ربات‌ها بسپارید. ایجنت‌های ما ایمیل‌ها را پاسخ می‌دهند و مشتریان را مدیریت می‌کنند.
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
                <div className="container mx-auto max-w-3xl">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold mb-4">اطلاعات کسب‌وکار شما</h2>
                        <p className="text-gray-400">فرم زیر را پر کنید تا کارشناسان ما تا فردا با شما تماس بگیرند.</p>
                    </div>

                    {hasPlanted ? (
                        <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-green-500/30 p-8 rounded-3xl shadow-2xl">
                            {requestSubmitted ? (
                                <div className="text-center py-10">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6 ring-2 ring-green-500 text-green-400">
                                        <CheckBadgeIcon className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">درخواست شما با موفقیت ثبت شد</h3>
                                    <p className="text-lg text-gray-300 mb-8">
                                        کارشناسان ما درخواست شما را بررسی کرده و <span className="text-amber-400 font-bold">تا فردا</span> با شما تماس خواهند گرفت.
                                    </p>
                                    <button
                                        onClick={() => dispatch({ type: 'SET_VIEW', payload: View.UserProfile })} // Redirect to profile or home
                                        className="text-gray-400 hover:text-white underline"
                                    >
                                        بازگشت به پروفایل
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitRequest} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">نام کسب‌وکار / برند <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <BriefcaseIcon className="absolute right-3 top-3.5 w-5 h-5 text-gray-500" />
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 pr-10 pl-4 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                    placeholder="مثال: گالری هنر مدرن"
                                                    value={formData.businessName}
                                                    onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">حوزه فعالیت <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                placeholder="مثال: فروشگاه پوشاک، مشاوره..."
                                                value={formData.industry}
                                                onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">شماره تماس (برای هماهنگی) <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <PhoneIcon className="absolute right-3 top-3.5 w-5 h-5 text-gray-500" />
                                                <input
                                                    type="tel"
                                                    required
                                                    dir="ltr"
                                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 pr-10 pl-4 text-white text-right focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                    placeholder="0912..."
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">لینک شبکه‌های اجتماعی (اختیاری)</label>
                                            <div className="relative">
                                                <GlobeAltIcon className="absolute right-3 top-3.5 w-5 h-5 text-gray-500" />
                                                <input
                                                    type="text"
                                                    dir="ltr"
                                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 pr-10 pl-4 text-white text-right focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                    placeholder="instagram.com/..."
                                                    value={formData.socialLink}
                                                    onChange={e => setFormData({ ...formData, socialLink: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">توضیحات / هدف اصلی سایت</label>
                                        <textarea
                                            rows={3}
                                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            placeholder="چه چیزی برایتان مهم است؟..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">آپلود لوگو (اختیاری)</label>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-gray-800/30 transition-all text-center group"
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                            {formData.logo ? (
                                                <div className="relative">
                                                    <img src={formData.logo} alt="Logo Preview" className="h-16 w-auto object-contain mb-2 mx-auto" />
                                                    <span className="text-xs text-green-400">تصویر انتخاب شد (برای تغییر کلیک کنید)</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <PhotoIcon className="w-8 h-8 text-gray-500 mb-3 group-hover:text-green-400 transition-colors" />
                                                    <span className="text-sm text-gray-400">برای انتخاب لوگو کلیک کنید</span>
                                                    <span className="text-xs text-gray-600 mt-1 max-w-[200px]">حداکثر ۵۰۰ کیلوبایت (JPG/PNG)</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 mt-4"
                                    >
                                        {loading ? (
                                            <span className="animate-pulse">در حال ثبت اطلاعات...</span>
                                        ) : (
                                            <>
                                                <span>ثبت و ارسال به کارشناسان</span>
                                                <ArrowLeftIcon className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gray-800/20 rounded-3xl border border-gray-700 border-dashed">
                            <SparklesIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 italic mb-6">برای ثبت درخواست، ابتدا باید «شروع سفر دیجیتال» را در بالای صفحه بزنید و تعهد خود را بکارید.</p>
                            <button onClick={handleStartFlow} className="text-green-400 hover:text-green-300 font-bold border-b border-green-500/30 hover:border-green-400 pb-1 transition-all">
                                شروع سفر دیجیتال
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default CampaignLandingView;
