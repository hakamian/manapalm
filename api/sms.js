export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { mobile, templateId, parameters } = req.body;
    const API_KEY = process.env.SMS_IR_API_KEY;

    if (!API_KEY) {
        console.error('SMS_IR_API_KEY is missing');
        // In dev/mock, don't crash, just log.
        return res.status(200).json({ success: true, message: 'Mock SMS Sent (No API Key)' });
    }

    try {
        const response = await fetch('https://api.sms.ir/v1/send/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY.trim(),
            },
            body: JSON.stringify({
                mobile: mobile,
                templateId: parseInt(templateId),
                parameters: parameters,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('SMS Provider Error:', data);
            throw new Error(data.message || 'خطا در پنل پیامک');
        }

        return res.status(200).json({ success: true, data });

    } catch (error) {
        console.error('SMS API Error:', error);
        return res.status(500).json({ message: error.message || 'خطا در ارسال پیامک (Legacy)' });
    }
}
