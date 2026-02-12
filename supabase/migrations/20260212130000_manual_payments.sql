-- 20260212130000_manual_payments.sql
-- Description: Adds support for manual payment tracking (Card transfer & Crypto)

DO $$ 
BEGIN
    -- 1. Update user_subscriptions status check
    -- We need to drop and recreate the constraint to add 'pending'
    ALTER TABLE public.user_subscriptions 
    DROP CONSTRAINT IF EXISTS user_subscriptions_status_check;

    ALTER TABLE public.user_subscriptions 
    ADD CONSTRAINT user_subscriptions_status_check 
    CHECK (status IN ('active', 'expired', 'cancelled', 'pending'));

    -- 2. Add columns to track manual payment details if needed
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='user_subscriptions' AND column_name='payment_method') THEN
        ALTER TABLE public.user_subscriptions ADD COLUMN payment_method TEXT DEFAULT 'online';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='user_subscriptions' AND column_name='payment_notes') THEN
        ALTER TABLE public.user_subscriptions ADD COLUMN payment_notes TEXT;
    END IF;

END $$;

-- 3. Update RLS policies for user_subscriptions to allow insertion by users
DROP POLICY IF EXISTS "Users can create own subscription request" ON public.user_subscriptions;
CREATE POLICY "Users can create own subscription request" 
ON public.user_subscriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);
