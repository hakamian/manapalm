-- [SOURCE OF TRUTH] Based on User Report - 2025-12-10

-- 1. CLEANUP
DROP TABLE IF EXISTS public.reviews;
DROP TABLE IF EXISTS public.timeline_events;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.posts;
DROP TABLE IF EXISTS public.agent_tasks;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.profiles;

-- 2. PROFILES (Text ID for frontend compatibility)
CREATE TABLE public.profiles (
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
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    category TEXT,
    image_url TEXT,
    description TEXT,
    type TEXT, -- 'physical', 'digital', 'service'
    stock INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    popularity INTEGER DEFAULT 0,
    tags TEXT[],
    download_url TEXT,
    file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ORDERS
CREATE TABLE public.orders (
    id TEXT PRIMARY KEY,
    user_id TEXT, 
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'ثبت شده',
    items JSONB DEFAULT '[]'::jsonb,
    status_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. POSTS
CREATE TABLE public.posts (
    id TEXT PRIMARY KEY,
    author_id TEXT REFERENCES public.profiles(id),
    content TEXT,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. AGENT TASKS
CREATE TABLE public.agent_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    payload JSONB,
    result TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Update profiles" ON public.profiles FOR UPDATE USING (true);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin insert products" ON public.products FOR INSERT WITH CHECK (true);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Insert orders" ON public.orders FOR INSERT WITH CHECK (true);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Insert posts" ON public.posts FOR INSERT WITH CHECK (true);

ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agent tasks public" ON public.agent_tasks FOR ALL USING (true);

-- 8. INITIAL DATA
INSERT INTO public.products (id, name, price, category, image_url, description, type, stock, points, popularity, tags)
VALUES 
('p_contribution_sapling', 'سهم در نهال‌کاری (نهال امید)', 200000, 'نخل میراث', 'https://images.unsplash.com/photo-1530968464165-7a1861cbaf9f?auto=format&fit=crop&w=800&q=80', 'یک شروع کوچک برای تاثیری بزرگ...', 'physical', 9999, 1000, 98, ARRAY['community', 'starter']),
('p_heritage_meaning', 'نخل معنا', 30000000, 'نخل میراث', 'https://images.unsplash.com/photo-1512428559087-560fa5ce7d87?auto=format&fit=crop&w=1000&q=80', 'کاشت نخلی برای یافتن و بزرگداشت معنای شخصی زندگی.', 'physical', 10, 150000, 100, ARRAY['growth', 'self-discovery']),
('p_heritage_iran', 'نخل ایران', 9000000, 'نخل میراث', 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1765110314/aerial-view_vwdbw2.png', 'برای سربلندی و آبادانی ایران...', 'physical', 50, 45000, 95, ARRAY['community', 'patriotism']),
('p3', 'خرمای شکلاتی لوکس', 150000, 'محصولات خرما', 'https://images.unsplash.com/photo-1607361869848-6a56e2978370?auto=format&fit=crop&w=800&q=80', 'ترکیبی بی‌نظیر از خرمای شیرین و شکلات تلخ بلژیکی.', 'physical', 3, 300, 85, ARRAY['gratitude']),
('p_ambassador_pack', 'بسته سفیر', 50000, 'ارتقا', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop', 'قابلیت «سفیر قصه‌گو» را فعال کنید.', 'service', 999, 100, 100, ARRAY['community', 'creativity']);


-- === PART 2: ADVANCED FEATURES (LMS, Crowdfund) ===

-- 1. Impact Categories
create table if not exists public.impact_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  icon text
);
alter table impact_categories enable row level security;
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
create policy "Public Read C" on courses for select using (true);

create table if not exists public.course_modules (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) not null,
  title text not null,
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table course_modules enable row level security;
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
create policy "User View Own E" on enrollments for select using (auth.uid()::text = user_id);
create policy "User Insert Own E" on enrollments for insert with check (auth.uid()::text = user_id);
create policy "User Update Own E" on enrollments for update using (auth.uid()::text = user_id);