-- [SOURCE OF TRUTH] Based on User Report - 2026-01-04 (Normalized Schema Update)
-- MODIFIED: 2026-01-04 (E-commerce tables added with TEXT ID compatibility)

-- 1. CLEANUP (COMMENTED OUT TO PREVENT DATA LOSS)
-- WARNING: Uncomment these only if you want to WIPE all data and start fresh.
-- DROP TABLE IF EXISTS public.payments CASCADE;
-- DROP TABLE IF EXISTS public.order_items CASCADE;
-- DROP TABLE IF EXISTS public.cart CASCADE;
-- DROP TABLE IF EXISTS public.orders CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. PROFILES (Text ID for frontend compatibility)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY, 
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
    metadata JSONB DEFAULT '{}'::jsonb,
    plaque TEXT,
    floor TEXT
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY, -- Changed to TEXT to match project IDs like 'p3', 'p_heritage_iran'
    name TEXT NOT NULL,
    price BIGINT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    type TEXT DEFAULT 'physical',
    stock INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    popularity INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. ORDERS (Normalized)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    total_amount BIGINT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled')),
    items JSONB DEFAULT '[]'::jsonb, -- Legacy support
    status_history JSONB DEFAULT '[]'::jsonb,
    deeds JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'refunded')),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    bank_ref_id TEXT,
    payment_method TEXT
);

-- 7. CART (Persistent)
CREATE TABLE IF NOT EXISTS public.cart (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- 8. POSTS
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id TEXT REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    type TEXT DEFAULT 'timeline' CHECK (type IN ('timeline', 'article', 'news', 'vision')),
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL 
);

-- 9. AGENT TASKS
CREATE TABLE IF NOT EXISTS public.agent_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    result TEXT,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Update own profile" ON public.profiles;
CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Insert profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid()::text = id);
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE USING (auth.uid()::text = id);

-- Products Policies
DROP POLICY IF EXISTS "Public products" ON public.products;
CREATE POLICY "Public products" ON public.products FOR SELECT USING (true);

-- Orders Policies
DROP POLICY IF EXISTS "View own orders" ON public.orders;
DROP POLICY IF EXISTS "Insert own orders" ON public.orders;
CREATE POLICY "View own orders" ON public.orders FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Cart Policies
DROP POLICY IF EXISTS "Users can handle own cart" ON public.cart;
CREATE POLICY "Users can handle own cart" ON public.cart FOR ALL USING (auth.uid()::text = user_id);

-- 11. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON public.cart(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 12. INITIAL DATA
-- Note: Already handled in DB, but documented here for truth.