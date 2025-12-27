-- =====================================================
-- MANAPALM - FIX PRODUCT PERSISTENCE
-- Run this in Supabase SQL Editor
-- Date: 2025-12-27
-- =====================================================

-- 1. Change products.id from UUID to TEXT to match frontend IDs
-- This allows IDs like 'p_heritage_memorial' instead of UUIDs only
ALTER TABLE public.products ALTER COLUMN id TYPE TEXT;

-- 2. Remove restrictive category constraint to allow Persian names
-- The old constraint only allowed English category names
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;

-- 3. Ensure admin profile exists for the test user
-- This is required because RLS policies check for is_admin = true
INSERT INTO public.profiles (id, email, phone, full_name, is_admin)
VALUES ('user_test_manapalm', 'test@manapalm.com', '09222453571', 'کاربر تست (توسعه)', true)
ON CONFLICT (id) DO UPDATE SET is_admin = true;

-- 4. Add is_active column if missing (used by frontend)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 5. [OPTIONAL] Verify the changes worked
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products';
