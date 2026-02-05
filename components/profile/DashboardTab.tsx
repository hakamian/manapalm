
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

            {/* TEMPORARILY HIDDEN: Digital Architect CTA - Uncomment after payment gateway approval
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
            */}

            {/* 4. Meaning Compass */}
            <MeaningCompass user={user} />

            {/* 5. Achievements Grid */}
            <div>
                <h3 className="text-xl font-semibold mb-4">دستاوردهای شما</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {achievements.map(ach => (
                        <div key={ach.id} className={`bg-gray-800 p-4 rounded-lg transition-opacity ${ach.achieved ? 'opacity-100' : 'opacity-40'}`}>
                            <div className={`w-12 h-12 mx-auto transition-colors ${ach.achieved ? 'text-yellow-400' : 'text-gray-500'}`}>{React.cloneElement(ach.icon as React.ReactElement<{ className?: string }>, { className: 'w-12 h-12' })}</div>
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
                            <p>#{orders[orders.length - 1].id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-400">{new Date(orders[orders.length - 1].createdAt || orders[orders.length - 1].date || new Date().toISOString()).toLocaleDateString('fa-IR')}</p>
                            <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full mt-2 inline-block">{orders[orders.length - 1].status}</span>
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

            {/* 7. New Sections Summary (Addresses, Messages, Recent) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Messages Summary */}
                <div onClick={() => onNavigateToTab('messages')} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700 hover:border-green-500/50 group">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-700 p-2 rounded-full text-blue-400 group-hover:bg-blue-900/30 group-hover:text-blue-300 transition-colors">
                            {/* We need to import EnvelopeIcon, let's assume it's passed or available. DashboardTab doesn't import it yet. */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                                <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-lg">{user.messages?.filter(m => !m.isRead).length || 0}</p>
                            <p className="text-xs text-gray-400">پیام خوانده نشده</p>
                        </div>
                    </div>
                    <ArrowLeftIcon className="w-4 h-4 text-gray-500 group-hover:text-white" />
                </div>

                {/* Addresses Summary */}
                <div onClick={() => onNavigateToTab('addresses')} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700 hover:border-green-500/50 group">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-700 p-2 rounded-full text-amber-400 group-hover:bg-amber-900/30 group-hover:text-amber-300 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-lg">{user.addresses?.length || 0}</p>
                            <p className="text-xs text-gray-400">آدرس ثبت شده</p>
                        </div>
                    </div>
                    <ArrowLeftIcon className="w-4 h-4 text-gray-500 group-hover:text-white" />
                </div>

                {/* Recent Views Summary */}
                <div onClick={() => onNavigateToTab('recent-views')} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700 hover:border-green-500/50 group">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-700 p-2 rounded-full text-purple-400 group-hover:bg-purple-900/30 group-hover:text-purple-300 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                                <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-lg">{user.recentViews?.length || 0}</p>
                            <p className="text-xs text-gray-400">بازدید اخیر</p>
                        </div>
                    </div>
                    <ArrowLeftIcon className="w-4 h-4 text-gray-500 group-hover:text-white" />
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
