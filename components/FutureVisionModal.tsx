
import React, { useState } from 'react';
import { Deed } from '../types';
import Modal from './Modal';
import { generateFutureVision } from '../services/geminiService';
import { ClockForwardIcon, SparklesIcon, ArrowDownTrayIcon } from './icons';

interface FutureVisionModalProps {
    isOpen: boolean;
    onClose: () => void;
    deed: Deed;
}

const FutureVisionModal: React.FC<FutureVisionModalProps> = ({ isOpen, onClose, deed }) => {
    const [selectedTime, setSelectedTime] = useState<number | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (years: number) => {
        setSelectedTime(years);
        setIsLoading(true);
        setError(null);
        setImage(null);
        
        try {
            const imageUrl = await generateFutureVision(deed, years);
            setImage(imageUrl);
        } catch (err) {
            console.error(err);
            setError('متاسفانه در تصویرسازی آینده خطایی رخ داد. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!image) return;
        const link = document.createElement('a');
        link.href = image;
        link.download = `nakhlestan-future-${deed.id}-${selectedTime}years.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-[90vw] max-w-2xl p-4 sm:p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2 text-amber-500">
                    <ClockForwardIcon className="w-8 h-8" />
                    <SparklesIcon className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-2">ماشین زمان نخلستان</h2>
                <p className="text-stone-600 dark:text-stone-300 mb-6">
                    آینده نخل «{deed.intention}» خود را ببینید.
                </p>

                {!selectedTime && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <button 
                            onClick={() => handleGenerate(10)} 
                            className="p-6 rounded-xl border-2 border-green-500/30 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all group"
                        >
                            <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">۱۰ سال بعد</h3>
                            <p className="text-sm text-stone-500 dark:text-stone-400">نخلی جوان و برومند، در آغاز ثمردهی.</p>
                        </button>
                        <button 
                            onClick={() => handleGenerate(30)} 
                            className="p-6 rounded-xl border-2 border-amber-500/30 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all group"
                        >
                            <h3 className="text-xl font-bold text-amber-700 dark:text-amber-300 mb-2">۳۰ سال بعد</h3>
                            <p className="text-sm text-stone-500 dark:text-stone-400">نخلی تنومند و سایه‌گستر، میراثی ماندگار.</p>
                        </button>
                    </div>
                )}

                {selectedTime && (
                    <div className="bg-stone-100 dark:bg-stone-800 rounded-xl p-4 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
                        {isLoading ? (
                             <div className="text-center z-10">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4"></div>
                                <p className="text-stone-600 dark:text-stone-300 font-semibold animate-pulse">
                                    سفر به سال {new Date().getFullYear() + selectedTime}...
                                </p>
                            </div>
                        ) : error ? (
                            <div className="text-red-500 text-center">
                                <p>{error}</p>
                                <button onClick={() => setSelectedTime(null)} className="mt-4 text-sm underline">بازگشت</button>
                            </div>
                        ) : image ? (
                            <div className="w-full h-full flex flex-col animate-fade-in">
                                <img src={image} alt={`Future vision of ${deed.intention}`} className="w-full h-auto rounded-lg shadow-lg object-cover" />
                                <div className="mt-4 flex justify-center gap-4">
                                    <button onClick={handleDownload} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                                        <ArrowDownTrayIcon className="w-5 h-5" /> دانلود تصویر
                                    </button>
                                    <button onClick={() => setSelectedTime(null)} className="px-4 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors">
                                        زمان دیگر
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default FutureVisionModal;