'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View, User } from '../types';
import { SproutIcon, CompassIcon, UsersIcon, CheckCircleIcon, SparklesIcon, CpuChipIcon, ArrowLeftIcon, HandshakeIcon, LeafIcon, QuoteIcon, MegaphoneIcon, HeartIcon, BookOpenIcon, SunIcon, BriefcaseIcon } from './icons';
import CollectiveImpactSection from './CollectiveImpactSection';
import CampaignList from './campaigns/CampaignList';
import FAQ from './FAQ';
import HeroCard from './home/HeroCard';
import SpringOfMeaning from './home/SpringOfMeaning';
import NextStepCard from './home/NextStepCard';
import LastHeritageCard from './home/LastHeritageCard';
import ManaGuideCard from './ManaGuideCard';
import WelcomeMat from './WelcomeMat';
import SEOHead from './seo/SEOHead';
import { OrganizationSchema } from './seo/SchemaMarkup';
import { LocalBusinessSchema, FAQSchema } from './seo/RichSnippets';
import SmartImage from './ui/SmartImage'; // New import

import { REFERENCE_DATE_STR, INITIAL_CAMPAIGNS } from '../utils/dummyData';

import InfographicOverlay from './ui/InfographicOverlay';
import PremiumButton from './ui/PremiumButton';

// --- Helper Hooks ---
const useScrollAnimate = (threshold = 0.2) => {
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
    }, [threshold]);

    return [ref, isVisible] as const;
};

// --- Sub-Components ---

