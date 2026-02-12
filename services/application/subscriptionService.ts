// services/application/subscriptionService.ts
import { supabase } from '../infrastructure/supabase.ts';
import { SubscriptionPlan, UserSubscription } from '../../types/subscription.ts';

export const subscriptionService = {
    /**
     * Fetch all active subscription plans
     */
    async getPlans(): Promise<SubscriptionPlan[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .order('price_irr', { ascending: true });

        if (error) {
            console.error('Error fetching plans:', error);
            return [];
        }
        return data || [];
    },

    /**
     * Get current active subscription for a user
     */
    async getActiveSubscription(userId: string): Promise<UserSubscription | null> {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('user_subscriptions')
            .select('*, plan:subscription_plans(*)')
            .eq('user_id', userId)
            .in('status', ['active', 'pending'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('Error fetching user subscription:', error);
            return null;
        }
        return data;
    },

    /**
     * Submit a manual payment request for a subscription
     */
    async submitManualRequest(userId: string, planId: string, method: string, trackingCode: string, notes?: string): Promise<{ success: boolean; error?: string }> {
        if (!supabase) return { success: false, error: 'Supabase client not initialized' };

        const { error } = await supabase
            .from('user_subscriptions')
            .insert({
                user_id: userId,
                plan_id: planId,
                status: 'pending',
                payment_method: method,
                payment_ref_id: trackingCode,
                payment_notes: notes,
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default 30 days
            });

        if (error) {
            console.error('Error submitting manual request:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    },

    /**
     * Admin: Get all pending subscription requests
     */
    async getPendingSubscriptions(): Promise<UserSubscription[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('user_subscriptions')
            .select('*, plan:subscription_plans(*), profile:profiles(*)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching pending subscriptions:', error);
            return [];
        }
        return data || [];
    },

    /**
     * Admin: Approve or Reject a subscription
     */
    async updateSubscriptionStatus(subscriptionId: string, status: 'active' | 'cancelled', notes?: string): Promise<{ success: boolean; error?: string }> {
        if (!supabase) return { success: false, error: 'Supabase client not initialized' };

        const updateData: any = { status };
        if (notes) updateData.payment_notes = notes;

        // If approving, we might want to reset the start/end dates to "now"
        if (status === 'active') {
            updateData.start_date = new Date().toISOString();
            updateData.end_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        }

        // 1. Get user_id first to update profile later
        const { data: subData } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('id', subscriptionId)
            .single();

        // 2. Update subscription status
        const { error: subError } = await supabase
            .from('user_subscriptions')
            .update(updateData)
            .eq('id', subscriptionId);

        if (subError) {
            console.error('Error updating subscription status:', subError);
            return { success: false, error: subError.message };
        }

        // 3. Update profile flag and add notification if approved
        if (status === 'active' && subData?.user_id) {
            // Fetch current metadata to avoid overwriting
            const { data: profile } = await supabase
                .from('profiles')
                .select('metadata')
                .eq('id', subData.user_id)
                .single();

            const metadata = (profile?.metadata as any) || {};
            const notifications = metadata.notifications || [];

            const newNotif = {
                id: `sub-active-${Date.now()}`,
                title: 'اشتراک شما فعال شد! 🎉',
                description: 'به جمع نگهبانان نخلستان خوش آمدید.',
                text: 'پرداخت شما تایید شد و هم‌اکنون تمام مزایای پلن انتخابی برای شما فعال است.',
                date: new Date().toISOString(),
                timestamp: new Date().toISOString(),
                read: false,
                isRead: false,
                type: 'success',
                icon: 'ShieldCheckIcon'
            };

            const updatedMetadata = {
                ...metadata,
                notifications: [newNotif, ...notifications]
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    is_monthly_subscriber: true,
                    metadata: updatedMetadata
                })
                .eq('id', subData.user_id);

            if (profileError) console.error('Error updating profile flag:', profileError);
        }

        return { success: true };
    }
};
