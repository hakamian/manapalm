
import React, { useState, useMemo } from 'react';
import { User, View, MIN_POINTS_FOR_MESSAGING } from '../../types';
import {
    FirstPlaceIcon, SecondPlaceIcon, ThirdPlaceIcon, EnvelopeIcon,
    TrophyIcon, SparklesIcon, HeartIcon, PalmTreeIcon, ArrowUpIcon
} from '../icons';
import { useAppDispatch } from '../../AppContext';
import { leaderboardService, LeaderboardCategory } from '../../services/application/leaderboardService';

interface LeaderboardTabProps {
    user: User;
    allUsers: User[];
}

const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ user, allUsers }) => {
    const dispatch = useAppDispatch();
    const [category, setCategory] = useState<LeaderboardCategory>('barkat');

    const leaderboard = useMemo(() => {
        return leaderboardService.getLeaderboard(allUsers, user, category);
    }, [allUsers, user, category]);

    const currentUserEntry = leaderboard.find(e => e.isCurrentUser);
    const userToBeat = currentUserEntry && currentUserEntry.rank > 1
        ? leaderboard[currentUserEntry.rank - 2]
        : null;

    const onStartConversation = (targetUserId: string) => {
        dispatch({ type: 'SET_VIEW', payload: View.DIRECT_MESSAGES });
    };

    const categories = [
        { id: 'barkat', label: 'برکت', icon: TrophyIcon, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { id: 'mana', label: 'مانا', icon: SparklesIcon, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
        { id: 'impact', label: 'تأثیر اجتماعی', icon: HeartIcon, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header and Category Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-800/50 p-6 rounded-3xl border border-gray-700">
                <div>
                    <h2 className="text-3xl font-black text-white mb-2">تابلوی قهرمانان</h2>
                    <p className="text-gray-400 text-sm">برترین یاوران و همراهان نخلستان در مسیر آگاهی و برکت</p>
                </div>

                <div className="flex p-1 bg-gray-900 rounded-2xl border border-gray-700">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id as LeaderboardCategory)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${category === cat.id
                                ? 'bg-gray-800 text-white shadow-lg border border-gray-600'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <cat.icon className={`w-4 h-4 ${category === cat.id ? cat.color : ''}`} />
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Current User Status Card */}
            {currentUserEntry && (
                <div className="relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                    <div className="relative bg-gray-800 p-6 rounded-3xl border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-500 blur-xl opacity-30 animate-pulse"></div>
                                <span className="relative z-10 flex items-center justify-center w-14 h-14 bg-gray-900 rounded-2xl border-2 border-green-500 text-2xl font-black text-green-400">
                                    {currentUserEntry.rank.toLocaleString('fa-IR')}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <img src={user.avatar || (user.id.charCodeAt(0) % 2 === 0 ? 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1766819369/manapalm/avatars/avatar-female.jpg' : 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1766819371/manapalm/avatars/avatar-male.jpg')} alt={user.fullName} className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-700" />
                                <div>
                                    <h3 className="text-xl font-bold text-white">رتبه شما در {categories.find(c => c.id === category)?.label}</h3>
                                    <p className="text-gray-400 text-sm mt-1">{user.fullName}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <div className="text-3xl font-black text-amber-400 flex items-center gap-2">
                                {currentUserEntry.score.toLocaleString('fa-IR')}
                                <span className="text-sm font-medium text-gray-500">امتیاز</span>
                            </div>
                            {userToBeat && (
                                <div className="flex items-center gap-2 text-xs bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-700">
                                    <ArrowUpIcon className="w-3 h-3 text-green-400" />
                                    <span className="text-gray-400">
                                        {(userToBeat.score - currentUserEntry.score + 1).toLocaleString('fa-IR')} امتیاز تا رسیدن به رتبه {userToBeat.rank.toLocaleString('fa-IR')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Full Leaderboard List */}
            <div className="grid grid-cols-1 gap-4">
                {leaderboard.map((entry) => {
                    if (entry.isCurrentUser) return null;

                    const { rank, user: member, score } = entry;
                    let rankStyles = "border-gray-800 bg-gray-800/30";
                    let rankIcon: React.ReactNode = null;

                    if (rank === 1) {
                        rankStyles = "border-amber-500/50 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]";
                        rankIcon = <FirstPlaceIcon className="w-8 h-8 text-amber-400" />;
                    } else if (rank === 2) {
                        rankStyles = "border-gray-400/50 bg-gray-400/5";
                        rankIcon = <SecondPlaceIcon className="w-8 h-8 text-gray-400" />;
                    } else if (rank === 3) {
                        rankStyles = "border-orange-500/50 bg-orange-500/5";
                        rankIcon = <ThirdPlaceIcon className="w-8 h-8 text-orange-500" />;
                    }

                    return (
                        <div
                            key={member.id}
                            className={`group flex items-center p-4 rounded-3xl border-2 transition-all duration-300 hover:scale-[1.01] hover:bg-gray-800/50 ${rankStyles}`}
                        >
                            <div className="w-16 flex-shrink-0 flex justify-center items-center font-black text-xl">
                                {rankIcon || <span className="text-gray-600">#{rank.toLocaleString('fa-IR')}</span>}
                            </div>

                            <div className="relative ml-4">
                                <img
                                    src={member.avatar || (member.id.charCodeAt(0) % 2 === 0 ? 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1766819369/manapalm/avatars/avatar-female.jpg' : 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1766819371/manapalm/avatars/avatar-male.jpg')}
                                    alt={member.fullName}
                                    className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-700 group-hover:border-gray-500 transition-colors"
                                />
                                {rank <= 3 && (
                                    <div className="absolute -top-1 -right-1 bg-gray-900 rounded-lg p-1 border border-gray-700">
                                        <TrophyIcon className="w-3 h-3 text-amber-500" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-grow mr-4">
                                <h4 className="font-bold text-lg text-white group-hover:text-amber-100 transition-colors">{member.fullName}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs bg-gray-900 px-2 py-0.5 rounded-md text-gray-400 border border-gray-700">{member.level}</span>
                                    {(member.timeline?.filter(e => e.type === 'palm_planted').length || 0) > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold">
                                            <PalmTreeIcon className="w-3 h-3" />
                                            <span>{member.timeline?.filter(e => e.type === 'palm_planted').length.toLocaleString('fa-IR')} نخل کاشته شده</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                {user.points >= MIN_POINTS_FOR_MESSAGING && (
                                    <button
                                        onClick={() => onStartConversation(member.id)}
                                        className="p-3 bg-gray-900/50 rounded-2xl text-gray-500 hover:text-white hover:bg-gray-800 border border-gray-700 transition-all"
                                        title="ارسال پیام"
                                    >
                                        <EnvelopeIcon className="w-5 h-5" />
                                    </button>
                                )}
                                <div className="text-right min-w-[100px]">
                                    <div className={`text-2xl font-black ${rank <= 3 ? 'text-amber-400' : 'text-gray-300'}`}>
                                        {score.toLocaleString('fa-IR')}
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                        {categories.find(c => c.id === category)?.label}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend / Info */}
            <div className="bg-gray-800/30 p-6 rounded-3xl border border-dashed border-gray-700 text-center">
                <p className="text-gray-500 text-xs leading-relaxed">
                    تابلوی قهرمانان به صورت لحظه‌ای آپدیت می‌شود. برای جابجایی در رتبه‌ها، فعالیت‌های خود را در بخش‌های اعلام شده افزایش دهید.
                    یاوران برتر هر ماه، پاداش‌های فیزیکی و معنوی ویژه‌ای دریافت خواهند کرد.
                </p>
            </div>
        </div>
    );
};

export default LeaderboardTab;
