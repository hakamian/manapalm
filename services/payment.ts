
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
        return await response.json();
    } catch (error) {
        console.error("Payment Request Failed:", error);
        throw error;
    }
};

export const verifyPayment = async (amount: number, authority: string) => {
    try {
        const response = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'verify',
                amount,
                authority
            })
        });
        return await response.json();
    } catch (error) {
        console.error("Payment Verification Failed:", error);
        throw error;
    }
};
