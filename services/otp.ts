interface OTPResponse {
    success: boolean;
    error?: string;
    fullName?: string;
    session?: {
        token: string;
        email: string;
    };
}

export const sendOTP = async (phone: string): Promise<OTPResponse> => {
    try {
        const response = await fetch('/api/otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'send', mobile: phone }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            return {
                success: false,
                error: data.message || 'خطا در ارسال پیامک. لطفا دقایقی دیگر تلاش کنید.'
            };
        }

        return { success: true };
    } catch (err) {
        console.error("OTP send error:", err);
        return { success: false, error: 'خطای ارتباط با سرور. لطفا وضعیت اینترنت خود را بررسی کنید.' };
    }
};

export const verifyOTP = async (phone: string, code: string): Promise<OTPResponse> => {
    try {
        const response = await fetch('/api/otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify', mobile: phone, code }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            return {
                success: false,
                error: data.message || 'کد وارد شده اشتباه است.'
            };
        }

        return {
            success: true,
            fullName: 'کاربر گرامی', // Default until rich profile resolved
            session: data.session // ✅ Forward session data to AuthModal
        };
    } catch (err) {
        console.error("OTP verify error:", err);
        return { success: false, error: 'خطای ارتباط با سرور.' };
    }
};
