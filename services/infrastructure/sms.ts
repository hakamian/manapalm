
/**
 * SMS Infrastructure for ManaPalm
 */
export const smsService = {
    sendVerificationCode: async (mobile: string, templateId: number, code: string) => {
        try {
            const response = await fetch('/api/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mobile,
                    templateId,
                    parameters: [{ name: "Code", value: code }]
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'خطا در ارسال پیامک');
            return data;
        } catch (error: any) {
            console.error('SMS Service Error:', error.message);
            throw error;
        }
    },
    sendTemplateSms: async (mobile: string, templateId: number, parameters: { name: string, value: string }[]) => {
        try {
            const response = await fetch('/api/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, templateId, parameters }),
            });
            return await response.json();
        } catch (error) {
            console.error('SMS Service Error:', error);
            throw error;
        }
    }
};
