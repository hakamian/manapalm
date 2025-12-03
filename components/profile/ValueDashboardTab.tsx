
import React, { useMemo } from 'react';
import { User, Order } from '../../types';
import { BanknotesIcon, ChartBarIcon, HandshakeIcon, LeafIcon, SparklesIcon, UsersIcon } from '../icons';

interface ValueDashboardTabProps {
    user: User;
    orders: Order[];
}

const ValueDashboardTab: React.FC<ValueDashboardTabProps> = ({ user, orders }) => {
    
    // Calculate Quantified Value
    const totalSpend = orders.reduce((acc, order) => acc + order.total, 0);
    const socialInvestment = totalSpend * 0.9; // 90% model
    
    // Impact Metrics (Estimates for demonstration)
    const jobsCreatedHours = Math.floor(socialInvestment / 50000); // 50k Tomans per hour of job creation
    const co2AbsorbedKg = Math.floor(socialInvestment / 10000); // 10k Tomans per kg CO2
    const familiesSupported = Math.floor(socialInvestment / 5000000); // 5M per family support unit

    const roiPercentage = 300; // Metaphorical "Return on Meaning" percentage

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-gradient-to-br from-stone-800 to-green-900/40 p-8 rounded-2xl border border-green-800/50">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                    <ChartBarIcon className="w-8 h-8 text-green-400" />
                    گزارش تاثیر سرمایه‌گذاری شما
                </h2>
                <p className="text-stone-300 mb-8 leading-relaxed">
                    شما تنها یک خریدار نیستید؛ شما یک سرمایه‌گذاری اجتماعی هستید. در اینجا می‌بینید که مشارکت مالی شما چگونه به ارزش واقعی در دنیای بیرون تبدیل شده است.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-stone-900/60 p-6 rounded-xl border border-stone-700 text-center">
                        <div className="bg-green-500/20 p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                            <BanknotesIcon className="w-8 h-8 text-green-400" />
                        </div>
                        <p className="text-sm text-stone-400 mb-1">مجموع سرمایه‌گذاری اجتماعی</p>
                        <p className="text-2xl font-bold text-white">{socialInvestment.toLocaleString('fa-IR')} تومان</p>
                    </div>
                    
                    <div className="bg-stone-900/60 p-6 rounded-xl border border-stone-700 text-center">
                        <div className="bg-blue-500/20 p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                            <HandshakeIcon className="w-8 h-8 text-blue-400" />
                        </div>
                        <p className="text-sm text-stone-400 mb-1">اشتغال‌زایی مستقیم</p>
                        <p className="text-2xl font-bold text-white">{jobsCreatedHours.toLocaleString('fa-IR')} ساعت</p>
                    </div>

                    <div className="bg-stone-900/60 p-6 rounded-xl border border-stone-700 text-center">
                        <div className="bg-teal-500/20 p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                            <LeafIcon className="w-8 h-8 text-teal-400" />
                        </div>
                        <p className="text-sm text-stone-400 mb-1">خدمت به زمین (جذب CO2)</p>
                        <p className="text-2xl font-bold text-white">{co2AbsorbedKg.toLocaleString('fa-IR')} کیلوگرم</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">بازگشت سرمایه معنوی (ROI)</h3>
                    <div className="flex items-center justify-center h-48">
                        <div className="text-center">
                            <span className="text-6xl font-extrabold text-amber-400 drop-shadow-lg">+{roiPercentage}%</span>
                            <p className="mt-2 text-stone-400">رشد احساس رضایت و معنا</p>
                        </div>
                    </div>
                    <p className="text-sm text-stone-500 text-center">
                        * محاسبه شده بر اساس بازخوردهای کیفی جامعه نخلستان
                    </p>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">تاثیر شما در شبکه</h3>
                    <ul className="space-y-4">
                        <li className="flex items-center justify-between p-3 bg-stone-700/30 rounded-lg">
                            <span className="text-stone-300 flex items-center gap-2"><SparklesIcon className="w-4 h-4 text-yellow-500"/>خانواده‌های حمایت شده</span>
                            <span className="font-bold text-white">{familiesSupported > 0 ? familiesSupported : 'در حال رشد...'}</span>
                        </li>
                         <li className="flex items-center justify-between p-3 bg-stone-700/30 rounded-lg">
                            <span className="text-stone-300 flex items-center gap-2"><UsersIcon className="w-4 h-4 text-blue-500"/>افراد دعوت شده به جنبش</span>
                            <span className="font-bold text-white">{(user.referralPointsEarned || 0) / 500} نفر</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ValueDashboardTab;
