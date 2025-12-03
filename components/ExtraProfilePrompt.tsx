import React, { useEffect, useState } from 'react';
import { AwardIcon, XIcon } from './icons.tsx';

interface ExtraProfilePromptProps {
    show: boolean;
    onConfirm: () => void;
    onDismiss: () => void;
}

const ExtraProfilePrompt: React.FC<ExtraProfilePromptProps> = ({ show, onConfirm, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className={`fixed bottom-24 left-5 w-full max-w-sm z-70 transition-all duration-300 ease-in-out ${show ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}
        >
            <div className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl p-4 border border-indigo-300/80 dark:border-indigo-700/80">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                        <AwardIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-indigo-800 dark:text-indigo-200">کسب امتیاز بیشتر!</h3>
                        <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">
                            با تکمیل اطلاعات بیشتر مانند شغل، سن و آدرس، <strong>۱۵۰ امتیاز دیگر</strong> هدیه بگیرید.
                        </p>
                    </div>
                     <button onClick={onDismiss} className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 flex-shrink-0">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                    <button 
                        onClick={onDismiss}
                        className="px-4 py-2 text-sm font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
                    >
                        بعدا
                    </button>
                     <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
                    >
                        تکمیل پروفایل
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExtraProfilePrompt;