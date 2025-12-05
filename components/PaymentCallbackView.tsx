
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppState } from '../AppContext';
import { verifyPayment } from '../services/payment';
import { CheckCircleIcon, XMarkIcon, ArrowLeftIcon, ArrowPathIcon } from './icons'; 
import { View, Order, Deed } from '../types';

const PaymentCallbackView: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppState();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [message, setMessage] = useState('در حال تایید تراکنش...');
    const [refId, setRefId] = useState('');

    useEffect(() => {
        const verify = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const authority = urlParams.get('Authority');
            const paymentStatus = urlParams.get('Status');
            
            // Retrieve pending order
            const pendingOrderStr = localStorage.getItem('pending_order');
            if (!pendingOrderStr) {
                setStatus('failed');
                setMessage('اطلاعات سفارش یافت نشد. لطفا مجددا تلاش کنید.');
                return;
            }
            
            const pendingOrder = JSON.parse(pendingOrderStr);

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

                    const newOrder: Order = {
                        id: `order-${Date.now()}`,
                        userId: user?.id || pendingOrder.userId,
                        date: new Date().toISOString(),
                        items: pendingOrder.items,
                        total: pendingOrder.total,
                        status: 'پرداخت شده',
                        statusHistory: [{ status: 'پرداخت شده', date: new Date().toISOString() }],
                        deeds: newDeeds,
                    };
                    
                    // Dispatch Actions
                    dispatch({ type: 'PLACE_ORDER', payload: newOrder });
                    
                    // Cleanup
                    localStorage.removeItem('pending_order');

                } else {
                    setStatus('failed');
                    setMessage(result.message || 'تایید تراکنش ناموفق بود.');
                }
            } catch (error) {
                console.error(error);
                setStatus('failed');
                setMessage('خطا در ارتباط با سرور جهت تایید پرداخت.');
            }
        };

        verify();
    }, [dispatch, user?.id]);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-gray-700">
                
                {status === 'loading' && (
                    <div className="py-10">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg animate-pulse">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-fade-in-up">
                        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(22,163,74,0.5)]">
                            <CheckCircleIcon className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-400 mb-2">پرداخت موفقیت‌آمیز بود</h2>
                        <p className="text-gray-300 mb-6">{message}</p>
                        
                        <div className="bg-gray-700/50 p-4 rounded-xl mb-6 border border-gray-600">
                            <p className="text-sm text-gray-400 mb-1">کد پیگیری تراکنش</p>
                            <p className="text-xl font-mono font-bold text-white tracking-wider">{refId}</p>
                        </div>

                        <button 
                            onClick={() => dispatch({ type: 'SET_VIEW', payload: View.UserProfile })}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            مشاهده سفارش در پروفایل
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
                        <p className="text-gray-300 mb-8">{message}</p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => dispatch({ type: 'SET_VIEW', payload: View.Shop })}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
                            >
                                بازگشت به فروشگاه
                            </button>
                            <button 
                                onClick={() => {
                                    // Clean URL parameters
                                    window.history.replaceState({}, document.title, "/");
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
