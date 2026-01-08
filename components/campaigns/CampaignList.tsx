import React from 'react';
import { Campaign } from '../../types';
import CampaignCard from './CampaignCard';
import { useAppDispatch } from '../../AppContext';

interface CampaignListProps {
    campaigns: Campaign[];
}

const CampaignList: React.FC<CampaignListProps> = ({ campaigns }) => {
    const dispatch = useAppDispatch();

    const handleDonate = (campaignId: string) => {
        console.log('Donate to campaign:', campaignId);
        // TODO: Open modal or navigate to campaign details
        // For MVP, we can just scroll to shop or show a simple toast
        dispatch({ 
            type: 'SHOW_POINTS_TOAST', 
            payload: { points: 0, action: 'به زودی: صفحه جزئیات کمپین', type: 'barkat' } 
        });
    };

    if (!campaigns || campaigns.length === 0) return null;

    return (
        <section className="py-12 relative">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            کمپین‌های <span className="text-emerald-400">مردمی</span>
                        </h2>
                        <p className="text-gray-400 text-sm md:text-base">
                            با هم‌افزایی کوچک، کارهای بزرگ انجام می‌دهیم
                        </p>
                    </div>
                    
                    <button className="hidden md:flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium">
                        مشاهده همه
                        <span className="text-lg">←</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map(campaign => (
                        <CampaignCard 
                            key={campaign.id} 
                            campaign={campaign} 
                            onDonate={handleDonate} 
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CampaignList;