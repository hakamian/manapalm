
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for elevated access (verification)
);

export default async function handler(req, res) {
    const { action, mobile, code } = req.body;

    if (action === 'send') {
        // 1. Generate 6-digit code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 mins expiry

        try {
            // 2. Save to Supabase (Upsert based on mobile)
            const { error: dbError } = await supabase
                .from('otps')
                .upsert({
                    mobile,
                    code: otpCode,
                    expires_at: expiresAt
                }, { onConflict: 'mobile' });

            if (dbError) throw dbError;

            // 3. Send via SMS.ir (Calling our own internal API or direct)
            const smsApiKey = process.env.SMS_IR_API_KEY;
            const templateId = process.env.SMS_IR_TEMPLATE_ID || 1; // Default or env

            const smsRes = await fetch('https://api.sms.ir/v1/send/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': smsApiKey,
                },
                body: JSON.stringify({
                    mobile,
                    templateId: parseInt(templateId),
                    parameters: [{ name: "Code", value: otpCode }],
                }),
            });

            const smsData = await smsRes.json();

            return res.status(200).json({ success: true, message: 'OTP sent' });
        } catch (error) {
            console.error('OTP Send Error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    if (action === 'verify') {
        try {
            // 1. Fetch code from DB
            const { data, error } = await supabase
                .from('otps')
                .select('*')
                .eq('mobile', mobile)
                .eq('code', code)
                .single();

            if (error || !data) {
                return res.status(400).json({ success: false, message: 'کد وارد شده اشتباه است' });
            }

            // 2. Check Expiry
            if (new Date(data.expires_at) < new Date()) {
                return res.status(400).json({ success: false, message: 'کد منقضی شده است' });
            }

            // 3. Clean up OTP
            await supabase.from('otps').delete().eq('mobile', mobile);

            // 4. Handle User Login/Creation via Supabase
            // Here we can return a success flag and let the frontend handle the rest
            // OR generate a custom token. For this simplified flow, we return success.
            return res.status(200).json({ success: true });

        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
