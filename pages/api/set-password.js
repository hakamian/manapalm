// API Route: Set User Password
// Uses service role key to update password reliably

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return res.status(500).json({ success: false, message: 'Server configuration error' });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { userId, password, phone } = req.body;

        // Validate input
        if (!userId && !phone) {
            return res.status(400).json({ success: false, message: 'شناسه کاربر یا شماره موبایل الزامی است.' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' });
        }

        let targetUserId = userId;

        // If no userId provided, find user by phone
        if (!targetUserId && phone) {
            const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
            const users = listData?.users || [];

            // Normalize phone for comparison
            const cleanPhone = phone.replace(/\D/g, '');

            const user = users.find(u => {
                const userPhone = (u.phone || '').replace(/\D/g, '');
                return userPhone.includes(cleanPhone) || cleanPhone.includes(userPhone);
            });

            if (user) {
                targetUserId = user.id;
            } else {
                return res.status(404).json({ success: false, message: 'کاربر یافت نشد.' });
            }
        }

        console.log(`🔐 [API] Updating password for user: ${targetUserId}`);

        // Normalize phone for email
        const cleanPhone = phone?.replace(/\D/g, '') || '';
        // Get the local part (without +98)
        let localPhone = cleanPhone;
        if (cleanPhone.startsWith('98')) {
            localPhone = '0' + cleanPhone.substring(2);
        } else if (cleanPhone.startsWith('9') && cleanPhone.length === 10) {
            localPhone = '0' + cleanPhone;
        }
        const normalizedEmail = `${localPhone}@manapalm.local`;

        console.log(`📧 [API] Setting email to: ${normalizedEmail}`);

        // Update password AND email using admin API
        const { error: updateError } = await supabase.auth.admin.updateUserById(targetUserId, {
            password: password,
            email: normalizedEmail,
            email_confirm: true
        });

        if (updateError) {
            console.error('❌ Password update failed:', updateError);
            return res.status(400).json({ success: false, message: updateError.message });
        }

        console.log(`✅ [API] Password and email updated successfully for: ${targetUserId}`);

        return res.status(200).json({
            success: true,
            message: 'رمز عبور با موفقیت ذخیره شد.'
        });

    } catch (error) {
        console.error('Set Password Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'خطای سرور'
        });
    }
}
