
import React from 'react';
import { User, Page, View, MIN_POINTS_FOR_MESSAGING } from '../../types';
import { AwardIcon, HeartIcon, PaperAirplaneIcon } from '../icons';

interface HeroCardProps {
    hero: { user: User; weeklyPoints: number };
    rank: number;
    currentUser: User | null;
    onAppreciate: (userId: string, userName: string) => void;
    onMessage: (page: Page) => void;
    onLogin: () => void;
    appreciated: boolean;
}

const HeroCard: React.FC<HeroCardProps> = ({ hero, rank, currentUser, onAppreciate, onMessage, onLogin, appreciated }) => {
    const { user, weeklyPoints } = hero;
    const rankStyles = [
        { ring: 'ring-amber-400', glow: 'shadow-[0_0_20px_theme(colors.amber.400)]', medal: 'text-amber-400' }, // Gold
        { ring: 'ring-slate-300', glow: 'shadow-[0_0_20px_theme(colors.slate.300)]', medal: 'text-slate-300' }, // Silver
        { ring: 'ring-amber-600', glow: 'shadow-[0_0_20px_theme(colors.amber.600)]', medal: 'text-amber-600' }, // Bronze
    ];
    const style = rankStyles[rank - 1];

    const isOwnCard = currentUser?.id === user.id;
    const canSendMessage = currentUser && !isOwnCard && currentUser.points >= MIN_POINTS_FOR_MESSAGING && user.allowDirectMessages;
    let messageTooltip = '';
    if (!currentUser) {
        messageTooltip = 'برای ارسال پیام وارد شوید.';
    } else if (isOwnCard) {
        // No tooltip needed
    } else {
        if (!user.allowDirectMessages) messageTooltip = 'این کاربر اجازه دریافت پیام را نداده است.';
        else if (currentUser.points < MIN_POINTS_FOR_MESSAGING) messageTooltip = `برای ارسال پیام به ${MIN_POINTS_FOR_MESSAGING} امتیاز نیاز دارید.`;
    }

    const handleInteraction = (action: () => void) => {
        if (!currentUser) {
            onLogin();
        } else {
            action();
        }
    };

    return (
        <div className={`group relative bg-stone-800/30 dark:bg-stone-900/50 p-6 rounded-2xl text-center flex flex-col items-center transition-all duration-300 border border-stone-700/50 hover:border-amber-500/30 ${rank === 1 ? 'md:-translate-y-6' : ''}`}>
            <div className={`absolute -top-4 right-4 flex items-center gap-1 font-bold ${style.medal}`}>
                <AwardIcon className="w-6 h-6" />
                <span>{['اول', 'دوم', 'سوم'][rank-1]}</span>
            </div>
            <img src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className={`w-24 h-24 rounded-full object-cover ring-4 ${style.ring} ${style.glow}`} />
            <h4 className="font-bold text-lg mt-4 text-white">{user.name}</h4>
            <p className="text-sm font-semibold text-amber-300">{weeklyPoints.toLocaleString('fa-IR')} امتیاز در این هفته</p>
            <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => handleInteraction(() => onAppreciate(user.id, user.name))}
                    disabled={isOwnCard || appreciated}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold bg-white text-stone-800 hover:bg-red-100 dark:hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <HeartIcon className={`w-5 h-5 transition-colors ${appreciated ? 'text-red-500 fill-red-500' : 'text-stone-600'}`} />
                    {appreciated ? 'تقدیر شد' : 'تقدیر'}
                </button>
                <button
                    onClick={() => handleInteraction(() => onMessage(View.DIRECT_MESSAGES))}
                    disabled={currentUser ? !canSendMessage : false}
                    title={messageTooltip}
                    className="group/button flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold bg-white text-stone-800 hover:bg-sky-100 dark:hover:bg-stone-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <PaperAirplaneIcon className="w-5 h-5 text-stone-600 transition-transform group-hover/button:rotate-12" />
                    پیام
                </button>
            </div>
        </div>
    );
};

export default HeroCard;
