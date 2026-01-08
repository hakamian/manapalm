import React from 'react';
import { Campaign } from '../../types';
import { SproutIcon, UsersIcon, ArrowRightIcon } from '../icons';

interface CampaignCardProps {
    campaign: Campaign;
    onDonate: (campaignId: string) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onDonate }) => {
    const progress = Math.min(100, Math.round((campaign.current / campaign.goal) * 100));
    const isFullyFunded = progress >= 100;

    return (
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group hover:shadow-emerald-500/10 transition-all duration-300">
            {/* Header Image / Gradient */}
            <div className="h-32 bg-gradient-to-br from-emerald-900 to-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <UsersIcon className="w-3 h-3" />
                    <span>کمپین مردمی</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {campaign.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-1">
                    {campaign.description}
                </p>

                {/* Stats */}
                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300 font-medium">
                            {campaign.current.toLocaleString('fa-IR')} {campaign.unit}
                        </span>
                        <span className="text-gray-500">
                           هدف: {campaign.goal.toLocaleString('fa-IR')}
                        </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${isFullyFunded ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-end mt-1">
                        <span className={`text-xs ${isFullyFunded ? 'text-emerald-400' : 'text-emerald-500/70'}`}>
                            {progress.toLocaleString('fa-IR')}% تکمیل شده
                        </span>
                    </div>
                </div>

                {/* Action */}
                <button 
                    onClick={() => onDonate(campaign.id)}
                    disabled={isFullyFunded}
                    className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${isFullyFunded ? 'bg-emerald-900/30 text-emerald-500 cursor-default' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/20'}`}
                >
                    {isFullyFunded ? (
                        <>
                            <SproutIcon className="w-5 h-5" />
                            <span>تکمیل شد</span>
                        </>
                    ) : (
                        <>
                            <span>{campaign.ctaText || 'مشارکت کنید'}</span>
                            <ArrowRightIcon className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CampaignCard;