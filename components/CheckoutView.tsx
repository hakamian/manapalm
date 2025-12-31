import React, { useState, useMemo } from 'react';
import { View, Order } from '../types';
import { useAppState, useAppDispatch } from '../AppContext';
import { TruckIcon, CreditCardIcon, ShieldCheckIcon, LockClosedIcon, PencilSquareIcon } from './icons';
import { requestPayment } from '../services/payment';
import { dbAdapter } from '../services/dbAdapter';

const CheckoutView: React.FC = () => {
    const { cartItems, user } = useAppState();
    const dispatch = useAppDispatch();
    const [step, setStep] = useState(1);
    const [shippingInfo, setShippingInfo] = useState({
        fullName: user?.fullName || '',
        address: user ? `${user.address || ''}${user.plaque ? '، پلاک ' + user.plaque : ''}${user.floor ? '، طبقه/واحد ' + user.floor : ''}` : '',
        phone: user?.phone || '',
    });
    const [paymentProvider, setPaymentProvider] = useState('zarinpal');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onNavigate = (view: View) => dispatch({ type: 'SET_VIEW', payload: view });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setShippingInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNextStep = () => {
        if (step === 1 && (shippingInfo.fullName && shippingInfo.address && shippingInfo.phone)) setStep(2);
        else if (step === 2) setStep(3);
    };

    const handlePayment = async () => {
        if (!user) return;
        setIsProcessing(true);
        setError(null);

        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const description = `خرید ${cartItems.length} محصول از نخلستان معنا`;
        const orderId = `order-${Date.now()}`;

        // 1. Create Pending Order Object & Save to DB
        const pendingOrder: Order = {
            id: orderId,
            userId: user.id,
            items: cartItems,
            total: total,
            totalAmount: total,
            status: 'pending', // Or 'در انتظار پرداخت'
            statusHistory: [{ status: 'pending', date: new Date().toISOString() }],
            deeds: [],
            createdAt: new Date().toISOString(),
            date: new Date().toISOString()
        };

        try {
            await dbAdapter.saveOrder(pendingOrder);

            // 2. Save Pending Order to LocalStorage (with ID)
            const storageOrder = {
                ...pendingOrder,
                shippingInfo: shippingInfo,
            };
            localStorage.setItem('pending_order', JSON.stringify(storageOrder));

            // 3. Request Payment Token
            const result = await requestPayment(total, description, { email: user.email, phone: user.phone });

            if (result.success && result.url) {
                // 4. Redirect to Gateway
                window.location.href = result.url;
            } else {
                throw new Error(result.error || 'خطا در اتصال به درگاه بانک');
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || "خطا در پردازش پرداخت.");
            setIsProcessing(false);
        }
    };

    const shippingCost = useMemo(() => (cartItems.some(item => item.type !== 'upgrade') ? 35000 : 0), [cartItems]);
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + shippingCost;

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
                <div className="text-center mb-8" onClick={() => onNavigate(View.Home)} style={{ cursor: 'pointer' }}><img src="https://picsum.photos/seed/nakhlestan-logo/60/60" alt="Logo" className="rounded-full mx-auto mb-2" /><h1 className="text-3xl font-bold">تکمیل خرید</h1></div>
                <div className="w-full max-w-2xl mx-auto mb-8"><ol className="flex items-center w-full">{steps.map((s, index) => (<li key={s.id} className={`flex w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" : ""} ${step > s.id ? 'after:border-green-400' : 'after:border-gray-700'}`}><span className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 ${step >= s.id ? 'bg-green-600 border-2 border-green-400' : 'bg-gray-700 border-2 border-gray-600'}`}>{s.icon}</span></li>))}</ol></div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 bg-gray-800 p-8 rounded-lg border border-gray-700">
                        {step === 1 && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-6">اطلاعات ارسال</h2>
                                <div className="space-y-4">
                                    <div><label className="block text-sm text-gray-400 mb-1">نام کامل گیرنده</label><input type="text" name="fullName" value={shippingInfo.fullName} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white" /></div>
                                    <div><label className="block text-sm text-gray-400 mb-1">شماره تماس</label><input type="tel" name="phone" value={shippingInfo.phone} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white" /></div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm text-gray-400">آدرس پستی دقیق</label>
                                            <button
                                                onClick={() => dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: 'detailed' })}
                                                className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
                                                تکمیل/ویرایش از پروفایل
                                            </button>
                                        </div>
                                        <textarea name="address" value={shippingInfo.address} onChange={handleInputChange} rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:border-amber-500 outline-none transition-colors" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {step === 2 && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-6">روش پرداخت</h2>
                                <div className="space-y-3">
                                    <label className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentProvider === 'zarinpal' ? 'border-amber-500 bg-amber-900/20' : 'border-gray-600 bg-gray-700/30'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xs">زرین</div>
                                            <div>
                                                <p className="font-bold">پرداخت آنلاین (زرین‌پال)</p>
                                                <p className="text-xs text-gray-400">تمامی کارت‌های عضو شتاب</p>
                                            </div>
                                        </div>
                                        <input type="radio" name="payment" value="zarinpal" checked={paymentProvider === 'zarinpal'} onChange={() => setPaymentProvider('zarinpal')} className="accent-amber-500 w-5 h-5" />
                                    </label>
                                </div>
                            </div>
                        )}
                        {step === 3 && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-6">تایید نهایی و پرداخت</h2>
                                <div className="bg-gray-700/30 p-4 rounded-lg mb-6 text-sm text-gray-300 space-y-2">
                                    <p><span className="text-gray-500">گیرنده:</span> {shippingInfo.fullName}</p>
                                    <p><span className="text-gray-500">آدرس:</span> {shippingInfo.address}</p>
                                    <p><span className="text-gray-500">تماس:</span> {shippingInfo.phone}</p>
                                </div>
                                <div className="flex items-center gap-2 text-yellow-400 bg-yellow-900/20 p-3 rounded-lg border border-yellow-600/30">
                                    <LockClosedIcon className="w-5 h-5" />
                                    <p className="text-sm">پرداخت امن از طریق درگاه شاپرک انجام می‌شود.</p>
                                </div>
                            </div>
                        )}

                        {error && <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg text-sm text-center">{error}</div>}

                        <div className="flex justify-between items-center mt-8">
                            <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="text-gray-400 hover:text-white font-bold py-3 px-6 rounded-md transition-colors disabled:opacity-50">بازگشت</button>
                            {step < 3 ? (
                                <button onClick={handleNextStep} disabled={step === 1 && (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.phone)} className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-md transition-colors">
                                    مرحله بعد
                                </button>
                            ) : (
                                <button onClick={handlePayment} disabled={isProcessing} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-3 px-8 rounded-md transition-colors flex items-center shadow-lg shadow-green-900/20">
                                    {isProcessing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            در حال انتقال به بانک...
                                        </>
                                    ) : (
                                        'پرداخت آنلاین'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                    <aside className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700 self-start sticky top-4">
                        <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-3">خلاصه سفارش</h2>
                        <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-4 custom-scrollbar">
                            {cartItems.map(item => (<div key={item.id} className="flex justify-between items-start text-sm"><div className="flex items-center"><img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover ml-3" /><div><p className="text-white font-semibold">{item.name}</p><p className="text-gray-400">تعداد: {item.quantity}</p></div></div><p className="font-semibold text-white">{formatPrice(item.price * item.quantity)}</p></div>))}
                        </div>
                        <div className="border-t border-gray-700 pt-4 space-y-3">
                            <div className="flex justify-between text-gray-300"><span>جمع محصولات</span><span>{formatPrice(cartItems.reduce((s, i) => s + i.price * i.quantity, 0))} تومان</span></div>
                            <div className="flex justify-between text-gray-300"><span>هزینه ارسال</span><span>{formatPrice(shippingCost)} تومان</span></div>
                            <div className="flex justify-between text-white font-bold text-lg border-t border-gray-700 pt-3 mt-3"><span>مبلغ قابل پرداخت</span><span>{formatPrice(totalAmount)} تومان</span></div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CheckoutView;
