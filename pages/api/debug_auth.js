
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Missing env vars' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });

        if (error) throw error;

        // Filter for the specific number to see what's stored
        const target = '9222453571';
        const matches = users.filter(u =>
            (u.phone && u.phone.includes(target)) ||
            (u.email && u.email.includes(target))
        );

        return res.status(200).json({
            count: users.length,
            matches: matches.map(u => ({
                id: u.id,
                phone: u.phone,
                email: u.email,
                metadata: u.user_metadata,
                created_at: u.created_at
            })),
            env: {
                url: supabaseUrl,
                hasKey: !!supabaseServiceKey
            }
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
