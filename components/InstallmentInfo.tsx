import React from 'react';
import { User } from '../types';
import { getInstallmentOptions } from '../services/gamificationService';
import { SparklesIcon } from './icons';

interface InstallmentInfoProps {
    price: number;
    user: User | null;
}

const InstallmentInfo: React.FC<InstallmentInfoProps> = ({ price, user }) => {
    const allOptions = getInstallmentOptions(user?.points);
    const availableOptions = allOptions.filter(opt => opt.isUnlocked);
    const currentMaxOption = availableOptions.length > 0 ? availableOptions[availableOptions.length - 1] : allOptions[0];
    const nextTierOption = allOptions.find(opt => !opt.isUnlocked);

    const installmentAmount = price / currentMaxOption.installments;

    return (
        <div className="mt-2 text-xs text-gray-400 bg-gray-700/50 p-2 rounded-md border border-gray-600">
            <p>
                تا <strong>{currentMaxOption.installments} قسط</strong> هر کدام{' '}
                <strong>{(Math.ceil(installmentAmount / 1000) * 1000).toLocaleString('fa-IR')} تومان</strong>
            </p>
            {nextTierOption && (
                <div className="flex items-start gap-1 mt-1 text-yellow-400/80">
                    <SparklesIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>
                        با کسب <strong>{nextTierOption.pointsNeeded.toLocaleString('fa-IR')}</strong> امتیاز دیگر، تا <strong>{nextTierOption.installments} قسط</strong> خرید کنید!
                    </p>
                </div>
            )}
        </div>
    );
};

export default InstallmentInfo;
