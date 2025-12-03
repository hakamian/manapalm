import React, { useState } from 'react';
import Modal from './Modal.tsx';
import { SparklesIcon } from './icons.tsx';

const prompts = [
    "در این ماه، بزرگترین چالش و بزرگترین منبع قدردانی شما چه بوده است؟",
    "کدام یک از ارزش‌های اصلی‌ات در این ماه بیشتر به تو کمک کرد؟ چرا؟",
    "یک پیروزی کوچک که این ماه داشتی و می‌خواهی آن را جشن بگیری چیست؟",
    "چه چیزی در مسیر معنایت اخیراً برایت شفاف‌تر شده است؟"
];

interface CheckInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (prompt: string) => void;
    menteeName: string;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose, onSend, menteeName }) => {
    const [customPrompt, setCustomPrompt] = useState('');

    const handleSend = (prompt: string) => {
        if (prompt.trim()) {
            onSend(prompt.trim());
            onClose();
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4 w-full max-w-lg">
                <h3 className="text-xl font-bold mb-2">ارسال تامل ماهانه برای {menteeName}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">یکی از سوالات زیر را انتخاب کنید یا سوال خودتان را بنویسید.</p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {prompts.map((p, i) => (
                        <button 
                            key={i}
                            onClick={() => handleSend(p)}
                            className="w-full text-right p-3 bg-stone-100 dark:bg-stone-700/50 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        >
                            {p}
                        </button>
                    ))}
                </div>
                 <div className="mt-4 pt-4 border-t dark:border-stone-700">
                    <textarea 
                        value={customPrompt}
                        onChange={e => setCustomPrompt(e.target.value)}
                        placeholder="یا سوال خودتان را اینجا بنویسید..."
                        rows={3}
                        className="w-full p-2 border rounded-md bg-transparent dark:border-stone-600"
                    />
                     <button
                        onClick={() => handleSend(customPrompt)}
                        disabled={!customPrompt.trim()}
                        className="mt-2 w-full bg-amber-500 text-white font-bold py-2.5 rounded-lg hover:bg-amber-600 disabled:bg-amber-300"
                    >
                        ارسال سوال سفارشی
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CheckInModal;