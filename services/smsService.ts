
/**
 * SMS Service for ManaPalm
 * Connects to the secure /api/sms proxy to send messages via sms.ir
 */

export const smsService = {
    /**
     * Sends a verification code using a predefined template in sms.ir
     * @param mobile String - The recipient's mobile number (e.g., "09121234567")
     * @param templateId Number - The template ID from sms.ir panel
     * @param code String - The code to be sent (replaces the first parameter in your template)
     */
    sendVerificationCode: async (mobile: string, templateId: number, code: string) => {
        try {
            const response = await fetch('/api/sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mobile,
                    templateId,
                    parameters: [
                        {
                            name: "Code", // Adjust parameter name based on your sms.ir template
                            value: code
                        }
                    ]
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'خطا در ارسال پیامک');
            }
            return data;
        } catch (error: any) {
            console.error('SMS Service Error:', error.message);
            throw error;
        }
    },

    /**
     * Generic method to send template-based SMS
     */
    sendTemplateSms: async (mobile: string, templateId: number, parameters: { name: string, value: string }[]) => {
        try {
            const response = await fetch('/api/sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mobile,
                    templateId,
                    parameters
                }),
            });

            return await response.json();
        } catch (error) {
            console.error('SMS Service Error:', error);
            throw error;
        }
    }
};
