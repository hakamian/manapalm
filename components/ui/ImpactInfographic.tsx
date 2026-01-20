import React, { useState } from 'react';
import {
    LeafIcon,
    HeartIcon,
    BriefcaseIcon,
    SproutIcon
} from '../icons';

const ImpactInfographic: React.FC = () => {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    // Node configurations matching the vertical (mobile) and horizontal (desktop) layouts
    const nodes = [
        {
            id: 'environment',
            title: 'محیط زیست',
            description: 'احیای نخلستان‌ها و جذب کربن',
            icon: LeafIcon,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            border: 'border-emerald-400/30',
        },
        {
            id: 'employment',
            title: 'اشتغال پایدار',
            description: 'کارآفرینی برای جوانان بومی',
            icon: BriefcaseIcon,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            border: 'border-blue-400/30',
        },
        {
            id: 'social',
            title: 'منفعت اجتماعی',
            description: 'توانمندسازی جامعه و چرخه نیکی',
            icon: HeartIcon,
            color: 'text-rose-400',
            bg: 'bg-rose-400/10',
            border: 'border-rose-400/30',
        }
    ];

    return (
        <div className="relative w-full aspect-[9/16] md:aspect-[16/9] max-w-5xl mx-auto select-none rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black transition-all duration-700">

            {/* Background Image - Responsive Switch */}
            <div className="absolute inset-0 z-0">
                <picture>
                    <source media="(max-width: 768px)" srcSet="/images/impact_infographic_mobile.png" />
                    <img
                        src="https://res.cloudinary.com/dk2x11rvs/image/upload/v1768732595/impact_infographic_bg_1768732519542_h1uxm3.jpg"
                        alt="Impact Network Background"
                        className="w-full h-full object-cover opacity-90 transition-transform duration-[10s] hover:scale-105"
                    />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
            </div>

            {/* Central Core: The Seed / User */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 group cursor-default">
                <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse-soft"></div>
                    <div className="relative w-24 h-24 md:w-28 md:h-28 bg-white/5 border border-white/30 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-transform duration-500 group-hover:scale-110">
                        <SproutIcon className="w-12 h-12 md:w-14 md:h-14 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                    </div>
                </div>
            </div>

            {/* 
                Manually positioned nodes for different breakpoints
                Why manual? Because the underlying image structure is different for mobile (vertical) and desktop (horizontal).
                We need precise control over positions that can't be easily mapped with a single set of percentage props.
            */}

            {/* 1. Environment Node: Top-Left (Mobile) / Far Left (Desktop) */}
            <NodeItem
                node={nodes[0]}
                isHovered={hoveredNode === 'environment'}
                setHoveredNode={setHoveredNode}
                className="left-[20%] top-[25%] md:left-[20%] md:top-[35%]"
            />

            {/* 2. Employment Node: Top-Right (Mobile) / Far Right (Desktop) */}
            <NodeItem
                node={nodes[1]}
                isHovered={hoveredNode === 'employment'}
                setHoveredNode={setHoveredNode}
                className="left-[80%] top-[25%] md:left-[80%] md:top-[35%]"
            />

            {/* 3. Social Node: Bottom-Center (Mobile) / Bottom-Center (Desktop) */}
            <NodeItem
                node={nodes[2]}
                isHovered={hoveredNode === 'social'}
                setHoveredNode={setHoveredNode}
                className="left-[50%] top-[85%] md:left-[50%] md:top-[82%]"
            />

        </div>
    );
};

// Helper Component for Cleaner Render Loop & Responsive Classes
const NodeItem: React.FC<{
    node: any,
    isHovered: boolean,
    setHoveredNode: (id: string | null) => void,
    className: string
}> = ({ node, isHovered, setHoveredNode, className }) => (
    <div
        className={`absolute z-20 cursor-pointer transition-all duration-500 -translate-x-1/2 -translate-y-1/2 ${className} ${isHovered ? 'scale-110 z-30' : 'scale-100 opacity-90'}`}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
        onClick={() => setHoveredNode(isHovered ? null : node.id)}
    >
        {/* Node Icon Circle */}
        <div className={`
            relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center 
            backdrop-blur-xl border transition-all duration-500 shadow-xl
            ${node.bg} ${node.border}
            ${isHovered ? 'shadow-[0_0_30px_rgba(255,255,255,0.3)] border-white bg-black/50' : 'grayscale-[0.3]'}
        `}>
            <node.icon className={`w-8 h-8 md:w-9 md:h-9 transition-all duration-500 ${isHovered ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : node.color}`} />

            {/* Floating Badge */}
            <div className={`absolute -top-3 -right-3 w-6 h-6 md:w-8 md:h-8 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-xs text-white shadow-lg animate-bounce`}>
                +
            </div>
        </div>

        {/* Node Info */}
        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 text-center w-56 transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none md:opacity-80 md:translate-y-1'}`}>
            <div className={`bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20`}>
                <h4 className={`font-bold text-sm md:text-lg mb-0.5 text-white`}>{node.title}</h4>
                <p className={`text-[10px] md:text-xs text-gray-300`}>{node.description}</p>
            </div>
        </div>
    </div>
);

export default ImpactInfographic;
