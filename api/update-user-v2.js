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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('❌ Missing Supabase credentials');
        return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    try {
        const { user } = req.body;

        if (!user || !user.id) {
            return res.status(400).json({ success: false, error: 'Missing user data' });
        }

        console.log('🔄 Syncing user profile to DB:', user.id);

        // Build metadata object with all user-specific data
        // We preserve existing data structure used in mapProfileToUser (database.ts)
        const metadata = {
            ...(user.metadata || {}), // Preserve existing if provided
            addresses: user.addresses || [],
            messages: user.messages || [],
            recentViews: user.recentViews || [],
            timeline: user.timeline || [],
            coursePersonalizations: user.coursePersonalizations || {},
            discReport: user.discReport || null,
            profileCompletion: user.profileCompletion || { initial: false, additional: false, extra: false },
            unlockedTools: user.unlockedTools || [],
            purchasedCourseIds: user.purchasedCourseIds || [],
            conversations: user.conversations || [],
            notifications: user.notifications || [],
            reflectionAnalysesRemaining: user.reflectionAnalysesRemaining || 0,
            ambassadorPacksRemaining: user.ambassadorPacksRemaining || 0,
            hoshmanaLiveAccess: user.hoshmanaLiveAccess || null,
        };

        // Prepare profile update
        const profileUpdate = {
            id: user.id,
            full_name: user.fullName || user.name,
            email: user.email,
            phone: user.phone,
            avatar_url: user.avatar,
            points: user.points || 0,
            mana_points: user.manaPoints || 0,
            level: user.level || 'جوانه',
            is_admin: user.isAdmin || false,
            is_guardian: user.isGuardian || false,
            is_grove_keeper: user.isGroveKeeper || false,
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
            debug: `Sent ${user.addresses?.length || 0}, Saved ${savedData?.metadata?.addresses?.length || 0}`
        });

    } catch (error) {
        console.error('❌ API Error in update-user-v2:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
