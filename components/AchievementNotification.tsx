

import React, { useEffect, useState } from 'react';
import { Achievement } from '../types.ts';
import { XIcon } from './icons.tsx';

interface AchievementNotificationProps {
    achievement: Achievement;
    show: boolean;
    onClose: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({ achievement, show, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                onClose();
            }, 5000); // Auto-close after 5 seconds
            return () => clearTimeout(timer);
        } else {
             const timer = setTimeout(() => {
                setIsVisible(false);
            }, 300); // Delay hiding for exit animation
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!isVisible) {
        return null;
    }
    
    const Icon = achievement.icon;

    return (
        <div 
            className={`fixed bottom-24 left-5 w-full max-w-sm z-70 transition-all duration-300 ease-in-out ${show ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}
        >
            <div className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl p-4 border-2 border-amber-400 dark:border-amber-600">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full ring-4 ring-amber-50 dark:ring-amber-800/20">
                        {/* FIX: Cast the icon prop to a React element that accepts a className to resolve the type error. */}
                        {React.cloneElement(achievement.icon as React.ReactElement<{ className?: string }>, { className: 'w-8 h-8 text-amber-500 dark:text-amber-400' })}
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-amber-800 dark:text-amber-200">دستاورد جدید!</h3>
                        <p className="text-sm font-semibold text-stone-700 dark:text-stone-200 mt-1">
                            {achievement.title}
                        </p>
                         <p className="text-xs text-stone-500 dark:text-stone-400">
                            {achievement.description}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AchievementNotification;
