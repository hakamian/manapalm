import React from 'react';
import Modal from './Modal.tsx';
import { AwardIcon, SparklesIcon } from './icons.tsx';

interface ProfileCompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    points: number;
}

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({ isOpen, onClose, points }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 text-center max-w-sm">
                <div className="relative w-24 h-24 mx-auto mb-4">
                    <AwardIcon className="w-24 h-24 text-amber-400" />
                    <SparklesIcon className="absolute -top-1 -right-1 w-8 h-8 text-yellow-300 animate-ping" style={{ animationDuration: '1.5s' }}/>
                    <SparklesIcon className="absolute bottom-0 left-0 w-6 h-6 text-yellow-300" style={{ animationDelay: '0.5s' }} />
                </div>
                <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200">تبریک! پروفایل شما کامل شد!</h2>
                <p className="my-3 text-stone-600 dark:text-stone-300">
                    شما با تکمیل اطلاعات خود، یک قدم بزرگ در سفر قهرمانی‌تان برداشتید و
                    <span className="font-bold text-amber-500"> {points.toLocaleString('fa-IR')} امتیاز </span>
                    هدیه گرفتید.
                </p>
                <button
                    onClick={onClose}
                    className="w-full mt-4 bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-all transform hover:scale-105 shadow-lg"
                >
                    برو به پورتال سفر قهرمانی
                </button>
            </div>
        </Modal>
    );
};

export default ProfileCompletionModal;