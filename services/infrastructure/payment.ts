
/**
 * Payment Infrastructure for ManaPalm
 */
export const requestPayment = async (amount: number, description: string, user: { email?: string, phone?: string }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
        const response = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                action: 'request',
                amount,
                description,
                email: user.email,
                mobile: user.phone
            })
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error: any) {
        clearTimeout(timeoutId);
        console.error("Payment request failed:", error);
        if (error.name === 'AbortError') {
            return { success: false, error: "زمان درخواست به پایان رسید. لطفاً اتصال اینترنت خود را بررسی کنید." };
        }
        return { success: false, error: "خطا در اتصال به درگاه پرداخت. لطفا دوباره تلاش کنید." };
    }
};

export const verifyPayment = async (amount: number, authority: string) => {
    try {
        const response = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify', amount, authority })
        });
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Payment verification failed:", error);
        return {
            success: false,
            message: 'خطا در تایید تراکنش. اگر مبلغی از حساب شما کسر شده، به زودی بازگشت داده خواهد شد.'
        };
    }
};