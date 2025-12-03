
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { User, HeritageItem } from '../types.ts';
import Modal from './Modal.tsx';
import { SparklesIcon } from './icons.tsx';

interface PlantingModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    palmType: HeritageItem;
    initialDetails?: { recipient: string; message: string; };
    onSave: (details: { recipient: string; message: string; }) => void;
}

const PlantingModal: React.FC<PlantingModalProps> = ({ isOpen, onClose, user, palmType, initialDetails, onSave }) => {
    const [recipientName, setRecipientName] = useState(initialDetails?.recipient || '');
    const [isForSelf, setIsForSelf] = useState(false);
    const [message, setMessage] = useState(initialDetails?.message || '');
    const [isGenerating, setIsGenerating] = useState(false);

    const isDecisionPalm = palmType.title === 'نخل تصمیم';

    useEffect(() => {
        if (isForSelf) {
            setRecipientName(user.name);
        } else {
            // If user unchecks, and name was user's name, clear it.
            if(recipientName === user.name) {
                 setRecipientName('');
            }
        }
    }, [isForSelf, user.name, recipientName]);

    // Pre-fill state when modal opens with initial details
    useEffect(() => {
        if (isOpen) {
            setRecipientName(initialDetails?.recipient || '');
            setMessage(initialDetails?.message || '');
            if(initialDetails?.recipient === user.name) {
                setIsForSelf(true);
            } else {
                setIsForSelf(false);
            }
        }
    }, [isOpen, initialDetails, user.name]);


    const handleGenerateMessage = async () => {
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const isImproving = message.trim() !== '';

            let prompt;
            if (isImproving) {
                prompt = `Rewrite the following text into a single, very short (max 10-12 words), poetic sentence in Persian suitable for a palm planting deed. Original text: "${message}". Respond ONLY with the improved Persian text. Do not use quotes.`;
            } else {
                prompt = isDecisionPalm
                    ? `کاربر تصمیمی گرفته است: '${message || 'یک هدف جدید'}'. این تصمیم برای '${recipientName || 'خودم'}' است. این را به یک جمله کوتاه (حداکثر ۱۰ کلمه) و انگیزشی برای ثبت در سند تبدیل کن. فقط متن نهایی.`
                    : `یک جمله بسیار کوتاه (حداکثر ۱۰ کلمه)، شاعرانه و ماندگار برای شناسنامه '${palmType.title}' که به '${recipientName || 'عزیز'}' تقدیم می‌شود بنویس. متن باید آماده چاپ و بدون توضیحات اضافه باشد.`;
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

    const handleSave = () => {
        onSave({ recipient: recipientName, message });
    };
    
    const hasText = message.trim() !== '';

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-[90vw] max-w-lg p-2">
                <h3 className="text-xl font-bold mb-4 text-center">
                    {isDecisionPalm ? 'ثبت تصمیم مهم شما' : `تکمیل اطلاعات کاشت ${palmType.title}`}
                </h3>
                <div className="space-y-4 text-right">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                             {isDecisionPalm ? 'این تصمیم برای چه کسی/چیزی است؟' : 'این نخل به چه کسی تقدیم می‌شود؟'}
                        </label>
                        <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} disabled={isForSelf} placeholder={isDecisionPalm ? 'مثال: خودم، آینده شغلی‌ام، خانواده‌ام' : 'نام گیرنده'} className="w-full p-2 border rounded-md bg-transparent dark:border-stone-600 disabled:bg-stone-100 dark:disabled:bg-stone-700" />
                        <div className="flex items-center mt-2">
                            <input type="checkbox" id="forSelfModal" checked={isForSelf} onChange={(e) => setIsForSelf(e.target.checked)} className="ml-2 rounded text-amber-500 focus:ring-amber-500" />
                            <label htmlFor="forSelfModal" className="text-sm">
                                {isDecisionPalm ? 'این تصمیم شخصی برای خودم است.' : 'این نخل را برای خودم می‌کارم.'}
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {isDecisionPalm ? 'تصمیم خود را بنویسید:' : 'متن تقدیمی:'}
                        </label>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder={isDecisionPalm ? 'من تصمیم می‌گیرم که...' : 'یک پیام ماندگار بنویسید...'} className="w-full p-2 border rounded-md bg-transparent dark:border-stone-600"></textarea>
                        <button onClick={handleGenerateMessage} disabled={isGenerating} className="mt-1 text-sm text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 hover:underline disabled:opacity-50">
                            {isGenerating ? 'در حال پردازش...' : (hasText ? 'بهبود متن با هوش مصنوعی' : 'کمک از هوش مصنوعی')}
                            <SparklesIcon className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
                <button onClick={handleSave} className="mt-6 w-full bg-amber-500 text-white font-bold py-2.5 rounded-lg hover:bg-amber-600">ذخیره اطلاعات</button>
            </div>
        </Modal>
    );
};

export default PlantingModal;