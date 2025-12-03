import React, { useState, useEffect, useRef } from 'react';
import { View } from '../types';
import { useAppState, useAppDispatch } from '../AppContext';
import { CompassIcon, SparklesIcon, TrophyIcon, ArrowLeftIcon, BrainCircuitIcon, BookOpenIcon, FlagIcon } from './icons';

const useScrollAnimate = (threshold = 0.5) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold }
        );
        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);
        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, []);

    return [ref, isVisible] as const;
};

const HerosJourneyIntroView: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [benefitsRef, areBenefitsVisible] = useScrollAnimate();


    const handleStart = () => {
        if (user?.hasUnlockedHerosJourney) {
            dispatch({ type: 'SET_VIEW', payload: View.HerosJourney });
        } else {
            dispatch({ type: 'SET_VIEW', payload: View.CompassUnlockChat });
        }
    };

    return (
        <div className="bg-gray-900 text-white pt-22 pb-24">
            {/* Hero */}
            <div className="relative text-center py-20 px-6 bg-gray-800 rounded-b-3xl">
                 <h1 className="text-4xl md:text-5xl font-bold mb-4">ماجراجویی بزرگ شما در شرف آغاز است</h1>
                 <p className="text-xl max-w-3xl mx-auto text-gray-300">
                    این فقط یک ویژگی نیست؛ یک سفر هدایت‌شده برای کشف عمیق‌ترین ارزش‌ها، استعدادها و رسالت شخصی شماست.
                 </p>
            </div>

            <div className="container mx-auto px-6 py-16 max-w-4xl">
                {/* Benefits */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-20" ref={benefitsRef}>
                     <div className="flex justify-center">
                        <div className="relative w-80 h-80">
                            <div
                                className="absolute -inset-2 rounded-full"
                                style={{
                                    background: 'conic-gradient(from 0deg, transparent 0 270deg, #34D399 270deg 360deg)',
                                    animation: areBenefitsVisible ? 'rotate-on-scroll 4s linear infinite' : 'none',
                                    opacity: areBenefitsVisible ? 1 : 0,
                                    transition: 'opacity 1s ease-in-out',
                                }}
                            ></div>
                            <img src="https://picsum.photos/seed/journey-map/500/500" alt="Journey Map" className="relative z-10 rounded-full shadow-2xl object-cover w-full h-full border-8 border-gray-900" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-green-400 mb-4">این سفر برای شما چه سودی دارد؟</h2>
                        <ul className="space-y-4 text-lg text-gray-300 leading-relaxed">
                            <li className="flex items-start"><SparklesIcon className="w-6 h-6 text-green-400 mt-1 ml-3 flex-shrink-0" /><span>به زندگی و کارتان <strong>عمق و رضایت</strong> می‌بخشد.</span></li>
                            <li className="flex items-start"><SparklesIcon className="w-6 h-6 text-green-400 mt-1 ml-3 flex-shrink-0" /><span>به شما <strong>شفافیت و هدفمندی</strong> برای تصمیم‌گیری‌های بزرگ می‌دهد.</span></li>
                            <li className="flex items-start"><SparklesIcon className="w-6 h-6 text-green-400 mt-1 ml-3 flex-shrink-0" /><span>به کارتان <strong>رنگ و بوی خرسندی</strong> و معنایی دوباره می‌دهد.</span></li>
                        </ul>
                    </div>
                </div>

                {/* How it works */}
                <div className="text-center mb-20">
                    <h2 className="text-3xl font-bold mb-10">روند کار چگونه است؟</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting line */}
                        <div className="absolute top-10 left-0 w-full h-0.5 bg-gray-700 hidden md:block"></div>
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-gray-800 border-4 border-green-500 flex items-center justify-center mb-4"><BrainCircuitIcon className="w-10 h-10 text-green-400" /></div>
                            <h3 className="text-xl font-semibold mb-2">۱. گفتگوی کشف</h3>
                            <p className="text-gray-400">با مربی هوشمند خود گفتگو می‌کنید تا ارزش‌هایتان آشکار شود.</p>
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-gray-800 border-4 border-green-500 flex items-center justify-center mb-4"><CompassIcon className="w-10 h-10 text-green-400" /></div>
                            <h3 className="text-xl font-semibold mb-2">۲. تحلیل هوشمند</h3>
                            <p className="text-gray-400">هوش مصنوعی با تحلیل گفتگو، قطب‌نمای معنای شما را ترسیم می‌کند.</p>
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-gray-800 border-4 border-green-500 flex items-center justify-center mb-4"><FlagIcon className="w-10 h-10 text-green-400" /></div>
                            <h3 className="text-xl font-semibold mb-2">۳. مسیر شخصی</h3>
                            <p className="text-gray-400">یک مسیر رشد شخصی‌سازی شده با ماموریت‌های هفتگی برایتان باز می‌شود.</p>
                        </div>
                    </div>
                </div>

                {/* Gamification & CTA */}
                <div className="bg-gray-800 p-8 rounded-2xl text-center border border-gray-700">
                    <h2 className="text-3xl font-bold text-yellow-300 mb-4">پاداش‌های شما در این سفر</h2>
                    <div className="flex flex-wrap justify-center gap-6 text-lg my-6">
                        <span className="bg-gray-700 px-4 py-2 rounded-full">باز شدن قفل "مسیر معنا"</span>
                        <span className="bg-gray-700 px-4 py-2 rounded-full">باز شدن قفل "گاهشمار معنا"</span>
                        <span className="bg-gray-700 px-4 py-2 rounded-full flex items-center gap-2">دریافت دستاورد <TrophyIcon className="w-5 h-5 text-yellow-400" /> "راه‌بلد"</span>
                        <span className="bg-gray-700 px-4 py-2 rounded-full">+۲۰۰ امتیاز معنا</span>
                    </div>
                    <button
                        onClick={handleStart}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-full text-xl transition-transform transform hover:scale-105 shadow-lg"
                    >
                        {user?.hasUnlockedHerosJourney ? 'ادامه سفر قهرمانی' : 'اولین قدم را برمی‌دارم'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HerosJourneyIntroView;