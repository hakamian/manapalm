
import React from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View, COMPANION_TRIAL_SECONDS } from '../types';
import { SparklesIcon, LockClosedIcon } from './icons';

const MeaningCompanionWidget: React.FC = () => {
    const { user, isBottomNavVisible } = useAppState();
    const dispatch = useAppDispatch();

    if (!user) return null;

    const trialSecondsUsed = user.companionTrialSecondsUsed || 0;
    const hasTrialTimeLeft = trialSecondsUsed < COMPANION_TRIAL_SECONDS;
    const hasUnlocked = user.hasUnlockedCompanion;

    const handleClick = () => {
        if (hasUnlocked) {
            dispatch({ type: 'SET_VIEW', payload: View.MeaningCompanion });
        } else if (hasTrialTimeLeft) {
            if (trialSecondsUsed === 0) {
                // First time user, show the intro modal
                dispatch({ type: 'SHOW_COMPANION_TRIAL_MODAL', payload: true });
            } else {
                // User has already started the trial, go straight to it
                dispatch({ type: 'SET_VIEW', payload: View.MeaningCompanion });
            }
        } else {
            // Trial is over
            dispatch({ type: 'SHOW_COMPANION_UNLOCK_MODAL', payload: true });
        }
    };

    return (
        <>
            <style>{`
                @keyframes companion-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(252, 211, 77, 0.5); }
                    70% { box-shadow: 0 0 0 15px rgba(252, 211, 77, 0); }
                }
                .animate-companion-pulse {
                    animation: companion-pulse 2.5s infinite;
                }
            `}</style>
            <button
                onClick={handleClick}
                className={`fixed ${isBottomNavVisible ? 'bottom-24' : 'bottom-5'} md:bottom-5 left-5 z-50 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 animate-companion-pulse transition-all duration-300`}
                aria-label={hasUnlocked ? "Open Meaning Companion" : "Unlock Meaning Companion"}
            >
                {hasUnlocked || (hasTrialTimeLeft && trialSecondsUsed > 0) ? (
                    <SparklesIcon className="w-6 h-6" />
                ) : (
                    <>
                        <LockClosedIcon className="w-6 h-6" />
                        {hasTrialTimeLeft && (
                            <span className="absolute -top-1 -right-2 text-xs bg-red-600 text-white font-semibold px-1.5 py-0.5 rounded-full">
                                آزمایشی
                            </span>
                        )}
                    </>
                )}
            </button>
        </>
    );
};

export default MeaningCompanionWidget;
