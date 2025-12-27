import { NextResponse } from 'next/server';

// Temporary debug endpoint - REMOVE AFTER DEBUGGING
export async function GET() {
    const envVars = {
        SMS_IR_API_KEY: process.env.SMS_IR_API_KEY
            ? `${process.env.SMS_IR_API_KEY.substring(0, 5)}...${process.env.SMS_IR_API_KEY.slice(-5)} (length: ${process.env.SMS_IR_API_KEY.length})`
            : 'NOT SET',
        SMS_IR_TEMPLATE_ID: process.env.SMS_IR_TEMPLATE_ID || 'NOT SET',
        SMS_IR_TEMPLATE_ID_TYPE: typeof process.env.SMS_IR_TEMPLATE_ID,
        SMS_IR_TEMPLATE_ID_LENGTH: process.env.SMS_IR_TEMPLATE_ID?.length || 0,
        SMS_IR_TEMPLATE_ID_PARSED: process.env.SMS_IR_TEMPLATE_ID ? parseInt(process.env.SMS_IR_TEMPLATE_ID.trim()) : 'N/A',
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (hidden)' : 'NOT SET',
    };

    return NextResponse.json({
        message: 'Environment Variables Debug',
        timestamp: new Date().toISOString(),
        vars: envVars
    });
}
