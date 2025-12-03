import React, { useEffect, useState } from 'react';
import { AwardIcon, XIcon } from './icons.tsx';

interface ProfileBonusPromptProps {
    show: boolean;
    onClose: () => void;
}

const ProfileBonusPrompt: React.FC<ProfileBonusPromptProps> = ({ show, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
             const timer = setTimeout(() => {
                onClose();
            }, 5000); // Auto-close after 5 seconds
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed bottom-24 right-5 w-full max-w-sm z-70 transition-all duration-300 ease-in-out ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}
        >
            <div className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl p-4 border border-green-300/80 dark:border-green-700/80">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                        <AwardIcon className="w-6 h-6 text-green-500 dark:text-green-400" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-green-800 dark:text-green-200">پروفایل کامل شد!</h3>
                        <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">
                            تبریک! شما با تکمیل پروفایل خود <strong>۱۰۰ امتیاز</strong> هدیه دریافت کردید.
                        </p>
                    </div>
                     <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 flex-shrink-0">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileBonusPrompt;