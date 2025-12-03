
import React from 'react';
import { User, Order, View } from '../../types';
import { SproutIcon, SaplingIcon, UsersIcon, BadgeCheckIcon, SparklesIcon, ArrowLeftIcon } from '../icons';
import NextHeroicStep from '../NextHeroicStep';
import MeaningCompass from '../MeaningCompass';
import ArchitectJourney from '../ArchitectJourney';

interface DashboardTabProps {
    user: User;
    orders: Order[];
    onNavigateToTab: (tab: string) => void;
    onStartPlantingFlow: () => void;
    onNavigate: (view: View) => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ user, orders, onNavigateToTab, onStartPlantingFlow, onNavigate }) => {
    const achievements = [
        { id: 'profile_complete', label: 'پروفایل کامل', icon: <BadgeCheckIcon />, achieved: !!(user.fullName && user.email && user.avatar && user.description) },
        { id: 'first_palm', label: 'اولین نخل', icon: <SproutIcon />, achieved: orders.some(o => o.deeds && o.deeds.length > 0) },
        { id: 'level_sapling', label: 'سطح نهال', icon: <SaplingIcon />, achieved: user.points >= 500 },
        { id: 'first_friend', label: 'اولین معرف', icon: <UsersIcon />, achieved: (user.referralPointsEarned || 0) > 0 },
    ];

    const hasActiveProject = user.webDevProject && user.webDevProject.status !== 'none';

    return (
        <div className="space-y-8">
            
            {/* 1. Digital Architect Mission Control (Top Priority if active) */}
            {hasActiveProject && (
                <section className="animate-fade-in-down">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-400">
                        <SparklesIcon className="w-6 h-6" />
                        ماموریت ویژه: ساخت میراث دیجیتال
                    </h2>
                    <ArchitectJourney />
                </section>
            )}

            {/* 2. Next Heroic Step (Standard User Journey) */}
            {!hasActiveProject && (
                <NextHeroicStep user={user} orders={orders} onNavigateToTab={onNavigateToTab} onStartPlantingFlow={onStartPlantingFlow} onNavigate={onNavigate} />
            )}

            {/* 3. CTA for Digital Architect (If not active) */}
            {!hasActiveProject && (
                <div className="bg-gradient-to-r from-stone-800 to-stone-900 rounded-xl p-6 border border-stone-700/50 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-white">معمار میراث دیجیتال شوید</h3>
                        <p className="text-sm text-stone-400 mt-1">وب‌سایت حرفه‌ای خود را بسازید و ۹۰٪ هزینه آن را صرف اشتغال‌زایی کنید.</p>
                    </div>
                    <button 
                        onClick={() => onNavigate(View['digital-heritage-architect'])}
                        className="bg-stone-700 hover:bg-stone-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
                    >
                        شروع طراحی
                        <ArrowLeftIcon className="w-4 h-4"/>
                    </button>
                </div>
            )}

            {/* 4. Meaning Compass */}
            <MeaningCompass user={user} />

            {/* 5. Achievements Grid */}
            <div>
                <h3 className="text-xl font-semibold mb-4">دستاوردهای شما</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {achievements.map(ach => (
                        <div key={ach.id} className={`bg-gray-800 p-4 rounded-lg transition-opacity ${ach.achieved ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-12 h-12 mx-auto transition-colors ${ach.achieved ? 'text-yellow-400' : 'text-gray-500'}`}>{React.cloneElement(ach.icon as React.ReactElement<{ className?: string }>, {className: 'w-12 h-12'})}</div>
                            <p className="text-xs mt-2">{ach.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 6. Stats & Last Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">آخرین سفارش</h3>
                    {orders.length > 0 ? (
                        <>
                            <p>#{orders[orders.length - 1].id.slice(-6)}</p>
                            <p className="text-sm text-gray-400">{new Date(orders[orders.length - 1].date).toLocaleDateString('fa-IR')}</p>
                            <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full mt-2 inline-block">{orders[orders.length-1].status}</span>
                        </>
                    ) : <p className="text-gray-400">سفارشی ثبت نشده است.</p>}
                </div>
                <div className="bg-gray-800 p-6 rounded-lg grid grid-cols-2 gap-4">
                   <div className="text-center">
                        <p className="text-3xl font-bold text-green-300">{user.points.toLocaleString('fa-IR')}</p>
                        <p className="text-sm text-gray-400">امتیاز برکت</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-indigo-300">{(user.manaPoints || 0).toLocaleString('fa-IR')}</p>
                        <p className="text-sm text-gray-400">امتیاز معنا</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
