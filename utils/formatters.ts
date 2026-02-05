
/**
 * Utility functions for formatting numbers and currencies in Farsi
 */

/**
 * Converts English digits to Farsi digits
 */
export const toFarsiDigits = (num: number | string): string => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
};

/**
 * Formats a number with thousand separators
 */
export const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Formats a price in Toman with thousand separators and Farsi digits
 */
export const formatPrice = (price: number): string => {
    const formatted = formatNumber(price);
    return toFarsiDigits(formatted);
};

/**
 * Formats a price with "تومان" suffix
 */
export const formatPriceWithUnit = (price: number): string => {
    return `${formatPrice(price)} تومان`;
};
