
import React, { useState, useEffect } from 'react';
import { Deed } from '../types';
import Modal from './Modal';
import { generatePalmVoice } from '../services/geminiService';
import { SparklesIcon, LeafIcon } from './icons';

interface VoiceOfPalmModalProps {
    isOpen: boolean;
    onClose: () => void;
    deed: Deed;
}

const VoiceOfPalmModal: React.FC<VoiceOfPalmModalProps> = ({ isOpen, onClose, deed }) => {
    const [content, setContent] = useState<{ message: string; mood: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && !content) {
            handleGenerate();
        }
    }, [isOpen]);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            // Mock context for now
            const context = { season: 'تابستان', weather: 'آفتابی و گرم' };
            const result = await generatePalmVoice(deed, context);
            setContent(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 text-center max-w-md w-full bg-gradient-to-b from-stone-900 to-green-900 rounded-2xl border border-green-700/50 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
                
                <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto bg-green-800/50 rounded-full flex items-center justify-center mb-4 border-2 border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.3)]">
                        <div className="animate-pulse" style={{ animationDuration: '3s' }}>
                            <LeafIcon className="w-10 h-10 text-green-300" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-green-200 mb-1">صدای نخل شما</h2>
                    <p className="text-xs text-green-400/70 uppercase tracking-widest mb-6">پیامی از قلب خاک</p>

                    {isLoading ? (
                        <div className="py-8 text-green-200/50 animate-pulse">
                            در حال گوش سپردن به طبیعت...
                        </div>
                    ) : content ? (
                        <div className="animate-fade-in-up">
                            <blockquote className="text-lg text-stone-100 font-serif italic leading-relaxed mb-6 relative">
                                <span className="absolute -top-4 -right-2 text-4xl text-green-600/30">"</span>
                                {content.message}
                                <span className="absolute -bottom-8 -left-2 text-4xl text-green-600/30">"</span>
                            </blockquote>
                            
                            <div className="flex justify-center gap-2 mb-6">
                                <span className="px-3 py-1 rounded-full bg-green-900/50 border border-green-700/50 text-xs text-green-300">
                                    حس: {content.mood}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-amber-900/50 border border-amber-700/50 text-xs text-amber-300">
                                    فصل: تابستان
                                </span>
                            </div>

                            <button 
                                onClick={onClose}
                                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg transition-all hover:scale-105"
                            >
                                سپاسگزارم
                            </button>
                        </div>
                    ) : (
                        <p className="text-red-400">ارتباط برقرار نشد.</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default VoiceOfPalmModal;
