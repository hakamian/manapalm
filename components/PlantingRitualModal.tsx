
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SproutIcon, XMarkIcon, SparklesIcon, TreeIcon } from './icons';

interface PlantingRitualModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

const PlantingRitualModal: React.FC<PlantingRitualModalProps> = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState<'intro' | 'planting' | 'growing' | 'blooming'>('intro');

    if (!isOpen) return null;

    const handlePlant = () => {
        setStep('planting');
        setTimeout(() => setStep('growing'), 1500);
        setTimeout(() => setStep('blooming'), 3500);
        setTimeout(() => {
            onComplete();
        }, 5500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-gradient-to-br from-gray-900 to-green-950/30 border border-green-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
                <div className="absolute top-0 right-0 p-4 z-10">
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
                    <AnimatePresence mode='wait'>
                        {step === 'intro' && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 ring-2 ring-green-500/40">
                                    <SproutIcon className="w-10 h-10 text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">کاشت بذر تعهد</h3>
                                <p className="text-gray-300 mb-8 leading-relaxed">
                                    قبل از اینکه سفر دیجیتال خود را آغاز کنید، بیایید با هم بذری بکاریم.
                                    <br />
                                    این بذر نمادی از رشد، برکت و معنایی است که قرار است در زندگی و کسب‌وکار خود خلق کنید.
                                </p>
                                <button
                                    onClick={handlePlant}
                                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-green-600/30 transition-all hover:scale-105"
                                >
                                    🌱 می‌کارم
                                </button>
                            </motion.div>
                        )}

                        {step === 'planting' && (
                            <motion.div
                                key="planting"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center"
                            >
                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="text-6xl mb-4"
                                >
                                    🌱
                                </motion.div>
                                <p className="text-green-300 font-medium">در حال کاشت در خاک حاصلخیز...</p>
                            </motion.div>
                        )}

                        {step === 'growing' && (
                            <motion.div
                                key="growing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center"
                            >
                                <motion.div
                                    initial={{ scale: 0.5 }}
                                    animate={{ scale: 1.2 }}
                                    transition={{ duration: 1.5 }}
                                    className="text-7xl mb-4 text-green-400"
                                >
                                    🌿
                                </motion.div>
                                <p className="text-green-300 font-medium">ریشه می‌دواند و قد می‌کشد...</p>
                            </motion.div>
                        )}

                        {step === 'blooming' && (
                            <motion.div
                                key="blooming"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center"
                            >
                                <div className="relative">
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="absolute -top-4 -right-4 w-8 h-8 text-yellow-400"
                                    >
                                        <SparklesIcon />
                                    </motion.div>
                                    <TreeIcon className="w-24 h-24 text-green-400 mb-6 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">تعهد شما سبز شد!</h3>
                                <p className="text-gray-300">حالا وقت آن است که کسب‌وکارتان را نیز مانند این درخت پرورش دهید.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default PlantingRitualModal;
