
import React, { useState } from 'react';
import { User, View } from '../types';
import { useAppState, useAppDispatch } from '../AppContext';
import { TrophyIcon, CheckCircleIcon, ChatBubbleOvalLeftEllipsisIcon, BrainCircuitIcon, SproutIcon, GiftIcon, BookOpenIcon, LockClosedIcon } from './icons';

const MeaningCoachingScholarshipView: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [hasReadBooks, setHasReadBooks] = useState(false);


    if (!user) {
        return (
             <div className="pt-24 min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center p-8 bg-gray-800 rounded-lg max-w-md mx-auto">
                    <p className="mb-4">برای مشاهده پیش‌نیازهای سفر کوچینگ معنا، لطفاً ابتدا وارد حساب کاربری خود شوید.</p>
                    <button onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md">
                        ورود / ثبت‌نام
                    </button>
                </div>
            </div>
        );
    }
    
    const onStartJourney = () => {
        const newState = { ...(user.meaningCoachingState || { currentDay: 0 }), currentDay: 1 };
        dispatch({ type: 'UPDATE_USER', payload: { ...user, meaningCoachingState: newState } });
    };

    const prerequisites = [
        {
            id: 'compass_chat',
            icon: ChatBubbleOvalLeftEllipsisIcon,
            title: "گفتگو با مربی معنا",
            description: "حداقل ۵ دقیقه گفتگوی عمیق با راهنمای هوشمند خود داشته باشید تا اولین قدم را برای خودشناسی بردارید.",
            isComplete: (user.compassChatDuration || 0) > 300,
            cta: { text: "شروع گفتگو", action: () => dispatch({ type: 'SET_VIEW', payload: View.CompassUnlockChat }) }
        },
        {
            id: 'self_discovery_tests',
            icon: BrainCircuitIcon,
            title: "انجام تمام آزمون‌های خودشناسی",
            description: "با تکمیل آزمون‌های DISC، انیاگرام، استعدادها و ایکیگای، دیدی ۳۶۰ درجه از خود پیدا کنید.",
            isComplete: !!user.discReport && !!user.enneagramReport && !!user.strengthsReport && !!user.ikigaiReport,
            cta: { text: "رفتن به آزمون‌ها", action: () => dispatch({ type: 'SET_VIEW', payload: View.HerosJourney }) }
        },
        {
            id: 'read_books',
            icon: BookOpenIcon,
            title: "مطالعه کتاب‌های بنیادین",
            description: "مطالعه سه کتاب «مرگ ایوان ایلیچ»، «جاناتان مرغ دریایی» و «تو همانی که می‌اندیشی» برای آمادگی ذهنی و عاطفی.",
            isComplete: hasReadBooks,
            cta: null
        },
        {
            id: 'plant_palm',
            icon: SproutIcon,
            title: "کاشت اولین نخل معنا",
            description: "با کاشت حداقل یک نخل، تعهد خود را به این جنبش و ثبت یک میراث ماندگار نشان دهید.",
            isComplete: user.timeline?.some(e => e.type === 'palm_planted') || false,
            cta: { text: "کاشت نخل", action: () => dispatch({ type: 'START_PLANTING_FLOW' }) }
        },
        {
            id: 'donate_points',
            icon: GiftIcon,
            title: "هدیه امتیاز به یک همسفر",
            description: "با بخشیدن بخشی از امتیاز خود به یک عضو دیگر، فرهنگ بخشندگی را در جامعه تقویت کنید.",
            isComplete: user.timeline?.some(e => e.type === 'community_contribution') || false, // Corrected to use timeline and likely event type
            cta: { text: "رفتن به کانون", action: () => dispatch({ type: 'SET_VIEW', payload: View.CommunityHub }) }
        },
        {
            id: 'share_reflection',
            icon: BookOpenIcon,
            title: "اشتراک‌گذاری یک تامل ناشناس",
            description: "یکی از یادداشت‌های روزانه خود را به صورت ناشناس در «چاه معنا» به اشتراک بگذارید تا دیگران را الهام‌بخش باشید.",
            isComplete: user.timeline?.some(e => e.type === 'reflection' && e.isSharedAnonymously) || false,
            cta: { text: "رفتن به خلوت روزانه", action: () => dispatch({ type: 'SET_VIEW', payload: View.DailyOasis }) }
        }
    ];

    const completedCount = prerequisites.filter(p => p.isComplete).length;
    const allPrerequisitesMet = completedCount === prerequisites.length;

    return (
        <div className="pt-24 min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <header className="text-center mb-16">
                    <TrophyIcon className="w-20 h-20 mx-auto text-yellow-300 mb-4" />
                    <h1 className="text-5xl font-bold mb-4">بورسیه سفر ۶ روزه کوچینگ معنا</h1>
                    <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                        این یک سفر تحول‌آفرین برای اعضای متعهد است. با تکمیل گام‌های آمادگی زیر، قفل این هدیه ارزشمند را برای خود باز کنید.
                    </p>
                </header>

                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-center">گام‌های آمادگی شما</h2>
                    <div className="relative pl-8">
                        {/* Vertical Line */}
                        <div className="absolute top-5 bottom-5 right-5 w-1 bg-gray-700 rounded"></div>

                        {prerequisites.map((step, index) => (
                            <div key={index} className="relative mb-8">
                                <div className={`absolute top-0 -right-1.5 w-8 h-8 rounded-full border-4 border-gray-900 flex items-center justify-center z-10 ${step.isComplete ? 'bg-green-500' : 'bg-gray-600'}`}>
                                    {step.isComplete ? <CheckCircleIcon className="w-5 h-5 text-white" /> : <div className="w-2 h-2 rounded-full bg-gray-400"></div>}
                                </div>
                                <div className="ml-8 bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-md">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-white flex items-center gap-3">
                                                <step.icon className={`w-6 h-6 ${step.isComplete ? 'text-green-400' : 'text-gray-500'}`} />
                                                {step.title}
                                            </h3>
                                            <p className="text-sm text-gray-400 mt-2">{step.description}</p>
                                        </div>
                                        {step.isComplete && (
                                            <span className="text-xs font-bold text-green-500 bg-green-900/50 px-2 py-1 rounded-full">تکمیل شد</span>
                                        )}
                                    </div>
                                    {!step.isComplete && (
                                        step.cta ? (
                                            <div className="mt-4 text-left">
                                                <button onClick={step.cta.action} className="text-sm py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md transition-colors">
                                                    {step.cta.text}
                                                </button>
                                            </div>
                                        ) : step.id === 'read_books' && (
                                            <div className="mt-4 text-left">
                                                <label className="flex items-center text-sm text-gray-300 cursor-pointer p-2 rounded-md hover:bg-gray-700/50 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={hasReadBooks}
                                                        onChange={(e) => setHasReadBooks(e.target.checked)}
                                                        className="ml-3 h-5 w-5 rounded bg-gray-600 border-gray-500 text-green-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500"
                                                    />
                                                    <span className="font-semibold">این کتاب‌ها را مطالعه کرده‌ام و آماده‌ام.</span>
                                                </label>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                         <button
                            onClick={onStartJourney}
                            disabled={!allPrerequisitesMet}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-2 mx-auto"
                        >
                            {!allPrerequisitesMet && <LockClosedIcon className="w-5 h-5" />}
                            <span>{allPrerequisitesMet ? 'شروع سفر ۶ روزه' : 'قفل است'}</span>
                        </button>
                        {!allPrerequisitesMet && (
                            <p className="text-sm text-gray-500 mt-3">
                                {prerequisites.length - completedCount} گام دیگر تا باز شدن قفل باقی مانده است.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeaningCoachingScholarshipView;
