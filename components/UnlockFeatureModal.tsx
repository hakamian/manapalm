
import React from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { Product } from '../types';
import { LockClosedIcon, SparklesIcon, BanknotesIcon, StarIcon, CheckCircleIcon } from './icons';

interface UnlockFeatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureId: string;
    featureName: string;
    unlockCostPoints: number;
    relatedProductId?: string; // ID of the "Heritage Palm" that unlocks this
}

const UnlockFeatureModal: React.FC<UnlockFeatureModalProps> = ({ isOpen, onClose, featureId, featureName, unlockCostPoints, relatedProductId }) => {
    const { user, products } = useAppState();
    const dispatch = useAppDispatch();

    if (!isOpen || !user) return null;

    const product = relatedProductId ? products.find(p => p.id === relatedProductId) : null;
    const hasEnoughPoints = user.manaPoints >= unlockCostPoints;

    const handlePurchaseProduct = () => {
        if (product) {
            dispatch({ type: 'ADD_TO_CART', payload: { product, quantity: 1 } });
            dispatch({ type: 'TOGGLE_CART', payload: true });
            onClose();
        }
    };

    const handleUnlockWithPoints = () => {
        if (hasEnoughPoints) {
             // This action needs to be handled in the reducer to deduct points and add featureId to user.unlockedTools
            dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: unlockCostPoints, action: `فعال‌سازی ${featureName}` } });
            // We also need a way to persist the unlock. For this demo, we might need a specific action type or extend SPEND_MANA_POINTS
            // In a real app, this would be an API call.
            // For now, let's assume the reducer handles 'UNLOCK_TOOL' or similar.
            // Since we don't have that, we can simulate it by dispatching an update user.
            const currentTools = user.unlockedTools || [];
            dispatch({ type: 'UPDATE_USER', payload: { unlockedTools: [...currentTools, featureId] } });
            onClose();
        }
    };

    const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-stone-900 text-white rounded-2xl shadow-2xl w-full max-w-lg p-0 overflow-hidden border border-stone-700" onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-amber-900/50 to-purple-900/50 p-6 text-center relative">
                     <div className="absolute top-4 right-4 opacity-20"><SparklesIcon className="w-12 h-12" /></div>
                    <LockClosedIcon className="w-12 h-12 mx-auto text-amber-300 mb-3" />
                    <h2 className="text-2xl font-bold mb-1">قفل {featureName}</h2>
                    <p className="text-stone-300 text-sm">این ابزار ویژه نیازمند فعال‌سازی است.</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Option 1: Social Investment (Pay Cash) */}
                    {product && (
                        <div className="bg-stone-800/50 border border-green-600/30 rounded-xl p-5 relative overflow-hidden group hover:border-green-500/50 transition-colors cursor-pointer" onClick={handlePurchaseProduct}>
                             <div className="absolute top-0 left-0 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg">پیشنهاد ما</div>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                        <BanknotesIcon className="w-5 h-5 text-green-400"/>
                                        سرمایه‌گذاری اجتماعی
                                    </h3>
                                    <p className="text-xs text-stone-400 mt-1">با خرید «{product.name}» هم نخل بکارید، هم قفل را باز کنید.</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                 <div className="text-left">
                                    <p className="text-xs text-stone-500 line-through">{formatPrice(product.price * 1.1)}</p>
                                    <p className="text-xl font-bold text-green-400">{formatPrice(product.price)} <span className="text-xs font-normal">تومان</span></p>
                                </div>
                                <button className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                                    خرید و فعال‌سازی
                                </button>
                            </div>
                             <p className="text-[10px] text-stone-500 mt-2 text-center border-t border-stone-700/50 pt-2">
                                ۹۰٪ مبلغ صرف کاشت نخل و اشتغال‌زایی می‌شود.
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-center text-stone-500 text-xs">
                        <span>یا</span>
                    </div>

                    {/* Option 2: Gamification (Spend Points) */}
                    <div className={`bg-stone-800/50 border rounded-xl p-5 transition-colors ${hasEnoughPoints ? 'border-indigo-500/30 hover:border-indigo-500/50 cursor-pointer' : 'border-stone-700 opacity-70'}`} onClick={hasEnoughPoints ? handleUnlockWithPoints : undefined}>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                <StarIcon className="w-5 h-5 text-indigo-400"/>
                                استفاده از امتیاز معنا
                            </h3>
                            {!hasEnoughPoints && <span className="text-xs text-red-400 font-bold">امتیاز کافی نیست</span>}
                        </div>
                        <p className="text-xs text-stone-400 mb-4">از امتیازاتی که با فعالیت در جامعه کسب کرده‌اید استفاده کنید.</p>
                        
                        <div className="flex justify-between items-center">
                             <p className="text-sm text-stone-300">موجودی: <span className="font-bold text-indigo-300">{user.manaPoints.toLocaleString('fa-IR')}</span></p>
                             <div className="text-right">
                                <p className="text-xl font-bold text-indigo-400">{unlockCostPoints.toLocaleString('fa-IR')} <span className="text-xs font-normal">امتیاز</span></p>
                             </div>
                        </div>
                         {hasEnoughPoints && (
                            <button className="w-full mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-sm transition-colors">
                                کسر امتیاز و باز کردن
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="p-4 bg-stone-900 border-t border-stone-800 text-center">
                    <button onClick={onClose} className="text-stone-500 hover:text-stone-300 text-sm">انصراف</button>
                </div>
            </div>
        </div>
    );
};

export default UnlockFeatureModal;
