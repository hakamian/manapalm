import React from 'react';
import { User, Order, View } from '../types';
import { SparklesIcon } from './icons';

interface NextHeroicStepProps {
    user: User;
    orders: Order[];
    onNavigateToTab: (tab: string) => void;
    onStartPlantingFlow: () => void;
    onNavigate: (view: View) => void;
}

const NextHeroicStep: React.FC<NextHeroicStepProps> = ({ user, orders, onNavigateToTab, onStartPlantingFlow, onNavigate }) => {
    let step = {
        title: 'سفرت را ادامه بده!',
        description: 'در سفر قهرمانی خود کاوش کن, ماموریت‌های جدید پیدا کن و از داستان‌های دیگران الهام بگیر.',
        buttonText: 'مشاهده سفر قهرمانی',
        action: () => onNavigate(View.HerosJourney),
    };

    const hasIncompleteProfile = !user.fullName || !user.email || !user.description || !user.avatar;
    const hasPlantedPalm = orders.some(o => o.deeds && o.deeds.length > 0);
    const hasMadePurchase = orders.length > 0;
    const hasChatted = user.meaningCoachHistory && user.meaningCoachHistory.length > 0;

    if (hasIncompleteProfile) {
        step = {
            title: 'پروفایلت را کامل کن!',
            description: 'با کامل کردن پروفایل خود، تا سقف ۱۵۰ امتیاز کسب کرده و اولین دستاورد خود را باز کن.',
            buttonText: 'تکمیل پروفایل',
            action: () => onNavigateToTab('profile'),
        };
    } else if (!hasPlantedPalm) {
        step = {
            title: 'اولین نخل خود را بکار!',
            description: 'با کاشت اولین نخل، میراث خود را آغاز کن و تاثیر مثبت خود را در نخلستان ثبت کن.',
            buttonText: 'شروع کاشت نخل',
            action: onStartPlantingFlow,
        };
    } else if (!hasMadePurchase) {
        step = {
            title: 'از فروشگاه ما دیدن کن!',
            description: 'محصولات دست‌ساز و ارگانیک نخلستان را کشف کن و با خرید خود به این جنبش کمک کن.',
            buttonText: 'رفتن به فروشگاه',
            action: () => onNavigate(View.Shop),
        };
    } else if (!hasChatted) {
        step = {
            title: 'با مربی معنا گفتگو کن!',
            description: 'برای کشف عمیق‌تر مسیرت و دریافت راهنمایی‌های شخصی‌سازی شده، اولین گفتگوی خود را با مربی هوشمند آغاز کن.',
            buttonText: 'شروع گفتگو',
            action: () => onNavigate(View.MeaningCoachingScholarship),
        };
    }
    
    return (
        <div id="next-heroic-step" className="bg-gradient-to-r from-green-800/50 via-gray-700 to-gray-700 p-6 rounded-lg mb-8 border border-green-600/50 shadow-lg">
            <div className="flex items-start space-x-reverse space-x-4">
                <div className="flex-shrink-0">
                    <SparklesIcon className="w-8 h-8 text-green-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                    <p className="text-gray-300 mt-2">{step.description}</p>
                </div>
            </div>
            <div className="mt-4 text-left">
                <button
                    onClick={step.action}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-md transition-colors"
                >
                    {step.buttonText}
                </button>
            </div>
        </div>
    );
};

export default NextHeroicStep;
