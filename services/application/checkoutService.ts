/**
 * Checkout Validation Service
 * Validates cart items and determines delivery requirements.
 * 
 * Rules:
 * - Physical products (organic, handicrafts) → REQUIRE physical address
 * - Heritage palms (digital certificate) → REQUIRE digital address (email or phone)
 * - Mixed orders → REQUIRE both (hybrid delivery)
 */

import { CartItem, DeliveryType, PhysicalAddress, DigitalAddress } from '../../types';

export interface CheckoutValidation {
    isValid: boolean;
    deliveryType: DeliveryType;
    requiresPhysicalAddress: boolean;
    requiresDigitalAddress: boolean;
    physicalItems: CartItem[];
    digitalItems: CartItem[];
    errors: string[];
    shippingCost: number;
}

// Categories that require physical shipping
const PHYSICAL_CATEGORIES = [
    'محصولات ارگانیک',
    'محصولات خرما',
    'صنایع دستی',
    'physical'
];

// Categories that are digital certificates/documents
const DIGITAL_CATEGORIES = [
    'نخل میراث',
    'heritage',
    'digital',
    'محصولات دیجیتال',
    'ارتقا',
    'service'
];

/**
 * Calculates shipping cost based on destination and weight
 */
const calculateShippingCost = (items: CartItem[], province: string): number => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // Base cost for Post Pishtaz (within Tehran)
    let baseCost = 45000; // 45,000 Toman

    // Add per-item cost
    const perItemCost = 15000; // 15,000 per additional kg equivalent

    // Province multiplier (farther = more expensive)
    const remoteProvinces = ['سیستان و بلوچستان', 'هرمزگان', 'کرمان', 'خراسان جنوبی'];
    const isRemote = remoteProvinces.includes(province);

    const cost = baseCost + (Math.max(0, totalItems - 1) * perItemCost);
    return isRemote ? cost * 1.5 : cost;
};

/**
 * Main validation function for checkout
 */
export const validateCheckout = (
    cartItems: CartItem[],
    physicalAddress?: PhysicalAddress,
    digitalAddress?: DigitalAddress
): CheckoutValidation => {
    const errors: string[] = [];

    // Separate items by delivery type
    const physicalItems = cartItems.filter(item =>
        PHYSICAL_CATEGORIES.includes(item.category) ||
        (item.type === 'physical' && !DIGITAL_CATEGORIES.includes(item.category))
    );

    const digitalItems = cartItems.filter(item =>
        DIGITAL_CATEGORIES.includes(item.category) ||
        item.type === 'digital' ||
        item.type === 'heritage' ||
        item.type === 'service'
    );

    // Determine delivery type
    let deliveryType: DeliveryType = 'digital';
    if (physicalItems.length > 0 && digitalItems.length > 0) {
        deliveryType = 'hybrid';
    } else if (physicalItems.length > 0) {
        deliveryType = 'physical';
    }

    const requiresPhysicalAddress = physicalItems.length > 0;
    const requiresDigitalAddress = digitalItems.length > 0;

    // Validate physical address
    if (requiresPhysicalAddress) {
        if (!physicalAddress) {
            errors.push('برای ارسال محصولات فیزیکی، آدرس پستی الزامی است.');
        } else {
            if (!physicalAddress.recipientName || physicalAddress.recipientName.length < 3) {
                errors.push('نام گیرنده الزامی است.');
            }
            if (!physicalAddress.phone || !/^(0|\+98)?9\d{9}$/.test(physicalAddress.phone)) {
                errors.push('شماره تماس گیرنده معتبر نیست.');
            }
            if (!physicalAddress.province) {
                errors.push('استان را انتخاب کنید.');
            }
            if (!physicalAddress.city) {
                errors.push('شهر را وارد کنید.');
            }
            if (!physicalAddress.fullAddress || physicalAddress.fullAddress.length < 10) {
                errors.push('آدرس کامل باید حداقل ۱۰ کاراکتر باشد.');
            }
            if (!physicalAddress.postalCode || !/^\d{10}$/.test(physicalAddress.postalCode)) {
                errors.push('کد پستی ۱۰ رقمی معتبر وارد کنید.');
            }
        }
    }

    // Validate digital address
    if (requiresDigitalAddress) {
        if (!digitalAddress) {
            errors.push('برای دریافت سند دیجیتال نخل، آدرس مجازی (ایمیل یا شماره موبایل) الزامی است.');
        } else {
            const hasValidEmail = digitalAddress.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(digitalAddress.email);
            const hasValidPhone = digitalAddress.phone && /^(0|\+98)?9\d{9}$/.test(digitalAddress.phone);

            if (!hasValidEmail && !hasValidPhone) {
                errors.push('حداقل یک ایمیل یا شماره موبایل معتبر برای ارسال سند دیجیتال وارد کنید.');
            }
        }
    }

    // Calculate shipping cost
    const shippingCost = requiresPhysicalAddress && physicalAddress?.province
        ? calculateShippingCost(physicalItems, physicalAddress.province)
        : 0;

    return {
        isValid: errors.length === 0,
        deliveryType,
        requiresPhysicalAddress,
        requiresDigitalAddress,
        physicalItems,
        digitalItems,
        errors,
        shippingCost
    };
};

/**
 * Formats validation errors for display
 */
export const formatValidationErrors = (validation: CheckoutValidation): string => {
    if (validation.isValid) return '';
    return validation.errors.join('\n');
};

/**
 * Gets a human-readable delivery type label
 */
export const getDeliveryTypeLabel = (type: DeliveryType): string => {
    switch (type) {
        case 'physical': return 'ارسال پستی';
        case 'digital': return 'ارسال دیجیتال';
        case 'hybrid': return 'ارسال ترکیبی (پستی + دیجیتال)';
    }
};
