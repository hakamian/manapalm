

import React, { useEffect, useState } from 'react';
import { SparklesIcon, XIcon } from './icons.tsx';
import { User, UserLevel } from '../types.ts';
import { getUserLevel, userLevels } from '../utils/gamification.ts';


interface PointsNotificationProps {
    notification: {
        points: number;
        message: string;
        userBefore: User;
    };
    currentUser: User;
    show: boolean;
    onClose: () => void;
}

const PointsNotification: React.FC<PointsNotificationProps> = ({ notification, currentUser, show, onClose }) => {
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
    
    const { points, message, userBefore } = notification;

    const levelBefore = getUserLevel(userBefore.points);
    const levelAfter = getUserLevel(currentUser.points);
    const didLevelUp = levelBefore.level < levelAfter.level;

    const getProgress = (userPoints: number, currentLevel: UserLevel): number => {
        const nextLevel = userLevels.find(l => l.level === currentLevel.level + 1);
        if (!nextLevel) return 100;
        const pointsInLevel = userPoints - currentLevel.pointsThreshold;
        const levelTotalPoints = nextLevel.pointsThreshold - currentLevel.pointsThreshold;
        if (levelTotalPoints <= 0) return 100;
        return Math.max(0, Math.min(100, (pointsInLevel / levelTotalPoints) * 100));
    };

    const initialProgress = getProgress(userBefore.points, levelBefore);
    const finalProgress = getProgress(currentUser.points, levelAfter);
    
    const [animatedProgress, setAnimatedProgress] = useState(initialProgress);

    useEffect(() => {
        if (show) {
            setAnimatedProgress(initialProgress);
            const timer = setTimeout(() => {
                setAnimatedProgress(finalProgress);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [show, finalProgress, initialProgress]);

    const CurrentLevelIcon = levelAfter.icon;
    const nextLevelForDisplay = userLevels.find(l => l.level === levelAfter.level + 1);

    if (!isVisible) {
        return null;
    }

    return (
        <div 
            className={`fixed bottom-24 right-5 w-full max-w-sm z-70 transition-all duration-300 ease-in-out ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}
        >
            <div className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl p-4 border border-green-300/80 dark:border-green-700/80">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                        <SparklesIcon className="w-6 h-6 text-green-500 dark:text-green-400" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-green-800 dark:text-green-200">{message}</h3>
                        <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">
                            شما <span className="font-bold text-green-600 dark:text-green-300">{points.toLocaleString('fa-IR')}</span> امتیاز جدید کسب کردید!
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-4 pt-3 border-t border-green-200/50 dark:border-green-800/50">
                    {didLevelUp && (
                        <p className="text-center font-bold text-lg text-amber-500 animate-pulse mb-2">سطح شما ارتقا یافت!</p>
                    )}
                    <div className="flex items-center gap-3 mb-1">
                        <CurrentLevelIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                        <div>
                            <p className="font-bold text-stone-700 dark:text-stone-200">{levelAfter.name}</p>
                             {nextLevelForDisplay ? (
                                <p className="text-xs text-stone-500 dark:text-stone-400">
                                    {currentUser.points.toLocaleString('fa-IR')} / {nextLevelForDisplay.pointsThreshold.toLocaleString('fa-IR')} امتیاز
                                </p>
                            ) : (
                                <p className="text-xs text-stone-500 dark:text-stone-400">شما در بالاترین سطح هستید!</p>
                            )}
                        </div>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${animatedProgress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PointsNotification;