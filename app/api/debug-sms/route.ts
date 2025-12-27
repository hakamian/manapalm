import { NextResponse } from 'next/server';

// Debug endpoint to test SMS.ir directly
export async function GET(req: Request) {
    const url = new URL(req.url);
    const testMobile = url.searchParams.get('mobile') || '09123456789';

    const apiKey = (process.env.SMS_IR_API_KEY || '').trim();
    const templateId = parseInt((process.env.SMS_IR_TEMPLATE_ID || '0').trim());
    const testCode = '123456';

    const requestBody = {
        mobile: testMobile,
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

        const responseText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = { rawText: responseText };
        }

        return NextResponse.json({
            success: response.ok,
            status: response.status,
            requestSent: {
                ...requestBody,
                apiKeyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : 'MISSING'
            },
            smsIrResponse: responseData,
            debug: {
                templateIdType: typeof templateId,
                templateIdValue: templateId,
                mobileValue: testMobile,
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            requestBody: requestBody
        }, { status: 500 });
    }
}
