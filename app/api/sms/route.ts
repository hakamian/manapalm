import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    // 🛑 DEBUG: Globally disabled to unblock profile updates
    return NextResponse.json({ success: true, message: 'SMS IS TEMPORARILY DISABLED' });

    try {
        const { mobile, templateId, parameters } = await req.json();

        if (!mobile || !templateId) {
            return NextResponse.json({ message: 'Mobile and TemplateId are required' }, { status: 400 });
        }

        const apiKey = process.env.SMS_IR_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ message: 'SMS API Key not configured on server' }, { status: 500 });
        }

        const response = await fetch('https://api.sms.ir/v1/send/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey.trim(),
            },
            body: JSON.stringify({
                mobile: mobile.trim(),
                templateId: parseInt(templateId.toString().trim()),
                parameters: parameters || [],
            }),
        });

        const result = await response.json();

        if (response.ok) {
            return NextResponse.json(result);
        } else {
            console.error('SMS.ir Error:', result);
            return NextResponse.json({
                message: result.message || 'خطا در ارسال پیامک از سمت پنل',
                error: result
            }, { status: response.status });
        }
    } catch (error: any) {
        console.error('SMS Proxy Error:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
