import { NextResponse } from 'next/server';

/**
 * DEPRECATED: This endpoint has been moved to /api/otp.js (Vercel Serverless Function)
 * This redirect is kept for backward compatibility.
 * 
 * The Next.js App Router had issues with SMS.ir API in production,
 * while Vercel Serverless Functions work correctly.
 */
export async function POST(req: Request) {
    // Forward the request to the working endpoint
    const body = await req.json();

    const origin = req.headers.get('origin') || req.headers.get('host') || '';
    const protocol = origin.includes('localhost') ? 'http' : 'https';
    const baseUrl = origin.includes('://') ? origin : `${protocol}://${origin}`;

    try {
        const response = await fetch(`${baseUrl}/api/otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Redirect to /api/otp failed:', error);
        return NextResponse.json({
            success: false,
            message: 'خطای سرور - لطفاً دوباره تلاش کنید',
            error: error.message
        }, { status: 500 });
    }
}
