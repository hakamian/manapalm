import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const { user } = await req.json();

        if (!user || !user.id) {
            return NextResponse.json({ success: false, error: 'User data is missing' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('❌ Missing Supabase Environment Variables');
            return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Map User object to database columns
        const {
            id, email, fullName, name, phone, avatar, address, plaque, floor,
            points, manaPoints, level, isAdmin, isGuardian, isGroveKeeper, joinDate,
            ...metadata
        } = user;

        const profileData = {
            id: id,
            email: email,
            full_name: fullName || name,
            phone: phone,
            avatar_url: avatar,
            address: address,
            plaque: plaque,
            floor: floor,
            points: points,
            mana_points: manaPoints,
            level: level,
            is_admin: isAdmin,
            is_guardian: isGuardian,
            is_grove_keeper: isGroveKeeper,
            metadata: {
                ...metadata,
                timeline: user.timeline ? user.timeline.slice(0, 50) : [],
            }
        };

        const { error } = await supabase
            .from('profiles')
            .upsert(profileData);

        if (error) {
            console.error('❌ Supabase Upsert Error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Update User API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
