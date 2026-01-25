
import React, { useState } from 'react';
import { User, View } from '../../types';
import { SproutIcon, LeafIcon, SunIcon, ArrowLeftIcon, CheckCircleIcon, FirstPalmBadgeIcon, CommunityContributorBadgeIcon, PathfinderBadgeIcon, LoyalMemberBadgeIcon, UserCircleIcon, SaplingIcon, SparklesIcon, TrophyIcon, StarIcon, HandshakeIcon, FireIcon, UsersIcon, GlobeIcon, BoltIcon } from '../icons';
import { getNextLevelInfo, getLevelForPoints, POINT_ALLOCATIONS } from '../../services/gamificationService';
import { ACHIEVEMENTS } from '../../services/domain/achievements';
import { useAppDispatch } from '../../AppContext';
import PointsDashboard from './PointsDashboard';
import { commerceService } from '../../services/application/commerceService';

interface GamificationTabProps {
    user: User;
    animatedBarkatProgress: number;
    animatedManaProgress: number;
    onNavigate: (view: View) => void;
    setActiveTab: (tab: string) => void;
    onStartPlantingFlow: () => void;
}

const legendaryPerks = [
    { title: "دعوت به رویداد سالانه", desc: "حضور VIP در جشن برداشت خرما و دیدار با بنیان‌گذاران.", icon: <StarIcon />, minLevel: "درخت تنومند" },
    { title: "حق رأی در شورا", desc: "مشارکت در تصمیم‌گیری‌های کلان نخلستان.", icon: <HandshakeIcon />, minLevel: "استاد کهنسال" },
    { title: "سهامداری معنوی", desc: "دریافت گزارش شفاف سود و تخصیص بخشی از آن به نیت شما.", icon: <TrophyIcon />, minLevel: "استاد کهنسال" },
];

