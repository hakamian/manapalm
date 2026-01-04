// SMS Management API Route
// Handles sending bulk messages or testing SMS configuration

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { mobile, message, templateId: customTemplateId } = req.body;

        const smsApiKey = process.env.SMS_IR_API_KEY;
        const defaultTemplateId = process.env.SMS_IR_TEMPLATE_ID;
        const templateId = customTemplateId || defaultTemplateId;

        if (!smsApiKey || !templateId) {
            return res.status(500).json({
                success: false,
                message: 'تنظیمات پنل پیامک (API Key یا Template ID) انجام نشده است.'
            });
        }

        if (!mobile) {
            return res.status(400).json({ success: false, message: 'شماره موبایل الزامی است.' });
        }

        // Clean mobile number
        const cleanMobile = mobile.replace(/\D/g, '');

        // Final API call to SMS.ir
        const smsRes = await fetch('https://api.sms.ir/v1/send/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': smsApiKey,
            },
            body: JSON.stringify({
                mobile: cleanMobile,
                templateId: parseInt(templateId),
                parameters: [
                    { name: "CODE", value: message || "تست سیستم" }
                ],
            }),
        });

        const smsData = await smsRes.json();

        if (!smsRes.ok) {
            console.error('❌ SMS.ir Error:', smsData);
            return res.status(smsRes.status).json({
                success: false,
                message: `خطا در ارسال پیامک: ${smsData.message || 'نامشخص'}`,
                debug: smsData
            });
        }

        return res.status(200).json({ success: true, message: 'پیامک با موفقیت ارسال شد.' });

    } catch (error) {
        console.error('❌ SMS API Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
