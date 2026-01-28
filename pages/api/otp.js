// OTP Secure Endpoint - Vercel Serverless Function
// Handles: send, verify, set-password

import { createClient } from '@supabase/supabase-js';

// Simple in-memory rate limiting (resets on cold start, but still helps)
// For production, consider using Redis/Upstash for persistent rate limiting
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5; // max 5 OTP requests per window

function checkRateLimit(mobile) {
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

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
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
            return res.status(500).json({
                success: false,
                message: 'تنظیمات سرور ناقص است.',
                missing: Object.keys(missingVars).filter(k => missingVars[k])
            });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { action, mobile, code, password, fullName } = req.body;

        const cleanNumber = (str) => {
            const p2e = (s) => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
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
                return res.status(429).json({
                    success: false,
                    message: `تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً ${Math.ceil(rateLimit.retryAfter / 60)} دقیقه دیگر تلاش کنید.`,
                    retryAfter: rateLimit.retryAfter
                });
            }

            const otpCode = Math.floor(10000 + Math.random() * 90000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

            const { error: dbError } = await supabase
                .from('otps')
                .upsert({ mobile: cleanMobile, code: otpCode, expires_at: expiresAt }, { onConflict: 'mobile' });

            if (dbError) throw dbError;

            console.log(`📡 [SMS.ir] Attempting to send OTP to ${cleanMobile}...`);

            let smsSent = false;
            let smsErrorMsg = '';

            try {
                // Controller for network timeout (4 seconds is plenty for a good connection)
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);

                const smsRes = await fetch('https://api.sms.ir/v1/send/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-KEY': finalApiKey,
                    },
                    signal: controller.signal,
                    body: JSON.stringify({
                        mobile: cleanMobile,
                        templateId: finalTemplateId,
                        parameters: [
                            { name: "CODE", value: otpCode }
                        ],
                    }),
                });

                clearTimeout(timeoutId);
                const smsData = await smsRes.json();

                if (smsRes.ok) {
                    console.log(`✅ [SMS.ir] Success: OTP ${otpCode} sent to ${cleanMobile}`);
                    smsSent = true;
                } else {
                    console.error('❌ [SMS.ir] Provider Error:', smsData);
                }
            } catch (err) {
                console.warn(`⚠️ [Network Issue] SMS.ir unreachable directly. Trying Supabase Edge Proxy...`);
            }

            // --- LAYER 2: SUPABASE EDGE FALLBACK (Bypass Intranet) ---
            if (!smsSent) {
                try {
                    console.log(`🔄 [Edge] Attempting to proxy via Supabase Edge Function...`);
                    const edgeRes = await fetch(`${supabaseUrl}/functions/v1/send-otp`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${supabaseServiceKey}`,
                            'apikey': supabaseServiceKey,
                        },
                        body: JSON.stringify({ mobile: cleanMobile, code: otpCode }),
                    });

                    if (edgeRes.ok) {
                        console.log(`✅ [Edge] Success: SMS dispatched via Supabase Infrastructure.`);
                        smsSent = true;
                    } else {
                        const edgeData = await edgeRes.json();
                        console.error('❌ [Edge] Failed:', edgeData);
                    }
                } catch (edgeErr) {
                    console.error('❌ [Edge] Unreachable:', edgeErr.message);
                }
            }

            // --- STRATEGIC FALLBACK ---
            // If SMS failed due to NETWORK (Intranet), we still allow the session to proceed 
            // by showing the code in the terminal for the developer.
            if (!smsSent) {
                console.log('\n' + '='.repeat(50));
                console.log('🔴 [Intranet-Mode] SMS DELIVERY FAILED');
                console.log(`📱 TARGET: ${cleanMobile}`);
                console.log(`🔑 OTP CODE: ${otpCode}`);
                console.log('💡 Action: Please enter the code above to continue.');
                console.log('='.repeat(50) + '\n');

                // We return true to the frontend so the modal moves to the verification step
                return res.status(200).json({
                    success: true,
                    isMocked: true,
                    note: 'سیستم به دلیل محدودیت شبکه در حالت شبیه‌ساز قرار گرفت'
                });
            }

            return res.status(200).json({ success: true });
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
                return res.status(400).json({ success: false, message: 'کد وارد شده اشتباه است' });
            }

            if (new Date(data.expires_at) < new Date()) {
                return res.status(400).json({ success: false, message: 'کد منقضی شده است' });
            }

            return res.status(200).json({ success: true });
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
                return res.status(400).json({ success: false, message: 'کد نامعتبر است. مجدداً تلاش کنید.' });
            }

            // E.164 format for Supabase
            const e164Mobile = '+98' + cleanMobile.substring(1);

            // Check if user exists
            const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
            if (listError) throw listError;

            const users = (listData?.users || []);
            const existingAuthUser = users.find(u => u.phone === e164Mobile || u.email === cleanMobile + "@mana.com");

            const finalMetadata = { full_name: fullName || cleanMobile };

            if (existingAuthUser) {
                // Update password
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

            // Cleanup OTP
            await supabase.from('otps').delete().eq('mobile', cleanMobile);

            return res.status(200).json({ success: true, message: 'رمز عبور با موفقیت تنظیم شد.' });
        }

        // ===== REGISTER WITHOUT OTP (Emergency Mode) =====
        if (action === 'register_without_otp') {
            const cleanMobile = cleanNumber(mobile);

            // Basic validation
            if (!password || password.length < 6) {
                return res.status(400).json({ success: false, message: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' });
            }

            // E.164 format
            const e164Mobile = '+98' + cleanMobile.substring(1);

            // Check if user already exists
            const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
            if (listError) throw listError;

            const users = (listData?.users || []);
            const existingUser = users.find(u => u.phone === e164Mobile || u.email === `${cleanMobile}@manapalm.local`);

            if (existingUser) {
                // For security, we DO NOT allow overwriting existing users without OTP.
                // They must use the "Forgot Password" flow (which needs SMS, currently down).
                // Or we can assume if they know the password they can login.
                // If they don't know the password and SMS is down, they are stuck.
                // But we cannot let a stranger hijack an account just by registering it.
                return res.status(409).json({
                    success: false,
                    message: 'این شماره قبلاً ثبت شده است. لطفاً وارد شوید.'
                });
            }

            // Create NEW user - Auto Confirmed
            const finalMetadata = {
                full_name: fullName || 'کاربر جدید',
                is_unverified_signup: true // Mark for future verification
            };

            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                phone: e164Mobile,
                email: `${cleanMobile}@manapalm.local`, // Fallback email
                password: password,
                phone_confirm: true, // Auto-confirm phone
                email_confirm: true,
                user_metadata: finalMetadata
            });

            if (createError) {
                throw createError;
            }

            return res.status(200).json({
                success: true,
                message: 'حساب کاربری با موفقیت ساخته شد.',
                user: newUser.user
            });
        }

        return res.status(400).json({ message: 'Action not valid' });
    } catch (error) {
        console.error('OTP Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'خطای سرور',
            error: error.message
        });
    }
}
