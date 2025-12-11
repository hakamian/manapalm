-- Nakhlestan Ma'na Database Schema
-- Focus: Impact-driven E-commerce & Gamification

-- 1. Profiles (Extends Auth.Users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin', 'mentor')),
  
  -- Gamification Stats
  points int default 0, -- "Barkat" (General XP)
  mana_points int default 0, -- "Mana" (Premium/Spirit Currency)
  level text default 'Jovane', -- "Sapling"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Impact Categories (The "Why")
-- e.g. 'Environment', 'Education', 'Poverty Alleviation'
create table public.impact_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  icon text -- Lucide icon name
);

-- 3. Products (The "What" to buy/fund)
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  category text check (category in ('physical', 'digital', 'donation', 'service')),
  
  -- The "Meaning" Link
  impact_category_id uuid references public.impact_categories(id),
  impact_value int default 1, -- How much "impact" this generates (e.g. 1 Tree, 1 Hour)
  impact_unit text default 'unit', -- 'tree', 'hour', 'meal'
  
  stock int default 100,
  is_active boolean default true,
  allowed_payment_plans uuid[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Orders (The Transaction)
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  status text default 'pending' check (status in ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
  total_amount decimal(10,2) not null,
  payment_ref text, -- Authority link or Transaction ID
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

-- 5. User Impact Log (The "Legacy")
-- Every meaningful action is recorded here to build the user's "Digital Garden"
create table public.user_impact_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  
  -- Source of impact (Buying a product, finishing a course, etc.)
  source_type text check (source_type in ('order', 'course_completion', 'daily_quest', 'direct_action')),
  source_id uuid, -- link to order_id or course_id
  
  -- Impact generated
  impact_category_id uuid references public.impact_categories(id),
  impact_amount int not null,
  description text, -- e.g. "Planted 1 Palm Tree via Order #123"
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table user_impact_logs enable row level security;

-- Basic Policies
-- (For MVP, readable by public, writable by owner/admin. Refine later.)
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

create policy "Products are viewable by everyone." on products for select using (true);

create policy "Users can view own orders." on orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders." on orders for insert with check (auth.uid() = user_id);

create policy "Users can view own impact." on user_impact_logs for select using (auth.uid() = user_id);

-- 6. Smart Installments
create table public.payment_plans (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  months int not null,
  interest_rate decimal(5,2) default 0,
  min_user_level text default 'Jovane', -- 'Jovane', 'Nahal', 'Derakht', 'Samar'
  is_active boolean default true
);

-- 7. Crowdfunding (Group Gifting)
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
  contributor_name text, -- Can be anonymous/guest
  amount decimal(10,2) not null,
  message text,
  payment_ref text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add Columns to Products
-- alter table public.products add column allowed_payment_plans uuid[];

-- Add Columns to Orders
-- alter table public.orders add column type text default 'standard' check (type in ('standard', 'installment', 'crowdfund'));
-- alter table public.orders add column payment_plan_id uuid references public.payment_plans(id);

-- RLS for new tables
alter table payment_plans enable row level security;
alter table crowdfunds enable row level security;
alter table crowdfund_contributors enable row level security;

create policy "Payment plans are public." on payment_plans for select using (true);
create policy "Crowdfunds are public." on crowdfunds for select using (true);
create policy "Contributors are viewable by public." on crowdfund_contributors for select using (true);

-- 8. LMS System (Hoshmana Academy)
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text,
  impact_category_id uuid references public.impact_categories(id),
  instructor_name text,
  level text default 'beginner', -- 'beginner', 'intermediate', 'advanced'
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
  quiz_data jsonb, -- { questions: [...] }
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

-- RLS for LMS
alter table courses enable row level security;
alter table course_modules enable row level security;
alter table lessons enable row level security;
alter table enrollments enable row level security;

create policy "Courses are viewable by everyone." on courses for select using (true);
create policy "Modules are viewable by everyone." on course_modules for select using (true);
create policy "Lessons are viewable by everyone." on lessons for select using (true);
create policy "Users can view own enrollments." on enrollments for select using (auth.uid() = user_id);
create policy "Users can insert own enrollments." on enrollments for insert with check (auth.uid() = user_id);
create policy "Users can update own enrollments." on enrollments for update using (auth.uid() = user_id);