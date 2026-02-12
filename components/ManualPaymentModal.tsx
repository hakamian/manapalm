// components/ManualPaymentModal.tsx
import React, { useState } from 'react';
import Modal from './Modal.tsx';
import { CreditCardIcon, SparklesIcon, CheckCircleIcon } from './icons.tsx';
import { subscriptionService } from '../services/application/subscriptionService.ts';
import { SubscriptionPlan } from '../types/subscription.ts';
import toast from 'react-hot-toast';

interface ManualPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: SubscriptionPlan | null;
    userId: string;
}

const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({ isOpen, onClose, plan, userId }) => {
    const [method, setMethod] = useState<'card' | 'crypto'>('card');
    const [trackingCode, setTrackingCode] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!plan || !trackingCode) {
            toast.error('لطفاً کد پیگیری را وارد کنید');
            return;
        }

        setSubmitting(true);
        const res = await subscriptionService.submitManualRequest(
            userId,
            plan.id,
            method,
            trackingCode,
            notes
        );

        if (res.success) {
            setSuccess(true);
            toast.success('درخواست شما ثبت شد و پس از تایید فعال می‌شود');
        } else {
            toast.error('خطا در ثبت درخواست: ' + res.error);
        }
        setSubmitting(false);
    };

    if (success) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="ثبت موفقیت‌آمیز">
                <div className="text-center py-8">
                    <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">درخواست نگهبانی شما ثبت شد!</h3>
                    <p className="text-stone-500 dark:text-stone-400 mb-6">
                        اطلاعات پرداخت شما دریافت شد. پس از بررسی توسط تیم پشتیبانی (معمولاً کمتر از ۲۴ ساعت)، اشتراک شما فعال شده و به شما اطلاع‌رسانی خواهد شد.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-stone-900 dark:bg-amber-600 text-white rounded-2xl font-bold"
                    >
                        متوجه شدم
                    </button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="پرداخت و فعال‌سازی اشتراک">
            <div className="max-w-md w-full">
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl mb-6 border border-amber-100 dark:border-amber-800/50">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        فعال‌سازی پلن <strong>{plan?.name}</strong> (ماهانه {(plan?.price_irr ? plan.price_irr / 10 : 0).toLocaleString('fa-IR')} تومان)
                    </p>
                </div>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setMethod('card')}
                        className={`flex-1 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'card' ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200' : 'border-stone-100 dark:border-stone-700 text-stone-500'}`}
                    >
                        <CreditCardIcon className="w-6 h-6" />
                        <span className="text-xs font-bold">کارت به کارت</span>
                    </button>
                    <button
                        onClick={() => setMethod('crypto')}
                        className={`flex-1 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${method === 'crypto' ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200' : 'border-stone-100 dark:border-stone-700 text-stone-500'}`}
                    >
                        <SparklesIcon className="w-6 h-6" />
                        <span className="text-xs font-bold">رمزارز (Crypto)</span>
                    </button>
                </div>

                <div className="bg-white dark:bg-stone-900/50 border dark:border-stone-700 p-6 rounded-2xl mb-6">
                    {method === 'card' ? (
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-xs text-stone-500 mb-1">شماره کارت جهت واریز:</p>
                                <p className="text-xl font-mono font-bold tracking-widest text-stone-900 dark:text-white">
                                    ۶۰۳۷ - ۹۹۷۳ - ۷۵۷۱ - ۱۱۶۹
                                </p>
                                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">به نام حسین حکمیان - بانک ملی</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-xs text-stone-500 mb-1">آدرس تتر (TRC-20):</p>
                                <p className="text-[10px] font-mono break-all bg-stone-100 dark:bg-stone-800 p-2 rounded-lg border dark:border-stone-700 select-all">
                                    TKh2pX... (آدرس تتر شما)
                                </p>
                                <p className="text-xs text-stone-400 mt-2 italic">مبالغ بر اساس نرخ لحظه‌ای تتر محاسبه می‌شود.</p>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-2 mr-1">کد پیگیری یا شماره فیش</label>
                        <input
                            required
                            type="text"
                            value={trackingCode}
                            onChange={(e) => setTrackingCode(e.target.value)}
                            className="w-full p-4 rounded-xl bg-stone-100 dark:bg-stone-900 border-none focus:ring-2 focus:ring-amber-500 text-right"
                            placeholder="مثلاً: ۱۲۳۴۵۶"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-2 mr-1">توضیحات (اختیاری)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-4 rounded-xl bg-stone-100 dark:bg-stone-900 border-none focus:ring-2 focus:ring-amber-500 text-right h-24"
                            placeholder="۴ رقم آخر کارت یا هر نکته دیگر..."
                        />
                    </div>
                    <button
                        disabled={submitting}
                        className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-lg shadow-amber-900/20"
                    >
                        {submitting ? 'در حال ثبت...' : 'تایید و ثبت نهایی'}
                    </button>
                    <p className="text-[10px] text-center text-stone-500">
                        با کلیک بر روی ثبت، شما تایید می‌کنید که مبلغ را واریز نموده و کد معتبر است.
                    </p>
                </form>
            </div>
        </Modal>
    );
};

export default ManualPaymentModal;
