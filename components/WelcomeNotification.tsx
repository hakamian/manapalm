
import React, { useEffect, useState } from 'react';
import { User } from '../types.ts';
import { getUserLevel } from '../utils/gamification.ts';
import { SparklesIcon, XIcon } from './icons.tsx';

interface WelcomeNotificationProps {
    user: User;
    show: boolean;
    onClose: () => void;
    type: 'new' | 'returning';
}

const WelcomeNotification: React.FC<WelcomeNotificationProps> = ({ user, show, onClose, type }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
        } else {
            // Delay hiding to allow for exit animation
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!isVisible) {
        return null;
    }

    const currentLevel = getUserLevel(user.points);

    const title = type === 'new' ? `خوش آمدید، ${user.name}!` : `سلام دوباره، ${user.name}!`;
    const description = type === 'new'
        ? "خوشحالیم که سفر قهرمانی خود را در نخلستان معنا آغاز کردید."
        : "خوشحالیم که برای ادامه سفر قهرمانی خود بازگشته‌اید.";

    return (
        <div 
            className={`fixed top-24 right-5 w-full max-w-sm z-70 transition-all duration-300 ease-in-out ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        >
            <div className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl p-4 border border-stone-200/80 dark:border-stone-700 flex items-start gap-4">
                <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
                    <SparklesIcon className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                </div>
                <div className="flex-grow">
                    <h3 className="font-bold text-amber-800 dark:text-amber-200">{title}</h3>
                    <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">
                        {description}
                    </p>
                    <div className="mt-3 text-xs flex items-center gap-4 text-stone-500 dark:text-stone-400">
                        <span>سطح: <span className="font-semibold">{currentLevel.name}</span></span>
                        <span>امتیاز: <span className="font-semibold">{user.points.toLocaleString('fa-IR')}</span></span>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default WelcomeNotification;