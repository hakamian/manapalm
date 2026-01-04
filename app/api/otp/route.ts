import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Simple in-memory rate limiting (resets on cold start/serverless invocation)
// For production, consider using Redis/Upstash for persistent rate limiting
const rateLimitStore = new Map<string, { firstRequest: number; count: number }>();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5; // max 5 OTP requests per window

function checkRateLimit(mobile: string) {
    const now = Date.now();
    const key = `otp_${mobile}`;
    const record = rateLimitStore.get(key);

    if (!record || now - record.firstRequest > RATE_LIMIT_WINDOW) {
        // Start new window
        rateLimitStore.set(key, { firstRequest: now, count: 1 });
        return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
    }

    if (record.count >= RATE_LIMIT_MAX) {
        const retryAfter = Math.ceil((RATE_LIMIT_WINDOW - (now - record.firstRequest)) / 1000);
        return { allowed: false, retryAfter };
    }

    record.count++;
    rateLimitStore.set(key, record);
    return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

export async function POST(req: Request) {
    // 🛑 DEBUG: Globally disabled
    return NextResponse.json({ success: true, message: 'OTP_API_DISABLED' });

    try {
        const body = await req.json();
        const { action, mobile, code, password, fullName } = body;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const smsApiKey = process.env.SMS_IR_API_KEY;
        const templateId = process.env.SMS_IR_TEMPLATE_ID;

        // Defensive check
        if (!supabaseUrl || !supabaseServiceKey || !smsApiKey || !templateId) {
            const missingVars = {
                supabaseUrl: !supabaseUrl,
                supabaseServiceKey: !supabaseServiceKey,
                smsApiKey: !smsApiKey,
                templateId: !templateId
            };
            console.error('❌ Missing Environment Variables:', missingVars);
            return NextResponse.json({
                success: false,
                message: 'تنظیمات سرور ناقص است.',
                missing: Object.keys(missingVars).filter(k => (missingVars as any)[k])
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const cleanNumber = (str: string) => {
            const p2e = (s: string) => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
                .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
            return p2e(str).replace(/\D/g, '');
        };

        const finalApiKey = (smsApiKey || '').trim();
        const finalTemplateId = parseInt((templateId || '0').trim());

        // ===== SEND OTP =====
        if (action === 'send') {
            const cleanMobile = cleanNumber(mobile);

            // Check rate limit before processing
            const rateLimit = checkRateLimit(cleanMobile);
            if (!rateLimit.allowed) {
                return NextResponse.json({
                    success: false,
                    message: `تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً ${Math.ceil((rateLimit.retryAfter || 0) / 60)} دقیقه دیگر تلاش کنید.`,
                    retryAfter: rateLimit.retryAfter
                }, { status: 429 });
            }

            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

            const { error: dbError } = await supabase
                .from('otps')
                .upsert({ mobile: cleanMobile, code: otpCode, expires_at: expiresAt }, { onConflict: 'mobile' });

            if (dbError) throw dbError;

            const smsRes = await fetch('https://api.sms.ir/v1/send/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': finalApiKey,
                },
                body: JSON.stringify({
                    mobile: cleanMobile,
                    templateId: finalTemplateId,
                    parameters: [
                        { name: "CODE", value: otpCode },
                        { name: "EXPIRE_TIME", value: "5" }
                    ],
                }),
            });

            const smsData = await smsRes.json();

            if (!smsRes.ok) {
                console.error('❌ SMS.ir Error:', smsData);
                return NextResponse.json({
                    success: false,
                    message: `خطا در ارسال پیامک: ${smsData.message || 'نامشخص'}`,
                    debug: { templateUsed: finalTemplateId, smsResponse: smsData }
                }, { status: smsRes.status });
            }

            console.log(`✅ SMS Sent to ${cleanMobile} using template ${finalTemplateId}`);
            return NextResponse.json({ success: true });
        }

        // ===== VERIFY OTP =====
        if (action === 'verify') {
            const cleanMobile = cleanNumber(mobile);
            const { data, error } = await supabase
                .from('otps')
                .select('*')
                .eq('mobile', cleanMobile)
                .eq('code', code)
                .single();

            if (error || !data) {
                return NextResponse.json({ success: false, message: 'کد وارد شده اشتباه است' }, { status: 400 });
            }

            if (new Date(data.expires_at) < new Date()) {
                return NextResponse.json({ success: false, message: 'کد منقضی شده است' }, { status: 400 });
            }

            return NextResponse.json({ success: true });
        }

        // ===== SET PASSWORD =====
        if (action === 'set-password') {
            const cleanMobile = cleanNumber(mobile);
            const verifyCode = code;

            // Verify OTP one last time
            const { data: otpData, error: otpError } = await supabase
                .from('otps')
                .select('*')
                .eq('mobile', cleanMobile)
                .eq('code', verifyCode)
                .single();

            if (otpError || !otpData) {
                return NextResponse.json({ success: false, message: 'کد نامعتبر است. مجدداً تلاش کنید.' }, { status: 400 });
            }

            // E.164 format for Supabase
            const e164Mobile = '+98' + cleanMobile.substring(1);

            // Check if user exists
            const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
            if (listError) throw listError;

            const users = (listData?.users || []);
            const existingAuthUser = users.find(u => u.phone === e164Mobile || u.email === cleanMobile + "@mana.com");

            const finalMetadata = { full_name: fullName || cleanMobile };
            const virtualEmail = `${cleanMobile}@manapalm.com`;

            if (existingAuthUser) {
                // Update password AND ensure virtual email is set
                const { error: updateError } = await supabase.auth.admin.updateUserById(
                    existingAuthUser.id,
                    {
                        email: virtualEmail,
                        email_confirm: true,
                        password: password,
                        user_metadata: { ...existingAuthUser.user_metadata, ...finalMetadata }
                    }
                );
                if (updateError) throw updateError;
            } else {
                // Create user with virtual email
                const { error: createError } = await supabase.auth.admin.createUser({
                    email: virtualEmail,
                    email_confirm: true,
                    phone: e164Mobile,
                    password: password,
                    phone_confirm: true,
                    user_metadata: finalMetadata
                });
                if (createError) throw createError;
            }

            // Cleanup OTP
            await supabase.from('otps').delete().eq('mobile', cleanMobile);

            return NextResponse.json({ success: true, message: 'رمز عبور با موفقیت تنظیم شد.' });
        }

        return NextResponse.json({ message: 'Action not valid' }, { status: 400 });
    } catch (error: any) {
        console.error('OTP Error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'خطای سرور',
            error: error.message
        }, { status: 500 });
    }
}
