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
        const { userId, password, oldPassword, phone, email: providedEmail } = req.body;

        // Validate input
        if (!userId && !phone) {
            return res.status(400).json({ success: false, message: 'شناسه کاربر یا شماره موبایل الزامی است.' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد.' });
        }

        let targetUserId = userId;
        let userEmail = providedEmail;

        // If no userId provided or if we need to verify email for sign-in
        const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        const users = listData?.users || [];

        let foundUser = null;
        if (targetUserId) {
            foundUser = users.find(u => u.id === targetUserId);
        } else if (phone) {
            const cleanPhone = phone.replace(/\D/g, '');
            foundUser = users.find(u => {
                const uPhone = (u.phone || '').replace(/\D/g, '');
                return uPhone.includes(cleanPhone) || cleanPhone.includes(uPhone);
            });
        }

        if (!foundUser) {
            return res.status(404).json({ success: false, message: 'کاربر مورد نظر یافت نشد.' });
        }

        targetUserId = foundUser.id;
        userEmail = foundUser.email;

        // 🛡️ VERIFY OLD PASSWORD (if provided)
        if (oldPassword) {
            console.log(`🔐 [API] Verifying old password for: ${userEmail}`);
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: userEmail,
                password: oldPassword
            });

            if (signInError) {
                console.error('❌ [API] Old password verification failed:', signInError.message);
                return res.status(401).json({ success: false, message: 'رمز عبور فعلی اشتباه است.' });
            }
            console.log('✅ [API] Old password verified.');
        }

        console.log(`🔐 [API] Updating password for user: ${targetUserId}`);

        // Decide on the final email to use (normalize if fallback)
        let finalEmail = userEmail;
        if (!finalEmail || !finalEmail.includes('@') || finalEmail.endsWith('.local')) {
            const cleanPhoneForEmail = phone?.replace(/\D/g, '') || (foundUser.phone || '').replace(/\D/g, '');
            let localPhone = cleanPhoneForEmail;
            if (cleanPhoneForEmail.startsWith('98')) {
                localPhone = '0' + cleanPhoneForEmail.substring(2);
            } else if (cleanPhoneForEmail.startsWith('9') && cleanPhoneForEmail.length === 10) {
                localPhone = '0' + cleanPhoneForEmail;
            }
            finalEmail = `${localPhone}@manapalm.local`;
        }

        // Update password AND email using admin API
        const { error: updateError } = await supabase.auth.admin.updateUserById(targetUserId, {
            password: password,
            email: finalEmail,
            email_confirm: true
        });

        if (updateError) {
            console.error('❌ Password update failed:', updateError);
            return res.status(400).json({ success: false, message: updateError.message });
        }

        // ✅ Also update the profile metadata to mark password as set
        const { data: profileData } = await supabase
            .from('profiles')
            .select('metadata')
            .eq('id', targetUserId)
            .single();

        const newMetadata = {
            ...(profileData?.metadata || {}),
            password_set: true
        };

        await supabase
            .from('profiles')
            .update({
                metadata: newMetadata,
                updated_at: new Date().toISOString()
            })
            .eq('id', targetUserId);

        console.log(`✅ [API] Password, email, and metadata updated for: ${targetUserId}`);

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
