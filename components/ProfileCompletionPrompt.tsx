import React, { useEffect, useState } from 'react';
import { AwardIcon, XIcon } from './icons.tsx';

interface ProfileCompletionPromptProps {
    show: boolean;
    onConfirm: () => void;
    onDismiss: () => void;
}

const ProfileCompletionPrompt: React.FC<ProfileCompletionPromptProps> = ({ show, onConfirm, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
        } else {
            // Delay hiding to allow for exit animation
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className={`fixed bottom-24 right-5 w-full max-w-sm z-70 transition-all duration-300 ease-in-out ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}
        >
            <div className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl p-4 border border-amber-300/80 dark:border-amber-700/80">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
                        <AwardIcon className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-amber-800 dark:text-amber-200">یک قدم تا امتیاز هدیه!</h3>
                        <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">
                            نام خانوادگی و ایمیل خود را در پروفایل ثبت کنید و <strong>۱۰۰ امتیاز هدیه</strong> دیگر دریافت کنید.
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
                        فعلا نه
                    </button>
                     <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
                    >
                        بله، می‌خواهم
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletionPrompt;