import React, { useState } from 'react';
import Image from 'next/image';
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
        <div className="relative w-full aspect-[9/16] max-w-[400px] mx-auto select-none rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-[#fcfaf7] transition-all duration-700">

            {/* Background Image - Responsive Cloudinary Asset optimized with Next.js */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://res.cloudinary.com/dk2x11rvs/image/upload/v1768902857/Gemini_Generated_Image_76q0fx76q0fx76q0_tnaldu.png"
                    alt="Ma'na Impact Canvas - طرح گرافیکی قدرت ما"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                    priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
            </div>

            {/* Central Core: REMOVED to stop masking the tree */}

            {/* 
                Manually positioned nodes for different breakpoints
                Why manual? Because the underlying image structure is different for mobile (vertical) and desktop (horizontal).
                We need precise control over positions that can't be easily mapped with a single set of percentage props.
            */}

            {/* 1. Environment Node: Bottom-Left (Aligned with leaf icon and text) */}
            <NodeItem
                node={nodes[0]}
                isHovered={hoveredNode === 'environment'}
                setHoveredNode={setHoveredNode}
                className="left-[22%] top-[65%]"
                align="left"
            />

            {/* 2. Employment Node: Top-Center (Aligned with hands holding plant and text) */}
            <NodeItem
                node={nodes[1]}
                isHovered={hoveredNode === 'employment'}
                setHoveredNode={setHoveredNode}
                className="left-[50%] top-[25%]"
                align="center"
            />

            {/* 3. Social Node: Bottom-Right (Aligned with heart icon and text) */}
            <NodeItem
                node={nodes[2]}
                isHovered={hoveredNode === 'social'}
                setHoveredNode={setHoveredNode}
                className="left-[78%] top-[65%]"
                align="right"
            />

        </div>
    );
};

// Helper Component for Cleaner Render Loop & Responsive Classes
const NodeItem: React.FC<{
    node: any,
    isHovered: boolean,
    setHoveredNode: (id: string | null) => void,
    className: string,
    align?: 'left' | 'right' | 'center'
}> = ({ node, isHovered, setHoveredNode, className, align = 'center' }) => (
    <div
        className={`absolute z-20 cursor-pointer transition-all duration-500 -translate-x-1/2 -translate-y-1/2 ${className} ${isHovered ? 'scale-110 z-30' : 'scale-100'}`}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
        onClick={() => setHoveredNode(isHovered ? null : node.id)}
    >
        {/* HIT AREA: Large invisible area that covers both the icon and the words below it */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-32 md:w-48 md:h-40 bg-transparent -z-10" />

        {/* Node Hover Zone - Shrinked as requested */}
        <div className={`
            relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center 
            transition-all duration-500
            ${isHovered ? 'bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl scale-125' : 'bg-transparent'}
        `}>
            {/* Pulsing indicator - Smaller and subtle */}
            {!isHovered && (
                <div className={`absolute inset-0 rounded-full border ${node.border} animate-ping opacity-30`} />
            )}
        </div>

        {/* Node Info - Smart Alignment to prevent clipping */}
        <div className={`
            absolute top-full mt-3 w-56 transition-all duration-500 
            ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}
            ${align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'}
        `}>
            <div className={`bg-stone-900/98 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-2xl ${align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'}`}>
                <h4 className="font-bold text-sm md:text-base mb-1 text-white">{node.title}</h4>
                <p className="text-[10px] md:text-xs text-stone-400 leading-relaxed font-light">{node.description}</p>
            </div>
        </div>
    </div>
);

export default ImpactInfographic;
