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
        console.error('❌ Missing Supabase credentials');
        return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    try {
        const { user: updateData } = req.body;

        if (!updateData || !updateData.id) {
            return res.status(400).json({ success: false, error: 'Missing user data' });
        }

        // 🛡️ SECURITY CHECK: Verify Token and Identity
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, error: 'Missing authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !authUser) {
            console.error('❌ Auth error:', authError);
            return res.status(401).json({ success: false, error: 'Invalid or expired token' });
        }

        // Check if requester is admin
        const { data: adminProfile } = await supabaseAdmin
            .from('profiles')
            .select('is_admin')
            .eq('id', authUser.id)
            .single();

        const isAdmin = adminProfile?.is_admin === true;

        // If not admin, user can ONLY update their own profile
        if (!isAdmin && authUser.id !== updateData.id) {
            console.warn(`🚫 Unauthorized attempt by ${authUser.id} to update ${updateData.id}`);
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
                updateData.points = currentProfile.points;
                updateData.manaPoints = currentProfile.mana_points;
                updateData.isAdmin = currentProfile.is_admin;
                updateData.isGuardian = currentProfile.is_guardian;
                updateData.isGroveKeeper = currentProfile.is_grove_keeper;
                updateData.level = currentProfile.level;
            }
        }

        console.log('🔄 Syncing user profile to DB:', updateData.id);

        // Build metadata object with all user-specific data
        // We preserve existing data structure used in mapProfileToUser (database.ts)
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

        // Upsert profile
        // Log the exact payload being sent to Supabase
        console.log('📤 Sending to DB (Payload):', JSON.stringify(profileUpdate.metadata.addresses));

        // Upsert profile and SELECT the result to confirm persistence
        const { data: savedData, error } = await supabaseAdmin
            .from('profiles')
            .upsert(profileUpdate, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase upsert error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        console.log('📥 DB Response (Saved):', JSON.stringify(savedData?.metadata?.addresses));
        return res.status(200).json({
            success: true,
            debug: `Sent ${updateData.addresses?.length || 0}, Saved ${savedData?.metadata?.addresses?.length || 0}`
        });

    } catch (error) {
        console.error('❌ API Error in update-user-v2:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}