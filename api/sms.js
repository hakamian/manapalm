
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { mobile, templateId, parameters } = req.body;

    if (!mobile || !templateId) {
        return res.status(400).json({ message: 'Mobile and TemplateId are required' });
    }

    // Use the API Key from environment variables for security
    const apiKey = process.env.SMS_IR_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ message: 'SMS API Key not configured on server' });
    }

    try {
        const response = await fetch('https://api.sms.ir/v1/send/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
            },
            body: JSON.stringify({
                mobile,
                templateId,
                parameters: parameters || [],
            }),
        });

        const result = await response.json();

        if (response.ok) {
            return res.status(200).json(result);
        } else {
            console.error('SMS.ir Error:', result);
            return res.status(response.status).json({
                message: 'Failed to send SMS',
                error: result
            });
        }
    } catch (error) {
        console.error('SMS Proxy Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
