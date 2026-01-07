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

        <section ref={ref} className="py-24 relative overflow-hidden">

             {/* Background matching Hero Section */}

             <div className="absolute inset-0 bg-[#0f172a]"></div>

             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(74,222,128,0.05),transparent_60%)]"></div>



            <div className="container mx-auto px-6 max-w-5xl relative z-10">

                {/* Glass Panel Card matching Hero style */}

                <div className={`glass-panel p-10 rounded-3xl relative overflow-hidden transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                    

                    {/* Glow Effects */}

                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none"></div>

                    

                    <div className="relative z-10">

                        <div className="flex flex-col items-center gap-4 mb-6">

                            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-glow-green">

                                <FlagIcon className="w-8 h-8 text-green-400" />

                            </div>

                            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight text-center">

                                {campaign.title}

                            </h2>

                        </div>

                        

                        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 text-center font-light leading-relaxed">

                            {campaign.description}

                        </p>



                        <div className="mb-10 max-w-3xl mx-auto">

                            <div className="flex justify-between items-end text-white mb-3">

                                <span className="text-sm text-gray-400 font-medium">وضعیت مشارکت</span>

                                <div className="text-right">

                                    <span className="text-2xl font-bold text-green-400">{campaign.current.toLocaleString('fa-IR')}</span>

                                    <span className="text-gray-500 mx-2">/</span>

                                    <span className="text-gray-400">{campaign.goal.toLocaleString('fa-IR')} {campaign.unit}</span>

                                </div>

                            </div>

                            

                            {/* Modern Progress Bar */}

                            <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden border border-white/5">

                                <div 

                                    className="bg-gradient-to-r from-green-500 via-green-400 to-green-300 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(74,222,128,0.5)] relative"

                                    style={{ width: `${progress}%` }}

                                >

                                    <div className="absolute inset-0 bg-white/20 animate-pulse-soft"></div>

                                </div>

                            </div>

                        </div>

                        

                        <div className="text-center">

                            <button 

                                onClick={onCTAClick}

                                className="group relative inline-flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-12 rounded-2xl text-lg transition-all duration-300 shadow-[0_4px_20px_rgba(22,163,74,0.3)] hover:shadow-[0_8px_30px_rgba(34,197,94,0.4)] hover:-translate-y-1 overflow-hidden"

                            >

                                <span className="relative z-10">{campaign.ctaText}</span>

                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </section>

    );
};

export default CampaignSection;