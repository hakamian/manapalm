
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View, User } from '../types';
import { SproutIcon, CompassIcon, UsersIcon, CheckCircleIcon, SparklesIcon, CpuChipIcon, ArrowLeftIcon, HandshakeIcon, LeafIcon, QuoteIcon, MegaphoneIcon, HeartIcon, BookOpenIcon, SunIcon, BriefcaseIcon } from './icons';
import CollectiveImpactSection from './CollectiveImpactSection';
import CampaignSection from './CampaignSection';
import FAQ from './FAQ';
import HeroCard from './home/HeroCard';
import SpringOfMeaning from './home/SpringOfMeaning';
import NextStepCard from './home/NextStepCard';
import LastHeritageCard from './home/LastHeritageCard';
import ManaGuideCard from './ManaGuideCard';
import WelcomeMat from './WelcomeMat';

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
        <div ref={sceneRef} className="relative min-h-[100dvh] w-full bg-gray-900 flex flex-col">
             <style>{`
                @keyframes twinkle { 0%, 100% { opacity: 0.4; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1); } }
                .star { position: absolute; background-color: white; border-radius: 50%; animation: twinkle 4s infinite ease-in-out; }
                @keyframes sway { 0%, 100% { transform: rotate(-1deg); } 50% { transform: rotate(1.5deg); } }
                .palm-sway { transform-origin: bottom center; animation: sway 12s infinite ease-in-out; }
                @keyframes scroll-indicator { 0%, 100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(10px); opacity: 0.5; } }
                .scroll-indicator { animation: scroll-indicator 2s infinite ease-in-out; }
            `}</style>
            
            {/* Background Layers Container - Absolute & Overflow Hidden */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#1e293b]"></div>
                <div className="absolute inset-0" style={getLayerStyle(8)}>
                    {[...Array(150)].map((_, i) => {
                        const size = Math.random() * 2 + 0.5;
                        const style: any = { width: `${size}px`, height: `${size}px`, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${Math.random() * 3 + 3}s` };
                        return <div key={i} className="star" style={style}></div>;
                    })}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1/2" style={getLayerStyle(20)}><div className="absolute bottom-0 -left-1/4 w-[150%] h-[60%] bg-[#1c2741] rounded-t-[100%]"></div></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2" style={getLayerStyle(30)}><div className="absolute bottom-0 -right-1/4 w-[150%] h-[50%] bg-[#151d30] rounded-t-[100%]"></div></div>
                <div className="absolute bottom-0 left-0 w-full h-full filter brightness-75" style={getLayerStyle(50)}>
                    <img src="https://purepng.com/public/uploads/large/purepng.com-palm-treepalm-treealms-tree-941524671653r6kcs.png" alt="Palm tree silhouette" className="absolute bottom-0 right-[-15%] w-[55%] max-w-lg palm-sway" style={{ animationDelay: '0s' }} />
                    <img src="https://purepng.com/public/uploads/large/purepng.com-palm-treepalm-treealms-tree-941524671653r6kcs.png" alt="Palm tree silhouette" className="absolute bottom-0 left-[-15%] w-[70%] max-w-xl palm-sway" style={{ animationDelay: '1.5s', transform: 'scaleX(-1)', filter: 'brightness(0.8)' }} />
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent z-20"></div>
            </div>

            {/* Content Container - Relative & Scrollable if needed */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-grow text-white text-center px-4 py-24" style={getLayerStyle(-15)}>
                
                <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
                    {user 
                        ? `سلام ${user.name}، به نخلستان خودت خوش آمدی` 
                        : 'نخل بکارید، اثر بگذارید، جاودانه شوید'}
                </h1>
                
                <p className="text-lg md:text-2xl mb-10 max-w-3xl text-gray-200 font-light leading-relaxed" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                    {user 
                        ? `مسیر معنای شما ادامه دارد. امروز چه میراثی را رشد خواهیم داد؟` 
                        : 'ما به شما کمک می‌کنیم با کاشت نخل‌های واقعی در جنوب ایران، هم به محیط زیست کمک کنید، هم اشتغال‌زایی کنید و هم یک یادگاری ابدی بسازید.'}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                     <button onClick={onStartJourneyClick} className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-10 rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(74,222,128,0.6)] border-2 border-green-400">
                        {user ? 'ادامه سفر قهرمانی' : 'همین حالا نخل خود را بکارید'}
                    </button>
                    {!user && (
                        <button className="bg-transparent hover:bg-white/10 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all border-2 border-white/30 backdrop-blur-sm">
                            بیشتر بدانید
                        </button>
                    )}
                </div>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 scroll-indicator"><svg className="w-6 h-6 text-white opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
        </div>
    );
};

const HowItWorksSection: React.FC<{ onStartPlantingFlow: () => void }> = ({ onStartPlantingFlow }) => {
    const [ref, isVisible] = useScrollAnimate();
    const steps = [
        { icon: <SproutIcon className="w-10 h-10" />, title: "۱. نیت خود را انتخاب کنید", description: "میراث شما برای چیست؟ یادبود، تولد، یا یک تصمیم جدید؟" },
        { icon: <SparklesIcon className="w-10 h-10" />, title: "۲. سند را شخصی‌سازی کنید", description: "یک پیام ماندگار بنویسید. هوش مصنوعی ما آن را شاعرانه می‌کند." },
        { icon: <CheckCircleIcon className="w-10 h-10" />, title: "۳. نخل شما کاشته می‌شود", description: "کشاورزان ما نخل را می‌کارند و شما سند دیجیتال و گزارش رشد آن را دریافت می‌کنید." },
    ];
    return (
        <section ref={ref} className="bg-gray-800 py-20">
            <div className="container mx-auto px-6">
                <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                    <h2 className="text-4xl font-bold mb-2">مسیر جاودانگی در ۳ قدم</h2>
                    <p className="text-lg text-gray-400">ساده، شفاف و تاثیرگذار.</p>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between text-center max-w-5xl mx-auto gap-8 md:gap-0">
                    {steps.map((step, index) => (
                        <React.Fragment key={index}>
                            <div className={`flex flex-col items-center md:flex-1 opacity-0 ${isVisible ? 'scroll-animate scroll-sprout' : ''}`} style={{animationDelay: `${index * 200}ms`}}>
                                <div className="text-green-400 mx-auto mb-4 bg-gray-700 p-4 rounded-full shadow-lg">{step.icon}</div>
                                <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                            </div>
                            {index < steps.length - 1 && (
                                <>
                                    <div className={`w-px h-12 border-l-2 border-dashed border-gray-600 md:hidden opacity-0 ${isVisible ? 'scroll-animate scroll-slide-up' : ''}`} style={{animationDelay: `${index * 200 + 300}ms`}}></div>
                                    <div className={`hidden md:block flex-grow border-t-2 border-dashed border-gray-600 mx-4 opacity-0 ${isVisible ? 'scroll-animate scroll-draw-line' : ''}`} style={{animationDelay: `${index * 200 + 100}ms`}}></div>
                                </>
                            )}
                        </React.Fragment>
                    ))}
                </div>
                <div className={`text-center mt-16 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                    <button onClick={onStartPlantingFlow} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-110 shadow-[0_5px_15px_rgba(74,222,128,0.4)] hover:shadow-[0_8px_25px_rgba(74,222,128,0.6)]">
                        شروع میراث‌سازی
                    </button>
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
                    <p className="text-gray-300 italic mb-4">"کاشت نخل به یاد مادرم، بهترین تصمیمی بود که گرفتم. حالا هر بار که به آن فکر می‌کنم، حس می‌کنم عشق او هنوز زنده است و رشد می‌کند."</p>
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
            <div className="text-2xl font-bold text-white flex items-center gap-2"><BriefcaseIcon className="w-6 h-6"/> شرکت نخل طلایی</div>
            <div className="text-2xl font-bold text-white flex items-center gap-2"><HeartIcon className="w-6 h-6"/> بنیاد امید</div>
            <div className="text-2xl font-bold text-white flex items-center gap-2"><LeafIcon className="w-6 h-6"/> استارتاپ سبز</div>
            <div className="text-2xl font-bold text-white flex items-center gap-2"><BookOpenIcon className="w-6 h-6"/> آکادمی رشد</div>
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
                    <div className="bg-green-900/30 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform"><SproutIcon className="w-10 h-10 text-green-400"/></div>
                    <span className="text-xl font-bold">کاشت میراث</span>
                    <span className="text-sm text-gray-400 mt-2">ثبت یک نیت ماندگار</span>
                 </button>
                 <button onClick={() => onNavigate(View.HEROS_JOURNEY_INTRO)} className="group bg-gray-800 border border-gray-700 p-8 rounded-2xl text-white hover:bg-gray-700 hover:border-yellow-500 transition-all w-72 flex flex-col items-center shadow-lg hover:shadow-yellow-900/20">
                    <div className="bg-yellow-900/30 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform"><CompassIcon className="w-10 h-10 text-yellow-400"/></div>
                    <span className="text-xl font-bold">سفر قهرمانی</span>
                    <span className="text-sm text-gray-400 mt-2">کشف خود و رشد</span>
                 </button>
                 <button onClick={() => onNavigate(View.CommunityHub)} className="group bg-gray-800 border border-gray-700 p-8 rounded-2xl text-white hover:bg-gray-700 hover:border-blue-500 transition-all w-72 flex flex-col items-center shadow-lg hover:shadow-blue-900/20">
                    <div className="bg-blue-900/30 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform"><UsersIcon className="w-10 h-10 text-blue-400"/></div>
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
        const oneWeekAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
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
        { icon: HandshakeIcon, title: 'میراث خود را بکارید', description: 'لحظات مهم زندگی خود را با کاشتن یک نخل نمادین، جاودانه کنید.', cta: { text: 'مشاهده میراث‌ها', page: View.HallOfHeritage }, color: 'amber' },
        { icon: BookOpenIcon, title: 'در آکادمی معنا بیاموزید', description: 'با شرکت در دوره‌های آموزشی، دانش خود را برای خلق تأثیری عمیق‌تر افزایش دهید.', cta: { text: 'مشاهده دوره‌ها', page: View.Courses }, color: 'sky' },
        { icon: UsersIcon, title: 'به باغ عمومی بپیوندید', description: 'با آخرین فعالیت‌های اعضای خانواده نخلستان معنا همراه شوید و در گفتگوها مشارکت نمایید.', cta: { text: 'ورود به باغ عمومی', page: View.OurGrove }, color: 'teal' }
    ];

    return (
        <main>
            {showWelcomeMat && (
                <WelcomeMat onEnter={handleCloseWelcome} onSelectIntent={handleWelcomeIntent} />
            )}
            <HeroSection onStartJourneyClick={onStartJourneyClick} user={user} />
            <CollectiveImpactSection />
            <HowItWorksSection onStartPlantingFlow={onStartPlantingFlow} />
            <CampaignSection campaign={campaign} onCTAClick={onStartPlantingFlow} />
            
            <SpringOfMeaning allUsers={allUsers} allInsights={user ? user.timeline || [] : []} setPage={handleSetPage} />
            
            <CrossroadsOfMeaning onNavigate={onNavigate} onStartPlantingFlow={onStartPlantingFlow} />
            
            <SpecializedConsultingSection onNavigate={onNavigate} />
            
            {/* Quick Access Section */}
            <section className="container mx-auto px-4 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 hover:border-amber-500 transition-all cursor-pointer" onClick={() => handleSetPage(View.CommunityHub)}>
                        <div className="bg-amber-100 dark:bg-amber-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <UsersIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">کانون جامعه</h3>
                        <p className="text-stone-600 dark:text-stone-400 mt-2 text-sm">به گفتگوها بپیوندید و از آخرین اخبار مطلع شوید.</p>
                    </div>
                     <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 hover:border-green-500 transition-all cursor-pointer" onClick={() => handleSetPage(View.PathOfMeaning)}>
                        <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <CompassIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">مسیر معنا</h3>
                        <p className="text-stone-600 dark:text-stone-400 mt-2 text-sm">سفر قهرمانی خود را ادامه دهید و ماموریت‌های جدید را کشف کنید.</p>
                    </div>
                     <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 hover:border-blue-500 transition-all cursor-pointer" onClick={() => {
                        if (user) {
                            handleSetPage(View['ai-tools']);
                        } else {
                            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
                        }
                     }}>
                        <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">آزمایشگاه معنا</h3>
                        <p className="text-stone-600 dark:text-stone-400 mt-2 text-sm">با ابزارهای هوشمند، خلاقیت خود را شکوفا کنید.</p>
                    </div>
                </div>
            </section>

            {/* --- Personalized Path Section --- */}
            <section className="container mx-auto px-4 animate-on-scroll">
                 <div className="max-w-4xl mx-auto">
                    {!user ? (
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {guides.map(guide => <ManaGuideCard key={guide.title} {...guide} setPage={handleSetPage} />)}
                        </div>
                    ) : !user.profileCompletion.extra ? (
                        <NextStepCard user={user} setPage={handleSetPage} />
                    ) : lastPlantedPalm ? (
                        <LastHeritageCard heritageItem={lastPlantedPalm} />
                    ) : (
                        <FirstHeritagePrompt setPage={handleSetPage} />
                    )}
                 </div>
            </section>

            {/* --- Heroes of the Week --- */}
            {displayedHeroes.length > 0 && (
                <section className="bg-stone-900/90 dark:bg-black/80 backdrop-blur-sm py-16 text-white animate-on-scroll">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold">قهرمانان هفته نخلستان</h2>
                            <p className="mt-2 text-stone-300">تقدیر از اعضایی که بیشترین تاثیر را در این هفته داشته‌اند.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto items-end">
                            {[0, 1, 2].map((index) => {
                                const rankOrder = [2, 1, 3];
                                const rank = rankOrder[index];
                                const heroToShow = displayedHeroes[rank - 1];
                                
                                if (!heroToShow) return <div key={index}></div>;
                                
                                return (
                                    <HeroCard 
                                        key={heroToShow.user.id} 
                                        hero={heroToShow} 
                                        rank={rank}
                                        currentUser={user}
                                        onAppreciate={handleAppreciateUser}
                                        onMessage={handleSetPage}
                                        onLogin={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })}
                                        appreciated={appreciatedHeroIds.includes(heroToShow.user.id)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            <TestimonialsSection />
            
            <FAQ user={user} />
            <PartnersSection />
        </main>
    );
};

export default HomeView;
