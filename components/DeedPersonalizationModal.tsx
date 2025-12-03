
import React, { useState, useEffect, useMemo } from 'react';
import { PalmType, User } from '../types';
import { SparklesIcon, TrophyIcon, LockClosedIcon, ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon } from './icons';
import { getAIAssistedText } from '../services/geminiService';
import InstallmentInfo from './InstallmentInfo';
import { getInstallmentOptions } from '../services/gamificationService';
import { useAppDispatch, useAppState } from '../AppContext';


interface DeedPersonalizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    palm: PalmType | null;
    user: User | null;
    onConfirm: (palm: PalmType, quantity: number, deedDetails: { name: string; intention: string; message: string; fromName?: string; groveKeeperId?: string; }, selectedPlan: number) => void;
}

const DeedPersonalizationModal: React.FC<DeedPersonalizationModalProps> = ({ isOpen, onClose, palm, user, onConfirm }) => {
    const [step, setStep] = useState<'recipient' | 'message' | 'review'>('recipient');
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

    const [deedName, setDeedName] = useState('');
    const [fromName, setFromName] = useState('');
    const [deedMessage, setDeedMessage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(1);
    const dispatch = useAppDispatch();
    const { allUsers } = useAppState();
    const [selectedKeeperId, setSelectedKeeperId] = useState<string>('');
    const [isForSelf, setIsForSelf] = useState(false);

    const groveKeepers = useMemo(() => allUsers.filter(u => u.isGroveKeeper), [allUsers]);

    useEffect(() => {
        if (isOpen && palm) {
            setDeedName(user?.fullName || '');
            setFromName('');
            setDeedMessage('');
            setQuantity(1);
            setSelectedPlan(1);
            setStep('recipient');
            if (user?.isGroveKeeper) {
                setSelectedKeeperId(user.id);
            } else if (groveKeepers.length > 0) {
                setSelectedKeeperId(groveKeepers[0].id);
            }
        }
    }, [isOpen, palm, user, groveKeepers]);

    useEffect(() => {
        if (isForSelf) {
            setDeedName(user?.fullName || '');
        } else if (deedName === user?.fullName) {
             setDeedName('');
        }
    }, [isForSelf, user?.fullName]);

    const basePoints = palm?.points || 0;
    const hasBonus = useMemo(() => 
        user?.values && palm?.tags?.some(tag => user.values?.includes(tag)),
        [user, palm]
    );
    const bonusPoints = hasBonus ? Math.round(basePoints * 0.5) : 0;
    const totalPoints = basePoints + bonusPoints;


    if (!isOpen || !palm) return null;

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

    const handleAIAssist = async () => {
        setIsGeneratingMessage(true);
        try {
            const hasText = deedMessage.trim().length > 0;
            const response = await getAIAssistedText({
                mode: hasText ? 'improve' : 'generate',
                type: 'deed_message',
                text: hasText ? deedMessage : '', 
                context: palm.name,
            });
            setDeedMessage(response);
        } catch (error) {
            console.error("Error with AI assist:", error);
        } finally {
            setIsGeneratingMessage(false);
        }
    };

    const handleConfirm = () => {
        if (!deedName.trim()) return;
        onConfirm(palm, quantity, {
            name: deedName,
            intention: palm.name,
            message: deedMessage,
            fromName: fromName,
            groveKeeperId: (palm.id !== 'p_heritage_meaning' && groveKeepers.length > 0) ? selectedKeeperId : undefined,
        }, selectedPlan);
    };

    const allInstallmentOptions = getInstallmentOptions(user?.points);
    const animationClass = direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left';

    return (
         <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-4" onClick={onClose}>
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
            <div className="bg-stone-900 text-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] border border-stone-700 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Ambient Background */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-green-600 z-10"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="p-6 flex-shrink-0 text-center relative z-10">
                    <h2 className="text-2xl font-bold mb-1 font-serif">آیین کاشت {palm.name}</h2>
                    <p className="text-xs text-stone-400">مرحله {step === 'recipient' ? '۱' : step === 'message' ? '۲' : '۳'} از ۳</p>
                </div>

                <div className="overflow-y-auto px-6 pb-6 space-y-6 relative z-10">
                    
                    {step === 'recipient' && (
                        <div key="recipient" className={`space-y-6 ${animationClass}`}>
                            <div className="text-center space-y-2">
                                <p className="text-lg">این نخل به نام چه کسی ریشه خواهد زد؟</p>
                                <p className="text-sm text-stone-400">نام صاحب معنوی این میراث را وارد کنید.</p>
                            </div>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={deedName}
                                    onChange={e => setDeedName(e.target.value)}
                                    className="w-full text-center p-4 text-lg border-2 border-stone-600 rounded-xl bg-stone-800 focus:border-amber-500 focus:ring-0 transition-colors placeholder-stone-500"
                                    placeholder="نام کامل"
                                />
                                <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => setIsForSelf(!isForSelf)}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${isForSelf ? 'bg-amber-500 border-amber-500' : 'border-stone-500'}`}>
                                        {isForSelf && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                    <span className="text-sm text-stone-300">این نخل را برای خودم می‌کارم.</span>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2 text-center">از طرف (اختیاری)</label>
                                    <input
                                        type="text"
                                        value={fromName}
                                        onChange={e => setFromName(e.target.value)}
                                        className="w-full text-center p-3 border border-stone-600 rounded-lg bg-stone-800/50 focus:border-amber-500 focus:outline-none text-sm"
                                        placeholder="نام هدیه‌دهنده"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'message' && (
                        <div key="message" className={`space-y-6 ${animationClass}`}>
                            <div className="text-center space-y-2">
                                <p className="text-lg">چه پیامی بر قلب این نخل حک شود؟</p>
                                <p className="text-sm text-stone-400">یک جمله کوتاه و ماندگار که با رشد نخل، زنده بماند.</p>
                            </div>
                            <div className="relative">
                                <textarea
                                    value={deedMessage}
                                    onChange={e => setDeedMessage(e.target.value)}
                                    rows={4}
                                    className="w-full p-4 border-2 border-stone-600 rounded-xl bg-stone-800 focus:border-amber-500 focus:ring-0 transition-colors placeholder-stone-500 resize-none"
                                    placeholder="پیام خود را بنویسید..."
                                />
                                <button 
                                    type="button" 
                                    onClick={handleAIAssist}
                                    disabled={isGeneratingMessage} 
                                    className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-900/30 border border-amber-500/30 px-3 py-1.5 rounded-full hover:bg-amber-900/50 disabled:opacity-50 transition-colors"
                                >
                                    {isGeneratingMessage ? <span className="animate-pulse">در حال الهام...</span> : <><SparklesIcon className="w-3 h-3"/> {deedMessage ? 'بهبود شاعرانه' : 'پیشنهاد متن'}</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'review' && (
                         <div key="review" className={`space-y-6 ${animationClass}`}>
                            <div className="bg-stone-800/80 border border-stone-600 p-5 rounded-xl text-center space-y-4">
                                <div>
                                    <p className="text-xs text-stone-400 mb-1">نیت کاشت</p>
                                    <h3 className="text-xl font-bold text-amber-400">{palm.name}</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t border-stone-700 pt-4">
                                    <div>
                                        <p className="text-xs text-stone-400">به نام</p>
                                        <p className="font-semibold">{deedName}</p>
                                    </div>
                                    {fromName && (
                                        <div>
                                            <p className="text-xs text-stone-400">از طرف</p>
                                            <p className="font-semibold">{fromName}</p>
                                        </div>
                                    )}
                                </div>
                                {deedMessage && (
                                    <div className="pt-2">
                                        <p className="text-xs text-stone-400 mb-1">پیام ماندگار</p>
                                        <p className="italic text-stone-300">"{deedMessage}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-stone-400">هزینه سرمایه‌گذاری</span>
                                    <span className="font-bold text-lg">{(palm.price * quantity).toLocaleString('fa-IR')} تومان</span>
                                </div>
                                
                                {/* Payment Plan Selection */}
                                <div className="space-y-2">
                                    <p className="text-xs text-stone-500">طرح پرداخت خود را انتخاب کنید:</p>
                                    {allInstallmentOptions.map(opt => (
                                        (opt.installments === 1 || opt.installments > 1) && (
                                            <label key={opt.installments} className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${selectedPlan === opt.installments ? 'bg-green-900/20 border-green-500' : 'bg-stone-800 border-stone-600 hover:border-stone-500'} ${!opt.isUnlocked && opt.installments > 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="radio" 
                                                        name="paymentPlan" 
                                                        value={opt.installments} 
                                                        checked={selectedPlan === opt.installments} 
                                                        onChange={() => opt.isUnlocked && setSelectedPlan(opt.installments)} 
                                                        disabled={!opt.isUnlocked && opt.installments > 1}
                                                        className="w-4 h-4 text-green-500 focus:ring-green-500 bg-stone-700 border-stone-500"
                                                    />
                                                    <span className="text-sm">{opt.installments === 1 ? 'پرداخت کامل' : `${opt.installments} قسط`}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-sm">{Math.ceil((palm.price * quantity) / opt.installments).toLocaleString('fa-IR')} ت</span>
                                                    {opt.installments > 1 && <span className="text-xs text-stone-400 block">ماهانه</span>}
                                                </div>
                                                {!opt.isUnlocked && opt.installments > 1 && <LockClosedIcon className="w-4 h-4 text-yellow-500" />}
                                            </label>
                                        )
                                    ))}
                                </div>
                            </div>
                         </div>
                    )}
                </div>

                <div className="p-6 border-t border-stone-700 flex justify-between items-center bg-stone-800/50 rounded-b-2xl z-10">
                    {step !== 'recipient' ? (
                        <button onClick={handlePrevStep} className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors">
                           <ArrowRightIcon className="w-5 h-5"/> بازگشت
                        </button>
                    ) : (
                        <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">انصراف</button>
                    )}
                    
                    {step !== 'review' ? (
                        <button onClick={handleNextStep} disabled={!deedName.trim() && step === 'recipient'} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-xl transition-colors disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed shadow-lg shadow-amber-900/20">
                            <span>مرحله بعد</span>
                             <ArrowLeftIcon className="w-5 h-5"/>
                        </button>
                    ) : (
                        <button onClick={handleConfirm} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-8 rounded-xl transition-colors shadow-lg shadow-green-900/20 flex items-center gap-2">
                            <CheckCircleIcon className="w-5 h-5"/>
                            تایید نهایی
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeedPersonalizationModal;
