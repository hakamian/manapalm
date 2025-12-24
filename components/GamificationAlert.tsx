
import React, { useEffect, useState } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { SparklesIcon, TrophyIcon, XMarkIcon } from './icons';

const GamificationAlert: React.FC = () => {
    const { gamificationAlerts } = useAppState();
    const dispatch = useAppDispatch();
    const [isVisible, setIsVisible] = useState(false);

    const currentAlert = gamificationAlerts[0];

    useEffect(() => {
        if (currentAlert) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                handleDismiss();
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [currentAlert]);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => {
            dispatch({ type: 'DISMISS_GAMIFICATION_ALERT' });
        }, 300);
    };

    if (!currentAlert) return null;

    const { type, data } = currentAlert;

    return (
        <div className={`fixed inset-x-0 top-20 z-[100] flex justify-center px-4 transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
            <div className="relative overflow-hidden bg-gray-900/90 backdrop-blur-xl border-2 border-amber-500/50 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.3)] p-6 max-w-md w-full border-b-[6px] border-b-amber-600">
                {/* Background Sparkles */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-amber-500 rounded-full blur-[60px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] animate-pulse delay-700"></div>
                </div>

                <div className="relative flex gap-5 items-start">
                    <div className={`flex-shrink-0 p-4 rounded-xl border-2 ${type === 'level_up' ? 'bg-amber-500/20 border-amber-500' : 'bg-indigo-500/20 border-indigo-500'} animate-bounce-slow`}>
                        {type === 'level_up' ? (
                            <TrophyIcon className="w-10 h-10 text-amber-400" />
                        ) : (
                            <SparklesIcon className="w-10 h-10 text-indigo-400" />
                        )}
                    </div>

                    <div className="flex-grow pt-1 text-right">
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                            {type === 'level_up' ? 'ارتقای سطح عالی!' : 'دستاورد جدید!'}
                        </h3>
                        <h4 className={`text-lg font-bold ${type === 'level_up' ? 'text-amber-400' : 'text-indigo-400'} mb-1`}>
                            {data.title}
                        </h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {data.description}
                        </p>

                        {(data.rewardBarkat || data.rewardMana) && (
                            <div className="mt-4 flex flex-wrap gap-2 justify-end">
                                {data.rewardBarkat && (
                                    <span className="bg-green-900/40 text-green-300 border border-green-700/50 px-3 py-1 rounded-full text-xs font-bold">
                                        + {data.rewardBarkat.toLocaleString('fa-IR')} برکت
                                    </span>
                                )}
                                {data.rewardMana && (
                                    <span className="bg-indigo-900/40 text-indigo-300 border border-indigo-700/50 px-3 py-1 rounded-full text-xs font-bold">
                                        + {data.rewardMana.toLocaleString('fa-IR')} مانا
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 p-2 text-gray-500 hover:text-white transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GamificationAlert;
