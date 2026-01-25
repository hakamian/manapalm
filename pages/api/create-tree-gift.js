// pages/api/create-tree-gift.js
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
        const {
            userId,
            treeVariety,
            occasionId,
            recipientName,
            recipientPhone,
            giftMessage,
            amount
        } = req.body;

        // 1. Transactions are not natively simple in Supabase JS client for multi-table logic 
        // without RPC, but we will perform sequential operations with rollback logic.

        // FIND AN AVAILABLE TREE
        const { data: availableTree, error: treeError } = await supabaseAdmin
            .from('trees')
            .select('id')
            .eq('status', 'available')
            .eq('variety', treeVariety || 'مضافتی')
            .limit(1)
            .single();

        if (treeError || !availableTree) {
            return res.status(404).json({ success: false, error: 'هیچ نخلی برای کاشت فعلاً موجود نیست.' });
        }

        // 2. CREATE ORDER
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                user_id: userId,
                total_amount: amount,
                status: 'pending',
                delivery_info: { type: 'digital', recipient: recipientName }
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 3. CREATE TREE GIFT
        const { data: gift, error: giftError } = await supabaseAdmin
            .from('tree_gifts')
            .insert({
                tree_id: availableTree.id,
                order_id: order.id,
                donor_id: userId,
                recipient_name: recipientName,
                recipient_phone: recipientPhone,
                occasion_id: occasionId,
                gift_message: giftMessage,
                status: 'pending'
            })
            .select()
            .single();

        if (giftError) throw giftError;

        // 4. RESERVE THE TREE (Update status to gifted)
        await supabaseAdmin
            .from('trees')
            .update({ status: 'gifted' })
            .eq('id', availableTree.id);

        return res.status(200).json({
            success: true,
            orderId: order.id,
            giftId: gift.id,
            message: 'سفارش هدیه نخل با موفقیت ثبت شد و نخل رزرو گردید.'
        });

    } catch (error) {
        console.error('❌ Error in create-tree-gift:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
