
import React from 'react';
import { User } from '../../../types';
import { PaymentPlan } from '../../../types/commerce'; // Ensure this type is exported
import { BanknotesIcon, CheckCircleIcon, LockClosedIcon } from '../../../../components/icons';

interface InstallmentSelectorProps {
    user: User | null;
    price: number;
    onSelectPlan: (plan: PaymentPlan) => void;
    selectedPlanId?: string;
}

// Mock plans for now checking against user level
const PLANS: PaymentPlan[] = [
    { id: 'plan_3', title: 'اقساط ۳ ماهه', months: 3, interestRate: 0, minUserLevel: 'Jovane', isActive: true },
    { id: 'plan_6', title: 'اقساط ۶ ماهه', months: 6, interestRate: 2, minUserLevel: 'Nahal', isActive: true },
    { id: 'plan_12', title: 'اقساط ۱۲ ماهه (ویژه)', months: 12, interestRate: 5, minUserLevel: 'Derakht', isActive: true },
];

const LEVEL_ORDER = ['Jovane', 'Nahal', 'Derakht', 'Samar'];

const InstallmentSelector: React.FC<InstallmentSelectorProps> = ({ user, price, onSelectPlan, selectedPlanId }) => {
    const userLevelIndex = user ? LEVEL_ORDER.indexOf(user.level || 'Jovane') : 0;

    const isLocked = (minLevel: string) => {
        const minLevelIndex = LEVEL_ORDER.indexOf(minLevel);
        return minLevelIndex > userLevelIndex;
    };

    const calculateMonthly = (plan: PaymentPlan) => {
        const total = price * (1 + plan.interestRate / 100);
        return Math.ceil(total / plan.months);
    };

    return (
        <div className="space-y-3 mt-4">
            <h4 className="font-semibold text-gray-300 flex items-center gap-2">
                <BanknotesIcon className="w-5 h-5 text-green-400" />
                انتخاب طرح پرداخت اقساطی
            </h4>
            <div className="grid gap-3">
                {PLANS.map(plan => {
                    const locked = isLocked(plan.minUserLevel);
                    return (
                        <button
                            key={plan.id}
                            disabled={locked}
                            onClick={() => onSelectPlan(plan)}
                            className={`relative p-3 rounded-lg border flex justify-between items-center transition-all
                                ${locked
                                    ? 'bg-gray-800 border-gray-700 opacity-60 cursor-not-allowed'
                                    : selectedPlanId === plan.id
                                        ? 'bg-green-900/40 border-green-500 ring-1 ring-green-500'
                                        : 'bg-gray-800 border-gray-600 hover:border-green-400'
                                }
                            `}
                        >
                            <div className="flex flex-col text-right">
                                <span className={locked ? 'text-gray-500' : 'text-white font-medium'}>
                                    {plan.title}
                                </span>
                                <span className="text-xs text-gray-400 mt-1">
                                    ماهانه: {calculateMonthly(plan).toLocaleString('fa-IR')} تومان
                                </span>
                            </div>

                            {locked ? (
                                <div className="flex items-center text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">
                                    <LockClosedIcon className="w-3 h-3 ml-1" />
                                    <span>نیاز به سطح {plan.minUserLevel}</span>
                                </div>
                            ) : selectedPlanId === plan.id && (
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                            )}
                        </button>
                    );
                })}
            </div>
            {!user && (
                <p className="text-xs text-yellow-500 mt-2">
                    برای مشاهده طرح‌های متناسب با سطح خود، لطفاً وارد شوید.
                </p>
            )}
        </div>
    );
};

export default InstallmentSelector;
