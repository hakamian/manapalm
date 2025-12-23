import { NextResponse } from 'next/server';

export async function POST(req: Request) {
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
                'x-api-key': apiKey,
            },
            body: JSON.stringify({
                mobile,
                templateId: parseInt(templateId),
                parameters: parameters || [],
            }),
        });

        const result = await response.json();

        if (response.ok) {
            return NextResponse.json(result);
        } else {
            console.error('SMS.ir Error:', result);
            return NextResponse.json({
                message: 'Failed to send SMS',
                error: result
            }, { status: response.status });
        }
    } catch (error: any) {
        console.error('SMS Proxy Error:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
