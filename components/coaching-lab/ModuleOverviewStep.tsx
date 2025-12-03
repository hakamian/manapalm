
import React from 'react';
import Modal from '../Modal';
import { BookOpenIcon, SparklesIcon, ClockIcon, ArrowLeftIcon, LockClosedIcon, StarIcon } from '../icons';
import { bookJourneys } from '../../utils/coachingData';

interface ModuleOverviewStepProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: () => void;
    module: typeof bookJourneys[0]['modules'][0];
    bookTitle: string;
    isUnlocked: boolean;
    onUnlockRequest?: () => void;
}

const ModuleOverviewStep: React.FC<ModuleOverviewStepProps> = ({ 
    isOpen, onClose, onStart, module, bookTitle, isUnlocked, onUnlockRequest 
}) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-[90vw] max-w-lg bg-stone-900 text-white rounded-2xl border border-stone-700 p-6 overflow-y-auto max-h-[90vh]">
                <div className="text-center mb-6">
                    <div className="inline-block p-3 bg-blue-900/30 rounded-full mb-3 border border-blue-500/30">
                            <BookOpenIcon className="w-10 h-10 text-blue-400" />
                    </div>
                    <p className="text-xs text-blue-300 font-semibold tracking-wider uppercase mb-1">{bookTitle}</p>
                    <h2 className="text-2xl font-bold text-white">{module.title}</h2>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 mb-6">
                    <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4"/> انتظارات این جلسه
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        {module.summary}
                    </p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                        <ClockIcon className="w-4 h-4" />
                        <span>زمان تخمینی: <span className="text-white font-bold">{module.timeEstimate}</span></span>
                    </div>
                </div>
                
                {!isUnlocked && (
                    <div className="mb-6 p-4 bg-stone-800 rounded-xl border border-stone-600 text-center">
                            <p className="text-sm text-stone-300 mb-3">این محتوا قفل است. برای دسترسی، لطفاً پرداخت کنید.</p>
                            <div className="flex justify-center gap-2 text-yellow-400 font-bold text-sm">
                                <StarIcon className="w-5 h-5" />
                                <span>۵۰۰ امتیاز</span>
                            </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-700 text-gray-300 font-semibold hover:bg-gray-600 transition-colors">
                        انصراف
                    </button>
                    {isUnlocked ? (
                        <button 
                            onClick={onStart} 
                            className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 transform hover:scale-105 bg-green-600 hover:bg-green-500"
                        >
                            شروع مطالعه عمیق
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                    ) : (
                        <button 
                            onClick={onUnlockRequest} 
                            className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 transform hover:scale-105 bg-amber-600 hover:bg-amber-500"
                        >
                            <LockClosedIcon className="w-5 h-5" />
                            پرداخت و شروع
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ModuleOverviewStep;
