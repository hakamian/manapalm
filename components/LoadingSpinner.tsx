'use client';

import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="relative">
                {/* 🌟 Animated Outer Ring */}
                <div className="w-24 h-24 rounded-full border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)] relative flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-t-2 border-amber-500 animate-spin"></div>

                    {/* 🥥 Inner Circle with Logo */}
                    <div className="w-20 h-20 bg-gradient-to-br from-stone-800 to-black rounded-full border border-stone-700 flex items-center justify-center overflow-hidden shadow-inner transform transition-transform duration-500 hover:scale-110">
                        <img
                            src="https://res.cloudinary.com/dk2x11rvs/image/upload/v1765131783/manapal-logo-3d_zpdvkd.png"
                            alt="Mana Palm"
                            className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                        />
                    </div>
                </div>

                {/* 💫 Subtle Glow Points */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping delay-700"></div>
            </div>

            <div className="mt-8 relative">
                <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-emerald-200 animate-pulse tracking-widest uppercase">
                    نخلستان معنا
                </p>
                <p className="mt-2 text-xs font-medium text-gray-500 tracking-[0.5em] uppercase opacity-75">
                    در حال بارگذاری...
                </p>
            </div>

            <style jsx>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default LoadingSpinner;
