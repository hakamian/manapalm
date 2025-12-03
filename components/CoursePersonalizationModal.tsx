
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { SparklesIcon, BriefcaseIcon, TargetIcon, FireIcon, CpuChipIcon } from './icons';
import { CoursePersonalization } from '../types';

interface CoursePersonalizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (persona: CoursePersonalization) => void;
    courseTitle: string;
}

const loadingMessages = [
    "در حال تحلیل پروفایل شغلی شما...",
    "شناسایی چالش‌های کلیدی در صنعت...",
    "بازنویسی سرفصل‌ها برای نقش شما...",
    "طراحی تمرین‌های عملی اختصاصی...",
    "تزریق هوش مصنوعی به محتوای دوره...",
    "نهایی‌سازی نقشه راه شخصی..."
];

const CoursePersonalizationModal: React.FC<CoursePersonalizationModalProps> = ({ isOpen, onClose, onComplete, courseTitle }) => {
    const [step, setStep] = useState<number | 'processing'>(1);
    const [role, setRole] = useState('');
    const [industry, setIndustry] = useState('');
    const [challenge, setChallenge] = useState('');
    const [goal, setGoal] = useState('');
    
    // Processing state
    const [loadingIndex, setLoadingIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setLoadingIndex(0);
            setProgress(0);
        }
    }, [isOpen]);

    // Handle the processing simulation
    useEffect(() => {
        if (step === 'processing') {
            const totalDuration = 20000; // 20 seconds as requested
            const intervalTime = 3000; // Change message every 3 seconds
            
            // Message cycler
            const msgInterval = setInterval(() => {
                setLoadingIndex(prev => (prev + 1) % loadingMessages.length);
            }, intervalTime);

            // Progress bar
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(progressInterval);
                        return 100;
                    }
                    return prev + 1;
                });
            }, totalDuration / 100);

            // Completion timeout
            const completeTimeout = setTimeout(() => {
                clearInterval(msgInterval);
                clearInterval(progressInterval);
                onComplete({ role, industry, challenge, goal });
            }, totalDuration);

            return () => {
                clearInterval(msgInterval);
                clearInterval(progressInterval);
                clearTimeout(completeTimeout);
            };
        }
    }, [step, onComplete, role, industry, challenge, goal]);

    const handleNext = () => {
        if (typeof step === 'number') {
            if (step < 3) setStep(step + 1);
            else setStep('processing');
        }
    };

    const renderProcessing = () => (
        <div className="text-center py-8 animate-fade-in">
            <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-stone-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-amber-500 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                     <CpuChipIcon className="w-10 h-10 text-amber-400 animate-pulse" />
                </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-4 animate-pulse">
                {loadingMessages[loadingIndex]}
            </h3>
            
            <p className="text-stone-400 text-sm mb-8">
                هوش مصنوعی در حال طراحی دوره «{courseTitle}» متناسب با شخصیت شماست...
            </p>

            <div className="w-full bg-stone-700 rounded-full h-3 overflow-hidden relative border border-stone-600">
                <div 
                    className="bg-gradient-to-r from-amber-500 to-orange-600 h-full transition-all duration-200 ease-linear relative"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
            </div>
            <p className="text-xs text-right mt-2 text-stone-500">{Math.round(progress)}%</p>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={step === 'processing' ? () => {} : onClose}>
            <div className="w-[90vw] max-w-lg p-6 text-center">
                {step !== 'processing' && (
                    <div className="mb-6">
                         <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                            <SparklesIcon className="w-8 h-8 text-amber-500 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">شخصی‌سازی دوره</h2>
                        <p className="text-stone-400 text-sm">
                            هوش مصنوعی محتوای دوره «{courseTitle}» را دقیقاً برای شرایط شما بازنویسی می‌کند.
                        </p>
                    </div>
                )}

                {step === 'processing' ? renderProcessing() : (
                    <>
                        <div className="space-y-6 text-right">
                            {step === 1 && (
                                <div className="animate-fade-in">
                                    <label className="block text-sm font-semibold text-stone-300 mb-2 flex items-center gap-2">
                                        <BriefcaseIcon className="w-4 h-4"/> نقش فعلی شما چیست؟
                                    </label>
                                    <input 
                                        type="text" 
                                        value={role}
                                        onChange={e => setRole(e.target.value)}
                                        placeholder="مثلاً: مدیر فروش، بنیان‌گذار استارتاپ..."
                                        className="w-full bg-stone-800 border border-stone-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 mb-4"
                                        autoFocus
                                    />
                                     <label className="block text-sm font-semibold text-stone-300 mb-2 flex items-center gap-2">
                                        <BriefcaseIcon className="w-4 h-4"/> در چه صنعتی فعالیت می‌کنید؟
                                    </label>
                                    <input 
                                        type="text" 
                                        value={industry}
                                        onChange={e => setIndustry(e.target.value)}
                                        placeholder="مثلاً: پوشاک، نرم‌افزار، آموزش..."
                                        className="w-full bg-stone-800 border border-stone-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            )}

                            {step === 2 && (
                                <div className="animate-fade-in">
                                    <label className="block text-sm font-semibold text-stone-300 mb-2 flex items-center gap-2">
                                        <FireIcon className="w-4 h-4 text-red-400"/> بزرگترین چالش فعلی شما چیست؟
                                    </label>
                                    <textarea 
                                        value={challenge}
                                        onChange={e => setChallenge(e.target.value)}
                                        placeholder="مثلاً: فروش کم است، کارمندان انگیزه ندارند..."
                                        rows={3}
                                        className="w-full bg-stone-800 border border-stone-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 mb-4 resize-none"
                                        autoFocus
                                    />
                                </div>
                            )}
                            
                            {step === 3 && (
                                <div className="animate-fade-in">
                                    <label className="block text-sm font-semibold text-stone-300 mb-2 flex items-center gap-2">
                                        <TargetIcon className="w-4 h-4 text-green-400"/> هدف اصلی شما از این دوره چیست؟
                                    </label>
                                    <textarea 
                                        value={goal}
                                        onChange={e => setGoal(e.target.value)}
                                        placeholder="مثلاً: می‌خواهم در ۳ ماه آینده فروش را ۲ برابر کنم..."
                                        rows={3}
                                        className="w-full bg-stone-800 border border-stone-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 mb-4 resize-none"
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-between items-center">
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`w-2 h-2 rounded-full ${step >= i ? 'bg-amber-500' : 'bg-stone-700'}`}></div>
                                ))}
                            </div>
                            <button 
                                onClick={handleNext}
                                disabled={(step === 1 && (!role || !industry)) || (step === 2 && !challenge) || (step === 3 && !goal)}
                                className="bg-white text-stone-900 font-bold py-2 px-6 rounded-lg hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {step === 3 ? 'تایید و طراحی دوره' : 'بعدی'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default CoursePersonalizationModal;
