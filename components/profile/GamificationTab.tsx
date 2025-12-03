
import React from 'react';
import { User, View } from '../../types';
import { SproutIcon, LeafIcon, SunIcon, ArrowLeftIcon, CheckCircleIcon, FirstPalmBadgeIcon, CommunityContributorBadgeIcon, PathfinderBadgeIcon, LoyalMemberBadgeIcon, UserCircleIcon, SaplingIcon, SparklesIcon, TrophyIcon, StarIcon, HandshakeIcon } from '../icons';
import { getNextLevelInfo, getLevelForPoints, POINT_ALLOCATIONS } from '../../services/gamificationService';
import { useAppDispatch } from '../../AppContext';

interface GamificationTabProps {
    user: User;
    animatedBarkatProgress: number;
    animatedManaProgress: number;
    onNavigate: (view: View) => void;
    setActiveTab: (tab: string) => void;
    onStartPlantingFlow: () => void;
}

const allAchievements = [
    { id: 'first_palm', name: 'اولین نخل', description: 'اولین نخل خود را در نخلستان معنا بکارید.', icon: <FirstPalmBadgeIcon />, points: 100 },
    { id: 'community_contributor', name: 'مشارکت‌کننده فعال', description: 'اولین پست خود را در کانون جامعه منتشر کنید.', icon: <CommunityContributorBadgeIcon />, points: 50 },
    { id: 'pathfinder', name: 'راه‌بلد', description: 'سفر معنای خود را در بخش کوچینگ آغاز کنید.', icon: <PathfinderBadgeIcon />, points: 200 },
    { id: 'loyal_member', name: 'عضو وفادار', description: 'برای بیش از ۳ روز متوالی وارد سایت شوید.', icon: <LoyalMemberBadgeIcon />, points: 75 },
    { id: 'profile_complete', name: 'پروفایل کامل', description: 'تمام بخش‌های پروفایل خود را تکمیل کنید.', icon: <UserCircleIcon />, points: 50 },
    { id: 'reach_sapling', name: 'سطح نهال', description: 'به سطح "نهال" برسید.', icon: <SaplingIcon />, points: 0 },
    { id: 'digital_cocreator', name: 'هم‌آفرین دیجیتال', description: 'با استفاده از استودیوی هم‌آفرینی، میراث دیجیتال خود را بسازید.', icon: <SparklesIcon />, points: 1000 },
];

// New Elder Game Content
const legendaryPerks = [
    { title: "دعوت به رویداد سالانه", desc: "حضور VIP در جشن برداشت خرما و دیدار با بنیان‌گذاران.", icon: <StarIcon />, minLevel: "درخت تنومند" },
    { title: "حق رأی در شورا", desc: "مشارکت در تصمیم‌گیری‌های کلان نخلستان.", icon: <HandshakeIcon />, minLevel: "استاد کهنسال" },
    { title: "سهامداری معنوی", desc: "دریافت گزارش شفاف سود و تخصیص بخشی از آن به نیت شما.", icon: <TrophyIcon />, minLevel: "استاد کهنسال" },
];

