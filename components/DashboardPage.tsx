
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
// FIX: Refactored to use useAppState and useAppDispatch from ../AppContext
import { User, TimelineEvent, CommunityProject, Page, HeritageItem, View, MIN_POINTS_FOR_MESSAGING } from '../types.ts';
// FIX: Added CompassIcon, StarIcon, SitemapIcon.
import { LeafIcon, ArrowLeftIcon, QuoteIcon, HandshakeIcon, BookOpenIcon, UsersIcon, SparklesIcon, CheckIcon, UserPlusIcon, AwardIcon, HeartIcon, PaperAirplaneIcon, MegaphoneIcon, PlusIcon, BanknotesIcon, BrainCircuitIcon, CompassIcon, StarIcon, SitemapIcon } from './icons.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import ManaGuideCard from './ManaGuideCard.tsx';
import FAQ from './FAQ.tsx';
// FIX: Refactored to use useAppState and useAppDispatch from ../AppContext
import { useAppState, useAppDispatch } from '../AppContext.tsx';
import { useAnimatedCounter, useScrollAnimation } from '../utils/hooks.ts';
import { heritageItems } from '../utils/heritage.ts';
import { iconMap } from './icons.tsx';
import Certificate from './Certificate.tsx';
import InstallmentModal from './InstallmentModal.tsx';
// FIX: Import getUserLevel.
import { getLevelForPoints } from '../services/gamificationService.ts';
// FIX: Import PATH_MILESTONES.
import { PATH_MILESTONES } from '../utils/path.ts';
// FIX: Import ArchitectJourney.
import ArchitectJourney from './ArchitectJourney.tsx';
// FIX: Import AIInsightCard.
import AIInsightCard from './AIInsightCard.tsx';
// FIX: Import ALL_ACHIEVEMENTS.
import { ALL_ACHIEVEMENTS } from '../utils/achievements.ts';
import { getAIAssistedText } from '../services/geminiService.ts';


// ... (HeroCard and SpringOfMeaning components remain the same) ...
const HeroCard: React.FC<{
    hero: { user: User; weeklyPoints: number };
    rank: number;
    currentUser: User | null;
    onAppreciate: (userId: string, userName: string) => void;
    onMessage: (page: Page) => void;
    onLogin: () => void;
    appreciated: boolean;
}> = ({ hero, rank, currentUser, onAppreciate, onMessage, onLogin, appreciated }) => {
    const { user, weeklyPoints } = hero;
    const rankStyles = [
        { ring: 'ring-amber-400', glow: 'shadow-[0_0_20px_theme(colors.amber.400)]', medal: 'text-amber-400' }, // Gold
        { ring: 'ring-slate-300', glow: 'shadow-[0_0_20px_theme(colors.slate.300)]', medal: 'text-slate-300' }, // Silver
        { ring: 'ring-amber-600', glow: 'shadow-[0_0_20px_theme(colors.amber.600)]', medal: 'text-amber-600' }, // Bronze
    ];
    const style = rankStyles[rank - 1];

    const isOwnCard = currentUser?.id === user.id;
    const canSendMessage = currentUser && !isOwnCard && currentUser.points >= MIN_POINTS_FOR_MESSAGING && user.allowDirectMessages;
    let messageTooltip = '';
    if (!currentUser) {
        messageTooltip = 'برای ارسال پیام وارد شوید.';
    } else if (isOwnCard) {
        // No tooltip needed, button disabled
    } else {
        if (!user.allowDirectMessages) messageTooltip = 'این کاربر اجازه دریافت پیام را نداده است.';
        else if (currentUser.points < MIN_POINTS_FOR_MESSAGING) messageTooltip = `برای ارسال پیام به ${MIN_POINTS_FOR_MESSAGING} امتیاز نیاز دارید.`;
    }

    const handleInteraction = (action: () => void) => {
        if (!currentUser) {
            onLogin();
        } else {
            action();
        }
    };

    return (
        <div className={`group relative bg-stone-800/30 dark:bg-stone-900/50 p-6 rounded-2xl text-center flex flex-col items-center transition-all duration-300 border border-stone-700/50 hover:border-amber-500/30 ${rank === 1 ? 'md:-translate-y-6' : ''}`}>
            <div className={`absolute -top-4 right-4 flex items-center gap-1 font-bold ${style.medal}`}>
                <AwardIcon className="w-6 h-6" />
                <span>{['اول', 'دوم', 'سوم'][rank-1]}</span>
            </div>
            <img src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className={`w-24 h-24 rounded-full object-cover ring-4 ${style.ring} ${style.glow}`} />
            <h4 className="font-bold text-lg mt-4 text-white">{user.name}</h4>
            <p className="text-sm font-semibold text-amber-300">{weeklyPoints.toLocaleString('fa-IR')} امتیاز در این هفته</p>
            <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => handleInteraction(() => onAppreciate(user.id, user.name))}
                    disabled={isOwnCard || appreciated}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold bg-white text-stone-800 hover:bg-red-100 dark:hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <HeartIcon className={`w-5 h-5 transition-colors ${appreciated ? 'text-red-500 fill-red-500' : 'text-stone-600'}`} />
                    {appreciated ? 'تقدیر شد' : 'تقدیر'}
                </button>
                <button
                    onClick={() => handleInteraction(() => onMessage(View.DIRECT_MESSAGES))}
                    disabled={currentUser ? !canSendMessage : false}
                    title={messageTooltip}
                    className="group/button flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold bg-white text-stone-800 hover:bg-sky-100 dark:hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <PaperAirplaneIcon className="w-5 h-5 text-stone-600 transition-transform group-hover/button:rotate-12" />
                    پیام
                </button>
            </div>
        </div>
    );
};

