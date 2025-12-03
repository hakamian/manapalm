

import React from 'react';
import { useAppDispatch, useAppState } from '../AppContext';
import { LockClosedIcon, SparklesIcon, BanknotesIcon, StarIcon } from './icons';
import { Product } from '../types';

interface CoachingLabAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userManaPoints: number;
  onPayWithPoints?: () => void;
  // New props for dynamic content
  title?: string;
  description?: string;
  priceToman?: number;
  pricePoints?: number;
  productId?: string;
  icon?: React.FC<any>;
}

const CoachingLabAccessModal: React.FC<CoachingLabAccessModalProps> = ({ 
    isOpen, 
    onClose, 
    userManaPoints, 
    onPayWithPoints,
    title = "دسترسی به آزمایشگاه کوچینگ",
    description = "برای استفاده از این ابزار حرفه‌ای، شما به دسترسی ویژه (۱۵ دقیقه جلسه) نیاز دارید.",
    priceToman = 150000,
    pricePoints = 500,
    productId = 'p_coaching_lab_access',
    icon: Icon = LockClosedIcon
}) => {
    const dispatch = useAppDispatch();
    const { products } = useAppState();

    if (!isOpen) return null;

    const handlePurchase = () => {
        // In a real app, we would look up the product by ID. 
        // For this demo, we create a mock cart item if the exact product isn't in the static list
        const product: Product = products.find(p => p.id === productId) || {
            id: productId,
            name: title,
            price: priceToman,
            image: 'https://picsum.photos/seed/service/400/400',
            category: 'سرویس',
            stock: 999,
            type: 'service',
            points: Math.floor(priceToman / 1000),
            popularity: 100,
            dateAdded: new Date().toISOString(),
            description: description // Added description
        };

        dispatch({ type: 'ADD_TO_CART', payload: { product, quantity: 1 } });
        dispatch({ type: 'TOGGLE_CART', payload: true }); // Open cart to finish purchase
        onClose();
    };

    const handleNavigateToGamification = () => {
        dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: 'gamification' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[70] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-md p-8 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale text-center"
                onClick={e => e.stopPropagation()}
            >
                <style>{`
                    @keyframes fade-in-scale { to { transform: scale(1); opacity: 1; } }
                    .animate-fade-in-scale { animation: fade-in-scale 0.3s ease-out forwards; }
                `}</style>
                
                <div className="w-16 h-16 mx-auto mb-4 text-yellow-400">
                    <Icon className="w-full h-full" />
                </div>

                <h2 className="text-2xl font-bold mb-2 text-yellow-300">{title}</h2>
                <p className="text-gray-300 mb-6">
                    {description}
                </p>

                <div className="space-y-4">
                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-green-500 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-lg text-green-300 flex items-center gap-2">
                                <BanknotesIcon className="w-5 h-5"/>
                                پرداخت مستقیم
                            </h3>
                            <span className="text-sm bg-green-900/50 text-green-200 px-2 py-0.5 rounded">اشتراک</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 mb-3 text-right">دسترسی کامل به سرویس با پرداخت نقدی.</p>
                        <button onClick={handlePurchase} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-md shadow-lg w-full transition-colors">
                            پرداخت {priceToman.toLocaleString('fa-IR')} تومان
                        </button>
                    </div>

                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-indigo-500 transition-colors">
                         <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-lg text-indigo-300 flex items-center gap-2">
                                <StarIcon className="w-5 h-5"/>
                                کسر از امتیاز
                            </h3>
                            <span className="text-sm bg-indigo-900/50 text-indigo-200 px-2 py-0.5 rounded">تک جلسه</span>
                        </div>
                        <div className="flex justify-between items-center mb-3 text-xs text-gray-400">
                             <p>هزینه این جلسه: {pricePoints.toLocaleString('fa-IR')} امتیاز</p>
                             <p>موجودی: <span className={`font-bold ${userManaPoints >= pricePoints ? 'text-green-400' : 'text-red-400'}`}>{userManaPoints.toLocaleString('fa-IR')}</span></p>
                        </div>
                        
                        {userManaPoints >= pricePoints && onPayWithPoints ? (
                            <button 
                                onClick={onPayWithPoints}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-md shadow-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <SparklesIcon className="w-4 h-4" />
                                کسر {pricePoints.toLocaleString('fa-IR')} امتیاز و شروع
                            </button>
                        ) : (
                            <button 
                                onClick={handleNavigateToGamification} 
                                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-5 rounded-md transition-colors"
                            >
                                کسب امتیاز بیشتر
                            </button>
                        )}
                    </div>
                </div>

                <button onClick={onClose} className="mt-6 text-gray-400 hover:text-white transition-colors text-sm">
                    انصراف
                </button>
            </div>
        </div>
    );
};

export default CoachingLabAccessModal;

