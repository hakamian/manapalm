
import React, { useState, useEffect } from 'react';
import { TreasureIcon, OpenTreasureIcon, SparklesBurstIcon, XMarkIcon, TrophyIcon, SparklesIcon } from './icons';
import { DailyChestReward } from '../types';
import { calculateDailyChestReward } from '../services/gamificationService';
import { useAppDispatch, useAppState } from '../AppContext';

interface DailyMysteryChestProps {
    streak: number;
    onClaim: (reward: DailyChestReward) => void;
}

const DailyMysteryChest: React.FC<DailyMysteryChestProps> = ({ streak, onClaim }) => {
    const { isBottomNavVisible } = useAppState();
    const [isOpen, setIsOpen] = useState(false); // Is modal open?
    const [isChestOpened, setIsChestOpened] = useState(false); // Is chest animation done?
    const [isShaking, setIsShaking] = useState(false);
    const [reward, setReward] = useState<DailyChestReward | null>(null);

    // Determine reward when modal opens, but don't show yet
    useEffect(() => {
        if (isOpen && !reward) {
            setReward(calculateDailyChestReward(streak));
        }
    }, [isOpen, streak, reward]);

    const handleChestClick = () => {
        if (isChestOpened) return;
        
        setIsShaking(true);
        
        // Simulate opening delay
        setTimeout(() => {
            setIsShaking(false);
            setIsChestOpened(true);
        }, 800); // 0.8s shake animation
    };

    const handleClaim = () => {
        if (reward) {
            onClaim(reward);
            setIsOpen(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className={`fixed ${isBottomNavVisible ? 'bottom-40' : 'bottom-20'} md:bottom-24 left-5 z-50 bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-full shadow-lg shadow-amber-500/40 transition-all duration-300 transform hover:scale-110 flex items-center justify-center group animate-bounce-slow`}
                title="صندوقچه راز روزانه"
            >
                <TreasureIcon className="w-8 h-8 text-white" />
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-gray-900">
                    {streak > 0 ? `${streak}🔥` : 'جایزه'}
                </span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-sm mx-auto p-6 text-center">
                {/* Close Button (only before opening to prevent accidental closing during reward) */}
                {!isChestOpened && (
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="absolute top-4 right-4 text-white/50 hover:text-white"
                    >
                        <XMarkIcon className="w-8 h-8" />
                    </button>
                )}

                {!isChestOpened ? (
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-bold text-amber-400 mb-2 drop-shadow-lg">صندوقچه راز امروز</h2>
                        <p className="text-gray-300 mb-8">روی صندوقچه ضربه بزنید تا باز شود!</p>
                        
                        <button 
                            onClick={handleChestClick}
                            className={`relative transition-transform ${isShaking ? 'animate-shake' : 'hover:scale-105'}`}
                        >
                            <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full"></div>
                            <TreasureIcon className="w-48 h-48 text-amber-400 drop-shadow-2xl relative z-10" />
                        </button>
                        
                        {streak > 0 && (
                            <div className="mt-8 bg-gray-800/80 px-4 py-2 rounded-full border border-amber-500/30">
                                <p className="text-sm text-amber-200 font-semibold">
                                    زنجیره فعلی: <span className="text-white font-bold text-lg">{streak} روز</span> 🔥
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center animate-scale-in">
                        {/* Reward Reveal */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full animate-pulse"></div>
                            <SparklesBurstIcon className="w-64 h-64 text-yellow-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow opacity-50" />
                            <OpenTreasureIcon className="w-40 h-40 text-amber-400 relative z-10" />
                        </div>

                        {reward && (
                            <div className="bg-gray-800/90 border-2 border-amber-500/50 p-6 rounded-2xl shadow-2xl w-full relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500"></div>
                                
                                <h3 className="text-2xl font-bold text-white mb-1">{reward.message}</h3>
                                
                                <div className="flex items-center justify-center gap-3 my-4">
                                    {reward.type === 'mana' ? (
                                        <SparklesIcon className="w-10 h-10 text-indigo-400" />
                                    ) : (
                                        <TrophyIcon className="w-10 h-10 text-yellow-400" />
                                    )}
                                    <span className={`text-4xl font-black ${reward.type === 'mana' ? 'text-indigo-300' : 'text-yellow-300'}`}>
                                        +{reward.amount}
                                    </span>
                                </div>

                                {reward.bonusMultiplier && reward.bonusMultiplier > 1 && (
                                    <p className="text-xs text-green-400 mb-4 font-bold bg-green-900/30 py-1 px-3 rounded-full inline-block">
                                        شامل {((reward.bonusMultiplier - 1) * 100).toFixed(0)}% پاداش تداوم!
                                    </p>
                                )}

                                <button 
                                    onClick={handleClaim}
                                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg transition-transform transform hover:scale-105 active:scale-95"
                                >
                                    دریافت جایزه
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes shake {
                    0% { transform: translate(1px, 1px) rotate(0deg); }
                    10% { transform: translate(-1px, -2px) rotate(-1deg); }
                    20% { transform: translate(-3px, 0px) rotate(1deg); }
                    30% { transform: translate(3px, 2px) rotate(0deg); }
                    40% { transform: translate(1px, -1px) rotate(1deg); }
                    50% { transform: translate(-1px, 2px) rotate(-1deg); }
                    60% { transform: translate(-3px, 1px) rotate(0deg); }
                    70% { transform: translate(3px, 1px) rotate(-1deg); }
                    80% { transform: translate(-1px, -1px) rotate(1deg); }
                    90% { transform: translate(1px, 2px) rotate(0deg); }
                    100% { transform: translate(1px, -2px) rotate(-1deg); }
                }
                .animate-shake {
                    animation: shake 0.5s;
                    animation-iteration-count: infinite;
                }
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
                @keyframes spin {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }
                .animate-bounce-slow {
                    animation: bounce 3s infinite;
                }
            `}</style>
        </div>
    );
};

export default DailyMysteryChest;
