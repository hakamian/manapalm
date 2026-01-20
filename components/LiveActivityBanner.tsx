'use client';

import React from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View } from '../types';

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
            <div className="fixed top-0 left-0 right-0 z-[60] bg-black/80 backdrop-blur-md border-b border-white/5 shadow-sm text-white text-sm h-8 flex items-center overflow-hidden">
                <div className="w-full flex items-center justify-between h-full">
                    <div className="marquee-container flex-grow h-full overflow-hidden relative">
                        <div className="marquee-content absolute top-0 left-0 h-full flex items-center whitespace-nowrap">
                            {marqueeItems.map((activity, index) => (
                                <div key={`${activity.id}-${index}`} className="flex items-center mx-6">
                                    {/* FIX: Add type assertion for the icon prop to fix cloneElement error. */}
                                    {React.cloneElement(activity.icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5 ml-3 flex-shrink-0 opacity-80' })}
                                    <span className="opacity-90">{activity.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-shrink-0 pr-4 pl-6 h-full flex items-center">
                        <button
                            onClick={handleJoinClick}
                            className="bg-green-600/80 hover:bg-green-600 text-white font-bold py-1 px-4 rounded-full text-xs transition-all duration-300 transform hover:scale-105"
                        >
                            به ما بپیوندید
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LiveActivityBanner;