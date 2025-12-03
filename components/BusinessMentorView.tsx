
import React, { useState } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View, CoachingRole } from '../types';
import { BriefcaseIcon, TrendingUpIcon, TargetIcon, ChartBarIcon, RocketLaunchIcon, LockClosedIcon } from './icons';
import CoachingLabAccessModal from './CoachingLabAccessModal';
import CourseReviews, { AddReviewForm } from './CourseReviews';

const BusinessMentorView: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [selectedTopic, setSelectedTopic] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

    const businessTopics = [
        "استراتژی رشد و مقیاس‌دهی (Scaling)",
        "بهینه‌سازی مدل کسب‌وکار",
        "مدیریت تیم و رهبری سازمانی",
        "بازاریابی و جذب مشتری",
        "مدیریت بحران و ریسک",
        "افزایش بهره‌وری و سیستم‌سازی",
        "راه‌اندازی استارتاپ (از ایده تا اجرا)"
    ];

    const PRICE_TOMAN = 199000;
    const PRICE_POINTS = 2000;

    const handleStartClick = () => {
        // Business Mentor is a premium service, always check payment
        setIsPaymentModalOpen(true);
    };

    const startSession = () => {
        const role: CoachingRole = 'business_client';
        const isRealSession = true;
        const topic = selectedTopic || 'استراتژی عمومی';

        dispatch({ 
            type: 'START_COACHING_SESSION', 
            payload: {
                role,
                topic,
                currentStep: 1,
                startTime: new Date().toISOString(),
                isRealSession,
                returnView: View.BUSINESS_MENTOR
            }
        });
        dispatch({ type: 'SET_VIEW', payload: View.COACHING_SESSION });
    };

    const handlePayWithPoints = () => {
        if (user && user.manaPoints >= PRICE_POINTS) {
            dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: PRICE_POINTS, action: `جلسه منتورینگ بیزینس` } });
            setIsPaymentModalOpen(false);
            startSession();
        }
    };

    return (
        <div className="bg-gray-900 text-white pt-22 pb-24 min-h-screen">
            <div className="container mx-auto px-6 max-w-4xl animate-fade-in-up">
                <header className="text-center mb-12">
                    <div className="inline-block p-4 bg-blue-900/30 rounded-full mb-6 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                        <BriefcaseIcon className="w-12 h-12 text-blue-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white leading-tight">
                        منتور متخصص بیزینس
                    </h1>
                    <p className="text-lg text-blue-200 max-w-2xl mx-auto font-medium">
                        استراتژی، رشد و حل چالش‌های کسب‌وکار
                        <br/>
                        <span className="text-sm opacity-80">(تحلیل داده‌محور و مشاوره اجرایی)</span>
                    </p>
                </header>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-600 overflow-hidden shadow-2xl relative">
                     <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mt-16 z-0"></div>

                    <div className="relative z-10 p-8 md:p-12 space-y-10">
                        <div className="space-y-6 text-center">
                            <p className="text-xl text-gray-200 leading-relaxed font-light">
                                "کسب‌وکار شما پتانسیل رشد دارد، فقط به یک نقشه راه دقیق و نگاهی تازه نیاز است."
                            </p>
                            <p className="text-gray-400 max-w-lg mx-auto">
                                این منتور هوشمند، با رویکردی تحلیلی و استراتژیک، به شما کمک می‌کند تا موانع رشد را شناسایی کرده و راهکارهای عملی برای توسعه بیزینس خود پیدا کنید.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-slate-700/30 p-6 rounded-2xl border border-slate-600/50 flex flex-col items-center text-center hover:bg-slate-700/50 transition-colors">
                                <div className="bg-blue-500/20 p-3 rounded-full mb-3">
                                     <TargetIcon className="w-6 h-6 text-blue-400"/>
                                </div>
                                <h4 className="font-bold text-white mb-1">هدف‌گذاری دقیق</h4>
                                <p className="text-xs text-gray-400">تعیین KPIs و اهداف قابل سنجش.</p>
                            </div>
                            <div className="bg-slate-700/30 p-6 rounded-2xl border border-slate-600/50 flex flex-col items-center text-center hover:bg-slate-700/50 transition-colors">
                                <div className="bg-green-500/20 p-3 rounded-full mb-3">
                                    <TrendingUpIcon className="w-6 h-6 text-green-400"/>
                                </div>
                                <h4 className="font-bold text-white mb-1">رشد و توسعه</h4>
                                <p className="text-xs text-gray-400">استراتژی‌های افزایش درآمد.</p>
                            </div>
                            <div className="bg-slate-700/30 p-6 rounded-2xl border border-slate-600/50 flex flex-col items-center text-center hover:bg-slate-700/50 transition-colors">
                                <div className="bg-amber-500/20 p-3 rounded-full mb-3">
                                    <ChartBarIcon className="w-6 h-6 text-amber-400"/>
                                </div>
                                <h4 className="font-bold text-white mb-1">تحلیل چالش‌ها</h4>
                                <p className="text-xs text-gray-400">یافتن گلوگاه‌های سیستم.</p>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-600">
                            <label className="block text-sm font-semibold text-gray-300 mb-4 text-center">در حال حاضر با چه چالش تجاری روبرو هستید؟</label>
                            <div className="relative">
                                <select 
                                    value={selectedTopic} 
                                    onChange={(e) => setSelectedTopic(e.target.value)} 
                                    className="w-full bg-slate-900 border border-slate-500 text-white rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-4 pr-10 text-lg appearance-none cursor-pointer hover:border-blue-400 transition-colors"
                                >
                                    <option value="">انتخاب موضوع مشاوره</option>
                                    {businessTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                                </select>
                                <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                             <button 
                                onClick={handleStartClick} 
                                className="w-full md:w-auto px-12 py-5 rounded-full font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all transform hover:scale-105 shadow-xl shadow-blue-900/50 flex items-center justify-center gap-3 mx-auto text-xl"
                            >
                                <RocketLaunchIcon className="w-6 h-6 text-white" />
                                دریافت مشاوره استراتژیک (۱۵ دقیقه)
                            </button>
                            <div className="mt-6 flex justify-center items-center gap-2 text-xs text-gray-500 bg-slate-800/50 inline-flex px-4 py-1 rounded-full border border-slate-700">
                                <LockClosedIcon className="w-3 h-3" />
                                <span>سرمایه‌گذاری ویژه ({PRICE_TOMAN.toLocaleString('fa-IR')} تومان)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Proof / Reviews */}
                <CourseReviews 
                    courseId="service-business-mentor" 
                    onAddReviewClick={() => setIsReviewFormOpen(true)} 
                />
            </div>

            <CoachingLabAccessModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                userManaPoints={user?.manaPoints || 0}
                onPayWithPoints={handlePayWithPoints}
                title="جلسه استراتژی بیزینس"
                description="این یک جلسه مشاوره تخصصی ۱۵ دقیقه‌ای است که می‌تواند مسیر کسب‌وکار شما را تغییر دهد."
                priceToman={PRICE_TOMAN}
                pricePoints={PRICE_POINTS}
                productId="p_business_mentor_session"
                icon={BriefcaseIcon}
            />
            
            <AddReviewForm 
                isOpen={isReviewFormOpen}
                onClose={() => setIsReviewFormOpen(false)}
                courseId="service-business-mentor"
            />
        </div>
    );
};

export default BusinessMentorView;
