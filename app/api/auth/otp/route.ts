
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const smsApiKey = process.env.SMS_IR_API_KEY;
        const templateId = process.env.SMS_IR_TEMPLATE_ID;

        // Defensive check to prevent server crash (HTML response)
        if (!supabaseUrl || !supabaseServiceKey || !smsApiKey || !templateId) {
            console.error('❌ Missing Environment Variables:', {
                supabaseUrl: !!supabaseUrl,
                supabaseServiceKey: !!supabaseServiceKey,
                smsApiKey: !!smsApiKey,
                templateId: !!templateId
            });
            return NextResponse.json({
                success: false,
                message: 'تنظیمات سرور (Environment Variables) ناقص است. لطفاً فایل .env را چک کنید.'
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { action, mobile, code } = await req.json();

        if (action === 'send') {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

            const { error: dbError } = await supabase
                .from('otps')
                .upsert({ mobile, code: otpCode, expires_at: expiresAt }, { onConflict: 'mobile' });

            if (dbError) throw dbError;

            const smsApiKey = process.env.SMS_IR_API_KEY;
            const templateId = process.env.SMS_IR_TEMPLATE_ID;

            const smsRes = await fetch('https://api.sms.ir/v1/send/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': smsApiKey!,
                },
                body: JSON.stringify({
                    mobile,
                    templateId: parseInt(templateId!),
                    parameters: [
                        { name: "CODE", value: otpCode },
                        { name: "EXPIRE_TIME", value: "5" }
                    ],
                }),
            });

            const smsData = await smsRes.json();

            if (!smsRes.ok) {
                console.error('❌ SMS.ir API Error:', smsData);

                try {
                    const fs = await import('fs');
                    const logPath = './sms_debug.log';
                    const logMsg = `\n[${new Date().toISOString()}] SMS Error: ${JSON.stringify(smsData)}`;
                    fs.appendFileSync(logPath, logMsg);
                } catch (e) {
                    console.error('Failed to write to log file:', e);
                }

                return NextResponse.json({
                    success: false,
                    message: `خطا از سمت پنل پیامک: ${smsData.message || 'نامشخص'}`
                }, { status: smsRes.status });
            }

            console.log('✅ SMS Sent Successfully:', smsData);
            return NextResponse.json({ success: true });
        }

        if (action === 'verify') {
            const { data, error } = await supabase
                .from('otps')
                .select('*')
                .eq('mobile', mobile)
                .eq('code', code)
                .single();

            if (error || !data) {
                return NextResponse.json({ success: false, message: 'کد وارد شده اشتباه است' }, { status: 400 });
            }

            if (new Date(data.expires_at) < new Date()) {
                return NextResponse.json({ success: false, message: 'کد منقضی شده است' }, { status: 400 });
            }

            await supabase.from('otps').delete().eq('mobile', mobile);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ message: 'Action not valid' }, { status: 400 });
    } catch (error: any) {
        console.error('OTP Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
