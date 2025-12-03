import React from 'react';
import Modal from './Modal.tsx';
import { LightBulbIcon } from './icons.tsx';

interface ReflectionGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ReflectionGuideModal: React.FC<ReflectionGuideModalProps> = ({ isOpen, onClose }) => {
    
    const questions = [
        "این رویداد چه احساسی در من ایجاد کرد؟",
        "چه چیزی در مورد خودم یا دنیای اطرافم یاد گرفتم؟",
        "این لحظه چگونه با ارزش‌های اصلی من ارتباط دارد؟",
        "این تجربه چه تاثیری بر مسیر آینده من خواهد داشت؟",
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 text-center max-w-md">
                <LightBulbIcon className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">راهنمای نوشتن تامل</h2>
                <p className="my-4 text-stone-600 dark:text-stone-300">
                    برای عمق بخشیدن به خاطرات خود، از این سوالات راهنما کمک بگیرید:
                </p>
                <ul className="space-y-2 text-right text-stone-700 dark:text-stone-200 list-disc list-inside">
                    {questions.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
                <button
                    onClick={onClose}
                    className="w-full mt-6 bg-amber-500 text-white font-bold py-2.5 rounded-lg hover:bg-amber-600"
                >
                    متوجه شدم
                </button>
            </div>
        </Modal>
    );
};

export default ReflectionGuideModal;
