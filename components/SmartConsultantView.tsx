
import React, { useState } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View, CoachingRole } from '../types';
import { SparklesIcon, LightBulbIcon, CheckCircleIcon, ArrowLeftIcon, BrainCircuitIcon, HeartIcon, SunIcon } from './icons';
import CoachingLabAccessModal from './CoachingLabAccessModal';
import CourseReviews, { AddReviewForm } from './CourseReviews';

const SmartConsultantView: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [selectedTopic, setSelectedTopic] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

    const coachingTopics = [
        "یافتن آرامش در طوفان زندگی",
        "بهبود روابط عاطفی و خانوادگی",
        "مدیریت استرس و اضطراب",
        "افزایش اعتماد به نفس و خودباوری",
        "غلبه بر اهمال‌کاری و کمال‌گرایی",
        "کشف ارزش‌های فردی و رسالت زندگی",
        "ایجاد تعادل بین کار و زندگی"
    ];

    const PRICE_TOMAN = 49000;
    const PRICE_POINTS = 500;

    const handleStartClick = () => {
        // Business Mentor is a premium service, always check payment
        setIsPaymentModalOpen(true);
    };

    const startSession = () => {
        const role: CoachingRole = 'coachee';
        const isRealSession = true;
        const topic = selectedTopic || 'آزاد';

        dispatch({ 
            type: 'START_COACHING_SESSION', 
            payload: {
                role,
                topic,
                currentStep: 1,
                startTime: new Date().toISOString(),
                isRealSession,
                returnView: View.SMART_CONSULTANT
            }
        });
        dispatch({ type: 'SET_VIEW', payload: View.COACHING_SESSION });
    };

    const handlePayWithPoints = () => {
        if (user && user.manaPoints >= PRICE_POINTS) {
            dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: PRICE_POINTS, action: `مشاوره هوشمند زندگی` } });
            setIsPaymentModalOpen(false);
            startSession();
        }
    };

    return (
        <div className="bg-gray-900 text-white pt-22 pb-24 min-h-screen">
            <div className="container mx-auto px-6 max-w-4xl animate-fade-in-up">
                <header className="text-center mb-12">
                    <div className="inline-block p-4 bg-indigo-900/30 rounded-full mb-6 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                        <SunIcon className="w-12 h-12 text-indigo-300" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white leading-tight">
                        مشاور هوشمند زندگی
                    </h1>
                    <p className="text-lg text-indigo-200 max-w-2xl mx-auto font-medium">
                        همراهی دلسوز برای شفافیت، آرامش و تعادل
                        <br/>
                        <span className="text-sm opacity-80">(بر پایه متدولوژی کوچینگ کواکتیو)</span>
                    </p>
                </header>

                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700 overflow-hidden shadow-2xl relative">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 z-0"></div>
                     
                    <div className="relative z-10 p-8 md:p-12 space-y-10">
                        <div className="space-y-6 text-center">
                            <p className="text-xl text-gray-200 leading-relaxed font-light">
                                "گاهی اوقات، تمام چیزی که نیاز داریم، فضایی امن برای شنیده شدن و پرسش‌هایی درست برای باز شدن گره‌های ذهنی است."
                            </p>
                            <p className="text-gray-400 max-w-lg mx-auto">
                                این دستیار هوشمند، نه نصیحت می‌کند و نه قضاوت. بلکه با همدلی و پرسیدن سوالات عمیق، به شما کمک می‌کند تا پاسخ را در درون خودتان پیدا کنید.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-gray-700/30 p-6 rounded-2xl border border-gray-600/50 flex flex-col items-center text-center hover:bg-gray-700/50 transition-colors">
                                <div className="bg-green-500/20 p-3 rounded-full mb-3">
                                     <CheckCircleIcon className="w-6 h-6 text-green-400"/>
                                </div>
                                <h4 className="font-bold text-white mb-1">محرمانه و امن</h4>
                                <p className="text-xs text-gray-400">فضایی کاملاً خصوصی برای بیان احساسات.</p>
                            </div>
                            <div className="bg-gray-700/30 p-6 rounded-2xl border border-gray-600/50 flex flex-col items-center text-center hover:bg-gray-700/50 transition-colors">
                                <div className="bg-indigo-500/20 p-3 rounded-full mb-3">
                                    <HeartIcon className="w-6 h-6 text-indigo-400"/>
                                </div>
                                <h4 className="font-bold text-white mb-1">همدلی عمیق</h4>
                                <p className="text-xs text-gray-400">درک احساسات بدون قضاوت.</p>
                            </div>
                            <div className="bg-gray-700/30 p-6 rounded-2xl border border-gray-600/50 flex flex-col items-center text-center hover:bg-gray-700/50 transition-colors">
                                <div className="bg-yellow-500/20 p-3 rounded-full mb-3">
                                    <SparklesIcon className="w-6 h-6 text-yellow-400"/>
                                </div>
                                <h4 className="font-bold text-white mb-1">شفافیت ذهن</h4>
                                <p className="text-xs text-gray-400">یافتن راهکار از درون خودتان.</p>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
                            <label className="block text-sm font-semibold text-gray-300 mb-4 text-center">امروز دوست دارید روی چه موضوعی تمرکز کنیم؟</label>
                            <div className="relative">
                                <select 
                                    value={selectedTopic} 
                                    onChange={(e) => setSelectedTopic(e.target.value)} 
                                    className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-4 pr-10 text-lg appearance-none cursor-pointer hover:border-indigo-400 transition-colors"
                                >
                                    <option value="">انتخاب موضوع (اختیاری - گفتگوی آزاد)</option>
                                    {coachingTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                                </select>
                                <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                             <button 
                                onClick={handleStartClick} 
                                className="w-full md:w-auto px-12 py-5 rounded-full font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all transform hover:scale-105 shadow-xl shadow-indigo-900/50 flex items-center justify-center gap-3 mx-auto text-xl"
                            >
                                <SparklesIcon className="w-6 h-6 text-yellow-200" />
                                شروع جلسه مشاوره (۱۵ دقیقه)
                            </button>
                            <p className="text-xs text-gray-500 mt-6 bg-gray-800/50 inline-block px-4 py-1 rounded-full">
                                هدیه‌ای برای آرامش ذهن شما ({PRICE_TOMAN.toLocaleString('fa-IR')} تومان)
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Social Proof / Reviews */}
                <CourseReviews 
                    courseId="service-smart-consultant" 
                    onAddReviewClick={() => setIsReviewFormOpen(true)} 
                />

            </div>

            <CoachingLabAccessModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                userManaPoints={user?.manaPoints || 0}
                onPayWithPoints={handlePayWithPoints}
                title="دسترسی به مشاور زندگی"
                description="برای شروع جلسه ۱۵ دقیقه‌ای مشاوره هوشمند، لطفا روش پرداخت را انتخاب کنید."
                priceToman={PRICE_TOMAN}
                pricePoints={PRICE_POINTS}
                productId="p_life_coach_session"
                icon={SunIcon}
            />
            
            <AddReviewForm 
                isOpen={isReviewFormOpen}
                onClose={() => setIsReviewFormOpen(false)}
                courseId="service-smart-consultant"
            />
        </div>
    );
};

export default SmartConsultantView;
