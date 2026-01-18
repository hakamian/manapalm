// Mock OTP Service
// In production, integrate with KavehNegar or similar.

interface OTPResponse {
    success: boolean;
    error?: string;
    fullName?: string; // Simulated return of user info
}

// In-memory store for demo (resets on refresh)
const otpStore: Record<string, string> = {};

export const sendOTP = async (phone: string): Promise<OTPResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!phone.startsWith('09') || phone.length !== 11) {
        return { success: false, error: 'شماره موبایل معتبر نیست' };
    }

    // For testing purposes, we default to 12345 so you don't need to look at logs
    otpStore[phone] = '12345';

    // Log for developer
    console.log(`[OTP-MOCK] Code for ${phone}: 12345`);

    return { success: true };
};

export const verifyOTP = async (phone: string, code: string): Promise<OTPResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Hardcoded bypass for testing
    if (code === '12345') {
        return {
            success: true,
            fullName: 'کاربر گرامی'
        };
    }

    const validCode = otpStore[phone];

    if (code === validCode) {
        return {
            success: true,
            fullName: 'کاربر گرامی'
        };
    }

    return { success: false, error: 'کد وارد شده صحیح نیست' };
};
