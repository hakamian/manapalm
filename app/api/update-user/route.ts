import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user } = body;

        if (!user || !user.id) {
            return NextResponse.json({ success: false, error: 'شناسه کاربر یافت نشد' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({
                success: false,
                error: 'تنظیمات Supabase در سرور ناقص است (Missing Service Key)'
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 🛡️ Explicitly pick fields to avoid dumping huge objects into metadata
        const profileData = {
            id: user.id,
            email: user.email,
            full_name: user.fullName || user.name,
            // phone: user.phone, // 🛑 Temporarily disabled to check if this triggers the ghost SMS
            avatar_url: user.avatar,
            points: user.points || 0,
            mana_points: user.manaPoints || 0,
            level: user.level || 'جوانه',
            is_admin: !!user.isAdmin,
            is_guardian: !!user.isGuardian,
            is_grove_keeper: !!user.isGroveKeeper,
            metadata: {
                addresses: user.addresses || [],
                messages: user.messages || [],
                recentViews: user.recentViews || [],
                timeline: (user.timeline || []).slice(0, 50),
                coursePersonalizations: user.coursePersonalizations || {},
                discReport: user.discReport || null,
                updated_at: new Date().toISOString()
            }
        };

        console.log('📝 Upserting Profile:', {
            id: profileData.id,
            fullName: profileData.full_name,
            addressCount: profileData.metadata.addresses.length
        });

        const { error } = await supabase
            .from('profiles')
            .upsert(profileData);

        if (error) {
            console.error('❌ Supabase Update Error [CRITICAL_DEBUG]:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                full_error: error
            });
            // Return BOTH message and details to help local debugging
            return NextResponse.json({
                success: false,
                error: error.message,
                details: error.details || 'No extra details',
                code: error.code
            }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Update User API Panic:', error);
        return NextResponse.json({ success: false, error: error.message || 'خطای داخلی سرور' }, { status: 500 });
    }
}
