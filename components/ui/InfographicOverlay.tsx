import React from 'react';

export interface Hotspot {
    id: string;
    x: number; // Percentage from left (0-100)
    y: number; // Percentage from top (0-100)
    title: string;
    description?: string;
    align?: 'left' | 'right' | 'center';
}

interface InfographicOverlayProps {
    imageSrc: string;
    alt: string;
    hotspots: Hotspot[];
    className?: string;
}

const InfographicOverlay: React.FC<InfographicOverlayProps> = ({ imageSrc, alt, hotspots, className = '' }) => {
    return (
        <div className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 group ${className}`}>
            {/* Base Image */}
            <img 
                src={imageSrc} 
                alt={alt} 
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 hover:opacity-100"
            />
            
            {/* Dark Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none"></div>

            {/* Hotspots & Labels */}
            {hotspots.map((spot) => (
                <div 
                    key={spot.id}
                    className="absolute flex flex-col gap-2 transition-all duration-500 hover:z-20"
                    style={{ 
                        left: `${spot.x}%`, 
                        top: `${spot.y}%`, 
                        transform: 'translate(-50%, -50%)', 
                        alignItems: spot.align === 'left' ? 'flex-start' : spot.align === 'right' ? 'flex-end' : 'center',
                        textAlign: spot.align || 'center',
                        width: 'max-content',
                        maxWidth: '250px'
                    }}
                >
                    {/* Pulsing Dot (Optional, can be removed for cleaner look if image has icons) */}
                    {/* <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping absolute opacity-75"></div>
                    <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div> */}

                    {/* Text Label */}
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-lg hover:bg-black/60 transition-colors animate-fade-in-up">
                        <h4 className="text-white font-bold text-sm md:text-base whitespace-nowrap text-shadow-sm">
                            {spot.title}
                        </h4>
                        {spot.description && (
                            <p className="text-gray-300 text-xs mt-1 leading-relaxed hidden md:block">
                                {spot.description}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InfographicOverlay;