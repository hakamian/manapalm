


import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { User, TimelineEvent } from '../../types.ts';
import { SparklesIcon } from '../icons.tsx';
import Modal from '../Modal.tsx';

interface ImageGeneratorProps {
    user: User;
    onUpdateProfile: (updatedUser: Partial<User>) => void;
    creativeActsCount: number;
    creativeStorageCapacity: number;
    onOpenPurchaseModal: () => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ user, onUpdateProfile, creativeActsCount, creativeStorageCapacity, onOpenPurchaseModal }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [reflectionNotes, setReflectionNotes] = useState('');

    const isStorageFull = creativeActsCount >= creativeStorageCapacity;

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('لطفا یک ایده برای خلق تصویر بنویسید.');
            return;
        }
        setIsLoading(true);
        setGeneratedImage(null);
        setError(null);

        // Enhanced prompt for realism and quality
        const enhancedPrompt = `Photorealistic, high-quality, 8k resolution, cinematic lighting, detailed texture, professional product photography style. Subject: ${prompt}. Neutral or blurred background to emphasize the subject.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: enhancedPrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                },
            });
            
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            setGeneratedImage(imageUrl);
        } catch (err) {
            console.error("Image generation failed:", err);
            let errorMessage = "متاسفانه در خلق تصویر خطایی رخ داد. لطفا دوباره تلاش کنید.";
            if (err instanceof Error && (err.message.includes("quota") || err.message.includes("RESOURCE_EXHAUSTED"))) {
                errorMessage = "سهمیه شما برای استفاده از این قابلیت به پایان رسیده است.";
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveToJournal = () => {
        if (!generatedImage || isStorageFull) return;

        const newEvent: TimelineEvent = {
            id: `evt_creative_${Date.now()}`,
            date: new Date().toISOString(),
            type: 'creative_act',
            title: 'یک اثر هنری خلق کردید',
            description: reflectionNotes || `خلق شده با ایده: "${prompt}"`,
            details: {
                mediaType: 'image',
                imageUrl: generatedImage,
                prompt: prompt,
            },
            userReflection: {
                notes: reflectionNotes
            }
        };
        
        const updatedTimeline = [newEvent, ...(user.timeline || [])];
        onUpdateProfile({ timeline: updatedTimeline });
        
        setIsSaveModalOpen(false);
        setReflectionNotes('');
        setGeneratedImage(null);
        setPrompt('');
    };
    
    const handleOpenPurchaseModal = () => {
        setIsSaveModalOpen(false);
        onOpenPurchaseModal();
    };

    return (
        <div className="w-full h-full bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg flex flex-col border border-stone-200/80 dark:border-stone-700">
            <div className="p-4 border-b border-stone-200 dark:border-stone-700">
                <h3 className="font-bold text-xl text-stone-800 dark:text-stone-100">استودیو تصویر نمادین (Imagen)</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">ایده‌ها و تاملات خود را به تصاویر هنری و واقعی تبدیل کنید.</p>
            </div>
            
            <div className="flex-1 p-4 md:p-6 flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/2 flex flex-col gap-4">
                    <div>
                        <label className="font-semibold block mb-2">ایده اصلی (Prompt)</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="مثال: یک سبد حصیری پر از خرمای تازه روی میز چوبی..."
                            rows={4}
                            className="w-full bg-stone-100 dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-amber-400"
                            disabled={isLoading}
                        />
                    </div>
                     <button 
                        onClick={handleGenerate} 
                        disabled={isLoading || !prompt.trim()}
                        className="w-full mt-auto bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-amber-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                         <SparklesIcon className="w-5 h-5"/>
                         {isLoading ? 'در حال خلق...' : 'خلق کن'}
                    </button>
                </div>
                <div className="lg:w-1/2 flex-grow flex items-center justify-center bg-stone-50 dark:bg-stone-800 rounded-lg p-4">
                    {isLoading ? (
                        <div className="text-center p-8">
                             <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 border-4 border-amber-200 dark:border-amber-800 rounded-full animate-pulse"></div>
                                <SparklesIcon className="w-10 h-10 text-amber-500 dark:text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                            </div>
                            <p className="mt-4 font-semibold text-stone-600 dark:text-stone-300">قلم‌موی هوشمند در حال کار است...</p>
                        </div>
                    ) : generatedImage ? (
                        <div className="text-center">
                            <img src={generatedImage} alt="Generated art" className="max-w-full max-h-80 rounded-lg shadow-xl" />
                             <div className="flex justify-center gap-3 mt-4">
                                <a href={generatedImage} download={`nakhlestan-art-${Date.now()}.jpg`} className="px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 rounded-lg">دانلود</a>
                                <button onClick={() => setIsSaveModalOpen(true)} className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg">ثبت به عنوان خاطره</button>
                            </div>
                        </div>
                    ) : (
                         <div className="text-center text-stone-400 dark:text-stone-500">
                             <SparklesIcon className="w-16 h-16 mx-auto"/>
                             <p className="mt-2">اثر هنری شما اینجا نمایش داده می‌شود.</p>
                         </div>
                    )}
                </div>
            </div>
             {error && <p className="text-center text-sm text-red-500 dark:text-red-400 py-2 border-t dark:border-stone-700">{error}</p>}

            <Modal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)}>
                <div className="p-4 text-center max-w-sm">
                    <h3 className="text-lg font-bold">ثبت در دفترچه خاطرات</h3>
                    {isStorageFull ? (
                         <div className="my-4">
                            <p className="text-red-500 font-semibold">ظرفیت گالری خلاقیت شما پر شده است.</p>
                             <p className="text-sm text-stone-600 dark:text-stone-300 mt-2">
                                برای ذخیره آثار بیشتر، می‌توانید ظرفیت گالری خود را با استفاده از امتیازهایتان افزایش دهید.
                             </p>
                        </div>
                    ) : (
                        <>
                            <p className="my-2 text-sm text-stone-600 dark:text-stone-300">
                                یک یادداشت برای این اثر هنری بنویسید.
                                <br />
                                <span className="font-semibold">{creativeActsCount} از {creativeStorageCapacity} اثر ذخیره شده.</span>
                            </p>
                            <textarea
                                value={reflectionNotes}
                                onChange={(e) => setReflectionNotes(e.target.value)}
                                placeholder="احساس یا داستان پشت این تصویر..."
                                rows={3}
                                className="w-full mt-4 bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-md p-2"
                            />
                        </>
                    )}
                     <div className="flex justify-center gap-4 mt-6">
                        <button onClick={() => setIsSaveModalOpen(false)} className="px-6 py-2 rounded-lg bg-stone-100 dark:bg-stone-600">انصراف</button>
                        {isStorageFull ? (
                             <button onClick={handleOpenPurchaseModal} className="px-6 py-2 font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-600">افزایش ظرفیت</button>
                        ) : (
                             <button onClick={handleSaveToJournal} className="px-6 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700">ثبت کن</button>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ImageGenerator;