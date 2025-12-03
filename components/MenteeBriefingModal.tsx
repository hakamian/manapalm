import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { generateMenteeBriefing } from '../services/geminiService';
import { SparklesIcon, XMarkIcon } from './icons';

interface MenteeBriefingModalProps {
    isOpen: boolean;
    onClose: () => void;
    mentee: User;
}

const MenteeBriefingModal: React.FC<MenteeBriefingModalProps> = ({ isOpen, onClose, mentee }) => {
    const [briefing, setBriefing] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchBriefing = async () => {
                setIsLoading(true);
                try {
                    const result = await generateMenteeBriefing(mentee);
                    setBriefing(result);
                } catch (error) {
                    console.error("Error generating mentee briefing:", error);
                    setBriefing("خطا در تولید خلاصه وضعیت. لطفاً فعالیت‌های اخیر رهجو را دستی بررسی کنید.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchBriefing();
        }
    }, [isOpen, mentee]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">خلاصه وضعیت هوشمند برای {mentee.name}</h3>
                    <button onClick={onClose}><XMarkIcon /></button>
                </div>
                <div className="p-4 bg-gray-700/50 rounded-lg min-h-[200px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <div className="animate-pulse flex flex-col items-center">
                                <SparklesIcon className="w-10 h-10 text-blue-400" />
                                <p className="mt-2 font-semibold">در حال تحلیل وضعیت رهجو...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="whitespace-pre-wrap text-gray-200"
                             dangerouslySetInnerHTML={{ __html: briefing.replace(/\* /g, '• ').replace(/\n/g, '<br />') }} />
                    )}
                </div>
                <button onClick={onClose} className="mt-4 w-full bg-gray-600 hover:bg-gray-700 font-semibold py-2 rounded-lg">بستن</button>
            </div>
        </div>
    );
};

export default MenteeBriefingModal;