const GamificationTab: React.FC<GamificationTabProps> = ({ user, animatedBarkatProgress, animatedManaProgress, onNavigate, setActiveTab, onStartPlantingFlow }) => {
    const nextLevelInfo = getNextLevelInfo(user.points, user.manaPoints || 0);
    const currentLevel = getLevelForPoints(user.points, user.manaPoints || 0);

    const getActionForAchievement = (achId: string) => {
        switch (achId) {
            case 'first_palm': return { label: 'انجام بده', action: onStartPlantingFlow };
            case 'profile_complete': return { label: 'تکمیل پروفایل', action: () => setActiveTab('profile') };
            case 'community_contributor': return { label: 'رفتن به کانون', action: () => onNavigate(View.CommunityHub) };
            case 'pathfinder': return { label: 'شروع سفر', action: () => onNavigate(View.MeaningCoachingScholarship) };
            case 'digital_cocreator': return { label: 'بیشتر بدانید', action: () => onNavigate(View.CoCreation) };
            default: return null;
        }
    };

    const getActionForPointItem = (actionText: string): (() => void) | null => {
        // Matching strings from POINT_ALLOCATIONS in gamificationService.ts
        if (actionText.includes('تکمیل اطلاعات')) return () => setActiveTab('profile');
        if (actionText.includes('ثبت‌نام') || actionText.includes('ورود')) return null; // Already done/passive
        
        if (actionText.includes('نظر') || actionText.includes('لایک')) return () => onNavigate(View.Articles);
        if (actionText.includes('پست در کانون')) return () => onNavigate(View.CommunityHub);
        if (actionText.includes('یادداشت')) return () => onNavigate(View.DailyOasis);
        if (actionText.includes('سند نخل') || actionText.includes('خاطره')) return () => setActiveTab('timeline');
        
        if (actionText.includes('کاشت نخل')) return onStartPlantingFlow;
        if (actionText.includes('خرید از فروشگاه')) return () => onNavigate(View.Shop);
        
        if (actionText.includes('دوره') || actionText.includes('آموزشی')) return () => onNavigate(View.Courses);
        
        if (actionText.includes('معرفی کاربر')) return () => setActiveTab('referral');
        if (actionText.includes('هم‌آفرینی') || actionText.includes('ارائه')) return () => onNavigate(View.CoCreation);
        if (actionText.includes('نخلدار')) return () => setActiveTab('grovekeeper');

        return null;
    };

    return (
        <div className="space-y-10">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-yellow-400 to-indigo-500"></div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <SproutIcon className="w-6 h-6 text-green-400" />
                    فلسفه باغبان
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-green-900/30">
                        <div className="w-12 h-12 mx-auto bg-green-900/50 rounded-full flex items-center justify-center mb-3 text-green-400"><LeafIcon className="w-6 h-6" /></div>
                        <h4 className="font-bold text-green-300">خاک و آب (برکت)</h4>
                        <p className="text-sm text-gray-400 mt-2">اقدامات بیرونی، خرید و مشارکت مالی. بستر رشد را فراهم می‌کند.</p>
                    </div>
                    <div className="flex items-center justify-center text-2xl font-bold text-gray-600">+</div>
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-indigo-900/30">
                        <div className="w-12 h-12 mx-auto bg-indigo-900/50 rounded-full flex items-center justify-center mb-3 text-indigo-400"><SunIcon className="w-6 h-6" /></div>
                        <h4 className="font-bold text-indigo-300">نور خورشید (معنا)</h4>
                        <p className="text-sm text-gray-400 mt-2">آگاهی، یادگیری و تامل درونی. انرژی حیات را تامین می‌کند.</p>
                    </div>
                </div>
                <p className="text-center text-gray-300 mt-6 text-sm">
                    یک درخت برای قد کشیدن به <strong>هر دو</strong> نیاز دارد. برای ارتقای سطح، تعادل را بین عمل و آگاهی حفظ کنید.
                </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">سطح و پیشرفت شما</h3>
                 <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className="text-sm text-gray-400">سطح فعلی</p>
                        <p className="text-2xl font-bold text-green-400">{currentLevel.name}</p>
                    </div>
                    {nextLevelInfo && (
                        <div className="text-left">
                            <p className="text-sm text-gray-400">سطح بعدی</p>
                            <p className="text-xl font-semibold">{nextLevelInfo.name}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>امتیاز برکت (فعالیت)</span>
                            <span>{user.points.toLocaleString('fa-IR')} / {nextLevelInfo ? nextLevelInfo.points.toLocaleString('fa-IR') : 'MAX'}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                            <div className="bg-green-500 h-4 rounded-full transition-all duration-1000 ease-out" style={{ width: `${animatedBarkatProgress}%` }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>امتیاز معنا (آگاهی)</span>
                            <span>{(user.manaPoints || 0).toLocaleString('fa-IR')} / {nextLevelInfo ? nextLevelInfo.manaThreshold.toLocaleString('fa-IR') : 'MAX'}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                            <div className="bg-indigo-500 h-4 rounded-full transition-all duration-1000 ease-out" style={{ width: `${animatedManaProgress}%` }}></div>
                        </div>
                    </div>
                </div>
                 <p className="text-center text-sm text-gray-400 mt-4">
                    {nextLevelInfo ? `برای رسیدن به سطح بعدی، هر دو نوار باید پر شوند.` : 'شما به بالاترین سطح رسیده‌اید!'}
                </p>
            </div>
            
            {/* Elder Game Section */}
            <div className="bg-gradient-to-b from-amber-900/20 to-gray-800 border border-amber-500/30 p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <h3 className="text-xl font-bold text-amber-400 mb-6 flex items-center gap-2">
                    <TrophyIcon className="w-6 h-6" /> تالار جاودانگی (جوایز سطح بالا)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {legendaryPerks.map((perk, index) => {
                        // Simple check if unlocked based on level name (in real app, check level index)
                        const isUnlocked = currentLevel.name === perk.minLevel || currentLevel.name === "استاد کهنسال" && perk.minLevel === "درخت تنومند";
                        
                        return (
                            <div key={index} className={`p-4 rounded-lg border flex flex-col items-center text-center ${isUnlocked ? 'bg-amber-900/40 border-amber-500/50' : 'bg-gray-800/50 border-gray-700 opacity-60 grayscale'}`}>
                                <div className={`p-3 rounded-full mb-3 ${isUnlocked ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-700 text-gray-500'}`}>
                                    {React.cloneElement(perk.icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })}
                                </div>
                                <h4 className="font-bold text-white mb-1">{perk.title}</h4>
                                <p className="text-xs text-gray-400 mb-3">{perk.desc}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded border ${isUnlocked ? 'bg-green-900/30 border-green-500/50 text-green-400' : 'bg-gray-700 border-gray-600 text-gray-500'}`}>
                                    {isUnlocked ? 'باز شده' : `نیاز: ${perk.minLevel}`}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">چگونه امتیاز کسب کنیم؟</h3>
                    {POINT_ALLOCATIONS.map(cat => (
                        <div key={cat.category} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <h4 className="text-lg font-semibold text-green-400 mb-3">{cat.category}</h4>
                            <div className="space-y-3">
                                {cat.items.map(item => {
                                    const actionHandler = getActionForPointItem(item.action);
                                    return (
                                        <div key={item.action} className="bg-gray-700/50 p-3 rounded-md">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className="font-semibold text-sm">{item.action}</p>
                                                <p className={`font-bold whitespace-nowrap ${item.type === 'mana' ? 'text-indigo-300' : 'text-green-300'}`}>
                                                    +{typeof item.points === 'number' ? item.points.toLocaleString('fa-IR') : item.points}
                                                </p>
                                            </div>
                                            {item.notes && <p className="text-xs text-gray-400 mt-1">{item.notes}</p>}
                                            {actionHandler && (
                                                <div className="mt-2 text-left">
                                                    <button onClick={actionHandler} className="text-xs font-semibold text-green-400 hover:text-green-300 flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-md border border-gray-600 hover:border-green-500 transition-colors">
                                                        <span>انجام بده</span>
                                                        <ArrowLeftIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">نشان‌های افتخار</h3>
                    {allAchievements.map(ach => {
                        const isUnlocked = user.unlockedAchievements?.includes(ach.id);
                        const actionInfo = getActionForAchievement(ach.id);
                        return (
                            <div key={ach.id} className={`bg-gray-800 p-4 rounded-lg border flex flex-col gap-4 ${isUnlocked ? 'border-yellow-400/50' : 'border-gray-700 opacity-80'}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`w-16 h-16 flex-shrink-0 ${isUnlocked ? 'text-yellow-400' : 'text-gray-500'}`}>
                                        {React.cloneElement(ach.icon as React.ReactElement<{ className?: string }>, { className: 'w-16 h-16' })}
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-white">{ach.name}</h4>
                                        <p className="text-sm text-gray-400 mt-1">{ach.description}</p>
                                    </div>
                                </div>
                                <div className="mt-auto text-left">
                                    {isUnlocked ? (
                                        <div className="flex items-center justify-end gap-1 text-xs text-green-400 font-bold">
                                            <CheckCircleIcon className="w-4 h-4" />
                                            <span>باز شده! (+{ach.points} امتیاز)</span>
                                        </div>
                                    ) : (
                                        actionInfo && (
                                            <button onClick={actionInfo.action} className="text-sm font-semibold text-green-400 hover:text-green-300 flex items-center gap-1">
                                                <span>{actionInfo.label}</span>
                                                <ArrowLeftIcon className="w-4 h-4" />
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GamificationTab;
