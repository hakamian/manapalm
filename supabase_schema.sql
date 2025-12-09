-- 1. پاکسازی کامل جدول‌های قدیمی (به ترتیب وابستگی)
DROP TABLE IF EXISTS public.reviews;
DROP TABLE IF EXISTS public.timeline_events;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.posts;
DROP TABLE IF EXISTS public.agent_tasks;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.profiles;

-- 2. ساخت جدول پروفایل‌ها (کاربران) با شناسه متنی
CREATE TABLE public.profiles (
    id TEXT PRIMARY KEY, -- شناسه متنی برای سازگاری با فرانت‌اند
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

-- 3. ساخت جدول محصولات
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

-- 4. ساخت جدول سفارش‌ها
CREATE TABLE public.orders (
    id TEXT PRIMARY KEY,
    user_id TEXT, -- رفرنس اختیاری برای سازگاری با کاربران مهمان یا تست
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'ثبت شده',
    items JSONB DEFAULT '[]'::jsonb,
    status_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ساخت جدول پست‌ها (کانون)
CREATE TABLE public.posts (
    id TEXT PRIMARY KEY,
    author_id TEXT REFERENCES public.profiles(id),
    content TEXT,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ساخت جدول تسک‌های ایجنت
CREATE TABLE public.agent_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    payload JSONB,
    result TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. فعال‌سازی امنیت (RLS) - برای سادگی فعلا دسترسی همگانی باز است
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

-- 8. ورود داده‌های اولیه (محصولات)
INSERT INTO public.products (id, name, price, category, image_url, description, type, stock, points, popularity, tags)
VALUES 
('p_contribution_sapling', 'سهم در نهال‌کاری (نهال امید)', 200000, 'نخل میراث', 'https://images.unsplash.com/photo-1530968464165-7a1861cbaf9f?auto=format&fit=crop&w=800&q=80', 'یک شروع کوچک برای تاثیری بزرگ...', 'physical', 9999, 1000, 98, ARRAY['community', 'starter']),
('p_heritage_meaning', 'نخل معنا', 30000000, 'نخل میراث', 'https://images.unsplash.com/photo-1512428559087-560fa5ce7d87?auto=format&fit=crop&w=1000&q=80', 'کاشت نخلی برای یافتن و بزرگداشت معنای شخصی زندگی.', 'physical', 10, 150000, 100, ARRAY['growth', 'self-discovery']),
('p_heritage_iran', 'نخل ایران', 9000000, 'نخل میراث', 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1765110314/aerial-view_vwdbw2.png', 'برای سربلندی و آبادانی ایران...', 'physical', 50, 45000, 95, ARRAY['community', 'patriotism']),
('p3', 'خرمای شکلاتی لوکس', 150000, 'محصولات خرما', 'https://images.unsplash.com/photo-1607361869848-6a56e2978370?auto=format&fit=crop&w=800&q=80', 'ترکیبی بی‌نظیر از خرمای شیرین و شکلات تلخ بلژیکی.', 'physical', 3, 300, 85, ARRAY['gratitude']),
('p_ambassador_pack', 'بسته سفیر', 50000, 'ارتقا', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop', 'قابلیت «سفیر قصه‌گو» را فعال کنید.', 'service', 999, 100, 100, ARRAY['community', 'creativity']);
