import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user } = body;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ success: false, error: 'Server config missing' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const profileData = {
            id: user.id,
            email: user.email,
            full_name: user.fullName || user.name,
            phone: user.phone,
            metadata: {
                addresses: user.addresses || [],
                updated_at: new Date().toISOString()
            }
        };

        const { error } = await supabase
            .from('profiles')
            .upsert(profileData);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'New Route Active' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
