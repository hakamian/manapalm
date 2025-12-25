-- [SOURCE OF TRUTH] Based on User Report - 2025-12-10
-- MODIFIED: 2025-12-25 (Safe Mode update)

-- 1. CLEANUP (COMMENTED OUT TO PREVENT DATA LOSS)
-- WARNING: Uncomment these only if you want to WIPE all data and start fresh.
-- DROP TABLE IF EXISTS public.reviews;
-- DROP TABLE IF EXISTS public.timeline_events;
-- DROP TABLE IF EXISTS public.orders;
-- DROP TABLE IF EXISTS public.posts;
-- DROP TABLE IF EXISTS public.agent_tasks;
-- DROP TABLE IF EXISTS public.products CASCADE; -- Added CASCADE just in case
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
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Date Syrup', 'Palm Handicrafts', 'Workshops', 'Tours', 'Adoption')),
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    type TEXT DEFAULT 'physical',
    stock INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    popularity INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}'
);

-- 4. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id),
    total_amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. POSTS
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id TEXT REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    type TEXT DEFAULT 'timeline' CHECK (type IN ('timeline', 'article', 'news', 'vision')),
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL 
);

-- 6. AGENT TASKS
CREATE TABLE IF NOT EXISTS public.agent_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    result TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Reset Profiles Policies
DROP POLICY IF EXISTS "Public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Update own profile" ON public.profiles;

CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Insert profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid()::text = id);
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE USING (auth.uid()::text = id);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Reset Products Policies
DROP POLICY IF EXISTS "Public products" ON public.products;
DROP POLICY IF EXISTS "Admin insert products" ON public.products;
DROP POLICY IF EXISTS "Admin update products" ON public.products;
DROP POLICY IF EXISTS "Admin delete products" ON public.products;

