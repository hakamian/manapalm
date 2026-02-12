// types/subscription.ts

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price_irr: number;
    duration_days: number;
    features: string[];
    is_active: boolean;
    created_at: string;
}

export interface UserSubscription {
    id: string;
    user_id: string;
    plan_id: string;
    start_date: string;
    end_date: string;
    status: SubscriptionStatus;
    auto_renew: boolean;
    payment_ref_id?: string;
    payment_method?: string;
    payment_notes?: string;
    created_at: string;
    plan?: SubscriptionPlan; // Joined data
    profile?: {
        fullName: string;
        phone: string;
        email: string;
    };
}
