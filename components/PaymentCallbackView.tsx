'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppState } from '../AppContext';
import { verifyPayment } from '../services/payment';
import { CheckCircleIcon, XMarkIcon, ArrowLeftIcon, ArrowPathIcon, BanknotesIcon } from './icons';
import { View, Order, Deed } from '../types';

const PaymentCallbackView: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppState();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [message, setMessage] = useState('در حال ارتباط با بانک...');
    const [refId, setRefId] = useState('');
    const [paidAmount, setPaidAmount] = useState(0);

    useEffect(() => {
        const verify = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const authority = urlParams.get('Authority');
            const paymentStatus = urlParams.get('Status');

            // Retrieve pending order
            const pendingOrderStr = localStorage.getItem('pending_order');
            if (!pendingOrderStr) {
                setStatus('failed');
                setMessage('اطلاعات سفارش در حافظه مرورگر یافت نشد. اگر پرداخت کرده‌اید، با پشتیبانی تماس بگیرید.');
                return;
            }

            const pendingOrder = JSON.parse(pendingOrderStr);
            setPaidAmount(pendingOrder.total);

            if (paymentStatus !== 'OK') {
                setStatus('failed');
                setMessage('پرداخت توسط کاربر لغو شد یا ناموفق بود.');
                return;
            }

            try {
                const result = await verifyPayment(pendingOrder.total, authority!);

                if (result.success) {
                    setRefId(result.refId);
                    setStatus('success');
                    setMessage('پرداخت با موفقیت انجام شد.');

                    // Create Real Order
                    const newDeeds: Deed[] = pendingOrder.items
                        .filter((item: any) => item.type === 'heritage' && item.deedDetails)
                        .map((item: any) => ({
                            id: `deed-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                            productId: item.productId,
                            intention: item.deedDetails.intention,
                            name: item.deedDetails.name,
                            date: new Date().toISOString(),
                            palmType: item.name,
                            message: item.deedDetails.message,
                            fromName: item.deedDetails.fromName,
                            groveKeeperId: item.deedDetails.groveKeeperId,
                        }));

                    const newHistory = pendingOrder.statusHistory
                        ? [...pendingOrder.statusHistory, { status: 'پرداخت شده', date: new Date().toISOString() }]
                        : [{ status: 'پرداخت شده', date: new Date().toISOString() }];

                    const newOrder: Order = {
                        id: pendingOrder.id || `order-${Date.now()}`,
                        userId: user?.id || pendingOrder.userId,
                        date: pendingOrder.date || new Date().toISOString(),
                        items: pendingOrder.items,
                        total: pendingOrder.total,
                        totalAmount: pendingOrder.totalAmount || pendingOrder.total,
                        status: 'پرداخت شده',
                        statusHistory: newHistory,
                        deeds: newDeeds,
                        deliveryType: pendingOrder.deliveryType || 'physical',
                        physicalAddress: pendingOrder.physicalAddress,
                        digitalAddress: pendingOrder.digitalAddress,
                        createdAt: pendingOrder.createdAt || new Date().toISOString()
                    };

                    // Dispatch Actions
                    dispatch({ type: 'PLACE_ORDER', payload: newOrder });

                    // 📱 SEND SMS CONFIRMATION
                    const phone = pendingOrder.physicalAddress?.phone || pendingOrder.digitalAddress?.phone || user?.phone;
                    if (phone) {
                        fetch('/api/sms', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                mobile: phone,
                                message: newOrder.id.slice(0, 8)
                            })
                        }).catch(err => console.error('SMS Error:', err));
                    }

                    // Clean URL to prevent re-verification on refresh and redirect to clean background
                    try {
                        window.history.replaceState({}, document.title, "/");
                    } catch (e) {
                        console.warn('Could not clean URL:', e);
                    }
                    dispatch({ type: 'SET_VIEW', payload: View.Home });

                    // Cleanup
                    localStorage.removeItem('pending_order');

                } else {
                    setStatus('failed');
                    setMessage(result.message || 'تایید تراکنش از سمت بانک ناموفق بود.');
                }
            } catch (error) {
                console.error(error);
                setStatus('failed');
                setMessage('خطا در ارتباط با سرور جهت تایید پرداخت.');
            }
        };

        // Run verify only once
        if (status === 'loading') {
            verify();
        }
    }, [dispatch, user?.id, status]);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-gray-700">

                {status === 'loading' && (
                    <div className="py-10">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg animate-pulse font-bold">{message}</p>
                        <p className="text-sm text-gray-400 mt-2">لطفاً صفحه را نبندید...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-fade-in-up">
                        <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(22,163,74,0.5)] border-4 border-green-400">
                            <CheckCircleIcon className="w-14 h-14 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-400 mb-2">پرداخت موفق!</h2>
                        <p className="text-gray-300 mb-6">{message}</p>

                        <div className="bg-gray-700/50 p-4 rounded-xl mb-6 border border-gray-600 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">مبلغ:</span>
                                <span className="text-white font-bold">{paidAmount.toLocaleString('fa-IR')} تومان</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">کد پیگیری:</span>
                                <span className="text-white font-mono">{refId}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => dispatch({ type: 'SET_VIEW', payload: View.UserProfile })}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
                        >
                            مشاهده سفارش و اسناد
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="animate-fade-in-up">
                        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                            <XMarkIcon className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-400 mb-2">پرداخت ناموفق</h2>
                        <p className="text-gray-300 mb-8 px-4">{message}</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => dispatch({ type: 'SET_VIEW', payload: View.Shop })}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
                            >
                                بازگشت
                            </button>
                            <button
                                onClick={() => {
                                    try {
                                        window.history.replaceState({}, document.title, "/");
                                    } catch (e) { }
                                    dispatch({ type: 'TOGGLE_CART', payload: true });
                                }}
                                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                                تلاش مجدد
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PaymentCallbackView;
