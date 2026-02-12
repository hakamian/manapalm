// components/profile/SubscriptionTab.tsx
import React, { useEffect, useState } from 'react';
import { UserSubscription } from '../../types/subscription.ts';
import { subscriptionService } from '../../services/application/subscriptionService.ts';
import { ShieldCheckIcon, CalendarDaysIcon, CreditCardIcon } from '../icons.tsx';
import { motion } from 'framer-motion';

interface SubscriptionTabProps {
    userId: string;
}

const SubscriptionTab: React.FC<SubscriptionTabProps> = ({ userId }) => {
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadActive = async () => {
            const data = await subscriptionService.getActiveSubscription(userId);
            setSubscription(data);
            setLoading(false);
        };
        loadActive();
    }, [userId]);

    if (loading) {
        return <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-800 rounded-2xl"></div>
        </div>;
    }

    if (!subscription) {
        return (
            <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 text-center">
                <ShieldCheckIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">هنوز نگهبان نخلستان نشده‌اید</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    با عضویت در طرح نگهبانان، علاوه بر حمایت ماهانه از محیط زیست، از مزایای ویژه‌ای همچون تخفیف در فروشگاه و دسترسی به ابزارهای هوشمند بهره‌مند شوید.
                </p>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('NAVIGATE', { detail: 'SUBSCRIPTION' }))}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-xl transition-all"
                >
                    مشاهده پلن‌های نگهبان
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-amber-600/20 to-stone-900 border border-amber-500/30 p-8 rounded-3xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4">
                    <ShieldCheckIcon className="w-24 h-24 text-amber-500/10" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 text-white text-[10px] font-bold rounded-full uppercase ${subscription.status === 'active' ? 'bg-amber-500' : 'bg-stone-500'}`}>
                            {subscription.status === 'active' ? 'فعال' : 'در انتظار تایید'}
                        </span>
                        {subscription.status === 'pending' && (
                            <span className="text-[10px] text-stone-400 bg-stone-900/50 px-2 py-0.5 rounded-lg border border-stone-700">
                                کد پیگیری: {subscription.payment_ref_id}
                            </span>
                        )}
                    </div>
                    <h2 className="text-3xl font-bold text-white">{subscription.plan?.name}</h2>
                    <p className="text-amber-200/70 mt-1">{subscription.plan?.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="flex items-center gap-3 text-stone-300">
                            <CalendarDaysIcon className="w-5 h-5 text-amber-500" />
                            <div>
                                <p className="text-[10px] uppercase text-stone-500">تاریخ پایان اعتبار</p>
                                <p className="font-semibold">{new Date(subscription.end_date).toLocaleDateString('fa-IR')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-stone-300">
                            <CreditCardIcon className="w-5 h-5 text-amber-500" />
                            <div>
                                <p className="text-[10px] uppercase text-stone-500">وضعیت تمدید خودکار</p>
                                <p className="font-semibold">{subscription.auto_renew ? 'فعال' : 'غیرفعال'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-amber-500" />
                    مزایای فعال شما
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {subscription.plan?.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SubscriptionTab;
