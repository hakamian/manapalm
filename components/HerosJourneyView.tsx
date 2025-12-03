import React from 'react';
import { User, View, Order } from '../types';
import { CompassIcon, SproutIcon, TrophyIcon, FlagIcon, UsersIcon, TreeIcon, ChevronLeftIcon, LockClosedIcon, BrainCircuitIcon } from './icons';
import { useAppState, useAppDispatch } from '../AppContext';

const HerosJourneyView: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    
    const onNavigate = (view: View) => dispatch({ type: 'SET_VIEW', payload: view });
    const onNavigateToProfileTab = (tab: string) => dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: tab });
    
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl mb-4">برای شروع سفر قهرمانی، لطفاً ابتدا وارد شوید.</p>
                    <button onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md">
                        ورود / ثبت‌نام
                    </button>
                </div>
            </div>
        );
    }

    if (!user.hasUnlockedHerosJourney) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center p-8 bg-gray-800 rounded-lg border border-gray-700 max-w-lg">
                    <LockClosedIcon className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
                    <h2 className="text-3xl font-bold mb-4">سفر قهرمانی قفل است</h2>
                    <p className="text-gray-300 mb-6">
                        این یک سفر ویژه برای اعضای متعهد است. برای باز کردن قفل آن، باید حداقل ۴۰ دقیقه با «مربی معنا» در بخش «قطب‌نمای معنا» گفتگو کرده باشید.
                    </p>
                    <button onClick={() => onNavigate(View.CompassUnlockChat)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105">
                        شروع گفتگو با مربی
                    </button>
                </div>
            </div>
        );
    }
    
    const journeyCards = [
        {
            icon: <TrophyIcon className="w-12 h-12" />,
            title: "کوچینگ معنا",
            description: "یک سفر ۶ روزه هدایت‌شده برای کشف عمیق‌ترین ارزش‌ها و اهداف زندگی‌تان، با همراهی یک مربی هوشمانا.",
            actionText: "شروع سفر کوچینگ",
            action: () => onNavigate(View.MeaningCoachingScholarship),
            color: 'yellow',
        },
        {
            icon: <FlagIcon className="w-12 h-12" />,
            title: "مسیر معنا",
            description: "با انجام ماموریت‌ها و چالش‌های هفتگی، در مسیر رشد شخصی قدم بردارید و امتیاز کسب کنید.",
            actionText: "مشاهده مسیر",
            action: () => onNavigate(View.PathOfMeaning),
            color: 'green',
        },
        {
            icon: <BrainCircuitIcon className="w-12 h-12" />,
            title: "آینه رفتارشناسی (DISC)",
            description: "با آزمون شخصیت‌شناسی DISC، سبک رفتاری خود را بشناسید و از نقاط قوت خود بهتر استفاده کنید.",
            actionText: "شروع آزمون",
            action: () => onNavigate(View.DISC_TEST),
            color: 'purple',
        },
        {
            icon: <CompassIcon className="w-12 h-12" />,
            title: "نقشه روان (Enneagram)",
            description: "با آزمون انیاگرام، انگیزه‌های بنیادین، ترس‌ها و امیال درونی خود را عمیق‌تر کشف کنید.",
            actionText: "شروع آزمون",
            action: () => onNavigate(View.ENNEAGRAM_TEST),
            color: 'indigo',
        },
        {
            icon: <TrophyIcon className="w-12 h-12" />,
            title: "چشمه استعدادها",
            description: "استعدادهای ذاتی و نقاط قوت برتر خود را بر اساس مدل CliftonStrengths کشف و به کار گیرید.",
            actionText: "شروع آزمون",
            action: () => onNavigate(View.STRENGTHS_TEST),
            color: 'blue',
        },
        {
            icon: <FlagIcon className="w-12 h-12" />,
            title: "قطب‌نمای ایکیگای",
            description: "رسالت شخصی و دلیل زیستن خود را با این چارچوب اکتشافی ژاپنی پیدا کنید.",
            actionText: "شروع اکتشاف",
            action: () => onNavigate(View.IKIGAI_TEST),
            color: 'red',
        },
    ];

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'yellow': return { bg: 'bg-yellow-900/30', border: 'border-yellow-700/50', text: 'text-yellow-300' };
            case 'green': return { bg: 'bg-green-900/30', border: 'border-green-700/50', text: 'text-green-300' };
            case 'blue': return { bg: 'bg-blue-900/30', border: 'border-blue-700/50', text: 'text-blue-300' };
            case 'purple': return { bg: 'bg-purple-900/30', border: 'border-purple-700/50', text: 'text-purple-300' };
            case 'indigo': return { bg: 'bg-indigo-900/30', border: 'border-indigo-700/50', text: 'text-indigo-300' };
            case 'red': return { bg: 'bg-red-900/30', border: 'border-red-700/50', text: 'text-red-300' };
            default: return { bg: 'bg-gray-800', border: 'border-gray-700', text: 'text-white' };
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-22 pb-24">
            <div className="container mx-auto px-6">
                <header className="text-center mb-16">
                    <CompassIcon className="w-20 h-20 mx-auto text-green-400 mb-4" />
                    <h1 className="text-5xl font-bold mb-4">{user.name ? `سفر قهرمانی ${user.name}` : 'سفر قهرمانی شما'}</h1>
                    <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                        اینجا نقطه شروع ماجراجویی شما برای کشف معنای عمیق‌تر در زندگی است. هر مسیر، فرصتی برای رشد و خودشناسی است.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {journeyCards.map(card => {
                        const colors = getColorClasses(card.color);
                        return (
                            <div key={card.title} className={`p-8 rounded-lg border-2 ${colors.bg} ${colors.border} flex flex-col text-center shadow-lg transform transition-transform hover:-translate-y-2`}>
                                <div className={`mx-auto ${colors.text}`}>{card.icon}</div>
                                <h2 className={`text-2xl font-bold mt-4 mb-2 ${colors.text}`}>{card.title}</h2>
                                <p className="text-gray-300 flex-grow">{card.description}</p>
                                <button onClick={card.action} className="mt-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-md transition-colors">
                                    {card.actionText}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-20 text-center">
                    <h2 className="text-3xl font-bold mb-4">گاهشمار معنای شما</h2>
                    <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                        تمام رویدادهای مهم سفر شما، از کاشت نخل تا خاطرات و یادداشت‌های روزانه، در یک مکان ثبت می‌شود.
                    </p>
                    <button onClick={() => onNavigateToProfileTab('timeline')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 flex items-center mx-auto">
                        <ChevronLeftIcon />
                        <span>مشاهده گاهشمار</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HerosJourneyView;
