// components/admin/SubscriptionManager.tsx
import React, { useEffect, useState } from 'react';
import { subscriptionService } from '../../services/application/subscriptionService.ts';
import { UserSubscription } from '../../types/subscription.ts';
import {
    ShieldCheckIcon, ClockIcon, CheckCircleIcon, XMarkIcon,
    CreditCardIcon, SparklesIcon, EnvelopeIcon, PhoneIcon
} from '../icons.tsx';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const SubscriptionManager: React.FC = () => {
    const [pending, setPending] = useState<UserSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadPending = async () => {
        setLoading(true);
        const data = await subscriptionService.getPendingSubscriptions();
        setPending(data);
        setLoading(false);
    };

    useEffect(() => {
        loadPending();
    }, []);

    const handleAction = async (id: string, status: 'active' | 'cancelled') => {
        setProcessingId(id);
        const res = await subscriptionService.updateSubscriptionStatus(id, status);
        if (res.success) {
            toast.success(status === 'active' ? 'اشتراک با موفقیت فعال شد' : 'درخواست رد شد');
            loadPending();
        } else {
            toast.error('خطا در انجام عملیات: ' + res.error);
        }
        setProcessingId(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheckIcon className="w-7 h-7 text-amber-500" />
                        مدیریت اشتراک‌های نگهبان
                    </h2>
                    <p className="text-stone-400 mt-1">بررسی و تایید واریزی‌های دستی (کارت و رمزارز)</p>
                </div>
                <div className="bg-stone-800 px-4 py-2 rounded-xl border border-stone-700">
                    <span className="text-amber-500 font-bold">{pending.length}</span>
                    <span className="text-xs text-stone-400 mr-2">درخواست در انتظار</span>
                </div>
            </header>

            {pending.length === 0 ? (
                <div className="bg-stone-900/50 border-2 border-dashed border-stone-800 rounded-3xl p-12 text-center text-stone-500">
                    <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>هیچ درخواست در انتظاری وجود ندارد.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {pending.map((sub) => (
                            <motion.div
                                key={sub.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-colors"
                            >
                                <div className="p-6 flex flex-col md:flex-row justify-between gap-6">
                                    <div className="space-y-4 flex-grow">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center border border-stone-700">
                                                <ShieldCheckIcon className="w-6 h-6 text-amber-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{sub.profile?.fullName || 'کاربر بدون نام'}</h3>
                                                <div className="flex gap-4 mt-1">
                                                    <span className="text-xs text-stone-500 flex items-center gap-1">
                                                        <PhoneIcon className="w-3 h-3" /> {sub.profile?.phone}
                                                    </span>
                                                    <span className="text-xs text-stone-500 flex items-center gap-1">
                                                        <ClockIcon className="w-3 h-3" /> {new Date(sub.created_at).toLocaleString('fa-IR')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-stone-800/50 p-3 rounded-xl border border-stone-700/50">
                                                <p className="text-[10px] text-stone-500 uppercase mb-1">پلن انتخابی</p>
                                                <p className="font-bold text-amber-500">{sub.plan?.name}</p>
                                                <p className="text-xs text-stone-400">{(sub.plan?.price_irr ? sub.plan.price_irr / 10 : 0).toLocaleString('fa-IR')} تومان</p>
                                            </div>
                                            <div className="bg-stone-800/50 p-3 rounded-xl border border-stone-700/50">
                                                <p className="text-[10px] text-stone-500 uppercase mb-1">اطلاعات پرداخت</p>
                                                <div className="flex items-center gap-2">
                                                    {sub.payment_method === 'crypto' ? <SparklesIcon className="w-4 h-4 text-blue-400" /> : <CreditCardIcon className="w-4 h-4 text-green-400" />}
                                                    <p className="font-mono text-sm">{sub.payment_ref_id}</p>
                                                </div>
                                                <p className="text-[10px] text-stone-500 mt-1">{sub.payment_method === 'crypto' ? 'رمز ارز' : 'کارت به کارت'}</p>
                                            </div>
                                        </div>

                                        {sub.payment_notes && (
                                            <div className="bg-amber-900/10 border border-amber-900/30 p-3 rounded-xl italic text-xs text-amber-200/70">
                                                " {sub.payment_notes} "
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex md:flex-col gap-2 justify-end min-w-[150px]">
                                        <button
                                            disabled={processingId === sub.id}
                                            onClick={() => handleAction(sub.id, 'active')}
                                            className="flex-1 md:flex-none py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                        >
                                            <CheckCircleIcon className="w-4 h-4" />
                                            {processingId === sub.id ? '...' : 'تایید و فعال‌سازی'}
                                        </button>
                                        <button
                                            disabled={processingId === sub.id}
                                            onClick={() => handleAction(sub.id, 'cancelled')}
                                            className="flex-1 md:flex-none py-3 px-6 bg-stone-800 hover:bg-red-900/50 text-stone-400 hover:text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                            رد درخواست
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManager;
