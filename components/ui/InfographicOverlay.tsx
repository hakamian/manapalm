import React, { useState } from 'react';

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
    const [activeId, setActiveId] = useState<string | null>(null);

    return (
        <div className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 group bg-gray-900 ${className}`}>
            {/* Base Image */}
            <img 
                src={imageSrc} 
                alt={alt} 
                className="w-full h-auto object-cover min-h-[300px] transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100"
            />
            
            {/* Dark Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>

            {/* Hotspots & Labels */}
            {hotspots.map((spot, index) => {
                const isActive = activeId === spot.id;
                
                // Determine horizontal translation based on alignment to prevent overflow
                let translateX = '-50%';
                if (spot.align === 'left') translateX = '0%';
                if (spot.align === 'right') translateX = '-100%';

                return (
                    <div 
                        key={spot.id}
                        className="absolute transition-all duration-500"
                        style={{ 
                            left: `${spot.x}%`, 
                            top: `${spot.y}%`, 
                            zIndex: isActive ? 30 : 10 + index
                        }}
                        onMouseEnter={() => setActiveId(spot.id)}
                        onMouseLeave={() => setActiveId(null)}
                        onClick={() => setActiveId(activeId === spot.id ? null : spot.id)}
                    >
                        {/* Interactive Marker */}
                        <div className="relative flex items-center justify-center cursor-pointer">
                            <div className="w-6 h-6 bg-emerald-500/30 rounded-full animate-ping absolute"></div>
                            <div className="w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pulse-glow"></div>
                        </div>

                        {/* Label Container */}
                        <div 
                            className={`absolute mt-3 transition-all duration-300 transform ${isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:scale-100'}`}
                            style={{ 
                                left: spot.align === 'left' ? '0' : spot.align === 'right' ? 'auto' : '50%',
                                right: spot.align === 'right' ? '0' : 'auto',
                                transform: spot.align === 'center' ? 'translateX(-50%)' : 'none',
                                width: 'max-content',
                                maxWidth: '200px'
                            }}
                        >
                            <div className="bg-gray-900/90 backdrop-blur-xl border border-emerald-500/30 p-3 rounded-2xl shadow-2xl ring-1 ring-white/10">
                                <h4 className="text-white font-bold text-sm md:text-base whitespace-nowrap">
                                    {spot.title}
                                </h4>
                                {spot.description && (
                                    <p className="text-gray-400 text-[10px] md:text-xs mt-1 leading-relaxed">
                                        {spot.description}
                                    </p>
                                )}
                            </div>
                            
                            {/* Connector Line (Decorative) */}
                            <div 
                                className={`h-3 w-px bg-emerald-500/50 mx-auto ${spot.align === 'left' ? 'ml-2 mr-auto' : spot.align === 'right' ? 'mr-2 ml-auto' : 'mx-auto'}`}
                            ></div>
                        </div>
                    </div>
                );
            })}

            {/* Mobile Hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white/70 md:hidden pointer-events-none">
                برای مشاهده جزئیات روی نقاط کلیک کنید
            </div>
        </div>
    );
};

export default InfographicOverlay;