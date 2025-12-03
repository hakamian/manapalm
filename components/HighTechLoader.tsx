
import React, { useState, useEffect } from 'react';
import { SparklesIcon, BoltIcon, CpuChipIcon, GlobeIcon } from './icons';

interface HighTechLoaderProps {
    isVisible: boolean;
    isFinishing?: boolean; // New prop to signal API completion
    messages?: string[];
}

const DEFAULT_MESSAGES = [
    "در حال برقراری ارتباط امن با هسته مرکزی هوشمانا...",
    "فعال‌سازی موتورهای پردازش عصبی (Neural Engines)...",
    "بارگذاری مدل زبانی Gemini 3 Pro (Maximum Context)...",
    "تحلیل معنایی و استخراج الگوهای پنهان...",
    "بهینه‌سازی خروجی برای حداکثر کیفیت و سئو...",
    "تزریق خلاقیت و بازنویسی نهایی...",
    "تایید نهایی توسط ناظر هوشمند..."
];

const HighTechLoader: React.FC<HighTechLoaderProps> = ({ isVisible, isFinishing = false, messages = DEFAULT_MESSAGES }) => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [computePower, setComputePower] = useState(0);

    useEffect(() => {
        if (!isVisible) {
            setProgress(0);
            setCurrentMessageIndex(0);
            return;
        }

        if (isFinishing) {
            // Fast forward to 100%
            setProgress(100);
            return;
        }

        // Message cycling
        const msgInterval = setInterval(() => {
            setCurrentMessageIndex(prev => (prev + 1) % messages.length);
        }, 3000);

        // Progress bar simulation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                // Cap at 95% to wait for the actual response
                if (prev >= 95) return 95;
                
                // Optimal Speed: Not too fast (cheap), not too slow (boring)
                // Avg ~0.16% per 100ms => ~1.6% per sec => ~60s to 95%
                const increment = Math.random() * 0.2 + 0.06; 
                
                return prev + increment;
            });
        }, 100);

        // Compute Power Fluctuation (The "Hype" Factor)
        const powerInterval = setInterval(() => {
            setComputePower(Math.floor(Math.random() * 30) + 70); // 70% to 100%
        }, 150);

        return () => {
            clearInterval(msgInterval);
            clearInterval(progressInterval);
            clearInterval(powerInterval);
        };
    }, [isVisible, isFinishing, messages]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-[#050505]/95 backdrop-blur-xl flex flex-col items-center justify-center text-white overflow-hidden">
            <style>{`
                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
                .scanline {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(to bottom, transparent, rgba(16, 185, 129, 0.1), transparent);
                    animation: scanline 3s linear infinite;
                    pointer-events: none;
                }
                @keyframes rotate-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes rotate-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                .glow-text {
                    text-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
                }
            `}</style>

            {/* Background Scanline Effect */}
            <div className="scanline"></div>

            {/* Central Core Animation */}
            <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
                {/* Outer Ring */}
                <div className="absolute inset-0 border-2 border-dashed border-emerald-500/30 rounded-full w-full h-full animate-[rotate-slow_10s_linear_infinite]"></div>
                {/* Middle Ring */}
                <div className="absolute inset-4 border-2 border-dashed border-blue-500/30 rounded-full w-56 h-56 animate-[rotate-reverse_7s_linear_infinite]"></div>
                {/* Inner Glow */}
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
                
                {/* Center Logo/Icon */}
                <div className="relative z-10 bg-black/50 p-6 rounded-full border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                    <CpuChipIcon className="w-16 h-16 text-emerald-400 animate-pulse" />
                </div>

                {/* Orbiting Particles */}
                <div className="absolute w-full h-full animate-[rotate-slow_4s_linear_infinite]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                </div>
            </div>

            {/* Text & Status */}
            <div className="text-center max-w-2xl px-6 relative z-10 space-y-6">
                <div>
                    <h2 className="text-3xl md:text-5xl font-black mb-2 tracking-tighter">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 glow-text">
                            HOSHMANA CORE v9.0
                        </span>
                    </h2>
                    <p className="text-stone-400 text-sm tracking-widest uppercase">Quantum Processing Unit • Active</p>
                </div>

                <div className="h-16 flex items-center justify-center">
                    <p className="text-xl md:text-2xl text-white font-bold animate-fade-in min-h-[2rem]">
                        {isFinishing ? "تقریباً آماده است..." : messages[currentMessageIndex]}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-stone-800/50 rounded-full h-4 border border-stone-700 overflow-hidden relative">
                    <div 
                        className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-cyan-400 relative"
                        style={{ width: `${progress}%`, transition: isFinishing ? 'width 0.5s ease-out' : 'width 0.1s linear' }}
                    >
                        <div className="absolute inset-0 bg-white/30 w-full h-full animate-[scanline_1s_linear_infinite] opacity-30" style={{ transform: 'skewX(-20deg)' }}></div>
                    </div>
                </div>
                
                {/* System Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mt-8 text-xs font-mono text-emerald-500/80">
                    <div className="bg-black/40 border border-emerald-500/20 p-3 rounded-lg">
                        <p className="text-stone-500 mb-1">COMPUTE POWER</p>
                        <div className="flex items-end gap-1 justify-center h-8">
                            {[...Array(5)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="w-2 bg-emerald-500 transition-all duration-100"
                                    style={{ height: `${Math.random() * computePower}%`, opacity: 0.5 + (i * 0.1) }}
                                ></div>
                            ))}
                        </div>
                        <p className="mt-1 text-white">{computePower}%</p>
                    </div>
                    <div className="bg-black/40 border border-emerald-500/20 p-3 rounded-lg">
                        <p className="text-stone-500 mb-1">LATENCY</p>
                        <p className="text-2xl text-white font-bold mt-2">12<span className="text-sm text-stone-500">ms</span></p>
                    </div>
                    <div className="bg-black/40 border border-emerald-500/20 p-3 rounded-lg">
                        <p className="text-stone-500 mb-1">MODEL</p>
                        <div className="flex items-center justify-center gap-1 mt-2">
                            <BoltIcon className="w-4 h-4 text-yellow-400" />
                            <span className="text-white font-bold">GEMINI PRO</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HighTechLoader;
