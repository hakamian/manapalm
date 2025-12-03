

import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { TimelineEvent } from '../types.ts';
import { WellIcon, SparklesIcon, HeartIcon } from './icons.tsx';
import { iconMap } from './icons.tsx';

interface SharedMeaningPageProps {
    insights: TimelineEvent[];
}

const InsightCard: React.FC<{ insight: TimelineEvent }> = ({ insight }) => {
    const [resonated, setResonated] = useState(false);

    const getIcon = () => {
        if (insight.type === 'palm_planted' && insight.details.icon && iconMap[insight.details.icon as keyof typeof iconMap]) {
            return iconMap[insight.details.icon as keyof typeof iconMap];
        }
        if (iconMap[insight.type as keyof typeof iconMap]) {
            return iconMap[insight.type as keyof typeof iconMap];
        }
        return WellIcon;
    };
    const Icon = getIcon();
    const color = insight.details.color || 'amber';

    const handleResonate = (e: React.MouseEvent) => {
        e.stopPropagation();
        setResonated(!resonated);
    };

    return (
        <div className={`p-6 rounded-2xl shadow-lg border-2 border-${color}-500/20 dark:border-${color}-500/30 bg-white dark:bg-stone-800/50 transform transition-all duration-300 hover:scale-105 hover:shadow-xl relative`}>
            <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-${color}-100 dark:bg-${color}-900/30`}>
                    <Icon className={`w-6 h-6 text-${color}-500 dark:text-${color}-400`} />
                </div>
                <div>
                    <h3 className="font-semibold text-stone-700 dark:text-stone-200">{insight.title}</h3>
                    <blockquote className="mt-2">
                        <p className="italic text-stone-800 dark:text-stone-100">"{insight.userReflection?.notes || insight.description}"</p>
                    </blockquote>
                </div>
            </div>
            <button
                onClick={handleResonate}
                className={`absolute bottom-3 right-3 flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                    resonated ? `bg-${color}-100 text-${color}-700 dark:bg-${color}-900/30 dark:text-${color}-200` : 'bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
            >
                <HeartIcon className={`w-4 h-4 transition-colors ${resonated ? 'text-red-500' : ''}`} />
                {resonated ? 'همدل' : 'همدلی'}
            </button>
        </div>
    );
};

const SharedMeaningPage: React.FC<SharedMeaningPageProps> = ({ insights }) => {
    const [synthesis, setSynthesis] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    const approvedInsights = useMemo(() => insights.filter(i => i.status === 'approved'), [insights]);

    useEffect(() => {
        const synthesizeInsights = async () => {
            if (approvedInsights.length === 0) {
                setSynthesis("هنوز تاملی برای تحلیل جمعی وجود ندارد. شما اولین نفر باشید!");
                setIsLoading(false);
                return;
            }

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const insightTexts = approvedInsights
                    .slice(0, 20) // Use latest 20 insights to manage prompt size
                    .map(i => i.userReflection?.notes || i.description)
                    .join("\n---\n");
                
                const prompt = `You are the "Guardian of the Well of Meaning" for a spiritual social movement platform. Your personality is wise, calm, and insightful. Below is a collection of recent anonymous reflections from community members, separated by "---". Your task is to read them and synthesize the overarching, non-obvious themes, emotions, or patterns you observe into a single, beautiful, and encouraging paragraph in Persian (Farsi). Do not quote directly. Speak to the community as a whole. Frame your synthesis as an observation of the collective consciousness. Start with a phrase like "در تاملات این هفته..." or "به نظر می‌رسد که...".

Reflections:
${insightTexts}`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-pro',
                    contents: prompt,
                });
                
                setSynthesis(response.text);
            } catch (error) {
                console.error("AI synthesis failed:", error);
                setSynthesis("در تحلیل تاملات جمعی خطایی رخ داد.");
            } finally {
                setIsLoading(false);
            }
        };

        synthesizeInsights();
    }, [approvedInsights]);

    return (
        <div className="space-y-16 animate-fade-in">
            <section className="text-center container mx-auto px-4">
                <WellIcon className="w-20 h-20 text-amber-500 mx-auto mb-4" />
                <h1 className="text-4xl md:text-5xl font-extrabold text-amber-900 dark:text-amber-200 mb-4 leading-tight">
                    چاه معنای مشترک
                </h1>
                <p className="text-lg md:text-xl text-stone-700 dark:text-stone-300 max-w-3xl mx-auto">
                    اینجا صدای جمعی خانواده نخلستان معناست. فضایی برای مشاهده و همدلی با تاملات ناشناس یکدیگر و کشف خرد جمعی.
                </p>
            </section>
            
            <section className="container mx-auto px-4 max-w-3xl">
                <div className="bg-white dark:bg-stone-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border-2 border-amber-200 dark:border-amber-800/50">
                    <h2 className="text-xl font-bold mb-3 text-center flex items-center justify-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-amber-500" />
                        پیام نگهبان چاه
                    </h2>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-16">
                           <div className="w-2 h-2 bg-stone-400 dark:bg-stone-500 rounded-full animate-pulse [animation-delay:0s]"></div>
                           <div className="w-2 h-2 bg-stone-400 dark:bg-stone-500 rounded-full animate-pulse [animation-delay:0.2s] mx-2"></div>
                           <div className="w-2 h-2 bg-stone-400 dark:bg-stone-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                        </div>
                    ) : (
                         <p className="text-center text-stone-600 dark:text-stone-300 italic leading-relaxed">
                            "{synthesis}"
                        </p>
                    )}
                </div>
            </section>

            <section className="container mx-auto px-4 max-w-4xl">
                 {approvedInsights.length > 0 ? (
                    <div className="masonry-columns">
                        {approvedInsights.map(insight => (
                            <div key={insight.id} className="mb-6 break-inside-avoid">
                                <InsightCard insight={insight} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <WellIcon className="w-20 h-20 text-stone-300 dark:text-stone-600 mx-auto" />
                        <p className="mt-4 text-stone-500 dark:text-stone-400">چاه معنا هنوز خالی است. اولین تامل خود را به اشتراک بگذارید.</p>
                    </div>
                )}
            </section>
            <style>{`
                .masonry-columns {
                    column-count: 1;
                }
                @media (min-width: 768px) {
                    .masonry-columns {
                        column-count: 2;
                        column-gap: 1.5rem;
                    }
                }
                 @media (min-width: 1024px) {
                    .masonry-columns {
                        column-count: 3;
                    }
                }
                .break-inside-avoid {
                    break-inside: avoid;
                }
            `}</style>
        </div>
    );
};

export default SharedMeaningPage;