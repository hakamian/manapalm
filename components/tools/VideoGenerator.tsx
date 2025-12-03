
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { User, TimelineEvent, View } from '../../types.ts';
import { SparklesIcon, VideoCameraIcon, StarIcon } from '../icons.tsx';
import Modal from '../Modal.tsx';
import { getFallbackMessage } from '../../services/geminiService.ts';
import { useAppDispatch } from '../../AppContext.tsx'; // Import dispatch

interface VideoGeneratorProps {
    user: User;
    onUpdateProfile: (updatedUser: Partial<User>) => void;
    creativeActsCount: number;
    creativeStorageCapacity: number;
    onOpenPurchaseModal: () => void;
}

const loadingMessages = [
    "در حال آماده‌سازی صحنه...",
    "نور، دوربین، هوش مصنوعی!",
    "کارگردان دیجیتال در حال کار است...",
    "در حال پردازش فریم به فریم...",
    "این فرآیند ممکن است چند دقیقه طول بکشد. از صبوری شما متشکریم.",
    "خلق یک رویای متحرک..."
];

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result;
            if (typeof base64data === 'string') {
                resolve(base64data.split(',')[1]);
            } else {
                reject(new Error("Failed to read blob data."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
    });
};

// AUDIT FIX: Updated cost to reflect high value and server load
const VIDEO_GENERATION_COST = 1500; // Mana points per generation

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ user, onUpdateProfile, creativeActsCount, creativeStorageCapacity, onOpenPurchaseModal }) => {
    const dispatch = useAppDispatch(); // Get dispatch
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [reflectionNotes, setReflectionNotes] = useState('');
    
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [image, setImage] = useState<{file: File, preview: string} | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');

    const loadingIntervalRef = useRef<number | null>(null);
    const isStorageFull = creativeActsCount >= creativeStorageCapacity;

    useEffect(() => {
        const checkApiKey = async () => {
            if ((window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
            }
        };
        checkApiKey();
        
        return () => {
            if (loadingIntervalRef.current) {
                clearInterval(loadingIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isLoading) {
            loadingIntervalRef.current = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    return loadingMessages[(currentIndex + 1) % loadingMessages.length];
                });
            }, 3000);
        } else {
            if (loadingIntervalRef.current) {
                clearInterval(loadingIntervalRef.current);
            }
        }
    }, [isLoading]);
    
    const handleSelectKey = async () => {
        if ((window as any).aistudio && typeof (window as any).aistudio.openSelectKey === 'function') {
            await (window as any).aistudio.openSelectKey();
            setApiKeySelected(true);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage({ file, preview: URL.createObjectURL(file) });
        }
    };

    const handleBuyCredits = () => {
        // Find or create a mana pack product
        const manaPack = {
            id: 'p_mana_pack',
            name: 'بسته معنا (۱۰۰۰ امتیاز)',
            price: 10000,
            type: 'service' as const,
            image: 'https://picsum.photos/seed/mana/400/400',
            stock: 999,
            points: 0, // Points are the product itself, not a bonus
            popularity: 100,
            dateAdded: new Date().toISOString(),
            category: 'ارتقا',
            description: 'افزایش موجودی امتیاز معنا برای استفاده از ابزارهای هوشمند.'
        };

        dispatch({ type: 'ADD_TO_CART', payload: { product: manaPack, quantity: 2 } }); // Suggest 2 packs for video
        dispatch({ type: 'SET_PENDING_REDIRECT', payload: View.AI_CREATION_STUDIO }); // Redirect back here
        dispatch({ type: 'TOGGLE_CART', payload: true });
    };

    const handleGenerate = async () => {
        if (!prompt.trim() && !image) {
            setError('لطفا یک ایده یا تصویر برای خلق ویدیو ارائه دهید.');
            return;
        }
        
        // CHECK CREDITS
        if (user.manaPoints < VIDEO_GENERATION_COST) {
            setError(`موجودی کافی نیست. هزینه تولید: ${VIDEO_GENERATION_COST} امتیاز معنا.`);
            return;
        }

        setIsLoading(true);
        setGeneratedVideo(null);
        setError(null);

        // DEDUCT POINTS
        dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: VIDEO_GENERATION_COST, action: 'تولید ویدیو با Veo' } });

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let imagePayload;
            if (image) {
                const base64Data = await blobToBase64(image.file);
                imagePayload = {
                    imageBytes: base64Data,
                    mimeType: image.file.type,
                };
            }

            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                ...(imagePayload && { image: imagePayload }),
                config: {
                    numberOfVideos: 1,
                    resolution: resolution,
                    aspectRatio: aspectRatio,
                }
            });

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            if(operation.error) {
                throw new Error(String(operation.error.message));
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                if(!videoResponse.ok) throw new Error("Failed to download video.");
                const videoBlob = await videoResponse.blob();
                const videoUrl = URL.createObjectURL(videoBlob);
                setGeneratedVideo(videoUrl);
            } else {
                throw new Error("AI did not return a video.");
            }

        } catch (err: any) {
            console.error("Video generation failed:", err);
            let errorMessage = getFallbackMessage('contentCreation');
            if (err instanceof Error) {
                const message = err.message;
                if (message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
                    errorMessage = "سهمیه شما برای استفاده از این قابلیت به پایان رسیده است.";
                } else if (message.includes("Requested entity was not found")) {
                    errorMessage = "کلید API نامعتبر است. لطفا یک کلید جدید انتخاب کنید.";
                    setApiKeySelected(false);
                }
            }
            // Refund points on failure? Optional, but fair.
            // dispatch({ type: 'UPDATE_USER', payload: { manaPoints: user.manaPoints + VIDEO_GENERATION_COST } });
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!generatedVideo) return;
        const link = document.createElement('a');
        link.href = generatedVideo;
        link.download = `nakhlestan-ma'na-video-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSaveToJournal = async () => {
        if (!generatedVideo || isStorageFull) return;
        
        const response = await fetch(generatedVideo);
        const blob = await response.blob();
        const dataUrl = await new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });

        const newEvent: TimelineEvent = {
            id: `evt_creative_${Date.now()}`,
            date: new  Date().toISOString(),
            type: 'creative_act',
            title: 'یک ویدیو خلق کردید',
            description: reflectionNotes || `خلق شده با ایده: "${prompt}"`,
            details: {
                mediaType: 'video',
                videoUrl: dataUrl,
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
        setGeneratedVideo(null);
        setPrompt('');
        setImage(null);
    };
    
     const handleOpenPurchaseModal = () => {
        setIsSaveModalOpen(false);
        onOpenPurchaseModal();
    };
    
    if(!apiKeySelected) {
        return (
            <div className="w-full h-full bg-white dark:bg-stone-800/50 rounded-2xl flex flex-col items-center justify-center text-center p-8 border border-stone-200/80 dark:border-stone-700">
                <VideoCameraIcon className="w-16 h-16 text-stone-400 dark:text-stone-500 mb-4"/>
                <h3 className="text-xl font-bold text-stone-700 dark:text-stone-200">نیاز به کلید API</h3>
                <p className="text-stone-600 dark:text-stone-300 mt-2 max-w-sm">
                    برای استفاده از ابزار تولید ویدیو (Veo)، ابتدا باید کلید API خود را از طریق Google AI Studio انتخاب کنید.
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
                    اطلاعات بیشتر در مورد صورتحساب در <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline">مستندات ما</a> موجود است.
                </p>
                 {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                <button
                    onClick={handleSelectKey}
                    className="mt-6 bg-amber-500 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-amber-600 transition-colors"
                >
                    انتخاب کلید API
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg flex flex-col border border-stone-200/80 dark:border-stone-700">
            <div className="p-4 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-xl text-stone-800 dark:text-stone-100">تولید ویدیو (Veo)</h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400">هزینه هر اجرا: {VIDEO_GENERATION_COST} امتیاز معنا</p>
                </div>
                <div className="bg-stone-700 px-3 py-1 rounded-lg flex items-center gap-2">
                    <span className="text-xs text-gray-300">موجودی:</span>
                    <span className={`font-bold ${user.manaPoints >= VIDEO_GENERATION_COST ? 'text-green-400' : 'text-red-400'}`}>{user.manaPoints.toLocaleString('fa-IR')}</span>
                    <StarIcon className="w-3 h-3 text-indigo-400" />
                </div>
            </div>

            <div className="flex-1 p-4 md:p-6 flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/2 flex flex-col gap-4">
                    <div>
                        <label className="font-semibold block mb-2">ایده اصلی (Prompt)</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="یک گربه هولوگرامی نئونی..."
                            rows={3}
                            className="w-full bg-stone-100 dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-amber-400"
                            disabled={isLoading}
                        />
                    </div>
                     <div>
                        <label className="font-semibold block mb-2">تصویر اولیه (اختیاری)</label>
                        <div className="w-full h-32 border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-lg flex items-center justify-center text-center relative">
                            {image ? (
                                <>
                                    <img src={image.preview} alt="Preview" className="w-full h-full object-contain rounded-lg"/>
                                    <button onClick={() => setImage(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 text-sm">X</button>
                                </>
                            ) : (
                                <p className="text-sm text-stone-500 dark:text-stone-400">تصویر را بکشید یا کلیک کنید</p>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isLoading}/>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="font-semibold block mb-2">نسبت تصویر</label>
                             <div className="flex gap-2">
                                <button onClick={() => setAspectRatio('16:9')} disabled={isLoading} className={`w-full p-2 rounded-lg border-2 ${aspectRatio === '16:9' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'border-stone-300 dark:border-stone-600'}`}>افقی</button>
                                <button onClick={() => setAspectRatio('9:16')} disabled={isLoading} className={`w-full p-2 rounded-lg border-2 ${aspectRatio === '9:16' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'border-stone-300 dark:border-stone-600'}`}>عمودی</button>
                             </div>
                        </div>
                        <div>
                             <label className="font-semibold block mb-2">کیفیت</label>
                             <div className="flex gap-2">
                                <button onClick={() => setResolution('720p')} disabled={isLoading} className={`w-full p-2 rounded-lg border-2 ${resolution === '720p' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'border-stone-300 dark:border-stone-600'}`}>720p</button>
                                <button onClick={() => setResolution('1080p')} disabled={isLoading} className={`w-full p-2 rounded-lg border-2 ${resolution === '1080p' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'border-stone-300 dark:border-stone-600'}`}>1080p</button>
                             </div>
                        </div>
                    </div>
                    
                    {user.manaPoints < VIDEO_GENERATION_COST ? (
                        <button 
                            onClick={handleBuyCredits} 
                            className="w-full mt-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <StarIcon className="w-5 h-5"/>
                            خرید اعتبار (۱۰۰۰ امتیاز = ۱۰,۰۰۰ تومان)
                        </button>
                    ) : (
                        <button 
                            onClick={handleGenerate} 
                            disabled={isLoading || (!prompt.trim() && !image)}
                            className="w-full mt-auto bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-amber-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                             <SparklesIcon className="w-5 h-5"/>
                             خلق ویدیو ({VIDEO_GENERATION_COST} امتیاز)
                        </button>
                    )}
                </div>
                <div className="lg:w-1/2 flex-grow flex items-center justify-center bg-stone-50 dark:bg-stone-800 rounded-lg p-4">
                    {isLoading ? (
                        <div className="text-center p-8">
                             <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 border-4 border-amber-200 dark:border-amber-800 rounded-full animate-pulse"></div>
                                <VideoCameraIcon className="w-10 h-10 text-amber-500 dark:text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                            </div>
                            <p className="mt-4 font-semibold text-stone-600 dark:text-stone-300">{loadingMessage}</p>
                        </div>
                    ) : generatedVideo ? (
                        <div className="text-center">
                            <video src={generatedVideo} controls autoPlay loop className="max-w-full max-h-80 rounded-lg shadow-xl" />
                             <div className="flex flex-wrap justify-center gap-3 mt-4">
                                <button onClick={handleDownload} className="px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 rounded-lg">دانلود</button>
                                <button onClick={() => setIsSaveModalOpen(true)} className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg">ثبت به عنوان خاطره</button>
                            </div>
                        </div>
                    ) : (
                         <div className="text-center text-stone-400 dark:text-stone-500">
                             <VideoCameraIcon className="w-16 h-16 mx-auto"/>
                             <p className="mt-2">ویدیوی شما اینجا نمایش داده می‌شود.</p>
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
                                placeholder="احساس یا داستان پشت این ویدیو..."
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

export default VideoGenerator;
