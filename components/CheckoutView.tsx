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
    const defaultAddress = useMemo(() => user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0], [user]);

    const [shippingInfo, setShippingInfo] = useState({
        fullName: defaultAddress?.recipientName || user?.fullName || '',
        address: defaultAddress
            ? `${defaultAddress.province}، ${defaultAddress.city}، ${defaultAddress.fullAddress}`
            : (user ? `${user.address || ''}${user.plaque ? '، پلاک ' + user.plaque : ''}${user.floor ? '، طبقه/واحد ' + user.floor : ''}` : ''),
        phone: defaultAddress?.phone || user?.phone || '',
    });
    const [paymentProvider, setPaymentProvider] = useState('zarinpal');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onNavigate = (view: View) => dispatch({ type: 'SET_VIEW', payload: view });

    // --- Dynamic Validation Logic ---
    const needsPhysicalShipping = useMemo(() => cartItems.some(item => item.category !== 'heritage' && item.type !== 'service'), [cartItems]);
    const needsEmailDelivery = useMemo(() => cartItems.some(item => item.category === 'heritage' || item.type === 'service'), [cartItems]);

    // If not logged in, show login prompt
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="glass-card p-12 rounded-3xl max-w-md w-full animate-in fade-in zoom-in">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LockClosedIcon className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">ورود به حساب کاربری</h2>
                    <p className="text-gray-400 mb-8">برای تکمیل سفارش و ثبت آن به نام شما، لطفاً وارد حساب کاربری خود شوید.</p>
                    <button
                        onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/40"
                    >
                        ورود / ثبت‌نام
                    </button>
                    <button
                        onClick={() => onNavigate(View.Home)}
                        className="mt-4 text-gray-500 hover:text-white text-sm"
                    >
                        بازگشت به صفحه اصلی
                    </button>
                </div>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setShippingInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNextStep = () => {
        // Validation checks
        if (step === 1) {
            if (!shippingInfo.fullName) return alert("لطفاً نام نام خانوادگی را وارد کنید");
            if (!shippingInfo.phone) return alert("لطفاً شماره تماس را وارد کنید");

            if (needsPhysicalShipping && !shippingInfo.address) {
                return alert("این سفارش شامل کالای فیزیکی است، لطفاً آدرس دقیق پستی را وارد کنید.");
            }
            if (needsEmailDelivery && !user.email && !shippingInfo.address.includes('@')) {
                // Note: In a real app we would have a dedicated email field if user.email is missing
                // For now, we assume user profile has email or they must update it
                // We can prompt them here if email is missing
                if (!user.email) return alert("برای ارسال سند نخل (دیجیتال)، لطفاً ایمیل خود را در پروفایل ثبت کنید یا با پشتیبانی تماس بگیرید.");
            }
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        }
    };

    const saveAddressToProfile = async () => {
        // Only save if it's a physical order and we have an address
        if (needsPhysicalShipping && shippingInfo.address && user) {
            // Check if address already exists to avoid duplicates (simple check by full string)
            const exists = user.addresses?.some(a => a.fullAddress === shippingInfo.address);
            if (!exists) {
                const newAddress = {
                    id: `addr-${Date.now()}`,
                    title: 'آدرس جدید',
                    recipientName: shippingInfo.fullName,
                    phone: shippingInfo.phone,
                    province: 'پیش‌فرض', // Can be enhanced with a city selector later
                    city: 'پیش‌فرض',
                    fullAddress: shippingInfo.address,
                    postalCode: '0000000000',
                    isDefault: true
                };

                const updatedAddresses = [newAddress, ...(user.addresses || [])];

                // Dispatch UPDATE_USER which triggers DB sync in AppContext reducer
                dispatch({
                    type: 'UPDATE_USER',
                    payload: { addresses: updatedAddresses }
                });

                console.log("📍 Address saved to profile and syncing to DB:", newAddress);
            }
        }
    };

    const handlePayment = async () => {
        if (!user) return;
        setIsProcessing(true);
        setError(null);

        // Save address if new
        await saveAddressToProfile();

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

    const shippingCost = useMemo(() => (needsPhysicalShipping ? 35000 : 0), [needsPhysicalShipping]);
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + shippingCost;
    const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(Math.ceil(price));

    const steps = [
        { id: 1, name: 'اطلاعات گیرنده', icon: <TruckIcon className="w-6 h-6" /> },
        { id: 2, name: 'روش پرداخت', icon: <CreditCardIcon className="w-6 h-6" /> },
        { id: 3, name: 'تایید نهایی', icon: <ShieldCheckIcon className="w-6 h-6" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 pt-clearance">
            <div className="w-full max-w-4xl mx-auto">
                <div className="text-center mb-8" onClick={() => onNavigate(View.Home)} style={{ cursor: 'pointer' }}>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">تکمیل خرید</h1>
                </div>

                <div className="w-full max-w-2xl mx-auto mb-10">
                    <ol className="flex items-center w-full relative justify-between px-4">
                        {steps.map((s, index) => (
                            <React.Fragment key={s.id}>
                                <li className={`relative z-10 flex flex-col items-center gap-2 ${step >= s.id ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    <span className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${step >= s.id ? 'bg-emerald-900/50 border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-gray-800 border-2 border-gray-700'}`}>
                                        {s.icon}
                                    </span>
                                    <span className="text-xs font-semibold">{s.name}</span>
                                </li>
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${step > s.id ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                                )}
                            </React.Fragment>
                        ))}
                    </ol>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="lg:col-span-3 glass-card p-6 sm:p-8 rounded-2xl">
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                                    <PencilSquareIcon className="w-6 h-6 text-emerald-400" />
                                    اطلاعات تماس و ارسال
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">نام و نام خانوادگی</label>
                                        <input type="text" name="fullName" value={shippingInfo.fullName} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" placeholder="مثال: علی محمدی" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">شماره تماس (جهت هماهنگی)</label>
                                        <input type="tel" name="phone" value={shippingInfo.phone} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all dir-ltr text-right" placeholder="0912..." />
                                    </div>
                                </div>

                                {needsPhysicalShipping ? (
                                    <div className="mt-4">
                                        <label className="block text-sm text-gray-400 mb-2">
                                            آدرس دقیق پستی <span className="text-red-400 text-xs">(الزامی برای محصولات فیزیکی)</span>
                                        </label>
                                        <textarea name="address" value={shippingInfo.address} onChange={handleInputChange} rows={3} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" placeholder="استان، شهر، خیابان، کوچه، پلاک، واحد..." />
                                    </div>
                                ) : (
                                    <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                                        <ShieldCheckIcon className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-bold text-emerald-300 mb-1">محصول دیجیتال / نخل میراث</p>
                                            <p className="text-gray-400">سند یا فایل خریداری شده به صورت آنی صادر شده و به ایمیل شما ارسال می‌شود. همچنین در بخش "نخل‌های من" قابل مشاهده خواهد بود.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {step === 2 && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-6">روش پرداخت</h2>
                                <div className="space-y-3">
                                    <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentProvider === 'zarinpal' ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-black/20 hover:bg-white/5'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-black font-extrabold text-sm shadow-lg shadow-amber-400/20">ZP</div>
                                            <div>
                                                <p className="font-bold text-lg">پرداخت آنلاین (زرین‌پال)</p>
                                                <p className="text-sm text-gray-400">پشتیبانی از تمامی کارت‌های بانکی عضو شتاب</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentProvider === 'zarinpal' ? 'border-amber-400' : 'border-gray-500'}`}>
                                            {paymentProvider === 'zarinpal' && <div className="w-3 h-3 bg-amber-400 rounded-full" />}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}
                        {step === 3 && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-6">تایید نهایی</h2>
                                <div className="glass-panel p-5 rounded-xl mb-6 text-sm text-gray-300 space-y-3">
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-gray-500">تحویل گیرنده:</span>
                                        <span className="font-medium text-white">{shippingInfo.fullName}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-gray-500">شماره تماس:</span>
                                        <span className="font-medium text-white">{shippingInfo.phone}</span>
                                    </div>
                                    {needsPhysicalShipping && (
                                        <div className="flex flex-col gap-1 pt-1">
                                            <span className="text-gray-500">آدرس ارسال:</span>
                                            <span className="font-medium text-white leading-relaxed">{shippingInfo.address}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-emerald-400 bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/20">
                                    <LockClosedIcon className="w-6 h-6" />
                                    <p className="text-sm">اطلاعات شما با پروتکل SSL رمزنگاری شده و پرداخت از طریق درگاه امن شاپرک انجام می‌شود.</p>
                                </div>
                            </div>
                        )}

                        {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-xl text-sm text-center animate-pulse">{error}</div>}

                        <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/10">
                            <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="text-gray-400 hover:text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2">
                                <span className="rotate-180">➜</span> بازگشت
                            </button>

                            {step < 3 ? (
                                <button onClick={handleNextStep} className="bg-white text-black hover:bg-emerald-400 font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-emerald-400/20 transform hover:-translate-y-0.5 flex items-center gap-2">
                                    مرحله بعد <span>➜</span>
                                </button>
                            ) : (
                                <button onClick={handlePayment} disabled={isProcessing} className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:grayscale text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg shadow-emerald-900/40 flex items-center gap-3 text-lg">
                                    {isProcessing ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            در حال انتقال...
                                        </>
                                    ) : (
                                        <>پرداخت و نهایی‌سازی</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    <aside className="lg:col-span-2 space-y-6">
                        <div className="glass-card p-6 rounded-2xl sticky top-24">
                            <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-white/10 flex items-center gap-2">
                                <span className="w-2 h-6 bg-emerald-500 rounded-full h-full block"></span>
                                خلاصه سفارش
                            </h2>
                            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-800" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{item.name}</p>
                                            <p className="text-emerald-400 text-sm mt-1">{formatPrice(item.price)} <span className="text-xs text-gray-400">تومان</span></p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-xs text-gray-400 bg-black/30 px-2 py-0.5 rounded">x{item.quantity}</span>
                                                <span className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <div className="flex justify-between text-gray-400 text-sm"><span>جمع کل کالاها</span><span>{formatPrice(cartItems.reduce((s, i) => s + i.price * i.quantity, 0))} تومان</span></div>
                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>هزینه ارسال {needsPhysicalShipping ? '(پست پیشتاز)' : '(دیجیتال)'}</span>
                                    <span className={shippingCost === 0 ? 'text-emerald-400' : ''}>{shippingCost === 0 ? 'رایگان' : `${formatPrice(shippingCost)} تومان`}</span>
                                </div>
                                <div className="flex justify-between text-white font-bold text-xl pt-4 border-t border-white/10 mt-2">
                                    <span>مبلغ قابل پرداخت</span>
                                    <span className="text-emerald-400">{formatPrice(totalAmount)} تومان</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CheckoutView;
