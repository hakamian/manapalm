import React, { useState, useMemo } from 'react';
import { View, Order } from '../types';
import { useAppState, useAppDispatch } from '../AppContext';
import { TruckIcon, CreditCardIcon, ShieldCheckIcon, LockClosedIcon } from './icons';

const CheckoutView: React.FC = () => {
    const { cartItems, user } = useAppState();
    const dispatch = useAppDispatch();
    const [step, setStep] = useState(1);
    const [shippingInfo, setShippingInfo] = useState({
        fullName: user?.fullName || '',
        address: user?.address || '',
        phone: user?.phone || '',
    });
    const [paymentProvider, setPaymentProvider] = useState('online');
    const [isProcessing, setIsProcessing] = useState(false);

    const onNavigate = (view: View) => dispatch({ type: 'SET_VIEW', payload: view });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setShippingInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNextStep = () => {
        if (step === 1 && (shippingInfo.fullName && shippingInfo.address && shippingInfo.phone)) setStep(2);
        else if (step === 2) setStep(3);
    };
    
    const handlePlaceOrder = () => {
        setIsProcessing(true);
        setTimeout(() => {
            if (!user) return;
            const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            // FIX: Added missing productId to conform to Deed type
            const newDeeds = cartItems.filter(item => item.id.startsWith('p_heritage_') && item.deedDetails).map(item => ({
                id: `deed-${Date.now()}-${item.id.slice(11, 15)}`, productId: item.productId, intention: item.deedDetails!.intention, name: item.deedDetails!.name,
                date: new Date().toISOString(), palmType: item.name, message: item.deedDetails!.message, fromName: item.deedDetails!.fromName,
            }));
            const newOrder: Order = {
                id: `order-${Date.now()}`, userId: user.id, date: new Date().toISOString(), items: cartItems, total: total,
                status: 'ثبت شده', statusHistory: [{ status: 'ثبت شده', date: new Date().toISOString() }], deeds: newDeeds,
            };
            dispatch({ type: 'PLACE_ORDER', payload: newOrder });
            // Points logic will be handled in the reducer now
        }, 2000);
    };
    
    const shippingCost = useMemo(() => (cartItems.some(item => item.type !== 'upgrade') ? 35000 : 0), [cartItems]);

    const { amountDueNow, installmentDetails } = useMemo(() => {
        const fullPaymentTotal = cartItems.filter(i => !i.paymentPlan).reduce((s, i) => s + i.price * i.quantity, 0);
        const installmentItems = cartItems.filter(i => i.paymentPlan);
        let installmentInitialTotal = 0; let totalInstallmentValue = 0; let plan: { installments: number } | null = null;
        if (installmentItems.length > 0) {
            plan = installmentItems[0].paymentPlan!;
            installmentItems.forEach(i => { totalInstallmentValue += i.price * i.quantity; });
            installmentInitialTotal = totalInstallmentValue / plan.installments;
        }
        return {
            amountDueNow: fullPaymentTotal + installmentInitialTotal + shippingCost,
            installmentDetails: plan ? { installments: plan.installments, remainingAmount: totalInstallmentValue - installmentInitialTotal } : null,
        };
    }, [cartItems, shippingCost]);
    
    const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(Math.ceil(price));

    const steps = [
        { id: 1, name: 'اطلاعات ارسال', icon: <TruckIcon className="w-6 h-6" /> },
        { id: 2, name: 'روش پرداخت', icon: <CreditCardIcon className="w-6 h-6" /> },
        { id: 3, name: 'تایید و پرداخت', icon: <ShieldCheckIcon className="w-6 h-6" /> },
    ];
    
    if (!user) { onNavigate(View.Home); return null; }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <div className="text-center mb-8" onClick={() => onNavigate(View.Home)} style={{cursor: 'pointer'}}><img src="https://picsum.photos/seed/nakhlestan-logo/60/60" alt="Logo" className="rounded-full mx-auto mb-2" /><h1 className="text-3xl font-bold">تکمیل خرید</h1></div>
                <div className="w-full max-w-2xl mx-auto mb-8"><ol className="flex items-center w-full">{steps.map((s, index) => (<li key={s.id} className={`flex w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" : ""} ${step > s.id ? 'after:border-green-400' : 'after:border-gray-700'}`}><span className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 ${step >= s.id ? 'bg-green-600 border-2 border-green-400' : 'bg-gray-700 border-2 border-gray-600'}`}>{s.icon}</span></li>))}</ol></div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 bg-gray-800 p-8 rounded-lg border border-gray-700">
                        {step === 1 && (<div><h2 className="text-2xl font-semibold">اطلاعات ارسال</h2>{/* Form fields */}</div>)}
                        {step === 2 && (<div><h2 className="text-2xl font-semibold">روش پرداخت</h2>{/* Payment options */}</div>)}
                        {step === 3 && (<div><h2 className="text-2xl font-semibold mb-6">خلاصه و تایید نهایی</h2>{/* Confirmation details */}</div>)}
                        <div className="flex justify-between items-center mt-8">
                            <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="text-gray-400 hover:text-white font-bold py-3 px-6 rounded-md transition-colors disabled:opacity-50">بازگشت</button>
                            {step < 3 ? <button onClick={handleNextStep} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition-colors">ادامه</button> : <button onClick={handlePlaceOrder} disabled={isProcessing} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center">{isProcessing && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}{isProcessing ? 'در حال پردازش...' : 'تایید و پرداخت'}</button>}
                        </div>
                    </div>
                    <aside className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700 self-start">
                        <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-3">خلاصه سفارش</h2>
                        <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-4">
                            {cartItems.map(item => (<div key={item.id} className="flex justify-between items-start text-sm"><div className="flex items-center"><img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover ml-3" /><div><p className="text-white font-semibold">{item.name}</p><p className="text-gray-400">تعداد: {item.quantity}</p></div></div><p className="font-semibold text-white">{formatPrice(item.price * item.quantity)}</p></div>))}
                        </div>
                        <div className="border-t border-gray-700 pt-4 space-y-3">
                             <div className="flex justify-between text-gray-300"><span>جمع محصولات</span><span>{formatPrice(cartItems.reduce((s, i) => s + i.price * i.quantity, 0))} تومان</span></div>
                             <div className="flex justify-between text-gray-300"><span>هزینه ارسال</span><span>{formatPrice(shippingCost)} تومان</span></div>
                             <div className="flex justify-between text-white font-bold text-lg border-t border-gray-700 pt-3 mt-3"><span>{installmentDetails ? 'مبلغ پرداخت اولیه' : 'مبلغ قابل پرداخت'}</span><span>{formatPrice(amountDueNow)} تومان</span></div>
                             {installmentDetails && (<div className="text-xs text-gray-400 text-center mt-2 bg-gray-700/50 p-2 rounded-md">مابقی در {installmentDetails.installments - 1} قسط ماهانه پرداخت خواهد شد.</div>)}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CheckoutView;
