
import React from 'react';
import { Deed } from '../types';
import { useAppDispatch } from '../AppContext';
import { ClockForwardIcon, MicrophoneIcon } from './icons';

const SubtlePalmWatermark = () => (
    <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full object-contain z-0 opacity-[0.03] text-stone-900 dark:text-white" aria-hidden="true" style={{ transform: 'scale(1.5)' }}>
        <path d="M 50 150 C 52 100, 48 50, 50 30 L 50 30 C 52 50, 48 100, 50 150" fill="currentColor"/>
        <g transform="translate(50, 35)" fill="currentColor">
            <path d="M 0 0 C 30 -25, 60 -15, 70 10" transform="rotate(-30)" /><path d="M 0 0 C 35 -20, 65 -10, 75 15" transform="rotate(0)" /><path d="M 0 0 C 30 -15, 55 0, 65 20" transform="rotate(30)" /><path d="M 0 0 C -30 -25, -60 -15, -70 10" transform="rotate(210)" /><path d="M 0 0 C -35 -20, -65 -10, -75 15" transform="rotate(180)" /><path d="M 0 0 C -30 -15, -55 0, -65 20" transform="rotate(150)" />
        </g>
    </svg>
);

const ModernSealIcon = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" className="w-24 h-24 text-amber-800/80 dark:text-amber-300/80" aria-hidden="true">
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" fill="none" />
        <text x="50" y="30" fontFamily="Vazirmatn, sans-serif" fontSize="10" fill="currentColor" textAnchor="middle">نخلستان معنا</text>
        <path d="M50 60 C 51 50, 49 40, 50 45 L 50 45 C 51 50, 49 50, 50 60" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <g transform="translate(50, 48)" stroke="currentColor" strokeWidth="1" fill="none">
             <path d="M 0 0 C 8 -7, 16 -4, 20 2" transform="rotate(-20) scale(0.6)" />
             <path d="M 0 0 C 10 -5, 18 -2, 22 4" transform="rotate(10) scale(0.6)" />
             <path d="M 0 0 C -8 -7, -16 -4, -20 2" transform="rotate(20) scale(0.6)" />
             <path d="M 0 0 C -10 -5, -18 -2, -22 4" transform="rotate(-10) scale(0.6)" />
        </g>
         <text x="50" y="78" fontFamily="Vazirmatn, sans-serif" fontSize="10" fill="currentColor" textAnchor="middle">تاسیس ۱۴۰۳</text>
    </svg>
);

interface DeedDisplayProps {
    deed: Deed;
}

const DeedDisplay = React.forwardRef<HTMLDivElement, DeedDisplayProps>(({ deed }, ref) => {
    const dispatch = useAppDispatch();
    
    const handleFutureVision = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: 'OPEN_FUTURE_VISION_MODAL', payload: deed });
    };

    const handleVoiceOfPalm = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: 'OPEN_VOICE_OF_PALM_MODAL', payload: deed });
    };

    return (
        <div ref={ref} className="max-w-md w-full bg-[#fcfaf5] dark:bg-stone-900 text-stone-800 dark:text-stone-200 p-2 rounded-lg shadow-2xl border border-stone-300 dark:border-stone-700">
            <div className="border-2 border-amber-700/50 dark:border-amber-400/30 p-6 rounded-md relative overflow-hidden">
                <SubtlePalmWatermark />
                <div className="relative z-10 text-center space-y-6">
                    <header className="space-y-1 border-b-2 border-double border-amber-800/30 dark:border-amber-300/20 pb-4">
                        <p className="text-sm tracking-widest text-amber-800/70 dark:text-amber-300/70">نخلستان معنا</p>
                        <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-200" style={{fontFamily: 'Vazirmatn, serif'}}>سند کاشت نخل میراث</h2>
                        <p className="text-xs text-stone-500">HERITAGE PALM PLANTING DEED</p>
                    </header>
                    <div className="text-lg space-y-4 py-2">
                        <p className="text-stone-600 dark:text-stone-400">گواهی می‌شود که یک اصله نخل میراث با نیتِ</p>
                        <p className="font-bold text-3xl text-green-700 dark:text-green-400">"{deed.intention}"</p>
                        <p className="text-stone-600 dark:text-stone-400">به نامِ</p>
                        <p className="font-semibold text-4xl text-stone-900 dark:text-stone-100">{deed.name}</p>
                        {deed.fromName && <p className="text-stone-500 dark:text-stone-400 text-base">از طرفِ <strong className="text-stone-700 dark:text-stone-200">{deed.fromName}</strong></p>}
                    </div>
                    {deed.message && (
                        <blockquote className="bg-stone-100 dark:bg-stone-800/50 border-r-4 border-amber-500 text-right p-4 my-4 rounded-r-lg">
                            <p className="text-md italic text-stone-700 dark:text-stone-300">"{deed.message}"</p>
                        </blockquote>
                    )}
                    <footer className="pt-6 mt-4 flex justify-between items-end">
                        <div className="text-right text-xs">
                            <p className="font-semibold text-stone-500 dark:text-stone-400">تاریخ ثبت:</p>
                            <p className="font-bold text-base text-stone-700 dark:text-stone-200">{new Date(deed.date).toLocaleDateString('fa-IR')}</p>
                            <p className="font-mono text-[10px] text-stone-400 dark:text-stone-500 mt-2">ID: {deed.id}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                                 <button onClick={handleVoiceOfPalm} className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-800/50 flex items-center gap-1 transition-colors" title="پیام نخل">
                                    <MicrophoneIcon className="w-3 h-3" />
                                    صدای نخل
                                </button>
                                 <button onClick={handleFutureVision} className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800/50 flex items-center gap-1 transition-colors" title="ماشین زمان نخلستان">
                                    <ClockForwardIcon className="w-3 h-3" />
                                    آینده نخل
                                </button>
                            </div>
                            <ModernSealIcon />
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
});

export default DeedDisplay;
