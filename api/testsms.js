// Test SMS.ir directly - No caching issues
export default async function handler(req, res) {
    const mobile = req.query.m || '09123456789';

    const apiKey = (process.env.SMS_IR_API_KEY || '').trim();
    const templateId = parseInt((process.env.SMS_IR_TEMPLATE_ID || '0').trim());
    const testCode = '999888';

    const requestBody = {
        mobile: mobile,
        templateId: templateId,
        parameters: [
            { name: "CODE", value: testCode },
            { name: "EXPIRE_TIME", value: "5" }
        ]
    };

    try {
        const response = await fetch('https://api.sms.ir/v1/send/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey,
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        return res.status(200).json({
            ok: response.ok,
            code: response.status,
            sent: { mobile, templateId, apiKeyOk: !!apiKey },
            result: data
        });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}
