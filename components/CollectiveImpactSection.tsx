
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View } from '../types';
import { SproutIcon, BriefcaseIcon, CloudIcon, UserCircleIcon, PresentationChartLineIcon, TrophyIcon } from './icons';

import InfographicOverlay from './ui/InfographicOverlay';

const useAnimatedCounter = (endValue: number, duration = 2000) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let startTime: number | null = null;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            setCount(Math.floor(percentage * endValue));
            if (progress < duration) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [endValue, duration]);
    return count;
};

const useScrollAnimate = (threshold = 0.2) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); } }, { threshold });
        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, []);
    return [ref, isVisible] as const;
};

interface InteractiveStatCardProps {
    label: string; communityValue: string; personalValue?: string; isLoggedIn: boolean; hasPlanted: boolean; onLoginClick: () => void; onNavigateToProfileTab: (tab: string) => void; onStartPlantingFlow: () => void; colorClass: string; icon: React.ReactNode; isVisible: boolean; delay: number;
}

const InteractiveStatCard: React.FC<InteractiveStatCardProps> = ({ label, communityValue, personalValue, isLoggedIn, hasPlanted, onLoginClick, onNavigateToProfileTab, onStartPlantingFlow, colorClass, icon, isVisible, delay }) => {
    const [isHovered, setIsHovered] = useState(false);
    const numericCommunityValue = useMemo(() => parseInt(communityValue.replace(/[^0-9]/g, ''), 10) || 0, [communityValue]);
    const animatedValue = useAnimatedCounter(isVisible ? numericCommunityValue : 0, 2000);
    const hasPlusSign = communityValue.includes('+');

    const renderHoverContent = () => {
        if (!isLoggedIn) return (<><UserCircleIcon className="w-10 h-10 text-gray-500 mb-2" /><p className="font-semibold text-white">تاثیر خود را ببینید</p><button onClick={(e) => { e.stopPropagation(); onLoginClick(); }} className="mt-2 text-sm text-green-400 hover:underline">وارد شوید یا ثبت‌نام کنید</button></>);
        if (hasPlanted) return (<><TrophyIcon className="w-10 h-10 text-yellow-300 mb-2" /><p className="font-bold text-lg text-yellow-300">تبریک قهرمان معنا!</p>{personalValue && <p className="text-white mt-1">تاثیر شما: <span className={`font-bold ${colorClass}`}>{personalValue}</span></p>}<button onClick={(e) => { e.stopPropagation(); onNavigateToProfileTab('timeline'); }} className="mt-3 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-3 rounded-md">ثبت خاطره برای نخل خود</button></>);
        return (<><SproutIcon className="w-10 h-10 text-green-300 mb-2" /><p className="font-semibold text-white">سفر شما از اینجا آغاز می‌شود</p><button onClick={(e) => { e.stopPropagation(); onStartPlantingFlow(); }} className="mt-2 text-sm text-green-400 hover:underline">اولین قدم را بردارید</button></>);
    };

    return (
        <div
            className={`glass-card p-8 rounded-[2rem] relative overflow-hidden cursor-pointer min-h-[160px] opacity-0 ${isVisible ? 'animate-fade-in-up' : ''}`}
            style={{ animationDelay: `${delay}ms` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Hover Glow Effect */}
            {isHovered && (
                <div className={`absolute -inset-0 opacity-20 blur-3xl pointer-events-none transition-opacity duration-500 ${colorClass.replace('text-', 'bg-')}`}></div>
            )}

            <div className={`transition-all duration-500 ${isHovered ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'}`}>
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className={`p-5 rounded-3xl mb-4 bg-white/5 border border-white/10 ${colorClass}`}>
                        {icon}
                    </div>
                    <p className={`text-5xl font-black mb-2 tracking-tight ${colorClass}`}>{animatedValue.toLocaleString('fa-IR')}{hasPlusSign ? '+' : ''}</p>
                    <p className="text-base text-gray-400 font-medium tracking-wide">{label}</p>
                </div>
            </div>

            <div className={`absolute inset-0 p-6 flex flex-col items-center justify-center text-center transition-all duration-500 bg-white/[0.02] backdrop-blur-xl ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {renderHoverContent()}
            </div>
        </div>
    );
};

const CollectiveImpactSection: React.FC = () => {
    const { user, communityStats, personalStats } = useAppState();
    const dispatch = useAppDispatch();
    const [sectionRef, isSectionVisible] = useScrollAnimate(0.3);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const onAuthClick = () => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
    const onNavigate = (view: View) => dispatch({ type: 'SET_VIEW', payload: view });
    const onNavigateToProfileTab = (tab: string) => dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: tab });
    const onStartPlantingFlow = () => dispatch({ type: 'START_PLANTING_FLOW' });

    const hasPlanted = !!user && personalStats.palms > 0;

    const stats = [
        { label: "نخل کاشته شده در خاک ایران", communityValue: communityStats.totalPalmsPlanted.toLocaleString('fa-IR') + '+', personalValue: personalStats.palms.toLocaleString('fa-IR'), colorClass: "text-green-400", icon: <SproutIcon className="w-8 h-8 text-green-400" /> },
        { label: "ساعت کار و اشتغال برای جوانان", communityValue: communityStats.totalJobHours.toLocaleString('fa-IR') + '+', personalValue: personalStats.jobHours.toLocaleString('fa-IR'), colorClass: "text-blue-400", icon: <BriefcaseIcon className="w-8 h-8 text-blue-400" /> },
        { label: "کیلوگرم اکسیژن تازه (جذب CO2)", communityValue: communityStats.totalCo2Absorbed.toLocaleString('fa-IR') + '+', personalValue: personalStats.co2Absorbed.toLocaleString('fa-IR'), colorClass: "text-teal-400", icon: <CloudIcon className="w-8 h-8 text-teal-400" /> },
    ];

    return (
        <section ref={sectionRef} className="py-32 bg-mana-bg overflow-hidden relative border-t border-white/5">
            {/* V5.4 Atmospheric Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_70%)] opacity-50"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className={`text-center mb-20 transition-all duration-1000 ${isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">قدرتِ <span className="text-gradient-green">«ما»</span></h2>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
                        این اعداد فقط آمار نیستند؛ آن‌ها نشان‌دهنده امید، زندگی و آینده‌ای هستند که ما با هم می‌سازیم. <br />
                        هر نخل، <span className="text-white font-medium">یک سنگر سبز</span> در برابر بیابان‌زایی و فقر است.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Infographic */}

                    <div className={`transition-all duration-1000 delay-300 ${isSectionVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>

                        <InfographicOverlay

                            imageSrc="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200&auto=format&fit=crop"

                            alt="Collective Impact Radial Chart"

                            hotspots={[

                                { id: 'c1', x: 30, y: 35, title: 'محیط زیست', description: 'احیای پوشش گیاهی و جذب کربن', align: 'left' },

                                { id: 'c2', x: 70, y: 35, title: 'اشتغال پایدار', description: 'ایجاد شغل برای جوانان بومی', align: 'right' },

                                { id: 'c3', x: 50, y: 75, title: 'چرخه خیریه', description: 'حمایت از خانواده‌های نیازمند', align: 'center' },

                            ]}

                        />

                    </div>



                    {/* Right: Stats Cards */}

                    <div className="flex flex-col gap-6">

                        {stats.map((stat, index) => (

                            <InteractiveStatCard

                                key={stat.label}

                                label={stat.label}

                                communityValue={stat.communityValue}

                                personalValue={stat.personalValue}

                                isLoggedIn={mounted && !!user}

                                hasPlanted={mounted && hasPlanted}

                                onLoginClick={onAuthClick}

                                onNavigateToProfileTab={onNavigateToProfileTab}

                                onStartPlantingFlow={onStartPlantingFlow}

                                colorClass={stat.colorClass}

                                icon={stat.icon}

                                isVisible={isSectionVisible}

                                delay={index * 150 + 500}

                            />

                        ))}

                    </div>

                </div>
                <div className={`text-center mt-16 transition-all duration-700 delay-500 ${isSectionVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    <button onClick={() => onNavigate(View.TransparencyDashboard)} className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-full text-lg transition-all border border-gray-600 hover:border-gray-500 shadow-lg">
                        <PresentationChartLineIcon className="w-6 h-6" />
                        <span>مشاهده شفافیت مالی و اثرگذاری</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CollectiveImpactSection;