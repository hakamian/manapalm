
import React, { useEffect } from 'react';
import { User, View } from '../types';
import { SproutIcon, TrophyIcon, UsersIcon, TreeIcon, CheckCircleIcon, BrainCircuitIcon, AwardIcon, HeartIcon, QuoteIcon, SparklesIcon, ArrowPathIcon } from './icons';
import { useAppState, useAppDispatch } from '../AppContext';
import { generateDailyChallenge } from '../services/geminiService';

const PathOfMeaningView: React.FC = () => {
    const { user, dailyChallenge, isGeneratingChallenge } = useAppState();
    const dispatch = useAppDispatch();

    const onNavigate = (view: View) => dispatch({ type: 'SET_VIEW', payload: view });
    const onNavigateToProfileTab = (tab: string) => dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: tab });
    const onStartPlantingFlow = () => dispatch({ type: 'START_PLANTING_FLOW' });

    useEffect(() => {
        // Generate a challenge if user exists, none exists, and we aren't currently generating
        if (user && !dailyChallenge && !isGeneratingChallenge) {
            handleGenerateChallenge();
        }
    }, [user]);

    const handleGenerateChallenge = async () => {
        if (!user) return;
        dispatch({ type: 'SET_IS_GENERATING_CHALLENGE', payload: true });
        try {
            const challenge = await generateDailyChallenge(user);
            dispatch({ type: 'SET_DAILY_CHALLENGE', payload: challenge });
        } catch (e) {
            console.error(e);
        } finally {
            dispatch({ type: 'SET_IS_GENERATING_CHALLENGE', payload: false });
        }
    };

    const handleCtaClick = () => {
        if (!dailyChallenge) return;
        
        if (dailyChallenge.ctaView) {
             // Check if we need to navigate to a profile tab
             if (dailyChallenge.ctaView === View.UserProfile) {
                 // Assuming 'profile' tab as default for UserProfile view, or specific tabs can be handled if needed
                 onNavigateToProfileTab('profile');
             } else {
                 onNavigate(dailyChallenge.ctaView);
             }
        } else {
            // Default action if no view is specified but button is clicked (e.g. just complete)
             // In a real app, this might mark the challenge as complete
             alert('ماموریت انجام شد!');
        }
    };

    const checkTrialCompletion = (trialId: string) => {
        // ... existing checkTrialCompletion logic (kept as is for brevity in this snippet, but assume full content is here)
        if (!user) return false;
        switch (trialId) {
            case 'complete_profile':
                return !!user.fullName && !!user.email && !!user.description && !!user.avatar;
            case 'plant_first_palm':
                // Using a simplified check since 'orders' isn't directly available in this scope without importing it from AppContext if not destructured. 
                // Assuming orders are accessible or user.timeline has this info.
                return user.timeline?.some(e => e.type === 'palm_planted') || false;
            case 'write_memory':
                 return user.timeline?.some(e => e.type === 'palm_planted' && !!e.memoryText) || false;
            case 'use_ai_chat':
                 return !!user.meaningCoachHistory && user.meaningCoachHistory.length > 0;
            case 'plant_three_palms':
                 const palmCount = user.timeline?.filter(e => e.type === 'palm_planted').length || 0;
                 return palmCount >= 3;
            case 'reach_sapling':
                return (user.points || 0) >= 500;
             case 'explore_ai_portal':
                return (user.points || 0) >= 500; // Simplified logic
            default:
                return false;
        }
    };

    // ... Levels definition (kept same)
    const levels = [
        {
            id: 'seeker',
            title: 'پویشگر',
            icon: <SproutIcon className="w-12 h-12" />,
            description: "آغاز سفر شما در دنیای معنا. کنجکاو باشید و کاوش کنید.",
            reward: "۱۰۰ امتیاز",
            trials: [
                { id: 'complete_profile', text: "پروفایل خود را کامل کنید (نام, ایمیل, بیوگرافی و آواتار).", action: () => onNavigateToProfileTab('profile') },
                { id: 'reach_sapling', text: "با کسب ۵۰۰ امتیاز به سطح «نهال» برسید.", action: () => onNavigateToProfileTab('gamification') },
            ]
        },
        {
            id: 'planter',
            title: 'کارنده',
            icon: <TreeIcon className="w-12 h-12" />,
            description: "اولین بذر معنا را در نخلستان می‌کارید و ریشه‌های خود را محکم می‌کنید.",
            reward: "۲۵۰ امتیاز",
            trials: [
                { id: 'plant_first_palm', text: "اولین نخل خود را بکارید.", action: onStartPlantingFlow },
                { id: 'write_memory', text: "برای نخل کاشته شده خود یک خاطره بنویسید.", action: () => onNavigateToProfileTab('timeline') },
                { id: 'use_ai_chat', text: "یک سوال از دستیار هوشمند سایت بپرسید.", action: () => onNavigate(View.MeaningCompanion) },
            ]
        },
        {
            id: 'guardian',
            title: 'نگهبان',
            icon: <UsersIcon className="w-12 h-12" />,
            description: "شما به یک عضو فعال و تاثیرگذار در جامعه نخلستان تبدیل می‌شوید.",
            reward: "۵۰۰ امتیاز",
            trials: [
                { id: 'plant_three_palms', text: "در مجموع ۳ نخل یا بیشتر بکارید.", action: onStartPlantingFlow },
                { id: 'explore_ai_portal', text: "یکی از ابزارهای پیشرفته پورتال هوشمانا را امتحان کنید.", action: () => onNavigate(View.AIPortal) },
            ]
        }
    ];

    let lastCompletedLevelIndex = -1;
    const processedLevels = levels.map((level, index) => {
        const trialsWithStatus = level.trials.map(trial => ({ ...trial, isCompleted: checkTrialCompletion(trial.id) }));
        const isLevelCompleted = trialsWithStatus.every(t => t.isCompleted);
        if (isLevelCompleted) {
            lastCompletedLevelIndex = index;
        }
        return { ...level, trials: trialsWithStatus, isCompleted: isLevelCompleted };
    });

    const TrialItem: React.FC<{ trial: any, isLocked: boolean }> = ({ trial, isLocked }) => (
        <div className={`flex items-center p-3 rounded-lg transition-all duration-300 ${trial.isCompleted ? 'bg-green-800/30' : 'bg-gray-800'} ${isLocked && !trial.isCompleted ? 'opacity-50' : ''}`}>
            <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full mr-4 ${trial.isCompleted ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-400'}`}>
                {trial.isCompleted ? <CheckCircleIcon className="w-5 h-5"/> : <div className="w-2 h-2 rounded-full bg-gray-400"></div>}
            </div>
            <div className="flex-grow">
                <p className={`${trial.isCompleted ? 'text-gray-400 line-through' : 'text-white'}`}>{trial.text}</p>
            </div>
            {!trial.isCompleted && !isLocked && (
                <button onClick={trial.action} className="text-sm py-1 px-3 bg-green-600 hover:bg-green-700 rounded-md transition-colors whitespace-nowrap">
                    انجام بده
                </button>
            )}
        </div>
    );
    
    return (
         <div className="pt-24 min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <header className="text-center mb-16">
                    <TrophyIcon className="w-16 h-16 mx-auto text-yellow-300 mb-4" />
                    <h1 className="text-5xl font-bold mb-4">مسیر معنا</h1>
                    <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                       یک راهنمای قدم به قدم برای قهرمانانی که می‌خواهند تاثیر عمیق‌تری در نخلستان معنا بگذارند.
                    </p>
                </header>

                {/* Smart Challenge Card (Handles Guest & Logged In) */}
                <div className="max-w-3xl mx-auto mb-12">
                    <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-6 border border-indigo-500/50 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className="w-6 h-6 text-yellow-300 animate-pulse" />
                                    <h2 className="text-xl font-bold text-white">
                                        {user ? 'چالش هوشمند امروز شما' : 'دعوت به ماجراجویی'}
                                    </h2>
                                </div>
                                {user && (
                                    <button onClick={handleGenerateChallenge} disabled={isGeneratingChallenge} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                        <ArrowPathIcon className={`w-5 h-5 text-indigo-200 ${isGeneratingChallenge ? 'animate-spin' : ''}`} />
                                    </button>
                                )}
                            </div>
                            
                            {!user ? (
                                // Guest View
                                <div>
                                    <h3 className="text-lg font-bold text-yellow-300 mb-2">همین حالا به خانواده ما بپیوندید!</h3>
                                    <p className="text-gray-200 mb-3 leading-relaxed">
                                        شما هنوز وارد نشده‌اید. برای شروع سفر قهرمانی خود، دریافت امتیاز و استفاده از ابزارهای هوش مصنوعی، اولین قدم را بردارید.
                                    </p>
                                    <div className="bg-black/20 p-3 rounded-lg mb-4 border-r-4 border-pink-500">
                                        <p className="text-xs text-pink-300 italic">💡 این اولین گام برای ساختن میراث دیجیتال شماست.</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-green-400">پاداش: ۵۰ امتیاز ورود</span>
                                        <button 
                                            onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })}
                                            className="bg-white text-indigo-900 font-bold py-2 px-6 rounded-md hover:bg-indigo-100 transition-colors text-sm shadow-md"
                                        >
                                            ورود / ثبت‌نام
                                        </button>
                                    </div>
                                </div>
                            ) : isGeneratingChallenge ? (
                                // Generating View
                                <div className="text-center py-6">
                                    <p className="text-indigo-200 animate-pulse">هوش مصنوعی در حال تحلیل پروفایل و طراحی ماموریت اختصاصی برای شماست...</p>
                                </div>
                            ) : dailyChallenge ? (
                                // User View (With Challenge)
                                <div>
                                    <h3 className="text-lg font-bold text-yellow-300 mb-2">{dailyChallenge.title}</h3>
                                    <p className="text-gray-200 mb-3 leading-relaxed">{dailyChallenge.description}</p>
                                    <div className="bg-black/20 p-3 rounded-lg mb-4 border-r-4 border-pink-500">
                                        <p className="text-xs text-pink-300 italic">💡 {dailyChallenge.reasoning}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-green-400">پاداش: {dailyChallenge.xp} امتیاز</span>
                                        <button 
                                            onClick={handleCtaClick}
                                            className="bg-white text-indigo-900 font-bold py-2 px-4 rounded-md hover:bg-indigo-100 transition-colors text-sm"
                                        >
                                            {dailyChallenge.ctaText || 'تکمیل ماموریت'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Fallback (Should not happen often if useEffect works)
                                <div className="text-center py-6">
                                    <p className="text-gray-400">برای دریافت ماموریت امروز، روی دکمه تازه‌سازی کلیک کنید.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {user && (
                    <div className="max-w-3xl mx-auto">
                        {/* The Path Line */}
                        <div className="relative p-4">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gray-700"></div>
                            {processedLevels.map((level, index) => {
                                const isLocked = index > lastCompletedLevelIndex + 1;
                                return (
                                    <div key={level.id} className="relative mb-16">
                                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 -mt-6 w-12 h-12 rounded-full border-4 flex items-center justify-center z-10 ${level.isCompleted ? 'bg-green-600 border-green-400' : isLocked ? 'bg-gray-800 border-gray-600' : 'bg-yellow-500 border-yellow-300 animate-pulse'}`}>
                                            {level.icon}
                                        </div>
                                        <div className={`mt-10 bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg ${isLocked ? 'opacity-60' : ''}`}>
                                            <h2 className="text-2xl font-bold mb-2">{level.title}</h2>
                                            <p className="text-gray-400 mb-4">{level.description}</p>
                                            <div className="space-y-3">
                                                {level.trials.map(trial => <TrialItem key={trial.id} trial={trial} isLocked={isLocked} />)}
                                            </div>
                                            {level.isCompleted && (
                                                <div className="mt-4 text-center text-green-400 font-semibold flex items-center justify-center gap-2">
                                                    <AwardIcon className="w-6 h-6" />
                                                    <span>مرحله تکمیل شد! {level.reward} جایزه گرفتید.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PathOfMeaningView;