// --- New Battle Component ---
const ActiveChallengeCard: React.FC<{
    title: string;
    description: string;
    target: number;
    current: number;
    timeLeft: string;
    reward: string;
    icon: React.FC<any>;
    color: string;
    onJoin: () => void;
}> = ({ title, description, target, current, timeLeft, reward, icon: Icon, color, onJoin }) => {
    const progress = Math.min(100, (current / target) * 100);

    return (
        <div className={`relative bg-gray-800 rounded-2xl border-2 border-${color}-500/30 overflow-hidden shadow-lg group hover:border-${color}-500 transition-all`}>
            <div className={`absolute top-0 right-0 p-3 bg-${color}-500/20 rounded-bl-2xl text-${color}-400`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="p-6">
                <h4 className="text-lg font-bold text-white mb-2 pr-10">{title}</h4>
                <p className="text-sm text-stone-400 mb-4">{description}</p>

                <div className="flex justify-between text-xs text-stone-300 mb-1">
                    <span>پیشرفت جمعی</span>
                    <span>{current.toLocaleString('fa-IR')} / {target.toLocaleString('fa-IR')}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                    <div className={`bg-${color}-500 h-2 rounded-full transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
                </div>

                <div className="flex justify-between items-center mt-4 border-t border-gray-700 pt-4">
                    <div className="text-xs">
                        <span className="block text-stone-500">زمان باقی‌مانده:</span>
                        <span className="text-white font-bold">{timeLeft}</span>
                    </div>
                    <div className="text-xs text-right">
                        <span className="block text-stone-500">جایزه:</span>
                        <span className="text-yellow-400 font-bold">{reward}</span>
                    </div>
                </div>
                <button onClick={onJoin} className={`w-full mt-4 bg-${color}-600 hover:bg-${color}-500 text-white font-bold py-2 rounded-lg transition-colors`}>
                    ورود به نبرد
                </button>
            </div>
        </div>
    );
};

const GamificationTab: React.FC<GamificationTabProps> = ({ user, animatedBarkatProgress, animatedManaProgress, onNavigate, setActiveTab, onStartPlantingFlow }) => {
    const [activeSection, setActiveSection] = useState<'status' | 'battles'>('status');
    const [pointsLedger, setPointsLedger] = useState<any[]>([]);
    const nextLevelInfo = getNextLevelInfo(user.points, user.manaPoints || 0);
    const currentLevel = getLevelForPoints(user.points, user.manaPoints || 0);

    React.useEffect(() => {
        if (user?.id) {
            commerceService.getPointsLedger(user.id).then(setPointsLedger);
        }
    }, [user?.id]);

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
        if (actionText.includes('تکمیل اطلاعات')) return () => setActiveTab('profile');
        if (actionText.includes('ثبت‌نام') || actionText.includes('ورود')) return null;
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
        <div className="space-y-8 animate-fade-in">
            {/* Tab Switcher for Gamification sub-sections */}
            <div className="flex justify-center mb-6">
                <div className="bg-gray-800 p-1 rounded-xl flex shadow-lg border border-gray-700">
                    <button
                        onClick={() => setActiveSection('status')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeSection === 'status' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        <TrophyIcon className="w-4 h-4" /> وضعیت من
                    </button>
                    <button
                        onClick={() => setActiveSection('battles')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeSection === 'battles' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        <FireIcon className="w-4 h-4" /> نبردها و چالش‌ها
                    </button>
                </div>
            </div>

            {activeSection === 'status' && (
                <>
                    {/* Points Dashboard */}
                    <PointsDashboard user={user} pointsLedger={pointsLedger} />

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
                    </div>

                    <div className="bg-gradient-to-b from-amber-900/20 to-gray-800 border border-amber-500/30 p-6 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-xl font-bold text-amber-400 mb-6 flex items-center gap-2">
                            <TrophyIcon className="w-6 h-6" /> تالار جاودانگی (جوایز سطح بالا)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {legendaryPerks.map((perk, index) => {
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
                            {ACHIEVEMENTS.map(ach => {
                                const isUnlocked = user.unlockedAchievements?.includes(ach.id);
                                const actionInfo = getActionForAchievement(ach.id);
                                return (
                                    <div key={ach.id} className={`bg-gray-800 p-4 rounded-lg border flex flex-col gap-4 ${isUnlocked ? 'border-yellow-400/50' : 'border-gray-700 opacity-80'}`}>
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-gray-700 ${isUnlocked ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-500'}`}>
                                                <TrophyIcon className="w-8 h-8" />
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="font-bold text-white">{ach.title}</h4>
                                                <p className="text-sm text-gray-400 mt-1">{ach.description}</p>
                                            </div>
                                        </div>
                                        <div className="mt-auto text-left">
                                            {isUnlocked ? (
                                                <div className="flex items-center justify-end gap-1 text-xs text-green-400 font-bold">
                                                    <CheckCircleIcon className="w-4 h-4" />
                                                    <span>باز شده! (+{ach.rewardBarkat || ach.rewardMana} امتیاز)</span>
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
                </>
            )}

            {activeSection === 'battles' && (
                <div className="animate-fade-in-up">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">میدان نبرد و چالش‌ها</h2>
                        <p className="text-stone-400 mt-2">با دوستان خود رقابت کنید و برای اهداف بزرگتر بجنگید.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ActiveChallengeCard
                            title="نبرد کاهش CO2"
                            description="رقابت برای کاشت بیشترین نخل در یک هفته و نجات زمین."
                            target={100}
                            current={45}
                            timeLeft="۳ روز"
                            reward="نشان «محافظ زمین» + ۵۰۰۰ امتیاز"
                            icon={GlobeIcon}
                            color="green"
                            onJoin={() => alert('به نبرد پیوستید!')}
                        />
                        <ActiveChallengeCard
                            title="چالش سحرخیزی"
                            description="ثبت تامل روزانه قبل از ساعت ۸ صبح برای ۷ روز متوالی."
                            target={7}
                            current={2}
                            timeLeft="۵ روز"
                            reward="بسته مدیتیشن ویژه"
                            icon={SunIcon}
                            color="amber"
                            onJoin={() => onNavigate(View.DailyOasis)}
                        />
                        <ActiveChallengeCard
                            title="ماراتن یادگیری"
                            description="تکمیل ۳ درس از آکادمی زبان یا بیزینس در ۴۸ ساعت."
                            target={3}
                            current={0}
                            timeLeft="۴۸ ساعت"
                            reward="کوپن تخفیف ۵۰٪"
                            icon={BoltIcon}
                            color="blue"
                            onJoin={() => onNavigate(View.Courses)}
                        />
                        <ActiveChallengeCard
                            title="دعوت دوستان"
                            description="دعوت از ۳ دوست جدید به پلتفرم."
                            target={3}
                            current={1}
                            timeLeft="۱۰ روز"
                            reward="۱۵۰۰ امتیاز برکت"
                            icon={UsersIcon}
                            color="purple"
                            onJoin={() => setActiveTab('referral')}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GamificationTab;
