
/**
 * Payment Infrastructure for ManaPalm
 */
export const requestPayment = async (amount: number, description: string, user: { email?: string, phone?: string }) => {
    try {
        const response = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'request',
                amount,
                description,
                email: user.email,
                mobile: user.phone
            })
        });
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Payment request failed:", error);
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