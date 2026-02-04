// OTP Secure Endpoint - Vercel Serverless Function
// Handles: send, verify, set-password, register_without_otp
// Version 2.0 - Robust Phone Normalization & User Lookup

import { createClient } from '@supabase/supabase-js';

// =========================================
// 📞 ROBUST PHONE NORMALIZATION
// Handles all Iranian phone formats
// =========================================
function normalizeIranianPhone(input) {
    if (!input) return '';

    // Convert Persian/Arabic digits to English
    const p2e = (s) => s
        .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
        .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());

    const digits = p2e(input).replace(/\D/g, '');

    // Case 1: Already has country code with +
    if (digits.startsWith('98') && digits.length === 12) {
        return '+' + digits; // 989222453571 → +989222453571
    }

    // Case 2: Has 0098 prefix
    if (digits.startsWith('0098') && digits.length === 14) {
        return '+98' + digits.substring(4); // 00989222453571 → +989222453571
    }

    // Case 3: Starts with 0 (local format)
    if (digits.startsWith('0') && digits.length === 11) {
        return '+98' + digits.substring(1); // 09222453571 → +989222453571
    }

    // Case 4: Starts with 9 (no prefix)
    if (digits.startsWith('9') && digits.length === 10) {
        return '+98' + digits; // 9222453571 → +989222453571
    }

    // Fallback: assume it needs +98
    console.warn(`⚠️ [Phone] Unusual format, applying fallback: ${digits}`);
    return '+98' + digits;
}

// Get clean digits only (for DB key)
function getCleanDigits(input) {
    const p2e = (s) => s
        .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
        .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    return p2e(input).replace(/\D/g, '');
}

// =========================================
// 🔍 ROBUST USER LOOKUP
// Matches against multiple phone formats
// =========================================
async function findUserByPhone(supabase, e164Phone, emailIdentifier) {
    const { data: listData, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });

    if (error || !listData?.users) {
        console.error("❌ Failed to list users:", error?.message);
        return null;
    }

    const users = listData.users;

    // Generate all possible formats to match
    const e164WithPlus = e164Phone; // +989222453571
    const e164NoPlusSign = e164Phone.replace('+', ''); // 989222453571
    const localFormat = '0' + e164Phone.substring(3); // 09222453571
    const shortFormat = e164Phone.substring(3); // 9222453571

    const phonesToMatch = [e164WithPlus, e164NoPlusSign, localFormat, shortFormat];

    console.log(`🔍 [Auth] Searching for user with phones:`, phonesToMatch);

    const user = users.find(u => {
        const userPhone = u.phone || '';
        const userPhoneClean = userPhone.replace('+', '');

        // Match phone in any format
        if (phonesToMatch.includes(userPhone)) return true;
        if (phonesToMatch.includes(userPhoneClean)) return true;

        // Match email identifier
        if (u.email === emailIdentifier) return true;

        return false;
    });

    if (user) {
        console.log(`✅ [Auth] Found user: ${user.id} (phone: ${user.phone})`);
    } else {
        console.log(`⚠️ [Auth] No user found for ${e164Phone}`);
    }

    return user;
}

// =========================================
// ⏱️ RATE LIMITING
// =========================================
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5;

