
import React, { useState, useEffect } from 'react';
import { PalmTreeSproutIcon, GiftIcon, HeartIcon, GlobeIcon } from './icons.tsx';

interface WelcomeMatProps {
    onEnter: () => void;
    onSelectIntent: (intent: 'gift' | 'memory' | 'impact') => void;
}

const WelcomeMat: React.FC<WelcomeMatProps> = ({ onEnter, onSelectIntent }) => {
    const [step, setStep] = useState<'intro' | 'question'>('intro');
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setStep('question'), 2500);
        return () => clearTimeout(timer);
    }, []);

    const handleSelection = (intent: 'gift' | 'memory' | 'impact') => {
        setIsExiting(true);
        setTimeout(() => {
            onSelectIntent(intent);
            onEnter();
        }, 500);
    };

    const handleSkip = () => {
        setIsExiting(true);
        setTimeout(onEnter, 500);
    };

    if (isExiting) return null; 

    return (
        <div className={`fixed inset-0 z-[200] flex flex-col justify-center items-center bg-stone-900 text-white transition-opacity duration-500 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {step === 'intro' ? (
                <div className="text-center animate-fade-in-up">
                    <PalmTreeSproutIcon className="w-24 h-24 mx-auto text-amber-400 mb-6 animate-pulse" />
                    <h1 className="text-4xl font-bold mb-4">به نخلستان معنا خوش آمدید</h1>
                    <p className="text-xl text-stone-300">جایی که هر دانه، ریشه در داستانی دارد.</p>
                </div>
            ) : (
                <div className="w-full max-w-4xl px-6 animate-fade-in">
                    <h2 className="text-3xl font-bold text-center mb-12">امروز چه نیتی شما را به اینجا کشانده است؟</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button 
                            onClick={() => handleSelection('gift')}
                            className="group bg-gray-800 border border-gray-700 hover:border-amber-500 p-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 text-center"
                        >
                            <div className="bg-amber-900/30 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                                <GiftIcon className="w-10 h-10 text-amber-400 group-hover:text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">هدیه دادن</h3>
                            <p className="text-sm text-gray-400">می‌خواهم به عزیزی یک نخل با شناسنامه ماندگار هدیه دهم.</p>
                        </button>

                        <button 
                            onClick={() => handleSelection('memory')}
                            className="group bg-gray-800 border border-gray-700 hover:border-pink-500 p-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-2 text-center"
                        >
                            <div className="bg-pink-900/30 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:bg-pink-500 transition-colors">
                                <HeartIcon className="w-10 h-10 text-pink-400 group-hover:text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">ثبت خاطره یا یادبود</h3>
                            <p className="text-sm text-gray-400">می‌خواهم یاد عزیزی را زنده نگه دارم یا تصمیمی را ثبت کنم.</p>
                        </button>

                        <button 
                            onClick={() => handleSelection('impact')}
                            className="group bg-gray-800 border border-gray-700 hover:border-green-500 p-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">پیشنهاد ما</div>
                            <div className="bg-green-900/30 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                                <GlobeIcon className="w-10 h-10 text-green-400 group-hover:text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">تاثیر اجتماعی</h3>
                            <p className="text-sm text-gray-400">می‌خواهم در اشتغال‌زایی و احیای محیط زیست سهیم باشم.</p>
                        </button>
                    </div>
                    
                    <button onClick={handleSkip} className="block mx-auto mt-12 text-stone-500 hover:text-white transition-colors">
                        فقط می‌خواهم نگاهی بیندازم
                    </button>
                </div>
            )}
        </div>
    );
};

export default WelcomeMat;
