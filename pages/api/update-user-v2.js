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

        // ✅ IMPROVEMENT 1: SERVER-SIDE DATA VALIDATION (Lenient for better UX)
        if (updateData.addresses && Array.isArray(updateData.addresses)) {
            updateData.addresses = updateData.addresses.filter(addr => {
                return (addr.fullAddress || addr.city) && addr.recipientName;
            });
        }

        // 🛡️ CTO DEFENSE: Fetch existing profile to preserve critical flags if missing
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('metadata')
            .eq('id', updateData.id)
            .single();

        const currentMetadata = existingProfile?.metadata || {};

        // Build metadata object with all user-specific data
        // ⚔️ CTO FIX: We merge [Current DB Metadata] + [Frontend Metadata] + [Frontend Clean Data]
        const metadata = {
            ...currentMetadata,
            ...(updateData.metadata || {}),
            ...updateData, // Spread top level fields
            addresses: updateData.addresses || updateData.metadata?.addresses || currentMetadata.addresses || [],
            messages: updateData.messages || updateData.metadata?.messages || currentMetadata.messages || [],
            recentViews: updateData.recentViews || updateData.metadata?.recentViews || currentMetadata.recentViews || [],
            timeline: updateData.timeline || updateData.metadata?.timeline || currentMetadata.timeline || [],
            coursePersonalizations: updateData.coursePersonalizations || updateData.metadata?.coursePersonalizations || currentMetadata.coursePersonalizations || {},
            discReport: updateData.discReport || updateData.metadata?.discReport || currentMetadata.discReport || null,
            profileCompletion: updateData.profileCompletion || updateData.metadata?.profileCompletion || currentMetadata.profileCompletion || { initial: false, additional: false, extra: false },
            unlockedTools: updateData.unlockedTools || updateData.metadata?.unlockedTools || currentMetadata.unlockedTools || [],
            purchasedCourseIds: updateData.purchasedCourseIds || updateData.metadata?.purchasedCourseIds || currentMetadata.purchasedCourseIds || [],
            conversations: updateData.conversations || updateData.metadata?.conversations || currentMetadata.conversations || [],
            notifications: updateData.notifications || updateData.metadata?.notifications || currentMetadata.notifications || [],
            reflectionAnalysesRemaining: updateData.reflectionAnalysesRemaining ?? updateData.metadata?.reflectionAnalysesRemaining ?? currentMetadata.reflectionAnalysesRemaining ?? 0,
            ambassadorPacksRemaining: updateData.ambassadorPacksRemaining ?? updateData.metadata?.ambassadorPacksRemaining ?? currentMetadata.ambassadorPacksRemaining ?? 0,
            hoshmanaLiveAccess: updateData.hoshmanaLiveAccess || updateData.metadata?.hoshmanaLiveAccess || currentMetadata.hoshmanaLiveAccess || null,
            password_set: updateData.password_set !== undefined ? updateData.password_set : (updateData.metadata?.password_set !== undefined ? updateData.metadata.password_set : (currentMetadata.password_set || false)),
        };

        // Remove DB root columns from metadata to keep JSON clean
        const rootColumns = ['id', 'full_name', 'email', 'phone', 'avatar_url', 'points', 'mana_points', 'level', 'is_admin', 'is_guardian', 'is_grove_keeper', 'created_at', 'updated_at', 'metadata'];
        rootColumns.forEach(key => delete metadata[key]);

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

        // 🔄 SYNC TO AUTH METADATA: This is critical for preventing "reverting names" on login
        // If we only update the 'profiles' table, the Supabase Session might still hold the old name in metadata.
        try {
            // Ensure we use the target user's metadata, not the requester's (if admin)
            let currentTargetMetadata = {};
            if (authUser.id === updateData.id) {
                currentTargetMetadata = authUser.user_metadata || {};
            } else {
                const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(updateData.id);
                currentTargetMetadata = targetUser?.user?.user_metadata || {};
            }

            await supabaseAdmin.auth.admin.updateUserById(updateData.id, {
                user_metadata: {
                    ...currentTargetMetadata,
                    full_name: profileUpdate.full_name,
                    name: profileUpdate.full_name, // Backup
                    avatar_url: profileUpdate.avatar_url
                }
            });
            console.log('✅ [API] Auth Metadata synced for:', updateData.id);
        } catch (syncErr) {
            console.warn('⚠️ [API] Auth Metadata sync failed (Profile updated anyway):', syncErr.message);
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