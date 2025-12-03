import React, { useState, useEffect, useRef } from 'react';
import { Campaign } from '../types';
import { FlagIcon } from './icons';

interface CampaignSectionProps {
    campaign: Campaign;
    onCTAClick: () => void;
}

const CampaignSection: React.FC<CampaignSectionProps> = ({ campaign, onCTAClick }) => {
    const [progress, setProgress] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.5 });
        
        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }
        
        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                const percentage = (campaign.current / campaign.goal) * 100;
                setProgress(percentage);
            }, 300); // Small delay for visual effect
            return () => clearTimeout(timer);
        }
    }, [isVisible, campaign.current, campaign.goal]);

    return (
        <section ref={ref} className="py-20 bg-gray-800">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className={`bg-gradient-to-br from-green-900/50 to-gray-900/50 p-8 rounded-2xl border-2 border-green-700/60 shadow-2xl text-center relative overflow-hidden transition-all duration-700 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-green-500/10 rounded-full filter blur-3xl"></div>
                    <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-green-500/10 rounded-full filter blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-center items-center gap-3 mb-4">
                            <FlagIcon className="w-8 h-8 text-green-400" />
                            <h2 className="text-4xl font-bold">{campaign.title}</h2>
                        </div>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">{campaign.description}</p>

                        <div className="mb-6">
                            <div className="flex justify-between items-center text-white mb-2 font-semibold">
                                <span>پیشرفت</span>
                                <span>{campaign.current.toLocaleString('fa-IR')} / {campaign.goal.toLocaleString('fa-IR')} {campaign.unit}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600">
                                <div 
                                    className="bg-gradient-to-r from-green-500 to-green-400 h-4 rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                        
                        <button 
                            onClick={onCTAClick}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-[0_4px_20px_rgba(74,222,128,0.3)] hover:shadow-[0_6px_25px_rgba(74,222,128,0.5)]"
                        >
                            {campaign.ctaText}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CampaignSection;