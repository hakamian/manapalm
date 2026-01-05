-- [SOURCE OF TRUTH] Unified Meaning OS - Database Schema v2.1
-- DATE: 2026-01-04
-- GOAL: Clean relational structure with JSONB flexibility for rapid iteration.

-- 1. CLEANUP (WIPE EXISTING TABLES, TRIGGERS & FUNCTIONS FOR FULL RECONFIG)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public') 
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON public.' || r.event_object_table || ' CASCADE;';
    END LOOP;
END $$;

DROP FUNCTION IF EXISTS public.notify_profile_change CASCADE;
DROP FUNCTION IF EXISTS public.send_sms_on_profile_update CASCADE;

DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.cart CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.agent_tasks CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;

-- 2. PROFILES
-- Stores core identity and gamification stats.
-- Note: 'address', 'plaque', 'floor' removed to use 'metadata.addresses' as the source of truth.
CREATE TABLE public.profiles (
    id TEXT PRIMARY KEY, -- Matches Supabase Auth User ID
    email TEXT,
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
        "messages": [],
        "recentViews": [],
        "timeline": [],
        "coursePersonalizations": {},
        "discReport": null
    }'::jsonb
);

-- 3. PRODUCTS
CREATE TABLE public.products (
    id TEXT PRIMARY KEY, -- Supports custom IDs like 'p_heritage_iran'
    name TEXT NOT NULL,
    price BIGINT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    description TEXT,
    type TEXT DEFAULT 'physical', -- 'physical', 'digital', 'heritage', 'service'
    stock INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    popularity INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. ORDERS
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    total_amount BIGINT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled')),
    items JSONB DEFAULT '[]'::jsonb, -- Snapshot of products at purchase
    status_history JSONB DEFAULT '[]'::jsonb,
    deeds JSONB DEFAULT '[]'::jsonb, -- Relational impact items (palms etc)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. ORDER ITEMS (Strict normalization for reporting)
CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PAYMENTS
CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'refunded')),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    bank_ref_id TEXT,
    payment_method TEXT DEFAULT 'online'
);

-- 7. CART (Server-side persistence)
CREATE TABLE public.cart (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- 8. POSTS (Community & Timeline)
CREATE TABLE public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id TEXT REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    type TEXT DEFAULT 'timeline' CHECK (type IN ('timeline', 'article', 'news', 'vision')),
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL 
);

-- 9. AGENT TASKS (Executive OS Queue)
CREATE TABLE public.agent_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    result TEXT,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. SECURITY (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;

-- 🛡️ Profiles Policies: Public can see profiles, users can only update their own.
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid()::text = id);

-- 🛡️ Products Policies: Viewable by everyone.
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

-- 🛡️ Orders Policies: Users can see/insert only their own orders.
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 🛡️ Cart Policies: Purely private per user.
CREATE POLICY "Users can manage own cart" ON public.cart FOR ALL USING (auth.uid()::text = user_id);

-- 🛡️ Posts Policies: Publicly viewable, owners can manage.
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert posts" ON public.posts FOR INSERT WITH CHECK (auth.uid()::text = author_id);

-- 11. INDEXES (Optimized for performance)
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_cart_user_id ON public.cart(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_posts_type ON public.posts(type);

-- 12. SEED DATA (CORE PRODUCTS)
INSERT INTO public.products (id, name, price, category, type, description, stock, points)
VALUES 
('p_heritage_iran', 'نخل میراث ایران', 2500000, 'heritage', 'heritage', 'کاشت نخل به نام شما در نخلستان‌های ایران.', 999, 500),
('p_meaning_compass', 'قطب‌نمای معنا', 50000, 'digital', 'digital', 'دستیار هوشمند برای یافتن معنای زندگی.', 9999, 100)
ON CONFLICT (id) DO NOTHING;