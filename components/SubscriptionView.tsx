// components/SubscriptionView.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { subscriptionService } from '../services/application/subscriptionService.ts';
import { SubscriptionPlan } from '../types/subscription.ts';
import { ShieldCheckIcon, StarIcon, FireIcon } from './icons.tsx';
import { useAppState, useAppDispatch } from '../AppContext.tsx';
import toast from 'react-hot-toast';
import ManualPaymentModal from './ManualPaymentModal.tsx';

const SubscriptionView: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const loadPlans = async () => {
            try {
                const data = await subscriptionService.getPlans();
                setPlans(data);
            } catch (err) {
                toast.error('خطا در بارگذاری پلن‌ها');
            } finally {
                setLoading(false);
            }
        };
        loadPlans();
    }, []);

    const handleSelectPlan = (plan: SubscriptionPlan) => {
        if (!user) {
            toast.error('لطفاً ابتدا وارد حساب کاربری خود شوید');
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
            return;
        }
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    const formatPrice = (price: number) => {
        return (price / 10).toLocaleString('fa-IR') + ' تومان';
    };

    const getIcon = (planName: string) => {
        if (planName.includes('نهال')) return <ShieldCheckIcon className="w-12 h-12 text-green-500" />;
        if (planName.includes('جوان')) return <StarIcon className="w-12 h-12 text-amber-500" />;
        return <FireIcon className="w-12 h-12 text-red-500" />;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <header className="text-center mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-amber-900 dark:text-amber-200 text-sm font-semibold tracking-wide uppercase"
                >
                    سیستم حمایتی نخلستان معنا
                </motion.h2>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-2 text-4xl font-extrabold text-stone-900 dark:text-white sm:text-5xl sm:tracking-tight"
                >
                    نگهبان نخلستان (نذر طبیعت)
                </motion.h1>
                <p className="mt-5 max-w-xl mx-auto text-xl text-stone-500 dark:text-stone-400">
                    با عضویت در سیستم نگهبانی، به صورت ماهانه در احیا و نگهداری نخلستان‌های ایران سهیم شوید.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -10 }}
                        className="relative flex flex-col p-8 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-3xl shadow-xl overflow-hidden"
                    >
                        {index === 1 && (
                            <div className="absolute top-0 right-0 mt-4 mr-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full uppercase tracking-widest">
                                محبوب‌ترین
                            </div>
                        )}
                        <div className="mb-8">
                            {getIcon(plan.name)}
                            <h3 className="mt-4 text-2xl font-bold text-stone-900 dark:text-white">{plan.name}</h3>
                            <p className="mt-2 text-stone-500 dark:text-stone-400 min-h-[50px]">{plan.description}</p>
                        </div>
                        <div className="mb-8">
                            <span className="text-4xl font-extrabold text-stone-900 dark:text-white">{formatPrice(plan.price_irr)}</span>
                            <span className="text-stone-500"> / ماهانه</span>
                        </div>
                        <ul className="mb-8 space-y-4 flex-grow">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-start text-stone-600 dark:text-stone-300">
                                    <div className="flex-shrink-0">
                                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="mr-3 text-sm">{feature}</p>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleSelectPlan(plan)}
                            className={`w-full py-4 px-6 rounded-2xl text-center font-bold transition-all ${index === 1
                                    ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-900/20'
                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white hover:bg-stone-200 dark:hover:bg-stone-700'
                                }`}
                        >
                            انتخاب این پلن
                        </button>
                    </motion.div>
                ))}
            </div>

            <footer className="mt-20 text-center">
                <div className="inline-flex items-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                    <p className="text-amber-800 dark:text-amber-200 text-sm">
                        🌸 تمامی مبالغ حاصل از اشتراک، مستقیماً صرف نهاده‌ها و دستمزد نخل‌کاران محلی می‌شود.
                    </p>
                </div>
            </footer>

            {user && (
                <ManualPaymentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    plan={selectedPlan}
                    userId={user.id}
                />
            )}
        </div>
    );
};

export default SubscriptionView;
