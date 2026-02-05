'use client';

import React, { useState, useMemo } from 'react';
import { View, Order, PhysicalAddress, DigitalAddress, DeliveryType } from '../types';
import { useAppState, useAppDispatch } from '../AppContext';
import { TruckIcon, CreditCardIcon, ShieldCheckIcon, LockClosedIcon } from './icons';
import { requestPayment } from '../services/infrastructure/payment';
import { dbAdapter } from '../services/application/database';
import { validateCheckout, getDeliveryTypeLabel } from '../services/application/checkoutService';
import { getShippingRates, ShippingRate, estimateWeight, createShipment, attachShipmentToOrder } from '../services/infrastructure/shippingService';
import { deliverOrderCertificates } from '../services/application/certificateDeliveryService';
import AddressForm from './checkout/AddressForm';
import ShippingMethodSelector from './checkout/ShippingMethodSelector';

const CheckoutView: React.FC = () => {
    const { cartItems, user } = useAppState();
    const dispatch = useAppDispatch();

    // Step Management
    const [currentStep, setCurrentStep] = useState<'address' | 'shipping' | 'payment' | 'review'>('address');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Address State - Initialize from user profile
    const defaultUserAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
    const [physicalAddress, setPhysicalAddress] = useState<PhysicalAddress>({
        recipientName: defaultUserAddress?.recipientName || user?.fullName || '',
        phone: defaultUserAddress?.phone || user?.phone || '',
        province: defaultUserAddress?.province || '',
        city: defaultUserAddress?.city || '',
        neighborhood: defaultUserAddress?.neighborhood || '',
        fullAddress: defaultUserAddress?.fullAddress || '',
        postalCode: defaultUserAddress?.postalCode || '',
        plaque: defaultUserAddress?.plaque || '',
        unit: defaultUserAddress?.unit || defaultUserAddress?.floor || '',
        floor: defaultUserAddress?.floor || ''
    });

    const [digitalAddress, setDigitalAddress] = useState<DigitalAddress>({
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const [selectedShipping, setSelectedShipping] = useState<ShippingRate | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'zarinpal' | 'wallet' | 'card_transfer' | 'crypto'>('zarinpal');
    const [paymentProof, setPaymentProof] = useState<string>('');

    // Navigation helper
    const onNavigate = (view: View) => dispatch({ type: 'SET_VIEW', payload: view });

    // Validation
    const validation = useMemo(() => {
        return validateCheckout(cartItems, physicalAddress, digitalAddress);
    }, [cartItems, physicalAddress, digitalAddress]);

    // Totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = selectedShipping?.price || 0;
    const isFreeShipping = subtotal >= 500000;
    const finalShipping = isFreeShipping || !validation.requiresPhysicalAddress ? 0 : shippingCost;
    const total = subtotal + finalShipping;

    // Weight estimation for shipping
    const estimatedWeight = useMemo(() => {
        return estimateWeight(validation.physicalItems.map(i => ({
            category: i.category,
            quantity: i.quantity
        })));
    }, [validation.physicalItems]);

    // Not logged in
    if (!user) {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-12 rounded-3xl max-w-md w-full">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LockClosedIcon className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">ورود به حساب کاربری</h2>
                    <p className="text-gray-400 mb-8">برای تکمیل سفارش و ثبت آن به نام شما، لطفاً وارد حساب کاربری خود شوید.</p>
                    <button
                        onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all"
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

    // Empty cart
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-12 rounded-3xl max-w-md w-full">
                    <div className="text-6xl mb-6">🛒</div>
                    <h2 className="text-2xl font-bold mb-4">سبد خرید خالی است</h2>
                    <p className="text-gray-400 mb-8">ابتدا محصولاتی به سبد خرید اضافه کنید.</p>
                    <button
                        onClick={() => onNavigate(View.Shop)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all"
                    >
                        رفتن به فروشگاه
                    </button>
                </div>
            </div>
        );
    }

    // Step navigation helpers
    const canProceedFromAddress = () => {
        if (validation.requiresPhysicalAddress) {
            if (!physicalAddress.recipientName || !physicalAddress.phone || !physicalAddress.province ||
                !physicalAddress.city || !physicalAddress.fullAddress || !physicalAddress.postalCode) {
                return false;
            }
        }
        if (validation.requiresDigitalAddress) {
            if (!digitalAddress.phone && !digitalAddress.email) {
                return false;
            }
        }
        return true;
    };

    const handleNextFromAddress = () => {
        if (!canProceedFromAddress()) {
            setError('لطفاً تمام فیلدهای الزامی را پر کنید.');
            return;
        }
        setError(null);
        if (validation.requiresPhysicalAddress) {
            setCurrentStep('shipping');
        } else {
            setCurrentStep('review');
        }
    };

    const handleNextFromShipping = () => {
        if (!selectedShipping && validation.requiresPhysicalAddress) {
            setError('لطفاً یک روش ارسال انتخاب کنید.');
            return;
        }
        setError(null);
        setCurrentStep('review');
    };

    // Payment Handler
    const handlePayment = async () => {
        if (!user) return;
        setIsProcessing(true);
        setError(null);

        try {
            // Generate a valid UUID v4
            const generateUUID = () => {
                if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };
            const orderId = generateUUID();
            const description = `خرید ${cartItems.length} محصول از نخلستان معنا`;

            // 1. Create Order Object with correct initialization
            const newOrder: Order = {
                id: orderId,
                userId: user.id,
                items: cartItems,
                total: total,
                totalAmount: total,
                status: (paymentMethod === 'card_transfer' || paymentMethod === 'crypto') ? 'awaiting_confirmation' : 'pending',
                paymentMethod: paymentMethod,
                paymentProof: (paymentMethod === 'card_transfer' || paymentMethod === 'crypto') ? paymentProof : undefined,
                deliveryType: validation.deliveryType,
                physicalAddress: validation.requiresPhysicalAddress ? physicalAddress : undefined,
                digitalAddress: validation.requiresDigitalAddress ? digitalAddress : undefined,
                shipment: selectedShipping ? {
                    carrier: selectedShipping.carrier,
                    shippingCost: finalShipping,
                    estimatedDelivery: new Date(Date.now() + selectedShipping.estimatedDays * 24 * 60 * 60 * 1000).toISOString()
                } : undefined,
                statusHistory: [{
                    status: (paymentMethod === 'card_transfer' || paymentMethod === 'crypto') ? 'awaiting_confirmation' : 'pending',
                    date: new Date().toISOString()
                }],
                deeds: [],
                createdAt: new Date().toISOString(),
                date: new Date().toISOString()
            };

            console.log('📦 [Checkout] Initializing order...', orderId);

            // 2. Save order to DB (Single save call)
            // Added timeout protection inside dbAdapter.saveOrder
            await dbAdapter.saveOrder(newOrder);
            console.log('✅ [Checkout] DB Order Step finished (or timed out)');

            // 3. 🌟 AGENT 4: Tree Gifting Integration (Run if applicable)
            const heritageItem = cartItems.find(item => item.category === 'نخل میراث' || item.type === 'heritage');
            if (heritageItem) {
                console.log('🌳 [Checkout] Reserving heritage palm...');
                try {
                    const giftingResult = await fetch('/api/create-tree-gift', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: user.id,
                            orderId: orderId,
                            treeVariety: 'مضافتی',
                            recipientName: physicalAddress.recipientName,
                            recipientPhone: physicalAddress.phone,
                            giftMessage: 'کاشت نخل زندگی',
                            amount: total
                        })
                    });
                    const giftingData = await giftingResult.json();
                    if (giftingData.success) {
                        console.log('🌳 [Checkout] Palm reserved successfully');
                    }
                } catch (giftErr) {
                    console.warn('⚠️ [Checkout] Palm reservation failed (Non-critical):', giftErr);
                }
            }

            // Save to localStorage for recovery
            localStorage.setItem('pending_order', JSON.stringify({
                ...newOrder,
                selectedShipping
            }));

            // 4. Handle Final Step based on Payment Method
            if (paymentMethod === 'card_transfer' || paymentMethod === 'crypto') {
                if (!paymentProof) {
                    throw new Error('لطفاً کد رهگیری یا شماره پیگیری تراکنش را وارد کنید.');
                }

                console.log('✅ [Checkout] Manual payment submitted');
                setIsProcessing(false);
                setError(null);

                // Dispatch PLACE_ORDER to update client state and show Success Modal
                dispatch({ type: 'PLACE_ORDER', payload: newOrder });

                // 📱 SEND SMS CONFIRMATION
                const phone = physicalAddress?.phone || digitalAddress?.phone || user?.phone;
                if (phone) {
                    fetch('/api/sms', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            mobile: phone,
                            message: `سفارش ${newOrder.id.slice(0, 8)} ثبت شد (در انتظار تأیید).`
                        })
                    }).catch(err => console.error('SMS Error:', err));
                }

                // Redirect to Home so modal is on a clean background
                dispatch({ type: 'SET_VIEW', payload: View.Home });

                return;
            }

            // Automated Payment (Zarinpal)
            console.log('💳 [Checkout] Requesting payment gateway...');
            const result = await requestPayment(total, description, {
                email: user.email,
                phone: user.phone
            });

            if (result.success && result.url) {
                console.log('🚀 [Checkout] Redirection to:', result.url);
                window.location.href = result.url;
            } else {
                throw new Error(result.error || 'خطا در اتصال به درگاه بانک');
            }
        } catch (err: any) {
            console.error('Payment error:', err);
            setError(err.message || 'خطا در پردازش پرداخت');
            setIsProcessing(false);
        }
    };

    const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price);

    // Step definitions
    const steps = [
        { key: 'address', label: 'آدرس', icon: '📍' },
        ...(validation.requiresPhysicalAddress ? [{ key: 'shipping', label: 'ارسال', icon: '🚚' }] : []),
        { key: 'review', label: 'پرداخت', icon: '💳' }
    ];

    const currentStepIndex = steps.findIndex(s => s.key === currentStep);

    return (
        <div className="min-h-screen bg-[#020617] py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-4">تکمیل سفارش</h1>
                    <p className="text-gray-400">{getDeliveryTypeLabel(validation.deliveryType)}</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-12 overflow-x-auto pb-4">
                    {steps.map((step, idx) => {
                        const isActive = step.key === currentStep;
                        const isPast = idx < currentStepIndex;

                        return (
                            <React.Fragment key={step.key}>
                                <div className={`flex items-center gap-2 whitespace-nowrap ${isActive ? 'text-emerald-400' : isPast ? 'text-emerald-600' : 'text-gray-500'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${isActive ? 'border-emerald-400 bg-emerald-400/20' :
                                        isPast ? 'border-emerald-600 bg-emerald-600' : 'border-gray-600 bg-gray-800'
                                        }`}>
                                        {isPast ? '✓' : step.icon}
                                    </div>
                                    <span className="font-medium hidden sm:inline">{step.label}</span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`w-8 sm:w-16 h-0.5 ${isPast ? 'bg-emerald-600' : 'bg-gray-700'}`}></div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Step: Address */}
                        {currentStep === 'address' && (
                            <>
                                <AddressForm
                                    type={validation.requiresPhysicalAddress && validation.requiresDigitalAddress ? 'both' :
                                        validation.requiresPhysicalAddress ? 'physical' : 'digital'}
                                    initialPhysical={physicalAddress}
                                    initialDigital={digitalAddress}
                                    savedAddresses={user?.addresses || []}
                                    onPhysicalChange={setPhysicalAddress}
                                    onDigitalChange={setDigitalAddress}
                                    errors={error ? [error] : []}
                                />

                                <button
                                    onClick={handleNextFromAddress}
                                    className="w-full py-4 rounded-xl font-bold text-lg transition-all bg-emerald-600 hover:bg-emerald-500 text-white"
                                >
                                    {validation.requiresPhysicalAddress ? 'انتخاب روش ارسال' : 'بررسی و پرداخت'}
                                </button>
                            </>
                        )}

                        {/* Step: Shipping */}
                        {currentStep === 'shipping' && (
                            <>
                                <ShippingMethodSelector
                                    destination={physicalAddress}
                                    weightGrams={estimatedWeight}
                                    onSelect={setSelectedShipping}
                                    selectedCarrier={selectedShipping?.carrier}
                                />

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { setError(null); setCurrentStep('address'); }}
                                        className="flex-1 py-4 rounded-xl font-bold text-lg transition-all border border-white/10 hover:border-white/30 text-white"
                                    >
                                        بازگشت
                                    </button>
                                    <button
                                        onClick={handleNextFromShipping}
                                        className="flex-1 py-4 rounded-xl font-bold text-lg transition-all bg-emerald-600 hover:bg-emerald-500 text-white"
                                    >
                                        بررسی نهایی
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step: Review & Payment */}
                        {currentStep === 'review' && (
                            <>
                                {/* Order Summary */}
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                                        محصولات
                                    </h3>
                                    <div className="space-y-4">
                                        {cartItems.map(item => (
                                            <div key={item.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                                                <div className="w-16 h-16 rounded-xl bg-gray-800 overflow-hidden flex-shrink-0">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <p className="text-white font-medium truncate">{item.name}</p>
                                                    <p className="text-sm text-gray-400">تعداد: {item.quantity}</p>
                                                </div>
                                                <p className="text-emerald-400 font-bold whitespace-nowrap">
                                                    {formatPrice(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery Info */}
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                                        اطلاعات تحویل
                                    </h3>

                                    {validation.requiresPhysicalAddress && (
                                        <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                            <p className="text-sm text-gray-400 mb-1">📦 ارسال پستی به:</p>
                                            <p className="text-white font-medium">{physicalAddress.recipientName} - {physicalAddress.phone}</p>
                                            <p className="text-gray-300 text-sm">{physicalAddress.province}، {physicalAddress.city}، {physicalAddress.fullAddress}</p>
                                            <p className="text-gray-400 text-xs mt-1">کد پستی: {physicalAddress.postalCode}</p>
                                            {selectedShipping && (
                                                <p className="text-emerald-400 text-sm mt-2">
                                                    🚚 {selectedShipping.name} - تحویل ظرف {selectedShipping.estimatedDays} روز کاری
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {validation.requiresDigitalAddress && (
                                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                            <p className="text-sm text-gray-400 mb-1">📄 ارسال سند دیجیتال به:</p>
                                            {digitalAddress.email && <p className="text-white">📧 {digitalAddress.email}</p>}
                                            <p className="text-white">📱 {digitalAddress.phone}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Method */}
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                                        روش پرداخت
                                    </h3>

                                    <div className="space-y-4">
                                        <button
                                            onClick={() => setPaymentMethod('zarinpal')}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === 'zarinpal' ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center text-black font-black text-sm">ZP</div>
                                                <div className="text-right">
                                                    <p className="font-bold text-white">درگاه زرین‌پال</p>
                                                    <p className="text-sm text-gray-400">پشتیبانی از تمام کارت‌های شتاب</p>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'zarinpal' ? 'border-amber-400' : 'border-gray-500'}`}>
                                                {paymentMethod === 'zarinpal' && <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>}
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setPaymentMethod('card_transfer')}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === 'card_transfer' ? 'border-emerald-400 bg-emerald-400/10' : 'border-white/10 bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white">💳</div>
                                                <div className="text-right">
                                                    <p className="font-bold text-white">کارت به کارت</p>
                                                    <p className="text-sm text-gray-400">واریز مستقیم به حساب</p>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card_transfer' ? 'border-emerald-400' : 'border-gray-500'}`}>
                                                {paymentMethod === 'card_transfer' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>}
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setPaymentMethod('crypto')}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === 'crypto' ? 'border-blue-400 bg-blue-400/10' : 'border-white/10 bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xs">USDT</div>
                                                <div className="text-right">
                                                    <p className="font-bold text-white">پرداخت ارزی (تتر)</p>
                                                    <p className="text-sm text-gray-400">شبکه BEP20 (Binance Smart Chain)</p>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'crypto' ? 'border-blue-400' : 'border-gray-500'}`}>
                                                {paymentMethod === 'crypto' && <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>}
                                            </div>
                                        </button>
                                    </div>

                                    {/* Manual Payment Details */}
                                    {paymentMethod === 'card_transfer' && (
                                        <div className="mt-4 p-5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl animate-in fade-in slide-in-from-top-2">
                                            <p className="text-emerald-300 text-sm mb-3 font-bold">لطفاً مبلغ را به کارت زیر واریز نمایید:</p>
                                            <div className="bg-emerald-900/40 p-4 rounded-lg flex items-center justify-between group">
                                                <span className="text-xl font-mono text-white tracking-widest">6219 8618 8499 6025</span>
                                                <button onClick={() => navigator.clipboard.writeText('6219861884996025')} className="text-xs text-emerald-400 hover:text-white underline">کپی</button>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">به نام: سید مهدی حکامیان</p>

                                            <div className="mt-4 space-y-2">
                                                <label className="text-xs text-gray-300">کد رهگیری یا شماره پیگیری تراکنش:</label>
                                                <input
                                                    type="text"
                                                    value={paymentProof}
                                                    onChange={(e) => setPaymentProof(e.target.value)}
                                                    placeholder="مثال: 123456789"
                                                    className="w-full bg-black/40 border border-emerald-500/30 rounded-lg p-3 text-white focus:border-emerald-400 outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'crypto' && (
                                        <div className="mt-4 p-5 bg-blue-950/30 border border-blue-500/30 rounded-xl animate-in fade-in slide-in-from-top-2">
                                            <p className="text-blue-300 text-sm mb-3 font-bold">واریز تتر (USDT) روی شبکه BEP20:</p>
                                            <div className="bg-blue-900/40 p-3 rounded-lg flex items-center justify-between group overflow-hidden">
                                                <span className="text-xs font-mono text-white break-all pr-2">0x2ca84105e9e3f3a91f0385acbd497923d743a342</span>
                                                <button onClick={() => navigator.clipboard.writeText('0x2ca84105e9e3f3a91f0385acbd497923d743a342')} className="text-xs text-blue-400 hover:text-white underline flex-shrink-0">کپی</button>
                                            </div>
                                            <p className="text-xs text-red-400 mt-2 font-bold">هشدار: فقط واریز روی شبکه BEP20 پشتیبانی می‌شود.</p>

                                            <div className="mt-4 space-y-2">
                                                <label className="text-xs text-gray-300">هش تراکنش (TXID):</label>
                                                <input
                                                    type="text"
                                                    value={paymentProof}
                                                    onChange={(e) => setPaymentProof(e.target.value)}
                                                    placeholder="0x..."
                                                    className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-3 text-white focus:border-blue-400 outline-none font-mono text-sm"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Security Notice */}
                                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <LockClosedIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                                    <p className="text-sm text-gray-300">
                                        اطلاعات شما با پروتکل SSL رمزنگاری شده و پرداخت از طریق درگاه امن شاپرک انجام می‌شود.
                                    </p>
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { setError(null); setCurrentStep(validation.requiresPhysicalAddress ? 'shipping' : 'address'); }}
                                        className="flex-1 py-4 rounded-xl font-bold text-lg transition-all border border-white/10 hover:border-white/30 text-white"
                                    >
                                        بازگشت
                                    </button>
                                    <button
                                        onClick={handlePayment}
                                        disabled={isProcessing}
                                        className="flex-1 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                در حال انتقال...
                                            </>
                                        ) : (
                                            <>💳 پرداخت {formatPrice(total)} تومان</>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Sidebar - Order Total */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                                جمع سفارش
                            </h3>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">مجموع کالاها ({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>
                                    <span className="text-white">{formatPrice(subtotal)} تومان</span>
                                </div>

                                {validation.requiresPhysicalAddress && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">هزینه ارسال</span>
                                        {isFreeShipping ? (
                                            <span className="text-emerald-400">رایگان 🎉</span>
                                        ) : shippingCost > 0 ? (
                                            <span className="text-white">{formatPrice(shippingCost)} تومان</span>
                                        ) : (
                                            <span className="text-gray-500">انتخاب کنید</span>
                                        )}
                                    </div>
                                )}

                                <hr className="border-white/10" />

                                <div className="flex justify-between text-lg font-bold">
                                    <span className="text-white">قابل پرداخت</span>
                                    <span className="text-emerald-400">{formatPrice(total)} تومان</span>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <div className="grid grid-cols-2 gap-3 text-center text-xs text-gray-400">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-lg">🔒</span>
                                        <span>پرداخت امن</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-lg">📦</span>
                                        <span>بسته‌بندی اختصاصی</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-lg">🔄</span>
                                        <span>ضمانت بازگشت</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-lg">📞</span>
                                        <span>پشتیبانی ۲۴/۷</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutView;
