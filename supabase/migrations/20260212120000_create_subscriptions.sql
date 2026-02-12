-- 20260212_create_subscriptions.sql
-- Description: Adds support for the "Grove Guardian" subscription model.
-- Fixes: Adds missing `is_admin` function and handles UUID types correctly.

-- 0. Create Helper Function: is_admin()
-- This checks if a user is an admin based on the 'profiles' table.
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id::text  -- profiles.id is TEXT, user_id is UUID
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Create the `subscription_plans` table (Admin managed)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- e.g., 'Seedling', 'Guardian', 'Forest Maker'
    description TEXT,
    price_irr BIGINT NOT NULL, -- Price in Rials
    duration_days INT NOT NULL DEFAULT 30, -- 30 days for monthly
    features JSONB DEFAULT '[]'::JSONB, -- List of features (e.g., "Monthly Report", "5% Discount")
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the `user_subscriptions` table (User active plans)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE RESTRICT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('active', 'expired', 'cancelled')) DEFAULT 'active',
    auto_renew BOOLEAN DEFAULT false,
    payment_ref_id TEXT, -- Reference to the payment transaction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Policies for `subscription_plans`
-- Everyone can view active plans
DROP POLICY IF EXISTS "Everyone can view active plans" ON public.subscription_plans;
CREATE POLICY "Everyone can view active plans" 
ON public.subscription_plans FOR SELECT 
USING (is_active = true);

-- Only admins can manage plans
DROP POLICY IF EXISTS "Admins can manage plans" ON public.subscription_plans;
CREATE POLICY "Admins can manage plans" 
ON public.subscription_plans FOR ALL 
USING (public.is_admin(auth.uid()));

-- 5. Policies for `user_subscriptions`
-- Users can view their own subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscriptions" 
ON public.user_subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all subscriptions
DROP POLICY IF EXISTS "Admins can view all user subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can view all user subscriptions" 
ON public.user_subscriptions FOR SELECT 
USING (public.is_admin(auth.uid()));

-- 6. Insert Default Plans (Seed Data)
INSERT INTO public.subscription_plans (name, description, price_irr, features)
SELECT 'Seedling (نهال)', 'Starter plan for new guardians.', 500000, '["Monthly Impact Report", "Digital Badge"]'
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Seedling (نهال)');

INSERT INTO public.subscription_plans (name, description, price_irr, features)
SELECT 'Sapling (نخل جوان)', 'Standard guardianship.', 1500000, '["Monthly Impact Report", "5% Store Discount", "Digital Badge"]'
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Sapling (نخل جوان)');

INSERT INTO public.subscription_plans (name, description, price_irr, features)
SELECT 'Palm (نخل بارور)', 'Elite guardianship and forest maker.', 5000000, '["Monthly Impact Report", "15% Store Discount", "Physical Certificate", "Digital Badge"]'
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Palm (نخل بارور)');
