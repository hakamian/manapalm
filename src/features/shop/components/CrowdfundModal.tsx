
import React, { useState } from 'react';
import { Product } from '../../../types';
import { XMarkIcon, UsersIcon, LinkIcon, CheckCircleIcon } from '../../../components/icons';

interface CrowdfundModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
}

const CrowdfundModal: React.FC<CrowdfundModalProps> = ({ isOpen, onClose, product }) => {
    const [step, setStep] = useState<'create' | 'share'>('create');
    const [targetUrl, setTargetUrl] = useState('');

    if (!isOpen) return null;

    const handleCreateLink = () => {
        // Mock link creation
        const uniqueId = Math.random().toString(36).substring(7);
        const url = `${window.location.origin}/crowdfund/${uniqueId}`;
        setTargetUrl(url);
        setStep('share');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(targetUrl);
        // Show toast or feedback
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-purple-500/30 overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-purple-400" />
                        خرید گروهی (هدیه)
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {step === 'create' ? (
                        <div className="space-y-4">
                            <div className="flex gap-4 items-center">
                                <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                                <div>
                                    <h4 className="font-semibold text-white">{product.name}</h4>
                                    <p className="text-sm text-purple-300">مبلغ هدف: {product.price.toLocaleString('fa-IR')} تومان</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm">
                                با ایجاد لینک خرید گروهی، می‌توانید هزینه این نخل ارزشمند را با مشارکت دوستان و خانواده تامین کنید و آن را به صورت مشترک هدیه دهید.
                            </p>
                            <button
                                onClick={handleCreateLink}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <LinkIcon className="w-5 h-5" />
                                ساخت لینک مشارکت
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 text-center">
                            <div className="animate-bounce mx-auto bg-green-900/50 p-4 rounded-full w-16 h-16 flex items-center justify-center border border-green-500">
                                <CheckCircleIcon className="w-8 h-8 text-green-400" />
                            </div>
                            <h4 className="text-xl font-bold text-white">لینک ساخته شد!</h4>
                            <p className="text-gray-400 text-sm">
                                این لینک را با دوستان خود به اشتراک بگذارید. آنها می‌توانند هر مبلغی که بخواهند مشارکت کنند.
                            </p>

                            <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 flex items-center justify-between gap-2">
                                <code className="text-purple-300 text-sm truncate dir-ltr">{targetUrl}</code>
                                <button
                                    onClick={copyToClipboard}
                                    className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
                                >
                                    کپی
                                </button>
                            </div>

                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white text-sm underline"
                            >
                                بازگشت به فروشگاه
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CrowdfundModal;
