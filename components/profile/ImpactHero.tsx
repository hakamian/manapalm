
import React, { useMemo } from 'react';
import { User, Order, View } from '../../types';
import { BanknotesIcon, BriefcaseIcon, SproutIcon, SparklesIcon, ArrowLeftIcon, ShareIcon } from '../icons';
import { useAppDispatch } from '../../AppContext';

interface ImpactHeroProps {
    user: User;
    orders: Order[];
}

const ImpactHero: React.FC<ImpactHeroProps> = ({ user, orders }) => {
    const dispatch = useAppDispatch();

    // 1. Calculate Quantified Value (McDonald's Principle)
    const totalSpend = orders.reduce((acc, order) => acc + order.total, 0);
    const socialInvestment = totalSpend * 0.9; // 90% model
    
    // Impact Metrics
    const jobsCreatedHours = Math.floor(socialInvestment / 50000); // 50k Tomans per hour
    const palmsPlanted = orders.flatMap(o => o.deeds || []).length;

    // 2. Gamification: Impact Levels (Octalysis CD2: Development)
    const getImpactLevel = (investment: number) => {
        if (investment < 1000000) return { title: "حامی جوان", nextThreshold: 1000000, nextTitle: "بانی رشد" };
        if (investment < 5000000) return { title: "بانی رشد", nextThreshold: 5000000, nextTitle: "معمار آبادی" };
        if (investment < 20000000) return { title: "معمار آبادی", nextThreshold: 20000000, nextTitle: "نگهبان زمین" };
        return { title: "نگهبان زمین", nextThreshold: 100000000, nextTitle: "اسطوره جاودان" };
    };

    const currentLevel = getImpactLevel(socialInvestment);
    const progressToNext = Math.min(100, (socialInvestment / currentLevel.nextThreshold) * 100);
    const amountToNext = currentLevel.nextThreshold - socialInvestment;

    // Generate Shareable Text
    const handleShare = () => {
        const text = `من در نخلستان معنا ${socialInvestment.toLocaleString('fa-IR')} تومان سرمایه‌گذاری اجتماعی کردم و ${jobsCreatedHours} ساعت شغل ایجاد کردم. شما هم بپیوندید!`;
        if (navigator.share) {
            navigator.share({ title: 'تاثیر من در نخلستان', text, url: 'https://nakhlestanmana.com' });
        } else {
            navigator.clipboard.writeText(text);
            alert('متن تاثیر شما کپی شد!');
        }
    };

    return (
        <div className="relative overflow-hidden rounded-2xl mb-8 border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.15)] group">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-green-950 z-0"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 z-0 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -ml-16 -mb-16 z-0"></div>

            <div className="relative z-10 p-6 md:p-8">
                {/* Header: Emotional Connection (CD1: Epic Meaning) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <SparklesIcon className="w-5 h-5 text-amber-400" />
                            <span className="text-amber-400 text-sm font-bold tracking-wider uppercase">کارنامه اثرگذاری شما</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white">
                            {user.fullName}، <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">{currentLevel.title}</span>
                        </h2>
                    </div>
                    <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors backdrop-blur-sm"
                    >
                        <ShareIcon className="w-4 h-4" />
                        بازتاب نور (اشتراک‌گذاری)
                    </button>
                </div>

                {/* Main Metrics (Quantified Value) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Investment */}
                    <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-700 hover:border-amber-500/50 transition-colors flex items-center gap-4 group/card">
                        <div className="p-3 bg-amber-500/20 rounded-full text-amber-400 group-hover/card:scale-110 transition-transform">
                            <BanknotesIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs text-stone-400">سرمایه‌گذاری اجتماعی</p>
                            <p className="text-xl font-bold text-white">{socialInvestment.toLocaleString('fa-IR')} <span className="text-xs font-normal text-stone-500">تومان</span></p>
                        </div>
                    </div>

                    {/* Jobs */}
                    <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-700 hover:border-blue-500/50 transition-colors flex items-center gap-4 group/card">
                        <div className="p-3 bg-blue-500/20 rounded-full text-blue-400 group-hover/card:scale-110 transition-transform">
                            <BriefcaseIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs text-stone-400">اشتغال ایجاد شده</p>
                            <p className="text-xl font-bold text-white">{jobsCreatedHours.toLocaleString('fa-IR')} <span className="text-xs font-normal text-stone-500">ساعت</span></p>
                        </div>
                    </div>

                    {/* Palms */}
                    <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-700 hover:border-green-500/50 transition-colors flex items-center gap-4 group/card">
                        <div className="p-3 bg-green-500/20 rounded-full text-green-400 group-hover/card:scale-110 transition-transform">
                            <SproutIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs text-stone-400">ریشه‌های کاشته شده</p>
                            <p className="text-xl font-bold text-white">{palmsPlanted.toLocaleString('fa-IR')} <span className="text-xs font-normal text-stone-500">نخل</span></p>
                        </div>
                    </div>
                </div>

                {/* Progress to Next Level (CD2 & CD6) */}
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-sm text-stone-300">
                                قدم بعدی: رسیدن به مقام <strong className="text-white">{currentLevel.nextTitle}</strong>
                            </p>
                            <p className="text-xs text-stone-500 mt-1">
                                فقط <span className="text-amber-400 font-bold">{amountToNext.toLocaleString('fa-IR')} تومان</span> سرمایه‌گذاری دیگر تا ارتقاء سطح تاثیرگذاری
                            </p>
                        </div>
                        <button 
                            onClick={() => dispatch({ type: 'START_PLANTING_FLOW' })}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-6 rounded-lg shadow-lg shadow-green-900/50 transition-all hover:scale-105 flex items-center gap-2"
                        >
                            <SproutIcon className="w-4 h-4" />
                            افزایش تاثیر
                        </button>
                    </div>
                    <div className="w-full bg-stone-700 rounded-full h-2 mt-3 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-all duration-1000 ease-out relative"
                            style={{ width: `${progressToNext}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImpactHero;
