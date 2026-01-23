// API Route for updating user profile data
// Uses Supabase Service Role Key to bypass RLS for admin operations

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { createClient } = await import('@supabase/supabase-js');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('❌ Missing Supabase credentials:', {
            hasUrl: !!supabaseUrl,
            hasKey: !!serviceRoleKey
        });
        return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    try {
        const { user: updateData } = req.body;

        if (!updateData || !updateData.id) {
            return res.status(400).json({ success: false, error: 'Missing user data' });
        }

        // 🛡️ SECURITY CHECK: Verify Token and Identity (Dual Header Support)
        const authHeader = req.headers.authorization;
        const customTokenHeader = req.headers['x-mana-token'];

        console.log('🔐 [API Auth] Header Status:', {
            auth: !!authHeader,
            custom: !!customTokenHeader
        });

        const token = authHeader?.split(' ')[1] || customTokenHeader;

        if (!token) {
            console.error('❌ [API Auth] No token found in any header');
            return res.status(401).json({ success: false, error: 'احراز هویت انجام نشد. لطفاً دوباره وارد شوید.' });
        }

        const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !authUser) {
            console.error('❌ [API Auth] Supabase rejected token:', authError?.message || 'User not found');
            return res.status(401).json({ success: false, error: 'Invalid or expired token', detailed_error: authError?.message });
        }

        console.log('✅ [API Auth] Token verified for user:', authUser.id);

        // Check if requester is admin
        const { data: adminProfile } = await supabaseAdmin
            .from('profiles')
            .select('is_admin')
            .eq('id', authUser.id)
            .single();

        const isAdmin = adminProfile?.is_admin === true;

        // 🚨 IMPROVEMENT 2: ENHANCED SECURITY LOGGING
        // If not admin, user can ONLY update their own profile
        if (!isAdmin && authUser.id !== updateData.id) {
            console.warn(`🚨 [SECURITY ALERT] IDOR Attempt detected!`);
            console.warn(`   - Attacker ID: ${authUser.id}`);
            console.warn(`   - Target ID: ${updateData.id}`);
            console.warn(`   - IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`);
            return res.status(403).json({ success: false, error: 'Forbidden: Cannot update other user profiles' });
        }

        // If not admin, restrict sensitive fields from being changed by the user
        if (!isAdmin) {
            const { data: currentProfile } = await supabaseAdmin
                .from('profiles')
                .select('points, mana_points, is_admin, is_guardian, is_grove_keeper, level')
                .eq('id', authUser.id)
                .single();

            if (currentProfile) {
                // Check if user tried to modify sensitive fields
                const attemptedPrivilegeEscalation =
                    (updateData.points !== undefined && updateData.points !== currentProfile.points) ||
                    (updateData.isAdmin !== undefined && updateData.isAdmin !== currentProfile.is_admin);

                if (attemptedPrivilegeEscalation) {
                    console.warn(`🚨 [SECURITY ALERT] Privilege Escalation Attempt detected!`);
                    console.warn(`   - User: ${authUser.id}`);
                    console.warn(`   - Attempted Points: ${updateData.points} (Real: ${currentProfile.points})`);
                    console.warn(`   - Attempted Admin: ${updateData.isAdmin}`);
                }

                // Force overwrite with SSOT (Truth from DB)
                updateData.points = currentProfile.points;
                updateData.manaPoints = currentProfile.mana_points;
                updateData.isAdmin = currentProfile.is_admin;
                updateData.isGuardian = currentProfile.is_guardian;
                updateData.isGroveKeeper = currentProfile.is_grove_keeper;
                updateData.level = currentProfile.level;
            }
        }

        // ✅ IMPROVEMENT 1: SERVER-SIDE DATA VALIDATION (Zod-like Native Implementation)
        // Validate Address Structure
        if (updateData.addresses && Array.isArray(updateData.addresses)) {
            const validAddresses = updateData.addresses.filter(addr => {
                const isValid =
                    addr.fullAddress && typeof addr.fullAddress === 'string' && addr.fullAddress.length > 5 &&
                    addr.recipientName && typeof addr.recipientName === 'string' &&
                    addr.phone && typeof addr.phone === 'string' && addr.phone.length >= 10;

                if (!isValid) {
                    console.warn(`⚠️ Invalid address filtered out for user ${updateData.id}:`, addr);
                }
                return isValid;
            });
            updateData.addresses = validAddresses;
        }

        // Validate Phone Format (Basic Iranian Mobile regex)
        if (updateData.phone) {
            const phoneRegex = /^(\+98|0)?9\d{9}$/;
            if (!phoneRegex.test(updateData.phone)) {
                // Use saved phone if provided is invalid, or just keep it (policy decision)
                // For now, we allow it but log warning
                console.warn(`⚠️ Potentially invalid phone number for user ${updateData.id}: ${updateData.phone}`);
            }
        }


        console.log('🔄 Syncing user profile to DB:', updateData.id);

        // Build metadata object with all user-specific data
        const metadata = {
            ...(updateData.metadata || {}), // Preserve existing if provided
            addresses: updateData.addresses || [],
            messages: updateData.messages || [],
            recentViews: updateData.recentViews || [],
            timeline: updateData.timeline || [],
            coursePersonalizations: updateData.coursePersonalizations || {},
            discReport: updateData.discReport || null,
            profileCompletion: updateData.profileCompletion || { initial: false, additional: false, extra: false },
            unlockedTools: updateData.unlockedTools || [],
            purchasedCourseIds: updateData.purchasedCourseIds || [],
            conversations: updateData.conversations || [],
            notifications: updateData.notifications || [],
            reflectionAnalysesRemaining: updateData.reflectionAnalysesRemaining || 0,
            ambassadorPacksRemaining: updateData.ambassadorPacksRemaining || 0,
            hoshmanaLiveAccess: updateData.hoshmanaLiveAccess || null,
        };

        // Prepare profile update
        console.log('🔄 [API] Syncing User to DB:', updateData.id);

        const profileUpdate = {
            id: updateData.id,
            full_name: updateData.fullName || updateData.name,
            email: updateData.email,
            phone: updateData.phone,
            avatar_url: updateData.avatar,
            points: updateData.points || 0,
            mana_points: updateData.manaPoints || 0,
            level: updateData.level || 'جوانه',
            is_admin: updateData.isAdmin || false,
            is_guardian: updateData.isGuardian || false,
            is_grove_keeper: updateData.isGroveKeeper || false,
            updated_at: new Date().toISOString(),
            metadata: metadata
        };

        // 🛡️ SECURITY: Log the actual structure going to Supabase (Omit sensitive if needed)
        console.log('📤 [API] Final DB Payload:', JSON.stringify({
            id: profileUpdate.id,
            name: profileUpdate.full_name,
            addresses_count: profileUpdate.metadata.addresses?.length
        }));

        // Upsert profile and SELECT the result to confirm persistence
        const { data: savedData, error } = await supabaseAdmin
            .from('profiles')
            .upsert(profileUpdate, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error('❌ [API] Supabase Error:', error.message, '| Hint:', error.hint);
            return res.status(500).json({ success: false, error: error.message });
        }

        if (!savedData) {
            console.error('⚠️ [API] Success returned but no data found in response.');
            return res.status(500).json({ success: false, error: 'تغییرات ثبت شد اما بازیابی نشد' });
        }

        console.log('✅ [API] Success! DB Name is now:', savedData.full_name);

        return res.status(200).json({
            success: true,
            user: savedData, // Send back the version from DB to keep UI in sync
            debug: `Sent ${updateData.addresses?.length || 0}, Saved ${savedData?.metadata?.addresses?.length || 0}`
        });

    } catch (error) {
        console.error('❌ API Error in update-user-v2:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}