CREATE POLICY "Public products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin insert products" ON public.products FOR INSERT WITH CHECK (
  auth.uid()::text IN (SELECT id FROM public.profiles WHERE is_admin = true)
);
CREATE POLICY "Admin update products" ON public.products FOR UPDATE USING (
  auth.uid()::text IN (SELECT id FROM public.profiles WHERE is_admin = true)
);
CREATE POLICY "Admin delete products" ON public.products FOR DELETE USING (
  auth.uid()::text IN (SELECT id FROM public.profiles WHERE is_admin = true)
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Reset Orders Policies
DROP POLICY IF EXISTS "View own orders" ON public.orders;
DROP POLICY IF EXISTS "Insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Admin view all orders" ON public.orders;

CREATE POLICY "View own orders" ON public.orders FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Admin view all orders" ON public.orders FOR SELECT USING (
  auth.uid()::text IN (SELECT id FROM public.profiles WHERE is_admin = true)
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Reset Posts Policies
DROP POLICY IF EXISTS "Public posts" ON public.posts;
DROP POLICY IF EXISTS "Insert posts" ON public.posts;
DROP POLICY IF EXISTS "Author update posts" ON public.posts;

CREATE POLICY "Public posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Insert posts" ON public.posts FOR INSERT WITH CHECK (auth.uid()::text = author_id);
CREATE POLICY "Author update posts" ON public.posts FOR UPDATE USING (auth.uid()::text = author_id);

ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;

-- Reset Agent Tasks Policies (Critical Fix)
DROP POLICY IF EXISTS "Agent tasks public" ON public.agent_tasks;
DROP POLICY IF EXISTS "Admin only agent tasks" ON public.agent_tasks;

CREATE POLICY "Admin only agent tasks" ON public.agent_tasks FOR ALL USING (
  auth.uid()::text IN (SELECT id FROM public.profiles WHERE is_admin = true)
);

-- 7.1 PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 8. INITIAL DATA
INSERT INTO public.products (id, name, price, category, image_url, description, type, stock, points, popularity, tags)
VALUES 
('p_contribution_sapling', 'سهم در نهال‌کاری (نهال امید)', 200000, 'نخل میراث', 'https://images.unsplash.com/photo-1530968464165-7a1861cbaf9f?auto=format&fit=crop&w=800&q=80', 'یک شروع کوچک برای تاثیری بزرگ...', 'physical', 9999, 1000, 98, ARRAY['community', 'starter']),
('p_heritage_meaning', 'نخل معنا', 30000000, 'نخل میراث', 'https://images.unsplash.com/photo-1512428559087-560fa5ce7d87?auto=format&fit=crop&w=1000&q=80', 'کاشت نخلی برای یافتن و بزرگداشت معنای شخصی زندگی.', 'physical', 10, 150000, 100, ARRAY['growth', 'self-discovery']),
('p_heritage_iran', 'نخل ایران', 9000000, 'نخل میراث', 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1765110314/aerial-view_vwdbw2.png', 'برای سربلندی و آبادانی ایران...', 'physical', 50, 45000, 95, ARRAY['community', 'patriotism']),
('p3', 'خرمای شکلاتی لوکس', 150000, 'محصولات خرما', 'https://images.unsplash.com/photo-1607361869848-6a56e2978370?auto=format&fit=crop&w=800&q=80', 'ترکیبی بی‌نظیر از خرمای شیرین و شکلات تلخ بلژیکی.', 'physical', 3, 300, 85, ARRAY['gratitude']),
('p_ambassador_pack', 'بسته سفیر', 50000, 'ارتقا', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop', 'قابلیت «سفیر قصه‌گو» را فعال کنید.', 'service', 999, 100, 100, ARRAY['community', 'creativity'])
ON CONFLICT (id) DO NOTHING;


-- === PART 2: ADVANCED FEATURES (LMS, Crowdfund) ===

-- 1. Impact Categories
create table if not exists public.impact_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  icon text
);
alter table impact_categories enable row level security;
DROP POLICY IF EXISTS "Public Read IC" ON impact_categories;
create policy "Public Read IC" on impact_categories for select using (true);

-- 2. Smart Installments
create table if not exists public.payment_plans (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  months int not null,
  interest_rate decimal(5,2) default 0,
  min_user_level text default 'Jovane',
  is_active boolean default true
);
alter table payment_plans enable row level security;
DROP POLICY IF EXISTS "Public Read PP" ON payment_plans;
create policy "Public Read PP" on payment_plans for select using (true);

-- 3. Crowdfunding (Using TEXT for creator_id and product_id)
create table if not exists public.crowdfunds (
  id uuid default gen_random_uuid() primary key,
  creator_id text references public.profiles(id) not null,
  product_id text references public.products(id) not null,
  target_amount decimal(10,2) not null,
  collected_amount decimal(10,2) default 0,
  expiry_date timestamp with time zone not null,
  status text default 'active' check (status in ('active', 'completed', 'expired')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table crowdfunds enable row level security;
DROP POLICY IF EXISTS "Public Read CF" ON crowdfunds;
create policy "Public Read CF" on crowdfunds for select using (true);

create table if not exists public.crowdfund_contributors (
  id uuid default gen_random_uuid() primary key,
  crowdfund_id uuid references public.crowdfunds(id) not null,
  contributor_name text,
  amount decimal(10,2) not null,
  message text,
  payment_ref text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table crowdfund_contributors enable row level security;
DROP POLICY IF EXISTS "Public Read CFC" ON crowdfund_contributors;
create policy "Public Read CFC" on crowdfund_contributors for select using (true);

-- 4. LMS System (Hoshmana Academy)
create table if not exists public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text,
  impact_category_id uuid references public.impact_categories(id),
  instructor_name text,
  level text default 'beginner',
  duration_minutes int default 0,
  points_reward int default 10,
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table courses enable row level security;
DROP POLICY IF EXISTS "Public Read C" ON courses;
create policy "Public Read C" on courses for select using (true);

create table if not exists public.course_modules (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) not null,
  title text not null,
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table course_modules enable row level security;
DROP POLICY IF EXISTS "Public Read CM" ON course_modules;
create policy "Public Read CM" on course_modules for select using (true);

create table if not exists public.lessons (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references public.course_modules(id) not null,
  title text not null,
  content_type text default 'video' check (content_type in ('video', 'article', 'quiz')),
  video_url text,
  article_body text,
  quiz_data jsonb,
  duration_minutes int default 5,
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table lessons enable row level security;
DROP POLICY IF EXISTS "Public Read L" ON lessons;
create policy "Public Read L" on lessons for select using (true);

create table if not exists public.enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id text references public.profiles(id) not null, 
  course_id uuid references public.courses(id) not null,
  progress_percentage int default 0,
  last_lesson_id uuid references public.lessons(id),
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, course_id)
);
alter table enrollments enable row level security;

DROP POLICY IF EXISTS "User View Own E" ON enrollments;
CREATE POLICY "User View Own E" ON enrollments FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "User Insert Own E" ON enrollments;
CREATE POLICY "User Insert Own E" ON enrollments FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "User Update Own E" ON enrollments;
CREATE POLICY "User Update Own E" ON enrollments FOR UPDATE USING (auth.uid()::text = user_id);