
import React, { useState, useMemo } from 'react';
import { User, HeritageItem, Course } from '../types.ts';
import Modal from './Modal.tsx';
import { getInstallmentOptions, ALL_INSTALLMENT_OPTIONS, getUnlockLevelForInstallment, getUserLevel } from '../utils/gamification.ts';
import { BanknotesIcon, LockClosedIcon, StarIcon, ShieldExclamationIcon } from './icons.tsx';
import { useAppState } from '../AppContext.tsx';

interface InstallmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: HeritageItem | Course;
    user: User;
    onAddToCartWithInstallments: (item: HeritageItem | Course, months: number) => void;
}

const InstallmentModal: React.FC<InstallmentModalProps> = ({ isOpen, onClose, item, user, onAddToCartWithInstallments }) => {
    const { orders } = useAppState();
    const availableOptions = getInstallmentOptions(user);
    const [selectedMonths, setSelectedMonths] = useState(availableOptions[0]);
    const userLevel = getUserLevel(user.points);

    // Risk Management: Calculate Total Spent
    const totalSpent = useMemo(() => {
        return orders
            .filter(o => o.userId === user.id && o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.total, 0);
    }, [orders, user.id]);

    const getFinancialRequirement = (months: number): number => {
        if (months <= 4) return 0;
        if (months <= 6) return 2000000; // 2M Toman history for 6 months
        if (months <= 10) return 10000000; // 10M Toman history for 10 months
        return 30000000; // 30M Toman history for 12+ months
    };

    if (!isOpen || !item) return null;

    const handleConfirm = () => {
        onAddToCartWithInstallments(item, selectedMonths);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4 w-full max-w-md text-right">
                <div className="text-center mb-4">
                    <BanknotesIcon className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                    <h3 className="text-xl font-bold">پرداخت قسطی برای «{item.title}»</h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">مجموع: {item.price.toLocaleString('fa-IR')} تومان</p>
                </div>
                
                <div className="mb-6 p-4 bg-stone-100 dark:bg-stone-700/50 rounded-lg text-center">
                    <p className="font-semibold text-stone-700 dark:text-stone-200">
                        اعتبار شما: <span className="text-amber-600 dark:text-amber-400 font-bold">«{userLevel.name}»</span>
                    </p>
                    <div className="flex justify-center gap-4 mt-2 text-xs text-stone-500 dark:text-stone-400">
                        <span className="flex items-center gap-1">
                            <StarIcon className="w-3 h-3 text-yellow-500" />
                            {user.points.toLocaleString('fa-IR')} امتیاز
                        </span>
                        <span className="flex items-center gap-1">
                             <BanknotesIcon className="w-3 h-3 text-green-500" />
                             سابقه خرید: {(totalSpent / 1000000).toFixed(1)} م
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="font-semibold text-sm">بر اساس امتیاز و سابقه خرید شما:</p>
                    {ALL_INSTALLMENT_OPTIONS.map(months => {
                        const levelUnlocked = availableOptions.includes(months);
                        const unlockLevel = !levelUnlocked ? getUnlockLevelForInstallment(months) : null;
                        
                        const financialReq = getFinancialRequirement(months);
                        const financialUnlocked = totalSpent >= financialReq;
                        
                        const isAvailable = levelUnlocked && financialUnlocked;
                        const monthlyPrice = Math.round(item.price / months);
                        
                        return (
                            <label key={months} className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${selectedMonths === months && isAvailable ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'border-stone-200 dark:border-stone-700'} ${isAvailable ? 'cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700/50' : 'opacity-60 cursor-not-allowed'}`}>
                                <input
                                    type="radio"
                                    name="installment-option"
                                    value={months}
                                    checked={selectedMonths === months}
                                    onChange={() => isAvailable && setSelectedMonths(months)}
                                    disabled={!isAvailable}
                                    className="h-5 w-5 text-amber-600 focus:ring-amber-500 disabled:text-stone-400"
                                />
                                <div className="text-right mr-4 flex-1">
                                    <p className="font-bold">{months} ماهه</p>
                                    <p className="text-sm text-stone-600 dark:text-stone-300">ماهی {monthlyPrice.toLocaleString('fa-IR')} تومان</p>
                                </div>
                                {!isAvailable && (
                                    <div className="flex flex-col items-end gap-1 text-xs text-stone-500 dark:text-stone-400">
                                        {!levelUnlocked && unlockLevel && (
                                            <span className="flex items-center gap-1"><LockClosedIcon className="w-3 h-3" /> سطح {unlockLevel.name}</span>
                                        )}
                                        {!financialUnlocked && (
                                            <span className="flex items-center gap-1 text-red-400"><ShieldExclamationIcon className="w-3 h-3" /> سابقه خرید {financialReq/1000000}م</span>
                                        )}
                                    </div>
                                )}
                            </label>
                        )
                    })}
                </div>
                
                <div className="mt-4 text-center text-xs text-stone-500 dark:text-stone-400 p-2 bg-stone-100 dark:bg-stone-700/50 rounded-lg">
                    برای اقساط بلندمدت، علاوه بر سطح کاربری، به سابقه خرید معتبر نیاز دارید.
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600 rounded-lg transition-colors">
                        انصراف
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        className="px-6 py-2 font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
                    >
                        تایید و افزودن به سبد
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default InstallmentModal;