const HeroSection: React.FC<{ onStartJourneyClick: () => void, user: User | null }> = ({ onStartJourneyClick, user }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const sceneRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (sceneRef.current) {
                const { clientX, clientY } = event;
                const { innerWidth, innerHeight } = window;
                const x = (clientX / innerWidth - 0.5) * 2;
                const y = (clientY / innerHeight - 0.5) * 2;
                setMousePos({ x, y });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const getLayerStyle = (depth: number): React.CSSProperties => ({
        transform: `translateX(${mousePos.x * depth}px) translateY(${mousePos.y * depth}px)`,
        transition: 'transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)'
    });

    return (
        <div ref={sceneRef} className="relative min-h-[90dvh] w-full flex flex-col items-center justify-center overflow-hidden hero-header-clearance">
            <style>{`
                @keyframes twinkle { 0%, 100% { opacity: 0.4; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1); } }
                .star { position: absolute; background-color: white; border-radius: 50%; animation: twinkle 4s infinite ease-in-out; }
                @keyframes sway { 0%, 100% { transform: rotate(-1deg); } 50% { transform: rotate(1.5deg); } }
                .palm-sway { transform-origin: bottom center; animation: sway 12s infinite ease-in-out; }
                @keyframes scroll-indicator { 0%, 100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(10px); opacity: 0.5; } }
                .scroll-indicator { animation: scroll-indicator 2s infinite ease-in-out; }

                /* New styles for premium HeroSection */
                .mana-bg { background-color: #0f172a; } /* Example base background color */
                .mana-primary { color: #4ade80; } /* Example primary color */
                .mana-accent { color: #facc15; } /* Example accent color */

                @keyframes pulse-soft {
                    0%, 100% { transform: scale(1); opacity: 0.7; }
                    50% { transform: scale(1.05); opacity: 1; }
                }
                .animate-pulse-soft { animation: pulse-soft 8s infinite ease-in-out; }

                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }

                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }

                .glass-panel {
                    background-color: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
                }

                .text-gradient-green {
                    background: linear-gradient(90deg, #4ade80, #16a34a);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .text-gradient-gold {
                    background: linear-gradient(90deg, #facc15, #eab308);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
            {/* V5.4 Atmospheric Background Integration */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-mana-bg"></div>

                {/* Animated Glows */}
                <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-mana-primary/10 rounded-full blur-[120px] animate-pulse-soft"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-mana-accent/5 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '2s' }}></div>

                {/* Parallax Stars */}
                {mounted && (
                    <div className="absolute inset-0" style={getLayerStyle(5)}>
                        {[...Array(80)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute bg-white rounded-full opacity-30"
                                style={{
                                    width: Math.random() * 2 + 'px',
                                    height: Math.random() * 2 + 'px',
                                    top: Math.random() * 100 + '%',
                                    left: Math.random() * 100 + '%',
                                    animation: `twinkle ${Math.random() * 5 + 3}s infinite ease-in-out`
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-6 max-w-6xl mx-auto" style={getLayerStyle(-10)}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/10 text-mana-primary text-sm font-medium mb-8 animate-fade-in-down">
                    <SparklesIcon className="w-4 h-4" />
                    <span>پلتفرم جامع معنا و مسئولیت اجتماعی</span>
                </div>

                <h1 className="text-5xl md:text-8xl font-bold mb-8 leading-[1.15] text-white animate-fade-in-up">
                    {mounted && user
                        ? <>سلام <span className="text-gradient-green">{user.name}</span>،<br />به نخلستان خودت خوش آمدی</>
                        : <>نخل بکارید، <span className="text-gradient-gold">اثر بگذارید</span>،<br />جاودانه شوید</>}
                </h1>

                <p className="text-xl md:text-2xl mb-12 max-w-3xl text-gray-400 font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {mounted && user
                        ? `مسیر معنای شما ادامه دارد. امروز چه میراثی را رشد خواهیم داد؟`
                        : 'ما به شما کمک می‌کنیم با کاشت نخل‌های واقعی در جنوب ایران، هم به محیط زیست کمک کنید، هم اشتغال‌زایی کنید و هم یک یادگاری ابدی بسازید.'}
                </p>

                <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <PremiumButton
                        onClick={onStartJourneyClick}
                        variant="shiny"
                        size="lg"
                        className="rounded-2xl group shadow-mana-primary/20"
                    >
                        <span className="flex items-center gap-3">
                            {mounted && user ? 'ادامه سفر قهرمانی' : 'همین حالا نخل خود را بکارید'}
                            <ArrowLeftIcon className="w-6 h-6 transform group-hover:-translate-x-2 transition-transform" />
                        </span>
                    </PremiumButton>
                    {!(mounted && user) && (
                        <PremiumButton
                            variant="glass"
                            size="lg"
                            className="rounded-2xl"
                        >
                            داستان نخلستان
                        </PremiumButton>
                    )}
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 opacity-50">
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
                    <div className="w-1 h-2 bg-mana-primary rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
    );
};

const HowItWorksSection: React.FC<{ onStartPlantingFlow: () => void }> = ({ onStartPlantingFlow }) => {

    const [ref, isVisible] = useScrollAnimate(0.2);

    return (

        <section ref={ref} className="bg-mana-bg py-24 relative">

            <div className="container mx-auto px-6 relative z-10">

                <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                    <h2 className="text-4xl md:text-5xl font-black mb-6">مسیر جاودانگی در <span className="text-gradient-gold">یک نگاه</span></h2>

                    <p className="text-xl text-gray-400 font-light">ساده، شفاف و تاثیرگذار در مقیاس جهانی.</p>

                </div>



                <div className={`max-w-3xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

                    <InfographicOverlay

                        imageSrc="https://res.cloudinary.com/dk2x11rvs/image/upload/v1768905595/Gemini_Generated_Image_psyf3epsyf3epsyf_uckzp1.png"

                        alt="Interest to Heritage Infographic"

                        hotspots={[

                            { id: 'h1', x: 50, y: 15, title: 'علاقه و آگاهی', description: 'شناخت مسیر و انتخاب نیت معنادار', align: 'center' },

                            { id: 'h2', x: 50, y: 40, title: 'کاشت و مراقبت', description: 'کاشت فیزیکی نهال و نگهداری مستمر', align: 'center' },

                            { id: 'h3', x: 50, y: 65, title: 'رشد و باروری', description: 'ثمردهی نخل و ایجاد اشتغال بومی', align: 'center' },

                            { id: 'h4', x: 50, y: 88, title: 'برداشت و میراث', description: 'دریافت ثمره و جاودانگی نام شما', align: 'center' },

                        ]}

                    />

                </div>



                <div className={`text-center mt-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <PremiumButton
                        onClick={onStartPlantingFlow}
                        variant="gold"
                        size="lg"
                        className="rounded-2xl px-16"
                    >
                        شروع میراث‌سازی
                    </PremiumButton>
                </div>

            </div>

        </section>

    );

};

const TestimonialsSection: React.FC = () => (
    <div className="bg-gray-800 py-20 text-center">
        <div className="container mx-auto px-6">
            <QuoteIcon className="w-12 h-12 text-amber-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-8">صدای خانواده نخلستان</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-green-500 transition-colors">
                    <p className="text-gray-300 italic mb-4">"کاشت نخل به یاد مادرم، بهترین تصمیمی بود که گرفتم. حالا هر بار که به آن فکر می‌کنم، حس می‌کنم ریشه‌هایش در قلب من هم رشد می‌کنند."</p>
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">م</div>
                        <div className="text-right">
                            <p className="font-bold text-white text-sm">مریم کاویانی</p>
                            <p className="text-xs text-gray-500">حامی سطح ۲</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-green-500 transition-colors">
                    <p className="text-gray-300 italic mb-4">"به عنوان مدیرعامل، دنبال راهی برای CSR واقعی بودم. نخلستان معنا هم شفاف بود و هم اثرگذار. تیم ما حالا احساس تعلق بیشتری دارد."</p>
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">ع</div>
                        <div className="text-right">
                            <p className="font-bold text-white text-sm">علی رضایی</p>
                            <p className="text-xs text-gray-500">مدیرعامل شرکت تکنو</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-green-500 transition-colors">
                    <p className="text-gray-300 italic mb-4">"دوره کوچینگ زندگی من رو تغییر داد. فکر می‌کردم فقط دارم نخل می‌کارم، ولی خودم رو پیدا کردم."</p>
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">س</div>
                        <div className="text-right">
                            <p className="font-bold text-white text-sm">سارا محمدی</p>
                            <p className="text-xs text-gray-500">دانشجوی آکادمی</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const PartnersSection: React.FC = () => (
    <div className="py-16 bg-gray-900 text-center border-t border-gray-800">
        <h2 className="text-xl font-bold text-gray-500 mb-8 uppercase tracking-widest">همراهان سازمانی ما</h2>
        <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="text-2xl font-bold text-white flex items-center gap-2"><BriefcaseIcon className="w-6 h-6" /> شرکت نخل طلایی</div>
            <div className="text-2xl font-bold text-white flex items-center gap-2"><HeartIcon className="w-6 h-6" /> بنیاد امید</div>
            <div className="text-2xl font-bold text-white flex items-center gap-2"><LeafIcon className="w-6 h-6" /> استارتاپ سبز</div>
            <div className="text-2xl font-bold text-white flex items-center gap-2"><BookOpenIcon className="w-6 h-6" /> آکادمی رشد</div>
        </div>
    </div>
);

const CrossroadsOfMeaning: React.FC<{ onNavigate: (v: View) => void, onStartPlantingFlow: () => void }> = ({ onNavigate, onStartPlantingFlow }) => (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black text-center">
        <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-white mb-2">مسیر خود را انتخاب کنید</h2>
            <p className="text-gray-400 mb-10">هر قدم در نخلستان، داستانی جدید می‌سازد.</p>
            <div className="flex flex-wrap justify-center gap-6">
                <button onClick={onStartPlantingFlow} className="group bg-gray-800 border border-gray-700 p-8 rounded-2xl text-white hover:bg-gray-700 hover:border-green-500 transition-all w-72 flex flex-col items-center shadow-lg hover:shadow-green-900/20">
                    <div className="bg-green-900/30 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform"><SproutIcon className="w-10 h-10 text-green-400" /></div>
                    <span className="text-xl font-bold">کاشت میراث</span>
                    <span className="text-sm text-gray-400 mt-2">ثبت یک نیت ماندگار</span>
                </button>
                <button onClick={() => onNavigate(View.HEROS_JOURNEY_INTRO)} className="group bg-gray-800 border border-gray-700 p-8 rounded-2xl text-white hover:bg-gray-700 hover:border-yellow-500 transition-all w-72 flex flex-col items-center shadow-lg hover:shadow-yellow-900/20">
                    <div className="bg-yellow-900/30 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform"><CompassIcon className="w-10 h-10 text-yellow-400" /></div>
                    <span className="text-xl font-bold">سفر قهرمانی</span>
                    <span className="text-sm text-gray-400 mt-2">کشف خود و رشد</span>
                </button>
                <button onClick={() => onNavigate(View.CommunityHub)} className="group bg-gray-800 border border-gray-700 p-8 rounded-2xl text-white hover:bg-gray-700 hover:border-blue-500 transition-all w-72 flex flex-col items-center shadow-lg hover:shadow-blue-900/20">
                    <div className="bg-blue-900/30 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform"><UsersIcon className="w-10 h-10 text-blue-400" /></div>
                    <span className="text-xl font-bold">کانون جامعه</span>
                    <span className="text-sm text-gray-400 mt-2">همدلی و مشارکت</span>
                </button>
            </div>
        </div>
    </section>
);

const FirstHeritagePrompt: React.FC<{ setPage: (page: View) => void }> = ({ setPage }) => {
    return (
        <div className="p-8 rounded-2xl shadow-lg border-2 border-dashed border-amber-300/50 dark:border-amber-700/50 bg-gradient-to-br from-white to-amber-50 dark:from-stone-800/50 dark:to-stone-900/10 text-center">
            <div className="w-40 h-56 border-2 border-stone-300 dark:border-stone-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <LeafIcon className="w-16 h-16 text-stone-300 dark:text-stone-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">جای اولین شناسنامه شما اینجاست</h3>
            <p className="text-stone-600 dark:text-stone-300 mt-2 mb-6">با کاشتن اولین میراث، سفر خود را معنادارتر کنید.</p>
            <button onClick={() => setPage(View.HallOfHeritage)} className="bg-amber-500 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-amber-600 transition-colors shadow">
                اولین میراثم را می‌کارم
            </button>
        </div>
    );
}

// --- Specialized Consulting Section (New) ---
const SpecializedConsultingSection: React.FC<{ onNavigate: (v: View) => void }> = ({ onNavigate }) => (
    <section className="py-20 bg-stone-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-4xl font-bold text-white mb-4">دستیار هوشمند و تخصصی</h2>
            <p className="text-gray-400 mb-12 max-w-2xl mx-auto">برای چالش‌های زندگی و کسب‌وکار خود، راهکارهای عمیق و شخصی‌سازی شده دریافت کنید.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Life Coach Card */}
                <div
                    onClick={() => onNavigate(View.SMART_CONSULTANT)}
                    className="group cursor-pointer bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-8 rounded-3xl border border-indigo-500/30 hover:border-indigo-400 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden shadow-xl"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="flex flex-col items-center relative z-10">
                        <div className="p-4 bg-indigo-500/20 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 border border-indigo-400/30">
                            <SunIcon className="w-12 h-12 text-indigo-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">مشاور هوشمند زندگی</h3>
                        <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
                            همراهی دلسوز برای یافتن آرامش، شفافیت ذهنی و تعادل در زندگی شخصی.
                        </p>
                        <span className="text-indigo-400 text-sm font-bold flex items-center gap-2 group-hover:text-white transition-colors bg-black/20 px-4 py-2 rounded-full">
                            شروع مشاوره <ArrowLeftIcon className="w-4 h-4" />
                        </span>
                    </div>
                </div>

                {/* Business Mentor Card */}
                <div
                    onClick={() => onNavigate(View.BUSINESS_MENTOR)}
                    className="group cursor-pointer bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl border border-slate-600 hover:border-blue-400 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden shadow-xl"
                >
                    <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -ml-10 -mt-10"></div>
                    <div className="flex flex-col items-center relative z-10">
                        <div className="p-4 bg-blue-500/20 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 border border-blue-400/30">
                            <BriefcaseIcon className="w-12 h-12 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">منتور متخصص بیزینس</h3>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            تحلیل استراتژیک، رشد کسب‌وکار و حل چالش‌های مدیریتی با رویکرد داده‌محور.
                        </p>
                        <span className="text-blue-400 text-sm font-bold flex items-center gap-2 group-hover:text-white transition-colors bg-black/20 px-4 py-2 rounded-full">
                            دریافت استراتژی <ArrowLeftIcon className="w-4 h-4" />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const HomeView: React.FC = () => {
    const { campaign, user, allUsers } = useAppState();
    const dispatch = useAppDispatch();
    const [appreciatedHeroIds, setAppreciatedHeroIds] = useState<string[]>([]);
    const [showWelcomeMat, setShowWelcomeMat] = useState(false);

    // Check for first time visit in this session (using sessionStorage instead of localStorage)
    useEffect(() => {
        const hasSeenWelcomeMat = sessionStorage.getItem('hasSeenWelcomeMat');
        if (!hasSeenWelcomeMat) {
            setShowWelcomeMat(true);
        }
    }, []);

    const onStartJourneyClick = () => dispatch({ type: 'SET_VIEW', payload: View.HEROS_JOURNEY_INTRO });
    const onStartPlantingFlow = () => dispatch({ type: 'START_PLANTING_FLOW' });
    const onNavigate = (v: View) => dispatch({ type: 'SET_VIEW', payload: v });
    const handleSetPage = (page: View) => dispatch({ type: 'SET_VIEW', payload: page });
    const handleAppreciateUser = (userId: string, userName: string) => {
        console.log(`Appreciating user ${userId}`);
        setAppreciatedHeroIds([...appreciatedHeroIds, userId]);
    }

    const handleWelcomeIntent = (intent: 'gift' | 'memory' | 'impact') => {
        setShowWelcomeMat(false);
        sessionStorage.setItem('hasSeenWelcomeMat', 'true');

        // Based on intent, we can customize the next view or show a specific modal
        if (intent === 'gift') {
            dispatch({ type: 'SET_VIEW', payload: View.GiftConcierge });
        } else if (intent === 'memory') {
            dispatch({ type: 'SET_VIEW', payload: View.HallOfHeritage });
        } else {
            dispatch({ type: 'SET_VIEW', payload: View.TransparencyDashboard });
        }
    };

    const handleCloseWelcome = () => {
        setShowWelcomeMat(false);
        sessionStorage.setItem('hasSeenWelcomeMat', 'true');
    };

    // Logic for heroes of the week
    const heroesOfWeek = useMemo(() => {
        const referenceTime = new Date(REFERENCE_DATE_STR).getTime();
        const oneWeekAgo = referenceTime - 7 * 24 * 60 * 60 * 1000;
        const pointValues: { [key: string]: number } = {
            palm_planted: 50,
            course_completed: 100,
            creative_act: 20,
            reflection: 10,
            decision: 10,
            success: 15,
            community_contribution: 30,
            admin_grant: 0,
        };

        return allUsers.map(user => {
            const weeklyPoints = user.timeline?.reduce((sum, event) => {
                if (new Date(event.date).getTime() > oneWeekAgo) {
                    const eventType = event.type as keyof typeof pointValues;
                    return sum + (pointValues[eventType] || 0);
                }
                return sum;
            }, 0) || 0;
            return { user, weeklyPoints };
        })
            .filter(item => item.weeklyPoints > 0)
            .sort((a, b) => b.weeklyPoints - a.weeklyPoints)
            .slice(0, 3);
    }, [allUsers]);

    const displayedHeroes = useMemo(() => {
        if (heroesOfWeek.length > 0) {
            return heroesOfWeek;
        }

        const exampleUserIds = ['admin_user_01', 'user_gen_1', 'user_gen_2'];
        const exampleUsers = exampleUserIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];

        while (exampleUsers.length < 3 && exampleUsers.length < allUsers.length) {
            const nextUser = allUsers.find(u => !exampleUsers.some(ex => ex.id === u.id));
            if (nextUser) {
                exampleUsers.push(nextUser);
            } else {
                break;
            }
        }

        if (exampleUsers.length === 0) return [];

        return [
            { user: exampleUsers[0], weeklyPoints: 720 },
            { user: exampleUsers[1 % exampleUsers.length], weeklyPoints: 550 },
            { user: exampleUsers[2 % exampleUsers.length], weeklyPoints: 480 },
        ].slice(0, exampleUsers.length).sort((a, b) => b.weeklyPoints - a.weeklyPoints);
    }, [heroesOfWeek, allUsers]);

    const lastPlantedPalm = useMemo(() => {
        if (!user) return null;
        return [...(user.timeline || [])]
            .filter(e => e.type === 'palm_planted')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;
    }, [user]);

    const guides = [
        { icon: HandshakeIcon, title: 'میراث خود را بکارید', description: 'لحظات مهم زندگی خود را با کاشتن یک نخل نمادین، جاودانه کنید.', cta: { text: 'مشاهده نخل‌ها', action: () => dispatch({ type: 'START_PLANTING_FLOW' }) }, color: 'text-green-400', bgColor: 'bg-green-400/10', borderColor: 'border-green-400/20' },
        { icon: CompassIcon, title: 'سفر قهرمانی', description: 'نقشه راه رشد شخصی و معنوی خود را با ابزارهای هوشمند دنبال کنید.', cta: { text: 'شروع سفر', action: () => onNavigate(View.HEROS_JOURNEY_INTRO) }, color: 'text-amber-400', bgColor: 'bg-amber-400/10', borderColor: 'border-amber-400/20' },
        { icon: UsersIcon, title: 'کانون جامعه', description: 'با دیگر همسفران آشنا شوید و در پروژه‌های جمعی مشارکت کنید.', cta: { text: 'پیوستن به جمع', action: () => onNavigate(View.CommunityHub) }, color: 'text-blue-400', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/20' },
    ];

    // Structured Data for SEO
    const organizationData = OrganizationSchema;
    const localBusinessData = LocalBusinessSchema;

    return (
        <div className="min-h-screen bg-mana-bg pb-20">
            <SEOHead
                title="نخلستان معنا | پلتفرم جامع رشد فردی و اثرگذاری اجتماعی"
                description="با کاشت نخل در نخلستان معنا، هم به طبیعت کمک کنید و هم مسیر رشد شخصی خود را با ابزارهای هوشمند و کوچینگ معنا دنبال نمایید."
                keywords={['کاشت درخت', 'نخل', 'خیریه', 'رشد فردی', 'کوچینگ', 'مسئولیت اجتماعی', 'هوش مصنوعی']}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQSchema) }}
            />

            {showWelcomeMat && (
                <WelcomeMat
                    onEnter={handleCloseWelcome}
                    onSelectIntent={handleWelcomeIntent}
                />
            )}

            <HeroSection onStartJourneyClick={onStartJourneyClick} user={user} />

            <div className="container mx-auto px-4 mt-20 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {guides.map((guide, index) => (
                        <ManaGuideCard key={index} {...guide} delay={index * 100} />
                    ))}
                </div>
            </div>

            <div className="mt-20 space-y-24">
                {/* 0. How It Works (Infographic) */}
                <HowItWorksSection onStartPlantingFlow={onStartPlantingFlow} />

                {/* 1. Spring of Meaning (Daily Engagement) */}
                <SpringOfMeaning
                    allUsers={allUsers}
                    allInsights={allUsers.flatMap(u => u.timeline || [])}
                    setPage={onNavigate}
                />

                {/* 2. Collective Impact (Social Proof) */}
                <CollectiveImpactSection />

                {/* 3. Campaigns (New) */}
                <CampaignList campaigns={INITIAL_CAMPAIGNS} />

                {/* 4. Crossroads (Navigation) */}
                <CrossroadsOfMeaning onNavigate={onNavigate} onStartPlantingFlow={onStartPlantingFlow} />

                {/* 5. Specialized Consulting */}
                <SpecializedConsultingSection onNavigate={onNavigate} />

                {/* 6. FAQ */}
                <FAQ user={user} />
            </div>

            {/* Floating Action Button for Mobile */}
            <div className="fixed bottom-24 left-6 md:hidden z-40">
                <button
                    onClick={onStartPlantingFlow}
                    className="bg-mana-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center animate-bounce"
                >
                    <SproutIcon className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
};

export default HomeView;