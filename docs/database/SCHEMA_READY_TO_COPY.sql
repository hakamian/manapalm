-- ✅ Nakhlestan Ma'na Database Schema (CLEANED VERSION)
-- تاریخ: 2025-12-11
-- وضعیت: آماده برای اجرا در Supabase

-- ========================================
-- 1. PROFILES (پروفایل کاربران)
-- ========================================
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin', 'mentor')),
  
  -- Gamification Stats
  points int default 0,
  mana_points int default 0,
  level text default 'Jovane',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================
-- 2. IMPACT CATEGORIES (دسته‌بندی تأثیرات)
-- ========================================
create table public.impact_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  icon text
);

-- ========================================
-- 3. PRODUCTS (محصولات)
-- ========================================
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  category text check (category in ('physical', 'digital', 'donation', 'service')),
  
  impact_category_id uuid references public.impact_categories(id),
  impact_value int default 1,
  impact_unit text default 'unit',
  
  stock int default 100,
  is_active boolean default true,
  allowed_payment_plans uuid[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================
-- 4. ORDERS (سفارشات)
-- ========================================
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  status text default 'pending' check (status in ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
  total_amount decimal(10,2) not null,
  payment_ref text,
  type text default 'standard' check (type in ('standard', 'installment', 'crowdfund')),
  payment_plan_id uuid references public.payment_plans(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) not null,
  product_id uuid references public.products(id) not null,
  quantity int default 1,
  price_at_purchase decimal(10,2) not null
);

-- ========================================
-- 5. USER IMPACT LOGS (لاگ تأثیرات کاربر)
-- ========================================
create table public.user_impact_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  
  source_type text check (source_type in ('order', 'course_completion', 'daily_quest', 'direct_action')),
  source_id uuid,
  
  impact_category_id uuid references public.impact_categories(id),
  impact_amount int not null,
  description text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================
-- 6. PAYMENT PLANS (طرح‌های اقساط)
-- ========================================
create table public.payment_plans (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  months int not null,
  interest_rate decimal(5,2) default 0,
  min_user_level text default 'Jovane',
  is_active boolean default true
);

-- ========================================
-- 7. CROWDFUNDING (کرادفاندینگ)
-- ========================================
create table public.crowdfunds (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references public.profiles(id) not null,
  product_id uuid references public.products(id) not null,
  target_amount decimal(10,2) not null,
  collected_amount decimal(10,2) default 0,
  expiry_date timestamp with time zone not null,
  status text default 'active' check (status in ('active', 'completed', 'expired')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.crowdfund_contributors (
  id uuid default gen_random_uuid() primary key,
  crowdfund_id uuid references public.crowdfunds(id) not null,
  contributor_name text,
  amount decimal(10,2) not null,
  message text,
  payment_ref text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================
-- 8. LMS - COURSES (دوره‌های آموزشی)
-- ========================================
create table public.courses (
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

create table public.course_modules (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) not null,
  title text not null,
  order_index int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.lessons (
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

create table public.enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  course_id uuid references public.courses(id) not null,
  progress_percentage int default 0,
  last_lesson_id uuid references public.lessons(id),
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, course_id)
);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS
alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table user_impact_logs enable row level security;
alter table courses enable row level security;
alter table course_modules enable row level security;
alter table lessons enable row level security;
alter table enrollments enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Products Policies
create policy "Products are viewable by everyone." on products for select using (true);

-- Orders Policies
create policy "Users can view own orders." on orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders." on orders for insert with check (auth.uid() = user_id);

-- Order Items Policies
create policy "Users can view own order items" on order_items for select using (
  exists ( select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid() )
);

create policy "Users can insert own order items" on order_items for insert with check (
   exists ( select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid() )
);

-- Impact Logs Policies
create policy "Users can view own impact." on user_impact_logs for select using (auth.uid() = user_id);

-- LMS Policies
create policy "Courses are viewable by everyone." on courses for select using (true);
create policy "Modules are viewable by everyone." on course_modules for select using (true);
create policy "Lessons are viewable by everyone." on lessons for select using (true);
create policy "Users can view own enrollments." on enrollments for select using (auth.uid() = user_id);
create policy "Users can insert own enrollments." on enrollments for insert with check (auth.uid() = user_id);
create policy "Users can update own enrollments." on enrollments for update using (auth.uid() = user_id);

-- ✅ SCHEMA READY FOR DEPLOYMENT
