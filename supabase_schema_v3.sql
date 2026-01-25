-- [SOURCE OF TRUTH] Nakhlestan Ma'na - Database Schema v3.1 (Fixed Types)
-- ROLE: Senior Database Architect (Supabase & PostgreSQL)

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Users)
-- Note: Re-syncing with existing TEXT ID structure
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY, -- Matches Supabase Auth User ID (Text format)
    email TEXT UNIQUE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    points INTEGER DEFAULT 0,
    mana_points INTEGER DEFAULT 0,
    level TEXT DEFAULT 'جوانه',
    is_admin BOOLEAN DEFAULT FALSE,
    is_guardian BOOLEAN DEFAULT FALSE,
    is_grove_keeper BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    metadata JSONB DEFAULT '{
        "addresses": [],
        "preferences": {}
    }'::jsonb
);

-- 2. COMMUNITIES (Groups)
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    avatar_url TEXT,
    creator_id TEXT REFERENCES public.profiles(id), -- Changed to TEXT
    total_impact_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price BIGINT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TREES
CREATE TABLE IF NOT EXISTS public.trees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tree_code TEXT UNIQUE NOT NULL,
    variety TEXT DEFAULT 'مضافتی',
    location_lat DECIMAL,
    location_lng DECIMAL,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'gifted', 'growing', 'memorial')),
    health_status TEXT DEFAULT 'healthy',
    last_photo_url TEXT,
    planted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. OCCASIONS
CREATE TABLE IF NOT EXISTS public.occasions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name_fa TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 6. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL, -- Changed to TEXT
    total_amount BIGINT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled')),
    payment_id TEXT,
    delivery_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TREE_GIFTS
CREATE TABLE IF NOT EXISTS public.tree_gifts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tree_id UUID REFERENCES public.trees(id) ON DELETE RESTRICT,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    donor_id TEXT REFERENCES public.profiles(id), -- Changed to TEXT
    recipient_name TEXT,
    recipient_phone TEXT,
    occasion_id UUID REFERENCES public.occasions(id),
    gift_message TEXT,
    gift_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    certificate_url TEXT,
    status TEXT DEFAULT 'pending'
);

-- 8. POINTS_LEDGER
CREATE TABLE IF NOT EXISTS public.points_ledger (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE, -- Changed to TEXT
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    order_id UUID REFERENCES public.orders(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 🛡️ SECURITY: Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- Profiles: Users see own, Admins see all
DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;
CREATE POLICY "Users can see own profile" ON public.profiles FOR SELECT USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid()::text = id);

-- Orders: Users see own
DROP POLICY IF EXISTS "Users can see own orders" ON public.orders;
CREATE POLICY "Users can see own orders" ON public.orders FOR SELECT USING (auth.uid()::text = user_id);

-- Tree Gifts: Donors can see their gifts
DROP POLICY IF EXISTS "Donors can see own tree gifts" ON public.tree_gifts;
CREATE POLICY "Donors can see own tree gifts" ON public.tree_gifts FOR SELECT USING (auth.uid()::text = donor_id);

-- General Visibility
DROP POLICY IF EXISTS "Public products view" ON public.products;
CREATE POLICY "Public products view" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public occasions view" ON public.occasions;
CREATE POLICY "Public occasions view" ON public.occasions FOR SELECT USING (true);

DROP POLICY IF EXISTS "All communities viewable" ON public.communities;
CREATE POLICY "All communities viewable" ON public.communities FOR SELECT USING (true);

-- 📊 INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_trees_status ON public.trees(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_tree_gifts_donor ON public.tree_gifts(donor_id);
CREATE INDEX IF NOT EXISTS idx_points_ledger_user ON public.points_ledger(user_id);

-- 📋 SEED BASIC DATA
INSERT INTO public.occasions (name_fa, name_en, icon) VALUES 
('تولد', 'Birthday', 'cake'),
('ازدواج', 'Marriage', 'heart'),
('یادبود', 'Memorial', 'church'),
('ارتقا شغلی', 'Promotion', 'trending-up'),
('فرزند آوری', 'New Born', 'baby')
ON CONFLICT DO NOTHING;
