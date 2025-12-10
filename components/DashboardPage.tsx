
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { User, TimelineEvent, Page, HeritageItem, View, MIN_POINTS_FOR_MESSAGING } from '../types';
import { LeafIcon, UsersIcon, SparklesIcon, CompassIcon, PlusIcon, AwardIcon, HeartIcon, PaperAirplaneIcon, LightBulbIcon } from './icons';
import { useAppState, useAppDispatch } from '../AppContext';
import { useAnimatedCounter } from '../utils/hooks';
import { heritageItems } from '../utils/heritage';
import { iconMap } from './icons';
import Certificate from './Certificate';
import InstallmentModal from './InstallmentModal';
import { getAIAssistedText } from '../services/geminiService';

const HeroCard: React.FC<{
    hero: { user: User; weeklyPoints: number };
    rank: number;
    currentUser: User | null;
    onAppreciate: (userId: string, userName: string) => void;
    onMessage: (page: View) => void;
    onLogin: () => void;
    appreciated: boolean;
}> = ({ hero, rank, currentUser, onAppreciate, onMessage, onLogin, appreciated }) => {
    const { user, weeklyPoints } = hero;
    const rankStyles = [
        { ring: 'ring-amber-400', glow: 'shadow-[0_0_30px_theme(colors.amber.400)]', medal: 'text-amber-400' },
        { ring: 'ring-slate-300', glow: 'shadow-[0_0_30px_theme(colors.slate.300)]', medal: 'text-slate-300' },
        { ring: 'ring-amber-700', glow: 'shadow-[0_0_30px_theme(colors.amber.700)]', medal: 'text-amber-700' },
    ];
    const style = rankStyles[rank - 1];
    const isOwnCard = currentUser?.id === user.id;

    return (
        <div className={`glass-card p-6 rounded-2xl text-center flex flex-col items-center relative overflow-hidden group ${rank === 1 ? 'md:-translate-y-8 z-10' : ''}`}>
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

            <div className={`absolute -top-4 right-4 flex items-center gap-1 font-bold ${style.medal}`}>
                <AwardIcon className="w-8 h-8 drop-shadow-md" />
            </div>
            <img src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className={`w-24 h-24 rounded-full object-cover ring-4 ${style.ring} ${style.glow} mb-4`} />
            <h4 className="font-bold text-lg text-white">{user.name}</h4>
            <p className="text-sm font-semibold text-amber-300 mb-4">{weeklyPoints.toLocaleString('fa-IR')} امتیاز</p>
            
            <div className="flex gap-2">
                 <button
                    onClick={() => currentUser ? onAppreciate(user.id, user.name) : onLogin()}
                    disabled={isOwnCard || appreciated}
                    className={`p-2 rounded-full transition-all ${appreciated ? 'bg-red-500/20 text-red-400' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                >
                    <HeartIcon className={`w-5 h-5 ${appreciated ? 'fill-current' : ''}`} />
                </button>
                 <button
                    onClick={() => currentUser ? onMessage(View.DIRECT_MESSAGES) : onLogin()}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                    <PaperAirplaneIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const DashboardPage: React.FC = () => {
    const { user: currentUser } = useAppState();
    const dispatch = useAppDispatch();
    const [aiWisdom, setAiWisdom] = useState<string>('');
    const [loadingWisdom, setLoadingWisdom] = useState(true);

    const handleSetPage = (page: View) => dispatch({ type: 'SET_VIEW', payload: page });
    const handleStartPlantingFlow = () => dispatch({ type: 'START_PLANTING_FLOW' });

    // AI Wisdom Generation
    useEffect(() => {
        const fetchWisdom = async () => {
            if (!currentUser) return;
            try {
                // Generate personalized wisdom based on user activity
                const context = `User Level: ${currentUser.level}, Points: ${currentUser.points}. Last activity: ${currentUser.timeline?.[0]?.title || 'None'}.`;
                const text = await getAIAssistedText({
                    mode: 'generate',
                    type: 'daily_wisdom',
                    text: '',
                    context: context
                });
                setAiWisdom(text);
            } catch (e) {
                setAiWisdom("امروز روز خوبی برای کاشتن یک بذر جدید است. حتی کوچکترین قدم‌ها، مسیرهای بزرگ را می‌سازند.");
            } finally {
                setLoadingWisdom(false);
            }
        };
        fetchWisdom();
    }, [currentUser]);

    return (
        <div className="space-y-16 pb-16">
            {/* --- Hero Section (Glassmorphism) --- */}
            <section className="relative text-center pt-24 pb-20 px-4">
                <div className="max-w-4xl mx-auto relative z-10">
                     <h1 className="text-4xl md:text-7xl font-extrabold mb-6 tracking-tight">
                        <span className="text-white">سلام، </span>
                        <span className="text-gradient-gold">{currentUser?.name || 'همسفر'}</span>
                    </h1>
                    
                    {/* Dynamic AI Wisdom Card */}
                    <div className="glass-panel p-6 rounded-2xl max-w-2xl mx-auto mb-10 transform transition-all hover:scale-[1.01]">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-amber-500/20 text-amber-400">
                                <SparklesIcon className="w-6 h-6 animate-pulse" />
                            </div>
                            <div className="text-right flex-1">
                                <h3 className="text-sm font-bold text-amber-200 mb-1">پیام امروز برای شما</h3>
                                {loadingWisdom ? (
                                    <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse"></div>
                                ) : (
                                    <p className="text-stone-300 text-lg leading-relaxed italic">"{aiWisdom}"</p>
                                )}
                            </div>
                        </div>
                    </div>

                     <div className="flex flex-wrap justify-center gap-4">
                        <button onClick={handleStartPlantingFlow} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-[0_0_25px_rgba(74,222,128,0.4)] flex items-center gap-2 text-lg">
                            <PlusIcon className="w-6 h-6" />
                            <span>کاشت میراث جدید</span>
                        </button>
                        <button onClick={() => handleSetPage(View.UserProfile)} className="glass-panel hover:bg-white/10 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center gap-2">
                            <UsersIcon className="w-5 h-5" />
                            <span>باغ شخصی من</span>
                        </button>
                    </div>
                </div>
            </section>

             {/* --- Quick Access Grid (Floating Cards) --- */}
            <section className="container mx-auto px-4 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-8 rounded-3xl cursor-pointer group" onClick={() => handleSetPage(View.CommunityHub)}>
                        <div className="bg-blue-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-blue-400">
                            <UsersIcon className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">کانون جامعه</h3>
                        <p className="text-stone-400">به گفتگوها بپیوندید و از آخرین اخبار مطلع شوید.</p>
                    </div>
                     <div className="glass-card p-8 rounded-3xl cursor-pointer group" onClick={() => handleSetPage(View.PathOfMeaning)}>
                        <div className="bg-green-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-green-400">
                            <CompassIcon className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">مسیر معنا</h3>
                        <p className="text-stone-400">سفر قهرمانی خود را ادامه دهید و ماموریت‌های جدید را کشف کنید.</p>
                    </div>
                     <div className="glass-card p-8 rounded-3xl cursor-pointer group" onClick={() => handleSetPage(View['ai-tools'])}>
                        <div className="bg-purple-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-purple-400">
                            <SparklesIcon className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">آزمایشگاه معنا</h3>
                        <p className="text-stone-400">با ابزارهای هوشمند، خلاقیت خود را شکوفا کنید.</p>
                    </div>
                </div>
            </section>

            {/* --- Recent Activity (Timeline Preview) --- */}
            {currentUser && currentUser.timeline && currentUser.timeline.length > 0 && (
                <section className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                        <LightBulbIcon className="w-6 h-6 text-amber-400" />
                        آخرین فعالیت‌های شما
                    </h2>
                    <div className="space-y-4">
                        {currentUser.timeline.slice(0, 3).map((event, index) => (
                            <div key={event.id} className="glass-panel p-5 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center border border-stone-700 text-amber-500 font-bold">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-lg">{event.title}</h4>
                                    <p className="text-stone-400 text-sm mt-1 truncate">{event.description}</p>
                                </div>
                                <span className="text-xs text-stone-500 font-mono">{new Date(event.date).toLocaleDateString('fa-IR')}</span>
                            </div>
                        ))}
                    </div>
                     <div className="text-center mt-8">
                        <button onClick={() => dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: 'timeline' })} className="text-amber-400 font-bold hover:text-amber-300 transition-colors">
                            مشاهده تمام فعالیت‌ها &larr;
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default DashboardPage;
