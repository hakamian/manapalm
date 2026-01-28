-- Nakhlestan Ma'na - SMS OTP Table
-- To be run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.otps (
    mobile TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Security)
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;

-- Note: No public policies needed as this is managed via Service Role in API routes.
-- Only the admin/service_role can read/write this table.
