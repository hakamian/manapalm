import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { TimelineEvent, View } from '../types.ts';
import Certificate from './Certificate.tsx';
import { SparklesIcon, HeartIcon, PlusIcon } from './icons.tsx';
// FIX: Refactored to use useAppDispatch
import { useAppDispatch } from '../AppContext.tsx';

interface LivingHeritagePageProps {
    heritageItem: TimelineEvent;
}

const LivingHeritagePage: React.FC<LivingHeritagePageProps> = ({ heritageItem }) => {
    // FIX: Refactored to use useAppDispatch
    const dispatch = useAppDispatch();
    const [isGeneratingArt, setIsGeneratingArt] = useState(false);

    const handleGenerateAiArtForHeritage = async (heritageItemId: string, prompt: string) => {
        // Mock implementation of AI art generation and updating the timeline event
        console.log("Generating AI art for:", heritageItemId, "with prompt:", prompt);
        // This would involve a call to an AI service and then a dispatch to update the user's timeline
    };
    
    const setReflectionModalState = (state: { isOpen: boolean, heritageItem: TimelineEvent }) => {
        // This would typically dispatch an action to open a modal with the item
        console.log("Opening reflection modal for:", state.heritageItem.id);
        // For now, we navigate to the user profile's timeline tab as a fallback
        dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: 'timeline' });
    };

    const handleGenerateArt = async () => {
        setIsGeneratingArt(true);
        const palmType = heritageItem.details.title;
        const recipient = heritageItem.details.recipient;
        const message = heritageItem.details.message;

        const prompt = `Create a soulful, artistic, beautiful painting of a single palm tree that represents a symbolic heritage. The heritage type is "${palmType}", planted for "${recipient}". The user's message was: "${message}". The style should be like a dreamy, slightly surreal watercolor painting with glowing light and soft colors. The palm tree should be the central focus, looking majestic and full of life. It should evoke a feeling of meaning and hope.`;
        
        await handleGenerateAiArtForHeritage(heritageItem.id, prompt);
        setIsGeneratingArt(false);
    };

    return (
        <div className="space-y-12 animate-fade-in-up">
            <section className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-amber-900 dark:text-amber-200 mb-4">
                    شناسنامه زنده میراث شما
                </h1>
                <p className="text-lg text-stone-700 dark:text-stone-300 max-w-2xl mx-auto">
                    اینجا داستان میراث شماست؛ داستانی که با شما رشد می‌کند.
                </p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
                <div className="lg:col-span-2">
                     <Certificate
                        userName={heritageItem.details.recipient || heritageItem.details.plantedBy}
                        palmName={heritageItem.details.title}
                        date={new Date(heritageItem.date).toLocaleDateString('fa-IR')}
                        certificateId={heritageItem.details.certificateId}
                    />
                </div>
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white dark:bg-stone-800/50 p-6 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50">
                        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                            <SparklesIcon className="w-6 h-6 text-purple-500" />
                            پرتره روح (خلق شده با هوش مصنوعی)
                        </h3>
                        {isGeneratingArt ? (
                             <div className="aspect-square bg-stone-100 dark:bg-stone-800 rounded-lg flex flex-col items-center justify-center text-center p-4 animate-pulse">
                                <SparklesIcon className="w-12 h-12 text-purple-400"/>
                                <p className="mt-2 font-semibold text-stone-600 dark:text-stone-300">در حال نقاشی روح این میراث...</p>
                            </div>
                        ) : heritageItem.details.aiArtImageUrl ? (
                            <img src={heritageItem.details.aiArtImageUrl} alt="AI Soul Portrait" className="w-full rounded-lg shadow-md" />
                        ) : (
                            <div className="aspect-square bg-stone-100 dark:bg-stone-800 rounded-lg flex flex-col items-center justify-center text-center p-4">
                                <p className="text-stone-600 dark:text-stone-300 mb-4">هنوز پرتره‌ای برای این میراث خلق نشده است.</p>
                                <button onClick={handleGenerateArt} className="bg-purple-500 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2">
                                   <SparklesIcon className="w-5 h-5"/> خلق پرتره هنری
                                </button>
                            </div>
                        )}
                    </div>

                     <div className="bg-white dark:bg-stone-800/50 p-6 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50">
                        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                            <HeartIcon className="w-6 h-6 text-red-500"/>
                            خاطره و تامل شما
                        </h3>
                        {heritageItem.userReflection?.notes ? (
                            <blockquote className="p-4 bg-stone-50 dark:bg-stone-700/50 rounded-lg border-r-4 border-red-400">
                                <p className="italic text-stone-700 dark:text-stone-200">"{heritageItem.userReflection.notes}"</p>
                            </blockquote>
                        ) : (
                            <p className="text-stone-500 dark:text-stone-400">هنوز خاطره‌ای برای این میراث ثبت نکرده‌اید.</p>
                        )}
                         <button onClick={() => setReflectionModalState({ isOpen: true, heritageItem })} className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/40">
                            <PlusIcon className="w-5 h-5"/>
                            {heritageItem.userReflection?.notes ? 'ویرایش خاطره' : 'افزودن خاطره'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivingHeritagePage;