function checkRateLimit(mobile) {
    const now = Date.now();
    const key = `otp_${mobile}`;
    const record = rateLimitStore.get(key);

    if (!record || now - record.firstRequest > RATE_LIMIT_WINDOW) {
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

// =========================================
// 🚀 MAIN HANDLER
// =========================================
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const smsApiKey = process.env.SMS_IR_API_KEY;
        const templateId = process.env.SMS_IR_TEMPLATE_ID;

        if (!supabaseUrl || !supabaseServiceKey || !smsApiKey || !templateId) {
            const missing = { supabaseUrl: !supabaseUrl, supabaseServiceKey: !supabaseServiceKey, smsApiKey: !smsApiKey, templateId: !templateId };
            console.error('❌ Missing Environment Variables:', missing);
            return res.status(500).json({ success: false, message: 'تنظیمات سرور ناقص است.' });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { action, mobile, code, password, fullName } = req.body;

        const cleanMobile = getCleanDigits(mobile || '');
        const e164Mobile = normalizeIranianPhone(mobile || '');
        const emailIdentifier = `${cleanMobile}@manapalm.local`;

        const finalApiKey = (smsApiKey || '').trim();
        const finalTemplateId = parseInt((templateId || '0').trim());

        // ===== SEND OTP =====
        if (action === 'send') {
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

            console.log(`📡 [SMS.ir] Attempting to send OTP to ${cleanMobile} (E.164: ${e164Mobile})`);

            let smsSent = false;

            // Layer 1: Direct SMS.ir call
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);

                const smsRes = await fetch('https://api.sms.ir/v1/send/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-API-KEY': finalApiKey },
                    signal: controller.signal,
                    body: JSON.stringify({
                        mobile: cleanMobile,
                        templateId: finalTemplateId,
                        parameters: [
                            { name: "CODE", value: otpCode },
                            { name: "EXPIRE_TIME", value: "5" },
                            { name: "expired_time", value: "5" }
                        ]
                    }),
                });

                clearTimeout(timeoutId);
                const smsData = await smsRes.json();

                if (smsRes.ok) {
                    console.log(`✅ [SMS.ir] Success: OTP ${otpCode} sent`);
                    smsSent = true;
                } else {
                    console.error('❌ [SMS.ir] Provider Error:', smsData);
                }
            } catch (err) {
                console.warn(`⚠️ [Network Issue] SMS.ir unreachable. Trying Edge fallback...`);
            }

            // Layer 2: Supabase Edge Function fallback
            if (!smsSent) {
                try {
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
                        console.log(`✅ [Edge] SMS dispatched via Supabase.`);
                        smsSent = true;
                    }
                } catch (edgeErr) {
                    console.error('❌ [Edge] Unreachable:', edgeErr.message);
                }
            }

            // Layer 3: Terminal fallback (Dev Mode)
            if (!smsSent) {
                console.log('\n' + '='.repeat(50));
                console.log('🔴 [DEV MODE] SMS DELIVERY FAILED');
                console.log(`📱 TARGET: ${cleanMobile}`);
                console.log(`🔑 OTP CODE: ${otpCode}`);
                console.log('='.repeat(50) + '\n');

                return res.status(200).json({ success: true, isMocked: true });
            }

            return res.status(200).json({ success: true });
        }

        // ===== VERIFY OTP =====
        if (action === 'verify') {
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

            // 🔐 Find or Create User
            let user = await findUserByPhone(supabase, e164Mobile, emailIdentifier);

            if (!user) {
                console.log(`🌱 [Auth] Creating new user for ${cleanMobile}...`);
                const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                    phone: e164Mobile,
                    email: emailIdentifier,
                    email_confirm: true,
                    phone_confirm: true,
                    user_metadata: { full_name: 'کاربر گرامی' }
                });

                if (createError) {
                    // Handle "phone_exists" by retrying lookup
                    if (createError.status === 422 || createError.message?.includes('already registered')) {
                        console.warn("⚠️ [Auth] Phone exists, retrying lookup...");
                        user = await findUserByPhone(supabase, e164Mobile, emailIdentifier);
                    }

                    if (!user) {
                        console.error("❌ [Auth] Could not create or find user:", createError);
                    }
                } else {
                    user = newUser.user;
                    console.log(`✅ [Auth] Created user: ${user.id}`);
                }
            }

            // Generate session token
            let sessionData = null;

            if (user) {
                // 🛡️ Ensure user has an email (some users were created phone-only)
                let userEmail = user.email;
                if (!userEmail || !userEmail.includes('@')) {
                    userEmail = emailIdentifier;
                    console.log(`📧 [Auth] Updating user ${user.id} with fallback email: ${userEmail}`);

                    await supabase.auth.admin.updateUserById(user.id, {
                        email: userEmail,
                        email_confirm: true
                    });
                }

                const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
                    type: 'magiclink',
                    email: userEmail
                });

                if (!linkError && linkData?.properties?.email_otp) {
                    sessionData = {
                        token: linkData.properties.email_otp,
                        email: userEmail
                    };
                    console.log(`🔐 [Auth] Session token generated for ${user.id}`);
                } else {
                    console.error("❌ Failed to generate magic link:", linkError);
                }
            }

            // Cleanup OTP
            await supabase.from('otps').delete().eq('mobile', cleanMobile);

            return res.status(200).json({
                success: true,
                session: sessionData
            });
        }

        // ===== SET PASSWORD =====
        if (action === 'set-password') {
            const { data: otpData, error: otpError } = await supabase
                .from('otps')
                .select('*')
                .eq('mobile', cleanMobile)
                .eq('code', code)
                .single();

            if (otpError || !otpData) {
                return res.status(400).json({ success: false, message: 'کد نامعتبر است.' });
            }

            let user = await findUserByPhone(supabase, e164Mobile, emailIdentifier);
            const finalMetadata = { full_name: fullName || cleanMobile };

            if (user) {
                const { error: updateError } = await supabase.auth.admin.updateUserById(
                    user.id,
                    { password, user_metadata: { ...user.user_metadata, ...finalMetadata } }
                );
                if (updateError) throw updateError;
            } else {
                const { error: createError } = await supabase.auth.admin.createUser({
                    phone: e164Mobile,
                    email: emailIdentifier,
                    password,
                    phone_confirm: true,
                    email_confirm: true,
                    user_metadata: finalMetadata
                });
                if (createError) throw createError;
            }

            await supabase.from('otps').delete().eq('mobile', cleanMobile);
            return res.status(200).json({ success: true, message: 'رمز عبور تنظیم شد.' });
        }

        // ===== REGISTER WITHOUT OTP (Emergency) =====
        if (action === 'register_without_otp') {
            if (!password || password.length < 6) {
                return res.status(400).json({ success: false, message: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' });
            }

            const existingUser = await findUserByPhone(supabase, e164Mobile, emailIdentifier);

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'این شماره قبلاً ثبت شده است. لطفاً وارد شوید.'
                });
            }

            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                phone: e164Mobile,
                email: emailIdentifier,
                password,
                phone_confirm: true,
                email_confirm: true,
                user_metadata: { full_name: fullName || 'کاربر جدید', is_unverified_signup: true }
            });

            if (createError) throw createError;

            return res.status(200).json({
                success: true,
                message: 'حساب کاربری ساخته شد.',
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
