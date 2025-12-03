
import React, { useState, useEffect, useRef } from 'react';
import { PalmTreeIcon } from './icons';

const ThreeDGarden: React.FC = () => {
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    // Generate random palms
    const palms = React.useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 800,
            z: (Math.random() - 0.5) * 800,
            scale: 0.5 + Math.random() * 1,
            delay: Math.random() * 2,
        }));
    }, []);

    useEffect(() => {
        let animationFrameId: number;
        const animate = () => {
            setRotation(prev => (prev + 0.2) % 360);
            animationFrameId = requestAnimationFrame(animate);
        };
        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-[500px] bg-gradient-to-b from-sky-900 to-stone-900 rounded-2xl overflow-hidden border-4 border-stone-700 shadow-2xl perspective-1000"
            style={{ perspective: '1000px' }}
        >
            {/* Sky & Moon */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-100 rounded-full blur-[2px] shadow-[0_0_40px_rgba(255,255,200,0.5)]"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>

            {/* 3D Scene */}
            <div 
                className="absolute top-1/2 left-1/2 w-0 h-0 transform-style-3d transition-transform duration-75"
                style={{ 
                    transform: `translateZ(${zoom * 100}px) rotateX(20deg) rotateY(${rotation}deg)` 
                }}
            >
                {/* Ground */}
                <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-stone-800 rounded-full border-4 border-green-900/30 shadow-[0_0_100px_rgba(0,0,0,0.8)_inset]"
                    style={{ 
                        transform: 'rotateX(90deg) translateZ(50px)',
                        background: 'radial-gradient(circle, #1c1917 0%, #0c0a09 100%)'
                    }}
                >
                    {/* Grid Lines */}
                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                </div>

                {/* Palms */}
                {palms.map(palm => (
                    <div
                        key={palm.id}
                        className="absolute top-1/2 left-1/2 transform-style-3d"
                        style={{
                            transform: `translateX(${palm.x}px) translateZ(${palm.z}px)`
                        }}
                    >
                        {/* Tree Billboard (Always faces camera roughly if we counteract rotation, simplistic here) */}
                        <div 
                            className="transform -translate-x-1/2 -translate-y-full origin-bottom transition-transform"
                            style={{ 
                                transform: `rotateY(${-rotation}deg) scale(${palm.scale})`,
                            }}
                        >
                            <div className="relative group cursor-pointer">
                                <PalmTreeIcon className="w-24 h-24 text-green-600 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" />
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/50 blur-sm rounded-full"></div>
                                
                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    نخل شماره {palm.id + 1}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-4 flex gap-2">
                <button onClick={() => setZoom(z => Math.min(z + 0.5, 5))} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded backdrop-blur-sm">+</button>
                <button onClick={() => setZoom(z => Math.max(z - 0.5, 0.5))} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded backdrop-blur-sm">-</button>
            </div>
            
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <p className="text-xs text-white">
                    <span className="w-2 h-2 inline-block bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    باغ زنده (۳ بعدی)
                </p>
            </div>
        </div>
    );
};

export default ThreeDGarden;
