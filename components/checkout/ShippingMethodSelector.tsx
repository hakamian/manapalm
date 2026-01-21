'use client';

import React, { useState, useEffect } from 'react';
import { PhysicalAddress, ShipmentInfo } from '../../types';
import { getShippingRates, ShippingRate } from '../../services/infrastructure/shippingService';

interface ShippingMethodSelectorProps {
    destination: PhysicalAddress;
    weightGrams?: number;
    onSelect: (rate: ShippingRate) => void;
    selectedCarrier?: ShipmentInfo['carrier'];
}

const ShippingMethodSelector: React.FC<ShippingMethodSelectorProps> = ({
    destination,
    weightGrams = 500,
    onSelect,
    selectedCarrier
}) => {
    const [rates, setRates] = useState<ShippingRate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRates = async () => {
            if (!destination.province) {
                setRates([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            const fetchedRates = await getShippingRates(destination, weightGrams);
            setRates(fetchedRates);
            setLoading(false);

            // Auto-select cheapest option
            if (fetchedRates.length > 0 && !selectedCarrier) {
                const cheapest = fetchedRates.reduce((a, b) => a.price < b.price ? a : b);
                onSelect(cheapest);
            }
        };

        fetchRates();
    }, [destination.province, weightGrams]);

    if (!destination.province) {
        return (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center">
                <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <p className="text-gray-400">ابتدا استان مقصد را انتخاب کنید</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-400">در حال دریافت نرخ‌های حمل...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">روش ارسال</h3>
                    <p className="text-sm text-gray-400">ارسال به {destination.province}، {destination.city || '...'}</p>
                </div>
            </div>

            <div className="space-y-3">
                {rates.map((rate) => {
                    const isSelected = selectedCarrier === rate.carrier;

                    return (
                        <button
                            key={rate.carrier}
                            onClick={() => onSelect(rate)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isSelected
                                    ? 'border-emerald-500 bg-emerald-500/10'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Radio Indicator */}
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-emerald-500' : 'border-gray-500'
                                    }`}>
                                    {isSelected && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                    )}
                                </div>

                                {/* Carrier Info */}
                                <div className="text-right">
                                    <p className={`font-bold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                                        {rate.name}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {rate.estimatedDays === 0
                                            ? 'تحویل همان روز'
                                            : `تحویل ظرف ${rate.estimatedDays} روز کاری`
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="text-left">
                                <p className={`font-bold text-lg ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                                    {rate.price.toLocaleString('fa-IR')}
                                </p>
                                <p className="text-xs text-gray-500">تومان</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Free Shipping Notice */}
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-sm text-emerald-400 text-center">
                    🎁 برای سفارش‌های بالای ۵۰۰ هزار تومان، ارسال رایگان است!
                </p>
            </div>
        </div>
    );
};

export default ShippingMethodSelector;
