'use client';

import React from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View, LiveActivity } from '../types';
import * as Icons from './icons';

const LiveActivityBanner: React.FC = () => {
    const { user, liveActivities } = useAppState();
    const dispatch = useAppDispatch();

    const handleJoinClick = () => {
        if (user) {
            dispatch({ type: 'SET_VIEW', payload: View.HallOfHeritage });
        } else {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
        }
    };

    if (!liveActivities || liveActivities.length === 0) {
        return null;
    }

    // Duplicate activities to create a seamless loop
    const marqueeItems = [...liveActivities, ...liveActivities];

    return (
        <>
            <style>{`
                .marquee-container {
                    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                }
                .marquee-content {
                    animation: marquee 40s linear infinite;
                }
                .marquee-container:hover .marquee-content {
                    animation-play-state: paused;
                }
                @keyframes marquee {
                    from { transform: translateX(-50%); }
                    to { transform: translateX(0); }
                }
                `}
            </style>
            <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-emerald-900/90 via-black/80 to-emerald-900/90 backdrop-blur-xl border-b border-white/10 shadow-lg text-white text-[11px] md:text-sm h-10 flex items-center overflow-hidden">
                <div className="w-full flex items-center justify-between h-full">
                    <div className="marquee-container flex-grow h-full overflow-hidden relative">
                        <div className="marquee-content absolute top-0 left-0 h-full flex items-center whitespace-nowrap">
                            {marqueeItems.map((activity: LiveActivity, index) => {
                                // Resolve icon component from name
                                const IconComponent = (Icons as any)[activity.iconName] || Icons.SparklesIcon;

                                return (
                                    <div key={`${activity.id}-${index}`} className="flex items-center mx-8">
                                        <div className="flex items-center gap-3">
                                            <IconComponent className="w-4 h-4 text-emerald-400" />
                                            <span className="font-medium text-emerald-50/90 tracking-wide">{activity.text}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex-shrink-0 pr-4 pl-6 h-full flex items-center">
                        <button
                            onClick={handleJoinClick}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black py-1 px-4 rounded-full text-[10px] uppercase transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        >
                            هم‌پیوند شوید
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LiveActivityBanner;