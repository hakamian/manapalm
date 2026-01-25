// services/application/commerceService.ts
// Role: Senior Frontend Engineer (Agent 4)
// Description: Services for commerce, gifting, and loyalty points.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const commerceService = {
    /**
     * Fetch the points ledger for a specific user
     */
    getPointsLedger: async (userId: string) => {
        const { data, error } = await supabase
            .from('points_ledger')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching points ledger:', error);
            return [];
        }
        return data;
    },

    /**
     * Create a tree gift order via standard API
     */
    createTreeGift: async (details: {
        userId: string,
        treeVariety: string,
        occasionId: string,
        recipientName: string,
        recipientPhone: string,
        giftMessage: string,
        amount: number
    }) => {
        try {
            const response = await fetch('/api/create-tree-gift', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(details)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating tree gift:', error);
            return { success: false, error: 'Network error' };
        }
    }
};
