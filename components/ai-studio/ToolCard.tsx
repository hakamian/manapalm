
import React from 'react';
import { LockClosedIcon, SparklesIcon, FireIcon, StarIcon, ArrowLeftIcon } from '../icons';
import { User } from '../../types';
import { CreationToolConfig } from '../../utils/aiStudioConfig';
import { useAppState } from '../../AppContext';

interface ToolCardProps {
    tool: CreationToolConfig;
    user: User | null;
    onClick: (tool: CreationToolConfig) => void;
    index: number;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, user, onClick, index }) => {
    const { appSettings } = useAppState();
    const Icon = tool?.icon;
    if (!Icon) return null;

    const isLocked = tool.isPremium && user && !user.unlockedTools?.includes(tool.id);
    
    // Dynamic border color based on tool config
    const borderColor = isLocked ? 'border-gray-700' : `border-${tool.color}-500/30`;
    const hoverBorderColor = isLocked ? 'hover:border-gray-600' : `hover:border-${tool.color}-400`;
    const glowColor = `rgba(var(--${tool.color}-500-rgb), 0.1)`; // Requires custom CSS vars or hardcoded fallback

    // --- DYNAMIC PRICING LOGIC ---
    // 1 Point = 10 Tomans (Standard conversion for game economy)
    const POINT_VALUE_TOMAN = 10;
    const exchangeRate = appSettings.usdToTomanRate || 120000;
    
    let costInPoints = tool.unlockCost || 0;
    
    if (tool.baseCostUSD) {
        const costInToman = tool.baseCostUSD * exchangeRate;
        costInPoints = Math.ceil(costInToman / POINT_VALUE_TOMAN);
        // Round to nice numbers (e.g. nearest 10 or 50)
        if (costInPoints > 100) {
             costInPoints = Math.ceil(costInPoints / 50) * 50;
        } else {
             costInPoints = Math.ceil(costInPoints / 10) * 10;
        }
    }

    const unlockText = tool.relatedProduct ? "نیازمند اشتراک" : `${costInPoints.toLocaleString('fa-IR')} امتیاز معنا`;

    return (
        <button
            onClick={() => onClick({ ...tool, unlockCost: costInPoints })} // Pass calculated cost
            className={`relative group w-full text-right flex flex-col h-full p-[1px] rounded-3xl transition-all duration-500 hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-${tool.color}-500`}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* Gradient Border Background */}
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b from-gray-700 to-gray-800 ${isLocked ? '' : `group-hover:from-${tool.color}-500 group-hover:to-${tool.color}-900`} transition-all duration-500 opacity-50 group-hover:opacity-100`}></div>
            
            {/* Inner Card Content */}
            <div className="relative w-full h-full bg-gray-900 rounded-[23px] p-6 flex flex-col overflow-hidden backface-hidden">
                
                {/* Background Ambient Glow */}
                {!isLocked && (
                    <div className={`absolute -top-20 -right-20 w-40 h-40 bg-${tool.color}-500/10 rounded-full blur-3xl group-hover:bg-${tool.color}-500/20 transition-all duration-500`}></div>
                )}

                {/* Header: Icon & Badges */}
                <div className="flex justify-between items-start mb-5 relative z-10">
                    <div className={`p-3.5 rounded-2xl border bg-gradient-to-br transition-all duration-300 group-hover:scale-110 shadow-lg ${
                        isLocked 
                        ? 'from-gray-800 to-gray-900 border-gray-700 text-gray-500' 
                        : `from-gray-800 to-gray-900 border-${tool.color}-500/30 text-${tool.color}-400 group-hover:text-${tool.color}-300 group-hover:shadow-${tool.color}-900/20`
                    }`}>
                        <Icon className="w-7 h-7" />
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {isLocked && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-800 border border-stone-700 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                                <LockClosedIcon className="w-3 h-3" /> قفل
                            </span>
                        )}
                        {!isLocked && tool.isNew && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-900/30 border border-blue-500/30 text-[10px] font-bold text-blue-300 uppercase tracking-wider animate-pulse">
                                <SparklesIcon className="w-3 h-3" /> جدید
                            </span>
                        )}
                        {!isLocked && tool.isPopular && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-900/30 border border-orange-500/30 text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                                <FireIcon className="w-3 h-3" /> محبوب
                            </span>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="relative z-10 flex-grow">
                    <h3 className={`text-xl font-bold mb-2 transition-colors ${isLocked ? 'text-gray-500' : 'text-white group-hover:text-white'}`}>
                        {tool.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${isLocked ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-300'}`}>
                        {tool.description}
                    </p>
                </div>

                {/* Footer / CTA */}
                <div className="relative z-10 mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
                     {isLocked ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 group-hover:text-amber-500 transition-colors">
                            <LockClosedIcon className="w-3.5 h-3.5" />
                            <span>{unlockText}</span>
                        </div>
                     ) : (
                        <div className={`flex items-center gap-1.5 text-xs font-bold text-${tool.color}-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0`}>
                            <span>اجرا کنید</span>
                            <ArrowLeftIcon className="w-3.5 h-3.5" />
                        </div>
                     )}
                </div>
            </div>
        </button>
    );
};

export default ToolCard;
