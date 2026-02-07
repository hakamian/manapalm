'use client';

import React from 'react';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]">
            {/* Background patterns */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative flex flex-col items-center">
                {/* Animated Logo/Icon Placeholder */}
                <div className="relative w-24 h-24 mb-8">
                    {/* Rotating outer ring */}
                    <div className="absolute inset-0 border-t-2 border-r-2 border-emerald-500/30 rounded-full animate-spin" style={{ animationDuration: '3s' }} />

                    {/* Inner pulsating glow */}
                    <div className="absolute inset-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full blur-sm opacity-50 animate-pulse" />

                    {/* Center icon (Palm-like SVG) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                            className="w-10 h-10 text-emerald-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707"
                            />
                            <circle cx="12" cy="12" r="3" strokeWidth={2} />
                        </svg>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="text-center">
                    <h2 className="text-xl font-medium text-white tracking-widest mb-2 animate-pulse">
                        نخلستان <span className="text-emerald-400">معنا</span>
                    </h2>
                    <div className="flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            </div>

            {/* Modern thin progress bar at top */}
            <div className="fixed top-0 left-0 w-full h-1 overflow-hidden bg-white/5">
                <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 w-full -translate-x-full animate-[progress_2s_infinite_linear]" />
            </div>

            <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    );
}
