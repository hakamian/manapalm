-- 20260212140000_profile_subscriber_flag.sql
-- Description: Adds is_monthly_subscriber flag to profiles table.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_monthly_subscriber BOOLEAN DEFAULT FALSE;
