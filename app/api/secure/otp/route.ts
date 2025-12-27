
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service key usually doesn't have VITE_ prefix as it's secret
        const smsApiKey = process.env.SMS_IR_API_KEY;
        const templateId = process.env.SMS_IR_TEMPLATE_ID;

        // Defensive check to prevent server crash (HTML response)
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
                message: 'تنظیمات سرور (Environment Variables) ناقص است. لطفاً فایل .env را چک کنید.',
                missing: Object.keys(missingVars).filter(k => (missingVars as any)[k])
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const jsonBody = await req.json();
        const { action, mobile, code } = jsonBody;

        const cleanNumber = (str: string) => {
            const p2e = (s: string) => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
                .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
            return p2e(str).replace(/\D/g, '');
        };

        const finalApiKey = (process.env.SMS_IR_API_KEY || '').trim();
        const rawTemplateId = (process.env.SMS_IR_TEMPLATE_ID || '').trim();
        const finalTemplateId = parseInt(cleanNumber(rawTemplateId));

        // Enhanced validation for templateId
        if (!rawTemplateId || isNaN(finalTemplateId) || finalTemplateId <= 0) {
            console.error('❌ Invalid Template ID:', { raw: rawTemplateId, parsed: finalTemplateId });
            return NextResponse.json({
                success: false,
                message: `خطا: شناسه قالب پیامک (SMS_IR_TEMPLATE_ID) معتبر نیست. مقدار فعلی: "${rawTemplateId}"`,
                debug: { rawTemplateId, finalTemplateId, isNaN: isNaN(finalTemplateId) }
            }, { status: 500 });
        }

        if (action === 'send') {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

            const { error: dbError } = await supabase
                .from('otps')
                .upsert({ mobile: cleanNumber(mobile), code: otpCode, expires_at: expiresAt }, { onConflict: 'mobile' });

            if (dbError) throw dbError;

            const smsRes = await fetch('https://api.sms.ir/v1/send/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': finalApiKey,
                },
                body: JSON.stringify({
                    mobile: cleanNumber(mobile),
                    templateId: finalTemplateId,
                    parameters: [
                        { name: "CODE", value: otpCode },
                        { name: "EXPIRE_TIME", value: "5" }
                    ],
                }),
            });

            const smsData = await smsRes.json();

            if (!smsRes.ok) {
                console.error(`❌ SMS.ir API Error (Template: ${templateId}):`, smsData);

                try {
                    const fs = await import('fs');
                    const logPath = './sms_debug.log';
                    const maskedKey = smsApiKey ? `${smsApiKey.substring(0, 5)}...${smsApiKey.slice(-5)}` : 'MISSING';
                    const logMsg = `\n[${new Date().toISOString()}] SMS Error: Template=${templateId}, Key=${maskedKey}, Response=${JSON.stringify(smsData)}`;
                    fs.appendFileSync(logPath, logMsg);
                } catch (e) {
                    console.error('Failed to write to log file:', e);
                }

                return NextResponse.json({
                    success: false,
                    message: `خطا در ارسال پیامک: ${smsData.message || 'نامشخص'}`,
                    debug: {
                        status: smsData.status,
                        message: smsData.message,
                        templateUsed: finalTemplateId,
                        templateType: typeof Number(finalTemplateId)
                    }
                }, { status: smsRes.status });
            }

            console.log(`✅ SMS Sent Successfully to ${mobile} using template ${finalTemplateId}`);
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

            // We don't delete yet, because Step 3 might want to set a password using this same code
            // But we should return success
            return NextResponse.json({ success: true });
        }

        if (action === 'set-password') {
            const { password, fullName } = jsonBody;
            const verifyCode = code;

            // 1. Double check the OTP one last time for security
            const { data: otpData, error: otpError } = await supabase
                .from('otps')
                .select('*')
                .eq('mobile', mobile)
                .eq('code', verifyCode)
                .single();

            if (otpError || !otpData) {
                return NextResponse.json({ success: false, message: 'زمان شما به پایان رسیده یا کد نامعتبر است. مجدداً تلاش کنید.' }, { status: 400 });
            }

            // 2. Check if user exists in Supabase Auth
            // Note: phone in Supabase must be E.164
            const e164Mobile = '+98' + mobile.substring(1);

            // Search for user
            const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
            if (listError) throw listError;

            const users = (listData?.users || []) as any[];
            const existingAuthUser = users.find((u: any) => u.phone === e164Mobile || u.email === mobile + "@mana.com");

            const finalMetadata = { full_name: fullName || mobile };

            if (existingAuthUser) {
                // Update password and metadata
                const { error: updateError } = await supabase.auth.admin.updateUserById(
                    existingAuthUser.id,
                    {
                        password: password,
                        user_metadata: { ...existingAuthUser.user_metadata, ...finalMetadata }
                    }
                );
                if (updateError) throw updateError;
            } else {
                // Create user
                const { error: createError } = await supabase.auth.admin.createUser({
                    phone: e164Mobile,
                    password: password,
                    phone_confirm: true,
                    user_metadata: finalMetadata
                });
                if (createError) throw createError;
            }

            // 3. Cleanup OTP
            await supabase.from('otps').delete().eq('mobile', mobile);

            return NextResponse.json({ success: true, message: 'رمز عبور با موفقیت تنظیم شد.' });
        }

        return NextResponse.json({ message: 'Action not valid' }, { status: 400 });
    } catch (error: any) {
        console.error('OTP Error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'خطای ناشناخته در سرور',
            error: error.message
        }, { status: 500 });
    }
}
