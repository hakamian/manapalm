
import React from 'react';
import { AcademyContent } from '../utils/academyLandingContent';
import { CheckCircleIcon, XMarkIcon, SproutIcon } from './icons';

interface AcademyLandingHeroProps {
    content: AcademyContent;
}

const AcademyLandingHero: React.FC<AcademyLandingHeroProps> = ({ content }) => {
    return (
        <div className="mb-16">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-gray-800 border border-gray-700 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600/20 to-purple-600/20 blur-3xl -mr-16 -mt-16 rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-600/10 to-orange-600/10 blur-3xl -ml-16 -mb-16 rounded-full pointer-events-none"></div>

                <div className="relative z-10 px-6 py-12 md:py-20 text-center">
                    
                    {/* Badges Row */}
                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-900/50 border border-gray-600 text-gray-300 text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm">
                            {content.hero.badge}
                        </div>
                        {/* The Missing Link: Connection to Nakhlestan */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-900/40 border border-green-500/40 text-green-300 text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm animate-pulse">
                            <SproutIcon className="w-4 h-4" />
                            مسیر کاشت {content.hero.palmType}
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-6 tracking-tight leading-tight">
                        {content.hero.title}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
                        {content.hero.subtitle}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12 border-t border-gray-700/50 pt-8">
                        {content.stats.map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div className="flex justify-center mb-2 text-amber-400">
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pain vs Value Section */}
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                {/* Pain (Problem) */}
                <div className="bg-red-900/10 border border-red-500/20 p-8 rounded-2xl relative overflow-hidden hover:border-red-500/30 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <XMarkIcon className="w-24 h-24 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-red-400 mb-4 relative z-10">{content.pain.title}</h3>
                    <p className="text-gray-300 mb-6 text-sm leading-relaxed relative z-10">
                        {content.pain.description}
                    </p>
                    <ul className="space-y-3 relative z-10">
                        {content.pain.points.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-gray-400">
                                <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-red-500/50"></div>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Value (Solution) */}
                <div className="bg-green-900/10 border border-green-500/20 p-8 rounded-2xl relative overflow-hidden hover:border-green-500/30 transition-colors">
                     <div className="absolute top-0 left-0 p-4 opacity-10">
                        <CheckCircleIcon className="w-24 h-24 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-green-400 mb-4 relative z-10">{content.value.title}</h3>
                    <p className="text-gray-300 mb-6 text-sm leading-relaxed relative z-10">
                        {content.value.description}
                    </p>
                    <ul className="space-y-3 relative z-10">
                        {content.value.points.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AcademyLandingHero;
