// Debug SMS endpoint - Vercel serverless function
export default async function handler(req, res) {
    // Allow both GET and POST
    const mobile = req.query.mobile || req.body?.mobile || '09123456789';

    const apiKey = (process.env.SMS_IR_API_KEY || '').trim();
    const templateId = parseInt((process.env.SMS_IR_TEMPLATE_ID || '0').trim());
    const testCode = '123456';

    const requestBody = {
        mobile: mobile,
        templateId: templateId,
        parameters: [
            { name: "CODE", value: testCode },
            { name: "EXPIRE_TIME", value: "5" }
        ]
    };

    console.log('📤 Sending to SMS.ir:', JSON.stringify(requestBody, null, 2));

    try {
        const response = await fetch('https://api.sms.ir/v1/send/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey,
            },
            body: JSON.stringify(requestBody),
        });

        const responseData = await response.json();

        return res.status(200).json({
            success: response.ok,
            httpStatus: response.status,
            requestSent: {
                ...requestBody,
                apiKeyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : 'MISSING'
            },
            smsIrResponse: responseData,
            debug: {
                templateIdType: typeof templateId,
                templateIdValue: templateId,
                mobileValue: mobile,
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            requestBody: requestBody
        });
    }
}