const SpringOfMeaning: React.FC<{ allUsers: User[], allInsights: TimelineEvent[], setPage: (page: Page) => void, activeHeritageId?: string | null }> = ({ allUsers, allInsights, setPage, activeHeritageId }) => {
    // FIX: Refactored to use useAppState and useAppDispatch from ../AppContext
    const { user: currentUser } = useAppState();
    const [installmentModalItem, setInstallmentModalItem] = useState<HeritageItem | null>(null);
    const heritageTypes = useMemo(() => heritageItems.filter(item => !item.isCommunity && item.id !== 'beginning_palm'), []);
    
    const [activeHeritage, setActiveHeritage] = useState<HeritageItem>(() => {
        const initialItem = activeHeritageId ? heritageTypes.find(h => h.id === activeHeritageId) : null;
        return initialItem || heritageTypes[0];
    });

    const [aiInsight, setAiInsight] = useState('');
    
    useEffect(() => {
        const newItem = activeHeritageId ? heritageTypes.find(h => h.id === activeHeritageId) : heritageTypes[0];
        if (newItem && newItem.id !== activeHeritage.id) {
            setActiveHeritage(newItem);
        }
    }, [activeHeritageId, heritageTypes, activeHeritage.id]);

    const heritageStats = useMemo(() => {
        const stats: { [key: string]: number } = {};
        heritageTypes.forEach(h => stats[h.id] = 0);
        allUsers.forEach(user => {
            user.timeline?.forEach(event => {
                if (event.type === 'palm_planted' && stats[event.details.id] !== undefined) {
                    stats[event.details.id]++;
                }
            });
        });
        return stats;
    }, [allUsers, heritageTypes]);
    
    const plantedHeritageIds = useMemo(() => {
        if (!currentUser) return new Set();
        return new Set(currentUser.timeline?.filter(e => e.type === 'palm_planted').map(e => e.details.id));
    }, [currentUser]);

    useEffect(() => {
        const fetchInsightForHeritage = async () => {
            setAiInsight('');
            const relevantInsights = allInsights.filter(insight =>
                insight.type === 'palm_planted' &&
                insight.details.id === activeHeritage.id &&
                insight.isSharedAnonymously &&
                insight.status === 'approved' &&
                insight.userReflection?.notes
            );

            if (relevantInsights.length > 0) {
                const randomInsight = relevantInsights[Math.floor(Math.random() * relevantInsights.length)];
                setAiInsight(randomInsight.userReflection!.notes);
            } else {
                setAiInsight(`هر «${activeHeritage.title}» داستانی منحصر به فرد دارد.`);
            }
        };

        fetchInsightForHeritage();
    }, [activeHeritage, allInsights]);

    const animatedCount = useAnimatedCounter(heritageStats[activeHeritage.id] || 0, 1000);

    return (
        <section className="container mx-auto px-4 animate-on-scroll" id="spring-of-meaning-section">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="lg:col-span-1">
                    <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100">سرچشمه معنا</h2>
                    <p className="mt-3 text-stone-600 dark:text-stone-300 leading-relaxed">اینجا دلایل و نیت‌های زیبای اعضای جامعه ما را می‌بینید. هر کدام از این میراث‌ها, داستانی از یک تصمیم, یک موفقیت, یا یک قدردانی است. شما هم می‌توانید داستان خود را بکارید.</p>
                    <div className="mt-8 p-6 bg-white dark:bg-stone-800/50 rounded-2xl shadow-xl border border-stone-200/50 dark:border-stone-700/50">
                        <div className="transition-all duration-500">
                             <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-300">{activeHeritage.title}</h3>
                             <p className="text-stone-600 dark:text-stone-400 mt-2">{activeHeritage.description}</p>
                             <div className="mt-4 pt-4 border-t border-dashed dark:border-stone-700">
                                <p ref={animatedCount.ref} className="text-3xl font-bold">{animatedCount.count.toLocaleString('fa-IR')}</p>
                                <p className="text-sm text-stone-500">میراث {activeHeritage.title} کاشته شده</p>
                            </div>
                            {aiInsight && (
                                <div className="mt-4">
                                    <p className="italic text-stone-700 dark:text-stone-300">"{aiInsight}"</p>
                                    <p className="text-xs text-stone-400 mt-1">- بازتابی ناشناس از چاه معنا</p>
                                </div>
                            )}
                             <button onClick={() => setPage(View.HallOfHeritage)} className="mt-6 bg-amber-500 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-amber-600 transition-colors">
                                ثبت {activeHeritage.title} شما
                            </button>
                        </div>
                    </div>
                </div>
                 <div className="lg:col-span-1 grid grid-cols-3 gap-4">
                    {heritageTypes.map((h, index) => {
                        const Icon = iconMap[h.icon as keyof typeof iconMap] || iconMap.default;
                        const isActive = activeHeritage.id === h.id;
                        const isMeaningPalm = h.id === 'meaning_palm';
                        const hasPlanted = plantedHeritageIds.has(h.id);
                        return (
                            <button
                                key={h.id}
                                onClick={() => setActiveHeritage(h)}
                                style={{ transitionDelay: `${index * 100}ms` }}
                                className={`animate-on-scroll group relative aspect-square rounded-2xl transition-all duration-300 overflow-hidden ${isActive ? `bg-${h.color}-100 dark:bg-${h.color}-900/30 scale-105 shadow-lg` : 'bg-stone-100 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800'} ${isMeaningPalm ? `ring-2 ring-offset-2 ring-offset-stone-100 dark:ring-offset-black ring-amber-400 shadow-lg shadow-amber-400/30` : ''}`}
                            >
                                {/* Default view */}
                                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center transition-all duration-300 group-hover:opacity-0 group-hover:scale-90">
                                    <Icon className={`w-1/2 h-1/2 transition-colors duration-300 ${isActive ? `text-${h.color}-500 dark:text-${h.color}-400` : 'text-stone-500 dark:text-stone-400'}`} />
                                    <p className={`mt-2 text-xs font-semibold transition-colors duration-300 ${isActive ? 'text-stone-800 dark:text-stone-100' : 'text-stone-600 dark:text-stone-300'}`}>{h.title}</p>
                                </div>
                                {/* Hover view */}
                                {hasPlanted ? (
                                    <div className="absolute inset-0 p-4 bg-white/95 dark:bg-stone-800/95 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                                        <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">این میراث را قبلاً کاشته‌اید.</p>
                                        <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 mb-3">آیا می‌خواهید دوباره آن را ثبت کنید؟</p>
                                        <div className="flex flex-col gap-2 w-full max-w-[120px]">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setPage(View.HallOfHeritage); }}
                                                className="w-full flex items-center justify-center gap-1.5 bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-amber-600 transition-colors shadow-md"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                                کاشت دوباره
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setInstallmentModalItem(h); }}
                                                className="w-full text-center text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors py-1"
                                            >
                                                پرداخت قسطی
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 p-4 bg-white/95 dark:bg-stone-800/95 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                                        <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">{h.description}</p>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setPage(View.HallOfHeritage); }}
                                            className="mt-4 flex items-center gap-1.5 bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-amber-600 transition-colors shadow-lg transform hover:scale-105"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            ثبت این میراث
                                        </button>
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
             </div>
        </section>
    );
};


const NextStepCard: React.FC<{ user: User, setPage: (page: Page) => void }> = ({ user, setPage }) => {
    // This card is now only for profile completion steps.
    let mission: { icon: React.FC<any>, title: string, description: string, buttonText: string, page: Page, color: string };

    if (!user.profileCompletion.additional) {
        // FIX: Use View enum for page navigation
        mission = { icon: UserPlusIcon, title: "قدم اول: تکمیل پروفایل", description: "نام خانوادگی و ایمیل خود را وارد کنید تا هویت خود را کامل کرده و ۱۰۰ امتیاز هدیه بگیرید.", buttonText: "تکمیل پروفایل", page: View.UserProfile, color: 'amber' };
    } else { // Implies !user.profileCompletion.extra
        // FIX: Use View enum for page navigation
        mission = { icon: AwardIcon, title: "یک قدم تا جایزه!", description: "اطلاعات تکمیلی را وارد کنید تا پروفایل خود را حرفه‌ای‌تر کرده و ۱۵۰ امتیاز جایزه بگیرید.", buttonText: "تکمیل اطلاعات", page: View.UserProfile, color: 'amber' };
    }
    
    const { icon: Icon, title, description, buttonText, page, color } = mission;

    return (
        <div className={`p-8 rounded-2xl shadow-lg border-2 border-${color}-300/50 dark:border-${color}-700/50 bg-gradient-to-br from-white to-${color}-50 dark:from-stone-800/50 dark:to-stone-900/10`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/30`}>
                    <Icon className={`w-10 h-10 text-${color}-500 dark:text-${color}-400`} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">{title}</h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400">قدم بعدی شما در این سفر</p>
                </div>
            </div>
            <p className="text-stone-600 dark:text-stone-300 mt-4 mb-6">{description}</p>
            <button onClick={() => setPage(page)} className={`bg-${color}-500 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-${color}-600 transition-colors shadow`}>
                {buttonText}
            </button>
        </div>
    );
};

const LastHeritageCard: React.FC<{ heritageItem: TimelineEvent }> = ({ heritageItem }) => {
    // FIX: Refactored to use useAppState and useAppDispatch from ../AppContext
    const dispatch = useAppDispatch();
    const setViewingHeritageItem = (item: TimelineEvent) => dispatch({ type: 'SET_VIEWING_HERITAGE_ITEM', payload: item } as any); // Type assertion as action is not in reducer yet
    const setReflectionModalState = (state: { isOpen: boolean, heritageItem: TimelineEvent }) => dispatch({ type: 'SET_REFLECTION_MODAL_STATE', payload: state } as any); // Type assertion
    const handleSetPage = (page: Page) => dispatch({ type: 'SET_VIEW', payload: page as View });

    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cardElement = cardRef.current;
        if (!cardElement) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    cardElement.classList.add('animate-rotate-3d');
                } else {
                    cardElement.classList.remove('animate-rotate-3d');
                }
            },
            { threshold: 0.2 }
        );

        observer.observe(cardElement);

        return () => {
            if (cardElement) {
                observer.unobserve(cardElement);
            }
        };
    }, []);

    const handleViewClick = () => {
        setViewingHeritageItem(heritageItem);
        handleSetPage(View['living-heritage']);
    };
    
    const handleAddMemoryClick = () => {
        setReflectionModalState({ isOpen: true, heritageItem: heritageItem });
    };

    return (
        <div className="group" style={{ perspective: '1000px' }}>
            <div ref={cardRef} className="relative group-hover:[animation-play-state:paused] transition-transform duration-300 group-hover:scale-105" style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-amber-400 rounded-lg blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <Certificate
                    userName={heritageItem.details.recipient || heritageItem.details.plantedBy}
                    palmName={heritageItem.details.title}
                    date={new Date(heritageItem.date).toLocaleDateString('fa-IR')}
                    certificateId={heritageItem.details.certificateId}
                />
                 <div className="absolute inset-0 bg-black/70 rounded-lg flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={handleViewClick} className="bg-white text-stone-800 font-bold px-6 py-2.5 rounded-lg hover:bg-amber-100">مشاهده شناسنامه زنده</button>
                    <button onClick={handleAddMemoryClick} className="bg-white/20 text-white backdrop-blur-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/30">افزودن خاطره</button>
                </div>
            </div>
             <div className="text-center mt-4">
                <h3 className="text-xl font-bold">آخرین میراث شما</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">روی کارت نگه دارید تا گزینه‌ها را ببینید.</p>
            </div>
        </div>
    );
};

const FirstHeritagePrompt: React.FC<{ setPage: (page: Page) => void }> = ({ setPage }) => {
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

interface HomePageProps {
    allUsers: User[];
    allInsights: TimelineEvent[];
    communityProjects: CommunityProject[];
}

const meaningTags = [
    { id: 'decision', title: 'یک تصمیم جدید', icon: BrainCircuitIcon, cta: 'ثبت تصمیم من' },
    { id: 'success', title: 'یک موفقیت', icon: AwardIcon, cta: 'جشن گرفتن موفقیت' },
    { id: 'gratitude', title: 'قدردانی از یک عزیز', icon: HeartIcon, cta: 'ثبت سپاسگزاری' },
    { id: 'memory', title: 'گرامی‌داشت یک خاطره', icon: QuoteIcon, cta: 'یادبود خاطره' },
];

// FIX: Define GardenItem component.
const GardenItem: React.FC<{ event: TimelineEvent, position: number, onClick: () => void }> = ({ event, position, onClick }) => {
    const Icon = iconMap[event.type as keyof typeof iconMap] || iconMap.default;
    const isUp = useMemo(() => Math.random() > 0.5, []);
    return (
        <button
            onClick={onClick}
            className="absolute -translate-x-1/2 group"
            style={{ left: `${position}%`, top: isUp ? 'auto' : '50%', bottom: isUp ? '50%' : 'auto', transform: `translateX(-50%) translateY(${isUp ? '20px' : '-20px'})` }}
        >
            <div className="relative flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center border-2 border-white dark:border-stone-800 shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-stone-600 dark:text-stone-300" />
                </div>
                <div className="absolute top-full mt-2 w-max max-w-xs bg-stone-900 text-white text-xs rounded-lg py-1 px-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <p className="font-bold">{event.title}</p>
                    <p className="text-stone-300">{event.description}</p>
                </div>
            </div>
        </button>
    );
};

// FIX: Define TabButton component.
const TabButton: React.FC<{ icon: React.FC<any>, label: string, isActive: boolean, onClick: () => void }> = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 text-center py-3 font-semibold flex items-center justify-center gap-2 transition-colors ${isActive ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700/50'}`}
    >
        <Icon className="w-5 h-5" />
        {label}
    </button>
);


const DashboardPage: React.FC = () => {
    // FIX: Refactored to use useAppState and useAppDispatch from ../AppContext
    const { user: currentUser } = useAppState();
    const dispatch = useAppDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [activeDashboardTab, setActiveDashboardTab] = useState('garden');

    const handleSetPage = (page: Page) => dispatch({ type: 'SET_VIEW', payload: page as View });
    const handleNavigateToProfileTab = (tab: string) => dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: tab });
    const handleStartPlantingFlow = () => dispatch({ type: 'START_PLANTING_FLOW' });

    // Generate a simple view based on the user state
    return (
        <div className="space-y-20 md:space-y-32 pb-16">
            {/* --- Hero Section --- */}
            <section className="relative text-center pt-16 pb-20 rounded-3xl overflow-hidden min-h-[50vh] flex flex-col justify-center items-center bg-stone-800 text-white">
                 <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-stone-900 to-black opacity-50 z-0"></div>
                <div className="relative z-10 container mx-auto px-4">
                     <h1 className="text-4xl md:text-6xl font-extrabold text-amber-200 mb-6 leading-tight">
                        سلام، {currentUser?.name || 'همسفر'}
                    </h1>
                    <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto">
                        به باغ شخصی خود خوش آمدید. اینجا جایی است که میراث شما رشد می‌کند.
                    </p>
                    
                     <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <button onClick={() => handleStartPlantingFlow()} className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg flex items-center gap-2">
                            <PlusIcon className="w-5 h-5" />
                            <span>کاشت میراث جدید</span>
                        </button>
                        <button onClick={() => handleSetPage(View.UserProfile)} className="bg-stone-700 hover:bg-stone-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg flex items-center gap-2">
                            <UsersIcon className="w-5 h-5" />
                            <span>پروفایل من</span>
                        </button>
                    </div>
                </div>
            </section>

             {/* --- Quick Access --- */}
            <section className="container mx-auto px-4 -mt-16 relative z-20">
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
                     <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 hover:border-blue-500 transition-all cursor-pointer" onClick={() => handleSetPage(View['ai-tools'])}>
                        <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">آزمایشگاه معنا</h3>
                        <p className="text-stone-600 dark:text-stone-400 mt-2 text-sm">با ابزارهای هوشمند، خلاقیت خود را شکوفا کنید.</p>
                    </div>
                </div>
            </section>

            {/* --- Recent Activity --- */}
            {currentUser && currentUser.timeline && currentUser.timeline.length > 0 && (
                <section className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6 text-center">آخرین فعالیت‌های شما</h2>
                    <div className="relative max-w-3xl mx-auto">
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-stone-300 dark:bg-stone-700 -translate-x-1/2"></div>
                        {currentUser.timeline.slice(0, 5).map((event, index) => (
                            <div key={event.id} className={`relative flex items-center justify-between mb-8 ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                                <div className="w-5/12"></div>
                                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-500 border-4 border-white dark:border-stone-900"></div>
                                <div className={`w-5/12 p-4 bg-white dark:bg-stone-800 rounded-xl shadow-md border border-stone-200 dark:border-stone-700 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                                    <span className="text-xs text-stone-500 block mb-1">{new Date(event.date).toLocaleDateString('fa-IR')}</span>
                                    <h4 className="font-bold text-stone-800 dark:text-stone-100 text-sm">{event.title}</h4>
                                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 truncate">{event.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="text-center mt-8">
                        <button onClick={() => handleNavigateToProfileTab('timeline')} className="text-amber-600 dark:text-amber-400 font-semibold hover:underline text-sm">
                            مشاهده همه فعالیت‌ها
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default DashboardPage;
