
import React, { useState, useEffect } from 'react';
import { Deed, User, TimelineEvent } from '../types';
import { generateImage, getAIAssistedText } from '../services/geminiService';
import { useAppDispatch, useAppState } from '../AppContext';
import { XMarkIcon, SparklesIcon, ArrowDownTrayIcon, PencilSquareIcon, ShareIcon, CheckCircleIcon, PlusCircleIcon, ExclamationCircleIcon } from './icons';

interface SocialPostGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  deed: Deed | null;
}

const SocialPostGeneratorModal: React.FC<SocialPostGeneratorModalProps> = ({ isOpen, onClose, deed }) => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [image, setImage] = useState<string | null>(null);
    const [caption, setCaption] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16'>('1:1');
    const [step, setStep] = useState<'select' | 'generating' | 'result'>('select');
    const [isSavedToTimeline, setIsSavedToTimeline] = useState(false);

    useEffect(() => {
        if (isOpen && deed && user) {
            // Reset state when modal opens
            setStep('select');
            setImage(null);
            setCaption('');
            setError(null);
            setIsSavedToTimeline(false);

            if (user.ambassadorPacksRemaining <= 0) {
                // User doesn't have a pack, show unlock modal
                sessionStorage.setItem('postPurchaseAction', JSON.stringify({ action: 'generateSocialPost', deedId: deed.id }));
                dispatch({ type: 'SHOW_AMBASSADOR_UNLOCK_MODAL', payload: true });
                onClose(); // Close this modal
            }
        }
    }, [isOpen, deed, user]);

    const handleGenerate = async () => {
        if (!deed || !user) return;
        
        setStep('generating');
        setIsLoading(true);
        setError(null);
        
        try {
            // 1. Generate Content (Caption)
            const captionPromptContext = {
                ...deed,
                format: aspectRatio === '1:1' ? 'Instagram Post' : 'Instagram Story',
                user_name: user.name
            };
            
            const captionPromise = getAIAssistedText({
                mode: 'generate',
                type: 'social_media_post',
                text: deed.message || '',
                context: captionPromptContext,
            });

            // 2. Generate Image
            // Optimized prompt for artistic, shareable content for Nano Banana
            const orientation = aspectRatio === '1:1' ? 'square' : 'vertical';
            const imagePrompt = `A high quality, artistic digital painting of a date palm tree in a ${orientation} composition. 
            Theme: ${deed.intention}. 
            Atmosphere: Hopeful, warm golden lighting, magical realism style. 
            The palm tree is the main subject. 
            No text on the image.`;

            const imagePromise = generateImage(imagePrompt, aspectRatio);

            const [captionResult, imageUrl] = await Promise.all([captionPromise, imagePromise]);
            
            setCaption(captionResult);
            setImage(imageUrl);
            
            // Deduct pack
            dispatch({ type: 'UPDATE_USER', payload: { ambassadorPacksRemaining: user.ambassadorPacksRemaining - 1 } });
            setStep('result');

        } catch (e) {
            console.error("Error generating social post:", e);
            setError(e instanceof Error ? e.message : "خطا در تولید محتوا. لطفا دوباره تلاش کنید.");
            setStep('select'); // Go back to selection so user can retry
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveToTimeline = () => {
        if (!deed || !image) return;

        const newEvent: TimelineEvent = {
            id: `evt_social_post_${Date.now()}`,
            date: new Date().toISOString(),
            type: 'creative_act',
            title: 'خلق اثر هنری با هوشمانا',
            description: caption.substring(0, 100) + '...',
            deedId: deed.id,
            memoryImage: image,
            memoryText: caption,
            details: {
                deedId: deed.id,
                intention: deed.intention,
                mediaType: 'image',
                imageUrl: image
            }
        };

        dispatch({ type: 'ADD_TIMELINE_EVENT', payload: newEvent });
        setIsSavedToTimeline(true);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(caption);
        alert('متن کپی شد!');
    };

    const handleDownload = () => {
        if (!image) return;
        const link = document.createElement('a');
        link.href = image;
        link.download = `nakhlestan-mana-${aspectRatio === '1:1' ? 'post' : 'story'}-${deed?.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = async () => {
        if (navigator.share && image) {
            try {
                // Convert base64 to blob for sharing
                const res = await fetch(image);
                const blob = await res.blob();
                const file = new File([blob], "image.jpg", { type: "image/jpeg" });

                await navigator.share({
                    title: 'نخلستان معنا',
                    text: caption,
                    files: [file]
                });
            } catch (err) {
                console.error('Sharing failed', err);
            }
        } else {
            handleCopy();
            alert('متن کپی شد. تصویر را دانلود کرده و به اشتراک بگذارید.');
        }
    };

    if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 text-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
             <div className="flex items-center gap-2">
                <SparklesIcon className="text-blue-400 w-6 h-6"/>
                <h2 className="text-lg font-bold">سفیر قصه‌گو</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
            {step === 'select' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">قالب خود را انتخاب کنید</h3>
                        <p className="text-gray-400">می‌خواهید داستان نخل خود را چگونه به اشتراک بگذارید؟</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
                        <button 
                            onClick={() => setAspectRatio('1:1')}
                            className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-4 group ${aspectRatio === '1:1' ? 'border-blue-500 bg-blue-900/20 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-gray-600 bg-gray-700/30 hover:bg-gray-700 hover:border-gray-500'}`}
                        >
                            <div className="w-24 h-24 bg-gray-600 rounded-lg group-hover:scale-105 transition-transform flex items-center justify-center border border-gray-500">
                                <span className="text-xs text-gray-300">1:1</span>
                            </div>
                            <span className={`font-bold ${aspectRatio === '1:1' ? 'text-blue-400' : 'text-gray-300'}`}>پست اینستاگرام</span>
                        </button>

                        <button 
                            onClick={() => setAspectRatio('9:16')}
                            className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-4 group ${aspectRatio === '9:16' ? 'border-purple-500 bg-purple-900/20 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'border-gray-600 bg-gray-700/30 hover:bg-gray-700 hover:border-gray-500'}`}
                        >
                             <div className="w-16 h-28 bg-gray-600 rounded-lg group-hover:scale-105 transition-transform flex items-center justify-center border border-gray-500">
                                <span className="text-xs text-gray-300">9:16</span>
                            </div>
                            <span className={`font-bold ${aspectRatio === '9:16' ? 'text-purple-400' : 'text-gray-300'}`}>استوری</span>
                        </button>
                    </div>

                    <div className="bg-gray-700/50 px-6 py-3 rounded-full border border-gray-600 text-sm text-gray-300">
                         موجودی: <span className="font-bold text-yellow-400">{user?.ambassadorPacksRemaining}</span> بسته سفیر
                    </div>

                    <button 
                        onClick={handleGenerate}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-10 rounded-xl text-lg shadow-lg transform transition hover:scale-105 flex items-center gap-2"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        خلق اثر هنری (سریع)
                    </button>
                    
                    {error && (
                        <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-900/50 max-w-lg mx-auto">
                            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm text-right">{error}</p>
                        </div>
                    )}
                </div>
            )}

            {step === 'generating' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-pulse">
                     <div className="relative w-32 h-32">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-500/30"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
                        <SparklesIcon className="absolute inset-0 m-auto w-12 h-12 text-blue-400" />
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-white mb-2">هوش مصنوعی در حال خلق اثر است...</h3>
                        <p className="text-gray-400 text-sm">در حال نقاشی رویای شما و نوشتن داستانی ماندگار.</p>
                     </div>
                </div>
            )}

            {step === 'result' && image && (
                <div className="h-full flex flex-col lg:flex-row gap-8 animate-fade-in">
                    {/* Preview Area */}
                    <div className="flex-1 flex items-center justify-center bg-black/30 rounded-2xl p-4 border border-gray-700">
                        <img 
                            src={image} 
                            alt="Generated Art" 
                            className={`rounded-lg shadow-2xl object-cover ${aspectRatio === '1:1' ? 'w-full max-w-md aspect-square' : 'h-full max-h-[600px] aspect-[9/16]'}`}
                        />
                    </div>

                    {/* Actions Area */}
                    <div className="flex-1 flex flex-col gap-6">
                        <div className="bg-gray-700/30 p-5 rounded-xl border border-gray-600 flex-grow overflow-y-auto">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-bold text-gray-200 flex items-center gap-2">
                                    <PencilSquareIcon className="w-4 h-4 text-yellow-400"/> متن پیشنهادی
                                </h4>
                                <button onClick={handleCopy} className="text-xs text-blue-400 hover:text-blue-300">کپی متن</button>
                            </div>
                            <textarea 
                                value={caption} 
                                onChange={(e) => setCaption(e.target.value)}
                                className="w-full h-full min-h-[150px] bg-transparent border-none focus:ring-0 text-gray-300 text-sm leading-relaxed resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                             <button onClick={handleDownload} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                دانلود تصویر
                            </button>
                            <button onClick={handleShare} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg">
                                <ShareIcon className="w-5 h-5" />
                                اشتراک‌گذاری
                            </button>
                        </div>
                        
                        <button 
                            onClick={handleSaveToTimeline} 
                            disabled={isSavedToTimeline}
                            className={`w-full font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 ${isSavedToTimeline ? 'bg-green-900/50 text-green-400 cursor-default' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        >
                            {isSavedToTimeline ? (
                                <>
                                    <CheckCircleIcon className="w-5 h-5" />
                                    در گاهشمار ذخیره شد
                                </>
                            ) : (
                                <>
                                    <PlusCircleIcon className="w-5 h-5" />
                                    ذخیره در گاهشمار سند
                                </>
                            )}
                        </button>
                        
                        <button onClick={() => setStep('select')} className="text-gray-500 hover:text-white text-sm underline mt-2 text-center">
                            ساخت یک پست دیگر
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default SocialPostGeneratorModal;
