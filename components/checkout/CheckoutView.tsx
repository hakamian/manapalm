'use client';

import React, { useState, useMemo } from 'react';
import { useAppState, useAppDispatch } from '../../AppContext';
import { PhysicalAddress, DigitalAddress, DeliveryType } from '../../types';
import { validateCheckout, getDeliveryTypeLabel } from '../../services/application/checkoutService';
import { ShippingRate, estimateWeight } from '../../services/infrastructure/shippingService';
import AddressForm from './AddressForm';
import ShippingMethodSelector from './ShippingMethodSelector';

interface CheckoutViewProps {
    onComplete?: (orderId: string) => void;
    onCancel?: () => void;
}

const CheckoutView: React.FC<CheckoutViewProps> = ({ onComplete, onCancel }) => {
    const { cartItems, user } = useAppState();
    const dispatch = useAppDispatch();

    // Address State
    const [physicalAddress, setPhysicalAddress] = useState<PhysicalAddress>(
        user?.addresses?.[0] || {
            recipientName: user?.fullName || '',
            phone: user?.phone || '',
            province: '',
            city: '',
            fullAddress: '',
            postalCode: ''
        }
    );

    const [digitalAddress, setDigitalAddress] = useState<DigitalAddress>({
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const [selectedShipping, setSelectedShipping] = useState<ShippingRate | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState<'address' | 'shipping' | 'review'>('address');

    // Validation
    const validation = useMemo(() => {
        return validateCheckout(cartItems, physicalAddress, digitalAddress);
    }, [cartItems, physicalAddress, digitalAddress]);

    // Totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = selectedShipping?.price || 0;
    const isFreeShipping = subtotal >= 500000;
    const finalShipping = isFreeShipping ? 0 : shippingCost;
    const total = subtotal + finalShipping;

    // Weight estimation
    const estimatedWeight = useMemo(() => {
        return estimateWeight(validation.physicalItems.map(i => ({
            category: i.category,
            quantity: i.quantity
        })));
    }, [validation.physicalItems]);

    // Step Navigation
    const canProceedToShipping = validation.requiresPhysicalAddress
        ? (physicalAddress.recipientName && physicalAddress.phone && physicalAddress.province && physicalAddress.city && physicalAddress.fullAddress && physicalAddress.postalCode)
        : true;

    const canProceedToReview = validation.requiresPhysicalAddress
        ? !!selectedShipping
        : true;

    const handleProceedToPayment = async () => {
        if (!validation.isValid) return;

        setIsProcessing(true);

        // In production, this would:
        // 1. Create order in DB
        // 2. Redirect to payment gateway
        // 3. On success, create shipment

        // For now, simulate success
        setTimeout(() => {
            const orderId = `order-${Date.now()}`;
            onComplete?.(orderId);
            setIsProcessing(false);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#020617] py-24 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-4">تکمیل سفارش</h1>
                    <p className="text-gray-400">
                        {getDeliveryTypeLabel(validation.deliveryType)}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    {['آدرس', 'ارسال', 'نهایی'].map((step, idx) => {
                        const stepKey = ['address', 'shipping', 'review'][idx];
                        const isActive = currentStep === stepKey;
                        const isPast = (currentStep === 'shipping' && idx === 0) || (currentStep === 'review' && idx < 2);

                        return (
                            <React.Fragment key={step}>
                                <div className={`flex items-center gap-2 ${isActive ? 'text-emerald-400' : isPast ? 'text-emerald-600' : 'text-gray-500'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${isActive ? 'border-emerald-400 bg-emerald-400/20' :
                                            isPast ? 'border-emerald-600 bg-emerald-600' : 'border-gray-600'
                                        }`}>
                                        {isPast ? '✓' : idx + 1}
                                    </div>
                                    <span className="font-medium hidden sm:inline">{step}</span>
                                </div>
                                {idx < 2 && (
                                    <div className={`w-12 h-0.5 ${isPast ? 'bg-emerald-600' : 'bg-gray-700'}`}></div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Step 1: Address */}
                        {currentStep === 'address' && (
                            <>
                                <AddressForm
                                    type={validation.requiresPhysicalAddress && validation.requiresDigitalAddress ? 'both' :
                                        validation.requiresPhysicalAddress ? 'physical' : 'digital'}
                                    initialPhysical={physicalAddress}
                                    initialDigital={digitalAddress}
                                    onPhysicalChange={setPhysicalAddress}
                                    onDigitalChange={setDigitalAddress}
                                    errors={[]}
                                />

                                <button
                                    onClick={() => validation.requiresPhysicalAddress ? setCurrentStep('shipping') : setCurrentStep('review')}
                                    disabled={!canProceedToShipping}
                                    className="w-full py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 text-white"
                                >
                                    {validation.requiresPhysicalAddress ? 'انتخاب روش ارسال' : 'بررسی نهایی'}
                                </button>
                            </>
                        )}

                        {/* Step 2: Shipping */}
                        {currentStep === 'shipping' && (
                            <>
                                <ShippingMethodSelector
                                    destination={physicalAddress}
                                    weightGrams={estimatedWeight}
                                    onSelect={setSelectedShipping}
                                    selectedCarrier={selectedShipping?.carrier}
                                />

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setCurrentStep('address')}
                                        className="flex-1 py-4 rounded-xl font-bold text-lg transition-all border border-white/10 hover:border-white/30 text-white"
                                    >
                                        بازگشت
                                    </button>
                                    <button
                                        onClick={() => setCurrentStep('review')}
                                        disabled={!canProceedToReview}
                                        className="flex-1 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 bg-emerald-600 hover:bg-emerald-500 text-white"
                                    >
                                        بررسی نهایی
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 3: Review */}
                        {currentStep === 'review' && (
                            <>
                                {/* Order Summary */}
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">خلاصه سفارش</h3>
                                    <div className="space-y-4">
                                        {cartItems.map(item => (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-xl bg-gray-800 overflow-hidden">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="text-white font-medium">{item.name}</p>
                                                    <p className="text-sm text-gray-400">تعداد: {item.quantity}</p>
                                                </div>
                                                <p className="text-emerald-400 font-bold">
                                                    {(item.price * item.quantity).toLocaleString('fa-IR')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery Info */}
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">اطلاعات تحویل</h3>

                                    {validation.requiresPhysicalAddress && (
                                        <div className="mb-4 p-4 bg-emerald-500/10 rounded-xl">
                                            <p className="text-sm text-gray-400 mb-1">ارسال پستی به:</p>
                                            <p className="text-white">{physicalAddress.recipientName} - {physicalAddress.phone}</p>
                                            <p className="text-gray-300 text-sm">{physicalAddress.province}، {physicalAddress.city}، {physicalAddress.fullAddress}</p>
                                            {selectedShipping && (
                                                <p className="text-emerald-400 text-sm mt-2">
                                                    روش ارسال: {selectedShipping.name} ({selectedShipping.estimatedDays} روز کاری)
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {validation.requiresDigitalAddress && (
                                        <div className="p-4 bg-blue-500/10 rounded-xl">
                                            <p className="text-sm text-gray-400 mb-1">ارسال سند دیجیتال به:</p>
                                            {digitalAddress.email && <p className="text-white">📧 {digitalAddress.email}</p>}
                                            <p className="text-white">📱 {digitalAddress.phone}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Validation Errors */}
                                {!validation.isValid && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                        <ul className="text-red-400 text-sm space-y-1">
                                            {validation.errors.map((err, i) => <li key={i}>• {err}</li>)}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setCurrentStep(validation.requiresPhysicalAddress ? 'shipping' : 'address')}
                                        className="flex-1 py-4 rounded-xl font-bold text-lg transition-all border border-white/10 hover:border-white/30 text-white"
                                    >
                                        بازگشت
                                    </button>
                                    <button
                                        onClick={handleProceedToPayment}
                                        disabled={!validation.isValid || isProcessing}
                                        className="flex-1 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                در حال پردازش...
                                            </>
                                        ) : (
                                            <>پرداخت و ثبت سفارش</>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Sidebar - Order Total */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-white mb-6">جمع سفارش</h3>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">مجموع کالاها ({cartItems.length})</span>
                                    <span className="text-white">{subtotal.toLocaleString('fa-IR')} تومان</span>
                                </div>

                                {validation.requiresPhysicalAddress && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">هزینه ارسال</span>
                                        {isFreeShipping ? (
                                            <span className="text-emerald-400">رایگان 🎉</span>
                                        ) : shippingCost > 0 ? (
                                            <span className="text-white">{shippingCost.toLocaleString('fa-IR')} تومان</span>
                                        ) : (
                                            <span className="text-gray-500">انتخاب کنید</span>
                                        )}
                                    </div>
                                )}

                                <hr className="border-white/10" />

                                <div className="flex justify-between text-lg font-bold">
                                    <span className="text-white">قابل پرداخت</span>
                                    <span className="text-emerald-400">{total.toLocaleString('fa-IR')} تومان</span>
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
