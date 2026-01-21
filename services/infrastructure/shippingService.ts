/**
 * Shipping Service - Iran Post Integration
 * Handles shipment creation, tracking, and delivery management.
 * 
 * Supports:
 * - Post (پست پیشتاز)
 * - Tipax (تیپاکس)
 * - Chapar (چاپار)
 * - Peyk (پیک موتوری - فقط تهران)
 */

import { PhysicalAddress, ShipmentInfo, Order } from '../../types';

export interface ShippingRate {
    carrier: ShipmentInfo['carrier'];
    name: string;
    price: number;
    estimatedDays: number;
    logo?: string;
}

export interface ShipmentRequest {
    orderId: string;
    senderName: string;
    senderPhone: string;
    senderAddress: string;
    recipient: PhysicalAddress;
    weight: number; // in grams
    contents: string;
    value: number; // for insurance
}

export interface ShipmentResponse {
    success: boolean;
    trackingCode?: string;
    barcode?: string;
    estimatedDelivery?: string;
    printableLabel?: string; // URL to PDF label
    error?: string;
}

// Iran Provinces for validation and rate calculation
export const IRAN_PROVINCES = [
    'تهران', 'اصفهان', 'فارس', 'خراسان رضوی', 'آذربایجان شرقی',
    'آذربایجان غربی', 'خوزستان', 'کرمان', 'گیلان', 'مازندران',
    'البرز', 'قم', 'مرکزی', 'گلستان', 'اردبیل', 'کرمانشاه',
    'همدان', 'لرستان', 'سیستان و بلوچستان', 'کردستان', 'یزد',
    'هرمزگان', 'قزوین', 'زنجان', 'سمنان', 'چهارمحال و بختیاری',
    'خراسان شمالی', 'خراسان جنوبی', 'بوشهر', 'ایلام', 'کهگیلویه و بویراحمد'
];

// Manapalm HQ Address (South Iran)
const SENDER_INFO = {
    name: 'نخلستان معنا',
    phone: '09120000000',
    address: 'بوشهر، دشتستان، نخلستان مرکزی',
    postalCode: '7541111111'
};

/**
 * Calculate shipping rates for all carriers
 */
export const getShippingRates = async (
    destination: PhysicalAddress,
    weightGrams: number = 500
): Promise<ShippingRate[]> => {
    const isInTehran = destination.province === 'تهران';
    const isRemote = ['سیستان و بلوچستان', 'هرمزگان', 'کرمان', 'خراسان جنوبی', 'بوشهر']
        .includes(destination.province);

    const rates: ShippingRate[] = [
        {
            carrier: 'post',
            name: 'پست پیشتاز',
            price: isRemote ? 85000 : 55000,
            estimatedDays: isRemote ? 5 : 3,
            logo: '/icons/post-iran.svg'
        },
        {
            carrier: 'tipax',
            name: 'تیپاکس',
            price: isRemote ? 120000 : 75000,
            estimatedDays: isRemote ? 3 : 2,
            logo: '/icons/tipax.svg'
        },
        {
            carrier: 'chapar',
            name: 'چاپار',
            price: isRemote ? 95000 : 65000,
            estimatedDays: isRemote ? 4 : 2,
            logo: '/icons/chapar.svg'
        }
    ];

    // Add Peyk option only for Tehran
    if (isInTehran) {
        rates.unshift({
            carrier: 'peyk',
            name: 'پیک موتوری (تحویل امروز)',
            price: 45000,
            estimatedDays: 0,
            logo: '/icons/peyk.svg'
        });
    }

    // Add weight-based pricing (per 500g over first 500g)
    const extraWeightUnits = Math.ceil(Math.max(0, weightGrams - 500) / 500);
    return rates.map(rate => ({
        ...rate,
        price: rate.price + (extraWeightUnits * 10000)
    }));
};

/**
 * Create a shipment with the selected carrier
 * In production, this would call the actual carrier APIs
 */
export const createShipment = async (
    request: ShipmentRequest,
    carrier: ShipmentInfo['carrier']
): Promise<ShipmentResponse> => {
    console.log(`📦 [Shipping] Creating shipment with ${carrier}:`, request.orderId);

    // In production, integrate with actual APIs:
    // - Post: https://api.post.ir
    // - Tipax: https://api.tipaxco.com
    // - Chapar: https://api.chapar.co

    // For now, simulate successful creation
    const trackingCode = `MP${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const estimatedDays = carrier === 'peyk' ? 0 : carrier === 'tipax' ? 2 : 3;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDays);

    return {
        success: true,
        trackingCode,
        barcode: trackingCode,
        estimatedDelivery: estimatedDelivery.toISOString(),
        printableLabel: `/api/shipping/label/${trackingCode}`
    };
};

/**
 * Track a shipment by tracking code
 */
export const trackShipment = async (trackingCode: string): Promise<{
    status: string;
    lastUpdate: string;
    events: { date: string; location: string; description: string }[];
}> => {
    console.log(`📦 [Shipping] Tracking shipment:`, trackingCode);

    // In production, call carrier tracking APIs
    // For now, return mock data
    return {
        status: 'در حال ارسال',
        lastUpdate: new Date().toISOString(),
        events: [
            {
                date: new Date().toISOString(),
                location: 'بوشهر - مرکز پردازش',
                description: 'بسته از مبدا ارسال شد'
            }
        ]
    };
};

/**
 * Calculate estimated item weight based on product type
 */
export const estimateWeight = (items: { category: string; quantity: number }[]): number => {
    let totalGrams = 0;

    for (const item of items) {
        let itemWeight = 200; // Default 200g

        if (item.category === 'محصولات ارگانیک' || item.category === 'محصولات خرما') {
            itemWeight = 600; // ~600g for date packages
        } else if (item.category === 'صنایع دستی') {
            itemWeight = 400; // ~400g for handicrafts
        }

        totalGrams += itemWeight * item.quantity;
    }

    return totalGrams;
};

/**
 * Update order with shipment information
 */
export const attachShipmentToOrder = (
    order: Order,
    shipment: ShipmentResponse,
    carrier: ShipmentInfo['carrier'],
    shippingCost: number
): Order => {
    return {
        ...order,
        shipment: {
            trackingCode: shipment.trackingCode,
            carrier,
            estimatedDelivery: shipment.estimatedDelivery,
            shippedAt: new Date().toISOString(),
            shippingCost
        },
        status: 'shipped' as any,
        statusHistory: [
            ...(order.statusHistory || []),
            { status: 'shipped' as any, date: new Date().toISOString() }
        ]
    };
};
