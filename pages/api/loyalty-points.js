// pages/api/loyalty-points.js
// Final Version: Unified Meaning OS v7.5
// Role: Senior Backend Engineer (Agent 3)

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    try {
        const { userId, amount, reason, orderId } = req.body;

        if (!userId || !amount) {
            return res.status(400).json({ error: 'Missing userId or amount' });
        }

        // 1. Add to Ledger (Internal Audit)
        const { error: ledgerError } = await supabaseAdmin
            .from('points_ledger')
            .insert({
                user_id: userId,
                amount: amount,
                reason: reason || 'purchase',
                order_id: orderId
            });

        if (ledgerError) throw ledgerError;

        // 2. Update User Profile (Running Balance)
        // Note: In a production app, this should be done via a Postgres Trigger to ensure consistency.
        const { data: profile, error: readError } = await supabaseAdmin
            .from('profiles')
            .select('points')
            .eq('id', userId)
            .single();

        if (readError) throw readError;

        const newBalance = (profile.points || 0) + amount;

        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
                points: newBalance,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) throw updateError;

        return res.status(200).json({
            success: true,
            newBalance,
            message: `امتیاز با موفقیت ثبت شد. دلیل: ${reason}`
        });

    } catch (error) {
        console.error('❌ Error in loyalty-points:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
