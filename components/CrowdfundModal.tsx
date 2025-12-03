
import React, { useState } from 'react';
import Modal from './Modal';
import { Product } from '../types';
import { GiftIcon, UsersIcon, CheckCircleIcon, ArrowLeftIcon } from './icons';

interface CrowdfundModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
}

const CrowdfundModal: React.FC<CrowdfundModalProps> = ({ isOpen, onClose, product }) => {
    const [step, setStep] = useState<'intro' | 'setup' | 'link'>('intro');
    const [generatedLink, setGeneratedLink] = useState('');
    
    if (!isOpen) return null;

    const handleCreateLink = () => {
        // Mock link generation
        const link = `https://nakhlestanmana.com/gift/${product.id}/pool-${Date.now().toString(36)}`;
        setGeneratedLink(link);
        setStep('link');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLink);
        alert('لینک کپی شد!');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 max-w-md w-full text-center">
                {step === 'intro' && (
                    <div className="animate-fade-in">
                        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                            <UsersIcon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">هدیه گروهی</h3>
                        <p className="text-gray-300 mb-6">
                            هزینه «{product.name}» را با دوستان یا خانواده تقسیم کنید. ما یک لینک پرداخت اشتراکی می‌سازیم و همه می‌توانند سهم خود را بپردازند.
                        </p>
                        <button 
                            onClick={() => setStep('setup')} 
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors"
                        >
                            ساخت لینک پرداخت مشترک
                        </button>
                    </div>
                )}

                {step === 'setup' && (
                    <div className="animate-fade-in">
                        <h3 className="text-lg font-bold mb-4 text-white">تنظیمات هدیه</h3>
                        <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600 mb-6 text-right">
                            <p className="text-sm text-gray-400">مبلغ کل:</p>
                            <p className="text-xl font-bold text-white">{product.price.toLocaleString('fa-IR')} تومان</p>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            پس از تکمیل مبلغ توسط مشارکت‌کنندگان، نخل به نام گیرنده نهایی ثبت خواهد شد.
                        </p>
                        <button 
                            onClick={handleCreateLink} 
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            ایجاد لینک
                            <ArrowLeftIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {step === 'link' && (
                    <div className="animate-fade-in">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500">
                            <CheckCircleIcon className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-white">لینک شما آماده است!</h3>
                        <p className="text-sm text-gray-400 mb-4">این لینک را برای دوستان خود ارسال کنید.</p>
                        
                        <div className="bg-black/30 p-3 rounded-lg border border-gray-600 flex items-center gap-2 mb-6">
                            <input 
                                type="text" 
                                value={generatedLink} 
                                readOnly 
                                className="bg-transparent text-white text-xs flex-grow outline-none"
                            />
                            <button 
                                onClick={handleCopy}
                                className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-md"
                            >
                                کپی
                            </button>
                        </div>
                        
                        <button 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-white text-sm underline"
                        >
                            بستن
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default CrowdfundModal;
