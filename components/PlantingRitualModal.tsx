
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { User, HeritageItem } from '../types.ts';
import Modal from './Modal.tsx';
import { SparklesIcon, ArrowLeftIcon, ArrowRightIcon, iconMap, StarIcon, HandshakeIcon } from './icons.tsx';

interface PlantingRitualModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null; // AUDIT FIX: Allow null user
    item: HeritageItem;
    onComplete: (item: HeritageItem, details: { recipient: string; message: string; isAnonymous: boolean; pointsApplied: number; }) => void;
}

type Step = 'recipient' | 'message' | 'review';

const POINTS_TO_TOMAN_RATE = 10; // 1 point = 10 Toman

const PlantingRitualModal: React.FC<PlantingRitualModalProps> = ({ isOpen, onClose, user, item, onComplete }) => {
    const [step, setStep] = useState<Step>('recipient');
    const [recipientName, setRecipientName] = useState('');
    const [isForSelf, setIsForSelf] = useState(false);
    const [message, setMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const [shareAnonymously, setShareAnonymously] = useState(false);
    const [pointsApplied, setPointsApplied] = useState(0);

    const isDecisionPalm = item.title === 'نخل تصمیم';
    const IconComponent = iconMap[item.icon as keyof typeof iconMap];
    
    const maxPointsToApply = user ? Math.min(user.points, Math.floor(item.price / POINTS_TO_TOMAN_RATE)) : 0;
    const discount = pointsApplied * POINTS_TO_TOMAN_RATE;
    const finalPrice = item.price - discount;

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setStep('recipient');
            setRecipientName('');
            setIsForSelf(false);
            setMessage('');
            setShareAnonymously(false);
            setPointsApplied(0);
            setDirection('forward');
        }
    }, [isOpen]);

    useEffect(() => {
        if (isForSelf) {
            setRecipientName(user?.name || 'خودم');
        } else if (user && recipientName === user.name) {
            setRecipientName('');
        } else if (!user && recipientName === 'خودم') {
            setRecipientName('');
        }
    }, [isForSelf, user?.name]);

    const handleNextStep = () => {
        setDirection('forward');
        if (step === 'recipient') setStep('message');
        else if (step === 'message') setStep('review');
    };

    const handlePrevStep = () => {
        setDirection('backward');
        if (step === 'review') setStep('message');
        else if (step === 'message') setStep('recipient');
    };
    
    const handleGenerateMessage = async () => {
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const isImproving = message.trim() !== '';

            let prompt;
            if (isImproving) {
                prompt = `Rewite the following text into a single, very short (max 10-12 words), poetic sentence in Persian suitable for a palm planting deed. Original text: "${message}". Respond ONLY with the improved Persian text. Do not use quotes.`;
            } else {
                prompt = isDecisionPalm
                    ? `کاربر تصمیمی گرفته است: '${message || 'یک هدف جدید'}'. این تصمیم برای '${recipientName || 'خودم'}' است. این را به یک جمله کوتاه (حداکثر ۱۰ کلمه) و انگیزشی برای ثبت در سند تبدیل کن. فقط متن نهایی.`
                    : `یک جمله بسیار کوتاه (حداکثر ۱۰ کلمه)، شاعرانه و ماندگار برای شناسنامه '${item.title}' که به '${recipientName || 'عزیز'}' تقدیم می‌شود بنویس. متن باید آماده چاپ و بدون توضیحات اضافه باشد.`;
            }
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setMessage(response.text);
        } catch (error) {
            console.error("AI message generation/improvement failed:", error);
            setMessage("خطا در پردازش متن. لطفاً خودتان بنویسید.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSubmit = () => {
        onComplete(item, { recipient: recipientName, message, isAnonymous: shareAnonymously, pointsApplied });
    };

    const steps = ['recipient', 'message', 'review'];
    const currentStepIndex = steps.indexOf(step);

    const animationClass = direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left';
    
    const renderStepContent = () => {
        switch (step) {
            case 'recipient':
                return (
                    <div key="recipient" className={`space-y-6 ${animationClass}`}>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold">تقدیم به...</h3>
                            <p className="text-stone-500 dark:text-stone-400 mt-1">{isDecisionPalm ? 'این تصمیم برای چه کسی/چیزی است؟' : 'این نخل به چه کسی تقدیم می‌شود؟'}</p>
                        </div>
                        <div className="space-y-4">
                            <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} disabled={isForSelf} placeholder={isDecisionPalm ? 'مثال: خودم، آینده شغلی‌ام' : 'نام گیرنده'} className="w-full text-center p-3 border-2 rounded-lg bg-transparent dark:border-stone-600 focus:border-amber-400 focus:ring-amber-400 disabled:bg-stone-100 dark:disabled:bg-stone-700" />
                            <div className="flex items-center justify-center">
                                <input type="checkbox" id="forSelfRitual" checked={isForSelf} onChange={(e) => setIsForSelf(e.target.checked)} className="ml-2 w-5 h-5 rounded text-amber-500 focus:ring-amber-500" />
                                <label htmlFor="forSelfRitual" className="text-sm">{isDecisionPalm ? 'این تصمیم شخصی برای خودم است.' : 'این نخل را برای خودم می‌کارم.'}</label>
                            </div>
                        </div>
                    </div>
                );
            case 'message':
                const hasText = message.trim() !== '';
                return (
                    <div key="message" className={`space-y-6 ${animationClass}`}>
                         <div className="text-center">
                            <h3 className="text-2xl font-bold">حک کردن پیام</h3>
                            <p className="text-stone-500 dark:text-stone-400 mt-1">{isDecisionPalm ? 'تصمیم خود را بنویسید تا ماندگار شود.' : 'یک پیام ماندگار برای این میراث بنویسید.'}</p>
                        </div>
                        <div className="relative">
                           <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder={isDecisionPalm ? 'من تصمیم می‌گیرم که...' : 'پیام شما...'} className="w-full p-3 border-2 rounded-lg bg-transparent dark:border-stone-600 focus:border-amber-400 focus:ring-amber-400"></textarea>
                            <button onClick={handleGenerateMessage} disabled={isGenerating} className="absolute bottom-3 left-3 text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800/50 disabled:opacity-50">
                                {isGenerating ? '...' : (hasText ? 'بهبود با AI' : 'کمک از AI')}
                                <SparklesIcon className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`}/>
                            </button>
                        </div>
                    </div>
                );
            case 'review':
                return (
                     <div key="review" className={`space-y-4 ${animationClass}`}>
                        <div className="text-center">
                           <h3 className="text-2xl font-bold">بازبینی نهایی</h3>
                           <p className="text-stone-500 dark:text-stone-400 mt-1">پیش‌نمایش میراثی که ثبت می‌کنید.</p>
                        </div>
                        <div className={`p-4 rounded-lg border-2 bg-stone-50 dark:bg-stone-800 border-${item.color}-300 dark:border-${item.color}-700/50 text-center space-y-3`}>
                             {IconComponent && <IconComponent className={`w-12 h-12 text-${item.color}-500 dark:text-${item.color}-400 mx-auto`} />}
                             <h4 className="font-bold text-xl">{item.title}</h4>
                             <p className="text-sm">
                                <span className="text-stone-500 dark:text-stone-400">{isDecisionPalm ? 'برای: ' : 'تقدیم به: '}</span>
                                <span className="font-semibold">{recipientName || 'شما'}</span>
                             </p>
                             {message && (
                                <blockquote className="pt-3 border-t border-dashed dark:border-stone-600">
                                    <p className="italic text-stone-600 dark:text-stone-300">"{message}"</p>
                                </blockquote>
                             )}
                        </div>
                        
                        {user ? (
                            <div className="pt-2">
                                 <h4 className="font-semibold text-sm mb-2">استفاده از امتیاز (اختیاری)</h4>
                                <div className="p-3 bg-stone-100 dark:bg-stone-700/50 rounded-lg space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-semibold">موجودی شما: {user.points.toLocaleString('fa-IR')} امتیاز</span>
                                        <span className="font-semibold text-amber-600 dark:text-amber-400">{pointsApplied.toLocaleString('fa-IR')} امتیاز</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={maxPointsToApply}
                                        step="1"
                                        value={pointsApplied}
                                        onChange={(e) => setPointsApplied(Number(e.target.value))}
                                        className="w-full h-2 bg-stone-200 dark:bg-stone-600 rounded-lg appearance-none cursor-pointer"
                                        disabled={maxPointsToApply === 0}
                                    />
                                    <p className="text-center text-xs font-semibold text-green-600 dark:text-green-400">
                                        تخفیف: {discount.toLocaleString('fa-IR')} تومان
                                    </p>
                                </div>
                            </div>
                        ) : (
                             <div className="pt-2">
                                <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-xs text-blue-300 text-center">
                                    برای استفاده از تخفیف امتیازی، لطفا وارد حساب کاربری شوید.
                                </div>
                            </div>
                        )}

                        <div className="text-center space-y-2 pt-2">
                            <div>
                                <p className="text-xs font-semibold text-green-800 dark:text-green-300">مبلغ سرمایه‌گذاری اجتماعی</p>
                                <span className="text-2xl font-bold text-green-700 dark:text-green-300">{(item.price * 0.9).toLocaleString('fa-IR')}</span>
                                <span className="font-semibold text-green-700 dark:text-green-300"> تومان</span>
                            </div>
                            
                            <p className="font-semibold text-base">
                                مبلغ نهایی پرداخت: 
                                {discount > 0 && <span className="text-sm text-stone-500 dark:text-stone-400 line-through mr-2">{item.price.toLocaleString('fa-IR')}</span>}
                                <span className="text-amber-700 dark:text-amber-300"> {finalPrice.toLocaleString('fa-IR')} تومان</span>
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-center pt-2">
                            <input
                                type="checkbox"
                                id="shareRitualAnonymously"
                                checked={shareAnonymously}
                                onChange={(e) => setShareAnonymously(e.target.checked)}
                                className="w-5 h-5 ml-2 rounded text-amber-500 focus:ring-amber-500"
                            />
                            <label htmlFor="shareRitualAnonymously" className="text-sm text-stone-600 dark:text-stone-300">
                                انتشار این لحظه به صورت <span className="font-semibold">ناشناس</span> در باغ عمومی
                            </label>
                        </div>
                     </div>
                );
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-[90vw] max-w-lg p-4 sm:p-6 bg-white dark:bg-stone-800/50 rounded-2xl">
                <div className="mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">آیین کاشت {item.title}</span>
                        <span className="text-sm text-stone-500">{currentStepIndex + 1} از {steps.length}</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-1.5 mt-2">
                        <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}></div>
                    </div>
                </div>

                <div className="overflow-x-hidden">
                    {renderStepContent()}
                </div>

                <div className="mt-8 flex justify-between items-center">
                    {step !== 'recipient' ? (
                        <button onClick={handlePrevStep} className="flex items-center gap-2 font-semibold text-stone-600 dark:text-stone-300 hover:text-black dark:hover:text-white transition-colors p-2">
                           <span>بازگشت</span>
                           <ArrowRightIcon className="w-5 h-5"/>
                        </button>
                    ) : <div></div>}
                    
                    {step !== 'review' ? (
                        <button onClick={handleNextStep} disabled={!recipientName && step === 'recipient'} className="flex items-center gap-2 font-bold text-white bg-amber-500 px-6 py-2.5 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-amber-300">
                            <span>ادامه</span>
                             <ArrowLeftIcon className="w-5 h-5"/>
                        </button>
                    ) : (
                        <button onClick={handleSubmit} className="font-bold text-white bg-green-600 px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors">
                            این میراث را ثبت کن
                        </button>
                    )}
                </div>
                 <style>{`
                    @keyframes slide-in-right {
                        from { transform: translateX(30px); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    .animate-slide-in-right { animation: slide-in-right 0.4s ease-out forwards; }
                    @keyframes slide-in-left {
                        from { transform: translateX(-30px); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    .animate-slide-in-left { animation: slide-in-left 0.4s ease-out forwards; }
                `}</style>
            </div>
        </Modal>
    );
};

export default PlantingRitualModal;
