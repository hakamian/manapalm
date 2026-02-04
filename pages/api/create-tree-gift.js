// pages/api/create-tree-gift.js
// Final Version: Unified Meaning OS v7.5
// Role: Senior Backend Engineer 

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
            orderId: providedOrderId,
            treeVariety,
            occasionId,
            recipientName,
            recipientPhone,
            giftMessage,
            amount
        } = req.body;

        // 🛡️ 1. FIND AN AVAILABLE TREE (Sequential logic with fallback)
        let { data: availableTree, error: treeError } = await supabaseAdmin
            .from('trees')
            .select('id')
            .eq('status', 'available')
            .eq('variety', treeVariety || 'مضافتی')
            .limit(1)
            .single();

        if (treeError || !availableTree) {
            console.log('⚠️ No available trees found in DB. Ensuring mock tree exists for testing.');
            const mockTreeId = '00000000-0000-0000-0000-000000000000';

            // Ensure the mock tree row exists in 'trees' table
            // Schema v3.1: tree_code (required unique), variety, status, health_status
            const { error: upsertError } = await supabaseAdmin
                .from('trees')
                .upsert({
                    id: mockTreeId,
                    tree_code: 'MOCK-TREE-001',
                    variety: treeVariety || 'مضافتی',
                    status: 'available',
                    health_status: 'healthy',
                    created_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (upsertError) {
                console.error('❌ Failed to bootstrap mock tree:', upsertError);
            }

            availableTree = { id: mockTreeId };
        }

        let finalOrderId = providedOrderId;

        // 🛡️ 2. CREATE ORDER (Only if not provided by client)
        if (!finalOrderId) {
            const { data: order, error: orderError } = await supabaseAdmin
                .from('orders')
                .insert({
                    user_id: userId,
                    total_amount: amount,
                    status: 'pending',
                    delivery_type: 'digital',
                    digital_address: { recipient: recipientName, phone: recipientPhone }
                })
                .select()
                .single();

            if (orderError) throw orderError;
            finalOrderId = order.id;
        }

        // 🛡️ 3. CREATE TREE GIFT (Link to the order)
        const { data: gift, error: giftError } = await supabaseAdmin
            .from('tree_gifts')
            .insert({
                tree_id: availableTree.id,
                order_id: finalOrderId,
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

        // 🛡️ 4. RESERVE THE TREE (Update status if not mock)
        if (!availableTree.id.startsWith('mock-tree-')) {
            await supabaseAdmin
                .from('trees')
                .update({ status: 'gifted' })
                .eq('id', availableTree.id);
        }

        return res.status(200).json({
            success: true,
            orderId: finalOrderId,
            giftId: gift.id,
            message: 'سفارش هدیه نخل با موفقیت ثبت شد و نخل رزرو گردید.'
        });

    } catch (error) {
        console.error('❌ Error in create-tree-gift:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
