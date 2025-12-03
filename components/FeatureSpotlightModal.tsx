import React, { useState, useEffect, useRef } from 'react';
import { Spotlight, Page } from '../types.ts';
import { XIcon } from './icons.tsx';

interface FeatureSpotlightModalProps {
    spotlights: Spotlight[];
    onClose: () => void;
    onNavigate: (page: Page) => void;
}

const FeatureSpotlightModal: React.FC<FeatureSpotlightModalProps> = ({ spotlights, onClose, onNavigate }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const goToNext = () => {
        if (currentIndex < spotlights.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onClose();
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    useEffect(() => {
        if (isPaused) {
            if (timerRef.current) clearTimeout(timerRef.current);
        } else {
            timerRef.current = setTimeout(goToNext, 5000); // Auto-advance after 5 seconds
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [currentIndex, isPaused, spotlights.length]);

    const handlePointerDown = () => setIsPaused(true);
    const handlePointerUp = () => setIsPaused(false);

    const currentSpotlight = spotlights[currentIndex];
    const Icon = currentSpotlight.icon;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex justify-center items-center p-4 animate-fade-in">
            {/* Progress Bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-2">
                {spotlights.map((_, index) => (
                    <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-200"
                            style={{ width: index < currentIndex ? '100%' : (index === currentIndex ? '100%' : '0%'), transitionDuration: index === currentIndex ? (isPaused ? '0s' : '5s') : '0.2s' }}
                        ></div>
                    </div>
                ))}
            </div>
            
            <button onClick={onClose} className="absolute top-8 right-4 text-white p-2 z-20">
                <XIcon className="w-8 h-8"/>
            </button>

            {/* Content */}
            <div
                className="relative w-full max-w-sm h-[80vh] max-h-[700px] text-white text-center flex flex-col justify-center items-center p-8 rounded-2xl overflow-hidden"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
            >
                 <div className="absolute -inset-20 bg-amber-500 opacity-20 blur-3xl animate-pulse-slow"></div>
                 <Icon className="w-24 h-24 mb-6" />
                 <h2 className="text-3xl font-bold">{currentSpotlight.title}</h2>
                 <p className="mt-4 text-lg text-stone-200 leading-relaxed">{currentSpotlight.description}</p>

                 <button
                    onClick={() => onNavigate(currentSpotlight.cta.page)}
                    className="mt-12 bg-white text-amber-800 font-bold px-8 py-3.5 rounded-xl hover:bg-amber-100 transition-all transform hover:scale-105 shadow-lg"
                 >
                    {currentSpotlight.cta.text}
                 </button>
            </div>
            
            {/* Navigation */}
            <div className="absolute inset-0 flex">
                <div className="flex-1 h-full" onClick={goToPrev}></div>
                <div className="flex-1 h-full" onClick={goToNext}></div>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 0.2; }
                    50% { transform: scale(1.1); opacity: 0.3; }
                }
                .animate-pulse-slow { animation: pulse-slow 8s infinite; }
            `}</style>
        </div>
    );
};

export default FeatureSpotlightModal;