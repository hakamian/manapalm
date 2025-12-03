
import React, { useMemo, useState } from 'react';
import { User, TimelineEvent, CommunityProject, Page, View } from '../types';
import { LeafIcon, QuoteIcon, HandshakeIcon, BookOpenIcon, UsersIcon, SparklesIcon, AwardIcon, HeartIcon, BrainCircuitIcon, CompassIcon, BanknotesIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';
import ManaGuideCard from './ManaGuideCard';
import FAQ from './FAQ';
import { useAppState, useAppDispatch } from '../AppContext';
import { useAnimatedCounter, useScrollAnimation } from '../utils/hooks';
import { iconMap } from './icons';
import { ArrowLeftIcon, MegaphoneIcon } from './icons';

// Modular components
import HeroCard from './home/HeroCard';
import SpringOfMeaning from './home/SpringOfMeaning';
import NextStepCard from './home/NextStepCard';
import LastHeritageCard from './home/LastHeritageCard';

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

const HomePage: React.FC<HomePageProps> = ({ allUsers, allInsights, communityProjects }) => {
    const { user: currentUser, campaign: activeCampaign } = useAppState();
    const dispatch = useAppDispatch();

    const handleSetPage = (page: Page) => dispatch({ type: 'SET_VIEW', payload: page });
    const setIsAuthModalOpen = (isOpen: boolean) => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: isOpen });
    const handleAppreciateUser = (userId: string) => {
        dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: 10, action: `Appreciated user ${userId}` } });
    };

    const [appreciatedHeroIds, setAppreciatedHeroIds] = useState<string[]>([]);
    const [appreciationTarget, setAppreciationTarget] = useState<{ userId: string; userName: string } | null>(null);
    const [selectedMeaning, setSelectedMeaning] = useState<(typeof meaningTags)[0] | null>(null);
    const [isHeroTransitioning, setIsHeroTransitioning] = useState(false);

    useScrollAnimation();

    const totalPalmsPlanted = useMemo(() => {
        return allUsers.reduce((sum, u) => sum + (u.timeline?.filter(e => e.type === 'palm_planted').length || 0), 0);
    }, [allUsers]);

    const { count: animatedPalms, ref: palmsRef } = useAnimatedCounter(totalPalmsPlanted);

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


    const handleRequestAppreciation = (userId: string, userName: string) => {
        if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
        }
        setAppreciationTarget({ userId, userName });
    };

    const handleConfirmAppreciation = () => {
        if (appreciationTarget) {
            handleAppreciateUser(appreciationTarget.userId);
            setAppreciatedHeroIds(prev => [...prev, appreciationTarget.userId]);
            setAppreciationTarget(null); // Close modal
        }
    };
    
    const handleMeaningSelect = (tag: typeof meaningTags[0]) => {
        setIsHeroTransitioning(true);
        setSelectedMeaning(tag);
        
        setTimeout(() => {
            document.getElementById('spring-of-meaning-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);

        setTimeout(() => {
            setIsHeroTransitioning(false);
        }, 1000);
    };
    
    const approvedInsights = useMemo(() => allInsights.filter(i => i.status === 'approved'), [allInsights]);

    const guides = [
        { icon: HandshakeIcon, title: 'میراث خود را بکارید', description: 'لحظات مهم زندگی خود را با کاشتن یک نخل نمادین، جاودانه کنید.', cta: { text: 'مشاهده میراث‌ها', page: View.HallOfHeritage }, color: 'amber' },
        { icon: BookOpenIcon, title: 'در آکادمی معنا بیاموزید', description: 'با شرکت در دوره‌های آموزشی، دانش خود را برای خلق تأثیری عمیق‌تر افزایش دهید.', cta: { text: 'مشاهده دوره‌ها', page: View.Courses }, color: 'sky' },
        { icon: UsersIcon, title: 'به باغ عمومی بپیوندید', description: 'با آخرین فعالیت‌های اعضای خانواده نخلستان معنا همراه شوید و در گفتگوها مشارکت نمایید.', cta: { text: 'ورود به باغ عمومی', page: View.OurGrove }, color: 'teal' }
    ];
    
    const lastPlantedPalm = useMemo(() => {
        if (!currentUser) return null;
        return [...(currentUser.timeline || [])]
            .filter(e => e.type === 'palm_planted')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;
    }, [currentUser]);

    return (
        <div className="space-y-20 md:space-y-32 pb-16">
            {/* --- Hero Section --- */}
            <section className="relative text-center pt-16 pb-20 rounded-3xl overflow-hidden min-h-[70vh] flex flex-col justify-center items-center">
                 <div className="absolute inset-0 bg-gradient-to-br from-amber-200 via-amber-50 to-white dark:from-stone-900 dark:via-stone-950 dark:to-black z-0">
                    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-10 mix-blend-overlay">
                         <source src="https://storage.googleapis.com/nakhlestan-public/hero-video.mp4" type="video/mp4" />
                    </video>
                 </div>
                <div className="relative z-10 container mx-auto px-4">
                    <div className={`transition-opacity duration-500 ${isHeroTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-amber-900 dark:text-amber-200 mb-6 leading-tight animate-text-glow">
                            امروز چه معنایی را می‌خواهی ثبت کنی؟
                        </h1>
                        <p className="text-lg md:text-xl text-stone-700 dark:text-stone-300 max-w-2xl mx-auto">
                            با انتخاب یکی از گزینه‌های زیر، سفر خود را در نخلستان معنا آغاز کنید.
                        </p>
                    </div>
                    <div className={`mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto transition-opacity duration-300 ${isHeroTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                        {meaningTags.map(tag => {
                            const Icon = tag.icon;
                            return (
                                <button 
                                    key={tag.id} 
                                    onClick={() => handleMeaningSelect(tag)}
                                    className="group flex flex-col items-center justify-center p-4 aspect-square bg-white/30 dark:bg-stone-800/50 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-stone-700/50 hover:bg-white/50 dark:hover:bg-stone-700/60 hover:scale-105 hover:shadow-xl transition-all duration-300"
                                >
                                    <Icon className="w-10 h-10 text-amber-600 dark:text-amber-400 mb-2 transition-transform duration-300 group-hover:-translate-y-1" />
                                    <span className="font-semibold text-stone-800 dark:text-stone-100">{tag.title}</span>
                                </button>
                            );
                        })}
                    </div>
                     <div className={`mt-12 text-center transition-opacity duration-500 ${isHeroTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                        <p className="font-bold text-xl" ref={palmsRef}>{animatedPalms.toLocaleString('fa-IR')}</p>
                        <p className="text-sm text-stone-600 dark:text-stone-400">میراث کاشته شده توسط خانواده نخلستان</p>
                    </div>
                </div>
            </section>
            
            <SpringOfMeaning allUsers={allUsers} allInsights={allInsights} setPage={handleSetPage} activeHeritageId={selectedMeaning?.id} />

            {/* --- Personalized Path Section --- */}
            <section className="container mx-auto px-4 animate-on-scroll">
                 <div className="max-w-4xl mx-auto">
                    {!currentUser ? (
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {guides.map(guide => <ManaGuideCard key={guide.title} {...guide} setPage={handleSetPage} />)}
                        </div>
                    ) : !currentUser.profileCompletion.extra ? (
                        <NextStepCard user={currentUser} setPage={handleSetPage} />
                    ) : lastPlantedPalm ? (
                        <LastHeritageCard heritageItem={lastPlantedPalm} />
                    ) : (
                        <FirstHeritagePrompt setPage={handleSetPage} />
                    )}
                 </div>
            </section>
            
            {/* --- Digital Heritage Architect Section --- */}
            <section className="container mx-auto px-4 animate-on-scroll">
                <div className="bg-gradient-to-br from-stone-800 to-stone-950 text-white rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row items-center gap-8 border border-stone-700/50 shadow-2xl">
                    <div className="lg:w-1/3 text-center">
                        <SparklesIcon className="w-24 h-24 text-amber-400 mx-auto animate-pulse" style={{ animationDuration: '3s' }}/>
                    </div>
                    <div className="lg:w-2/3 text-center lg:text-right">
                        <h2 className="text-3xl font-bold">میراث دیجیتال شما، بذری برای آینده‌ای سبزتر</h2>
                        <p className="mt-4 text-stone-300 leading-relaxed">
                            با سرویس «معمار میراث دیجیتال» از گروه ماناپالم، وب‌سایت شما به یک سرمایه‌گذاری قدرتمند اجتماعی تبدیل می‌گردد. شما یک وب‌سایت حرفه‌ای و بی‌رقیب دریافت می‌کنید و همزمان، ۹۰٪ هزینه آن صرف اهداف زیر می‌شود:
                        </p>
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-semibold">
                            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg"><HandshakeIcon className="w-5 h-5 text-amber-300"/><span>ایجاد شغل پایدار برای جوانان</span></div>
                            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg"><BanknotesIcon className="w-5 h-5 text-amber-300"/><span>تامین سرمایه کسب‌وکارهای کوچک</span></div>
                            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg"><LeafIcon className="w-5 h-5 text-amber-300"/><span>احیای محیط زیست و خاک</span></div>
                        </div>
                        <button 
                            onClick={() => handleSetPage(View['digital-heritage-architect'])}
                            className="mt-8 bg-amber-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto lg:mx-0"
                        >
                            <span>اطلاعات بیشتر</span>
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>

            {/* --- Weekly Challenge --- */}
            {activeCampaign && (
                <section className="container mx-auto px-4 animate-on-scroll">
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700 p-8 rounded-3xl shadow-2xl text-white text-center">
                        <div className="flex justify-center items-center gap-3">
                            <MegaphoneIcon className="w-8 h-8"/>
                            <h2 className="text-3xl font-bold">{activeCampaign.title}</h2>
                        </div>
                        <p className="mt-3 max-w-2xl mx-auto text-amber-50">{activeCampaign.description}</p>
                        <div className="max-w-md mx-auto mt-6">
                            <div className="flex justify-between text-sm font-semibold mb-1 text-amber-100">
                                <span>{activeCampaign.current.toLocaleString('fa-IR')} / {activeCampaign.goal.toLocaleString('fa-IR')}</span>
                                <span>پیشرفت</span>
                            </div>
                            <div className="w-full bg-black/20 rounded-full h-4 border-2 border-white/20">
                                <div 
                                    className="bg-white h-full rounded-full transition-all duration-500"
                                    style={{ width: `${(activeCampaign.current / activeCampaign.goal) * 100}%` }}
                                ></div>
                            </div>
                            <div className="mt-4 flex items-center justify-center gap-2 font-semibold text-amber-100 bg-black/20 px-3 py-1 rounded-full text-sm w-fit mx-auto">
                                <HeartIcon className="w-5 h-5 text-yellow-300"/>
                                <span>با هر مشارکت <span className="font-bold">{activeCampaign.rewardPoints} امتیاز ویژه</span> دریافت کنید!</span>
                            </div>
                        </div>
                        <button onClick={() => handleSetPage(View.HallOfHeritage)} className="mt-8 bg-white text-amber-800 font-bold px-8 py-3 rounded-xl hover:bg-amber-100 transition-all transform hover:scale-105 shadow-lg">
                            من هم مشارکت می‌کنم
                        </button>
                    </div>
                </section>
            )}

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
                                        currentUser={currentUser}
                                        onAppreciate={handleRequestAppreciation}
                                        onMessage={handleSetPage}
                                        onLogin={() => setIsAuthModalOpen(true)}
                                        appreciated={appreciatedHeroIds.includes(heroToShow.user.id)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* --- Echoes from the Well --- */}
            {approvedInsights.length > 0 && (
            <section className="bg-stone-800 dark:bg-black text-white py-10">
                <div className="container mx-auto px-4 overflow-hidden">
                     <div className="flex animate-marquee hover:pause whitespace-nowrap">
                         {[...approvedInsights, ...approvedInsights].map((insight, index) => (
                             <div key={index} className="flex items-center gap-3 mx-8 text-stone-300">
                                 <QuoteIcon className="w-5 h-5 flex-shrink-0" />
                                 <p className="italic">"{insight.userReflection?.notes || insight.description}"</p>
                             </div>
                         ))}
                     </div>
                </div>
            </section>
            )}

            {/* --- FAQ Section --- */}
            <section className="container mx-auto px-4 animate-on-scroll">
                <FAQ user={currentUser} />
            </section>
            {appreciationTarget && (
                <ConfirmationModal
                    isOpen={!!appreciationTarget}
                    onClose={() => setAppreciationTarget(null)}
                    onConfirm={handleConfirmAppreciation}
                    title={`تقدیر از ${appreciationTarget.userName}`}
                    message={`آیا مایلید از ${appreciationTarget.userName} تقدیر کنید؟ این کار باعث دلگرمی او و ثبت یک امتیاز معنا برای شما خواهد شد.`}
                    confirmText="بله، تقدیر می‌کنم"
                    cancelText="انصراف"
                    variant="positive"
                    icon={HeartIcon}
                />
            )}
             <style>{`
                .hover\\:pause:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default HomePage;
