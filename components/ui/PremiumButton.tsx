'use client';

import React from 'react';

interface PremiumButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: 'shiny' | 'neon' | 'glass' | 'gold';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
    children,
    onClick,
    className = '',
    variant = 'shiny',
    size = 'md',
    disabled = false,
    type = 'button'
}) => {
    const sizeClasses = {
        sm: 'px-4 py-1.5 text-xs',
        md: 'px-8 py-3 text-base',
        lg: 'px-10 py-4 text-lg'
    };

    const variants = {
        shiny: `
            relative overflow-hidden bg-stone-800 text-white font-bold rounded-full 
            border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.3)]
            transition-all duration-300 active:scale-95
            hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] hover:border-white/20
            before:absolute before:top-0 before:-left-full before:w-full before:h-full
            before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent
            hover:before:left-full before:transition-all before:duration-700 before:ease-in-out
        `,
        neon: `
            relative bg-emerald-500/10 text-emerald-400 font-bold rounded-full 
            border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]
            hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:bg-emerald-500/20 hover:text-white
            transition-all duration-300 active:scale-95
        `,
        glass: `
            backdrop-blur-md bg-white/5 border border-white/10 text-white font-bold rounded-full
            hover:bg-white/10 hover:border-white/20 shadow-xl
            transition-all duration-300 active:scale-95
        `,
        gold: `
            relative overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 font-black rounded-full
            border border-amber-300/50 shadow-[0_4px_20px_rgba(217,119,6,0.4)]
            hover:shadow-[0_8px_30px_rgba(217,119,6,0.6)] hover:scale-[1.02]
            transition-all duration-300 active:scale-95
            before:absolute before:top-0 before:-left-full before:w-full before:h-full
            before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent
            hover:before:left-full before:transition-all before:duration-1000 before:ease-in-out
        `
    };

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`
                inline-flex items-center justify-center gap-2 
                tracking-wider uppercase outline-none
                ${variants[variant]} 
                ${sizeClasses[size]} 
                ${className}
            `}
        >
            {children}
        </button>
    );
};

export default PremiumButton;
