import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { TimelineEvent } from '../types.ts';
import Modal from './Modal.tsx';
import { HeartIcon, SparklesIcon, LightBulbIcon } from './icons.tsx';
import ReflectionGuideModal from './ReflectionGuideModal.tsx';

interface AddReflectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    heritageItem: TimelineEvent;
    onSave: (heritageItemId: string, reflectionText: string, isAnonymous: boolean) => void;
}

const AddReflectionModal: React.FC<AddReflectionModalProps> = ({ isOpen, onClose, heritageItem, onSave }) => {
    const [reflection, setReflection] = useState('');
    const [isImproving, setIsImproving] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [shareAnonymously, setShareAnonymously] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setReflection(heritageItem.userReflection?.notes || '');
            setShareAnonymously(heritageItem.isSharedAnonymously || false);
        }
    }, [isOpen, heritageItem]);
    
    const handleImproveReflection = async () => {
        if (!reflection.trim()) return;
        setIsImproving(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `You are an expert in writing deep and meaningful personal reflections in Persian. The user has written a reflection about a significant life moment. Your task is to improve it. Make it more evocative, insightful, and eloquent, while PRESERVING the original core meaning and personal voice.\n\nOriginal reflection: "${reflection}"\n\nRespond ONLY with the improved Persian text.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setReflection(response.text);
        } catch (error) {
            console.error("AI reflection improvement failed:", error);
        } finally {
            setIsImproving(false);
        }
    };

    const handleSave = () => {
        onSave(heritageItem.id, reflection, shareAnonymously);
        onClose();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <div className="p-4 w-full max-w-lg">
                    <div className="text-center">
                        <HeartIcon className="w-12 h-12 text-red-500 mx-auto mb-2" />
                        <h3 className="text-xl font-bold">ثبت خاطره برای «{heritageItem.details.title}»</h3>
                        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                            برای این میراث که به {heritageItem.details.recipient} تقدیم شده، یک خاطره یا تامل بنویسید.
                        </p>
                    </div>
                    <div className="my-4 relative">
                        <textarea
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                            rows={6}
                            placeholder="احساس، خاطره یا داستان خود را اینجا بنویسید..."
                            className="w-full p-3 pb-10 border rounded-md bg-transparent dark:border-stone-600 focus:border-amber-400 focus:ring-amber-400"
                        />
                         <div className="absolute bottom-2 left-2 flex items-center gap-2">
                            <button 
                                onClick={handleImproveReflection} 
                                disabled={isImproving || !reflection.trim()} 
                                className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-1.5 rounded-full hover:bg-amber-200 disabled:opacity-50"
                            >
                                <SparklesIcon className="w-4 h-4" />
                                {isImproving ? 'در حال پردازش...' : 'بهبود با AI'}
                            </button>
                             <button 
                                onClick={() => setIsGuideOpen(true)}
                                title="راهنمای نوشتن"
                                className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-700 p-1.5 rounded-full hover:bg-stone-200"
                            >
                                <LightBulbIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                     <div className="flex items-center my-4">
                        <input
                            type="checkbox"
                            id="shareReflectionAnonymously"
                            checked={shareAnonymously}
                            onChange={(e) => setShareAnonymously(e.target.checked)}
                            className="w-5 h-5 ml-2 rounded text-amber-500 focus:ring-amber-500"
                        />
                        <label htmlFor="shareReflectionAnonymously" className="text-sm text-stone-600 dark:text-stone-300">
                            انتشار این خاطره به صورت <span className="font-semibold">ناشناس</span> در باغ عمومی
                        </label>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="px-6 py-2 rounded-lg bg-stone-100 dark:bg-stone-600">انصراف</button>
                        <button onClick={handleSave} disabled={!reflection.trim()} className="px-6 py-2 font-bold text-white bg-amber-500 rounded-lg disabled:bg-amber-300">ذخیره خاطره</button>
                    </div>
                </div>
            </Modal>
            <ReflectionGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
        </>
    );
};

export default AddReflectionModal;