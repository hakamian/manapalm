-- ==========================================
-- 1. پاکسازی و آماده‌سازی (Reset)
-- ==========================================

-- حذف توابع و تریگرهای قبلی برای جلوگیری از تضاد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ==========================================
-- 2. ساخت جداول اصلی (Tables)
-- ==========================================

-- جدول پروفایل کاربران (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  
  -- سیستم امتیازدهی و سطح
  points BIGINT DEFAULT 100,      -- امتیاز برکت (Activity)
  mana_points BIGINT DEFAULT 50,  -- امتیاز معنا (Wisdom/Currency)
  level TEXT DEFAULT 'جوانه',
  
  -- نقش‌ها و دسترسی‌ها
  is_admin BOOLEAN DEFAULT FALSE,
  is_guardian BOOLEAN DEFAULT FALSE,
  is_grove_keeper BOOLEAN DEFAULT FALSE,
  is_monthly_subscriber BOOLEAN DEFAULT FALSE,
  
  -- داده‌های تکمیلی (به صورت JSON برای انعطاف‌پذیری)
  metadata JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- جدول محصولات (Products)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY, -- شناسه دستی مثل 'p_heritage_meaning'
  name TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  category TEXT, -- 'نخل میراث', 'آکادمی', 'خدمات'
  type TEXT DEFAULT 'physical', -- 'physical', 'digital', 'service'
  image_url TEXT,
  stock INT DEFAULT 999,
  points INT DEFAULT 0, -- امتیازی که با خرید داده می‌شود
  
  -- ویژگی‌های خاص
  tags TEXT[] DEFAULT '{}',
  download_url TEXT, -- برای محصولات دیجیتال
  file_type TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- جدول سفارشات (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  
  total_amount BIGINT NOT NULL,
  status TEXT DEFAULT 'ثبت شده', -- 'پرداخت شده', 'ارسال شده', 'لغو شده'
  
  items JSONB NOT NULL, -- آرایه‌ای از آیتم‌های سبد خرید
  status_history JSONB DEFAULT '[]'::JSONB, -- تاریخچه تغییر وضعیت
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- جدول اسناد نخل (Deeds) - شناسنامه‌های کاشت
CREATE TABLE IF NOT EXISTS public.deeds (
  id TEXT PRIMARY KEY, -- شناسه سند
  user_id UUID REFERENCES public.profiles(id), -- صاحب سند (می‌تواند نال باشد اگر هدیه باشد و هنوز Claim نشده)
  order_id UUID REFERENCES public.orders(id),
  
  palm_type TEXT NOT NULL,
  intention TEXT, -- نیت کاشت
  recipient_name TEXT, -- به نام چه کسی
  message TEXT, -- پیام تقدیمی
  
  -- وضعیت کاشت فیزیکی
  is_planted BOOLEAN DEFAULT FALSE,
  planted_at TIMESTAMP WITH TIME ZONE,
  planted_photo_url TEXT,
  gps_lat FLOAT,
  gps_long FLOAT,
  grove_keeper_id UUID REFERENCES public.profiles(id), -- چه کسی کاشته است
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- جدول پست‌های کانون (Community Posts)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  
  is_pinned BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE, -- برای مدیریت محتوا
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- جدول وظایف هوشمند (Agent Tasks) - برای کارخانه محتوا
CREATE TABLE IF NOT EXISTS public.agent_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'generate_article', 'analyze_sentiment', etc.
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  
  payload JSONB, -- داده‌های ورودی برای هوش مصنوعی
  result TEXT, -- خروجی هوش مصنوعی
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 3. تنظیمات امنیتی (Row Level Security)
-- ==========================================

-- فعال‌سازی RLS برای همه جداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;

-- سیاست‌های پروفایل
CREATE POLICY "پروفایل‌ها برای همه قابل خواندن هستند" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "کاربران فقط پروفایل خودشان را ویرایش می‌کنند" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- سیاست‌های محصولات
CREATE POLICY "محصولات برای همه قابل خواندن هستند" ON public.products FOR SELECT USING (true);
CREATE POLICY "فقط ادمین می‌تواند محصول اضافه/ویرایش کند" ON public.products FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- سیاست‌های سفارشات
CREATE POLICY "کاربران سفارشات خود را می‌بینند" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "کاربران می‌توانند سفارش ثبت کنند" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ادمین همه سفارشات را می‌بیند" ON public.orders FOR SELECT USING (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- سیاست‌های اسناد (Deeds)
CREATE POLICY "اسناد برای همه قابل مشاهده (تالار افتخارات)" ON public.deeds FOR SELECT USING (true);
CREATE POLICY "کاربران سند خود را ثبت می‌کنند" ON public.deeds FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "نخل‌داران می‌توانند وضعیت کاشت را آپدیت کنند" ON public.deeds FOR UPDATE USING (
  exists (select 1 from public.profiles where id = auth.uid() and (is_grove_keeper = true or is_admin = true))
);

-- سیاست‌های پست‌ها
CREATE POLICY "پست‌ها برای همه قابل خواندن" ON public.posts FOR SELECT USING (true);
CREATE POLICY "کاربران احراز شده می‌توانند پست بگذارند" ON public.posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- سیاست‌های وظایف هوشمند (Agent Tasks)
CREATE POLICY "فقط ادمین به وظایف هوشمند دسترسی دارد" ON public.agent_tasks FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- ==========================================
-- 4. تریگرها و توابع خودکار
-- ==========================================

-- تابع ساخت پروفایل هنگام ثبت‌نام (Supabase Auth Hook)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'کاربر جدید'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- اتصال تریگر به جدول کاربران Auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 5. داده‌های اولیه (Seed Data)
-- ==========================================

-- افزودن محصولات پیش‌فرض (اختیاری - اگر جدول خالی باشد)
INSERT INTO public.products (id, name, price, category, type, description, points)
VALUES 
  ('p_heritage_meaning', 'نخل معنا', 30000000, 'نخل میراث', 'physical', 'کاشت نخلی برای یافتن و بزرگداشت معنای شخصی زندگی.', 150000),
  ('p_heritage_memorial', 'نخل یادبود', 8900000, 'نخل میراث', 'physical', 'زنده نگه داشتن یاد و خاطره عزیزان.', 44500),
  ('p_companion_unlock', 'نخل آگاهی (همراه معنا)', 250000, 'ارتقا', 'service', 'فعال‌سازی دستیار صوتی هوشمند برای کوچینگ.', 1250)
ON CONFLICT (id) DO NOTHING;

-- Storage Bucket Setup (برای عکس‌های پروفایل و شواهد کاشت)
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', true) ON CONFLICT DO NOTHING;

-- سیاست دسترسی به عکس‌ها
CREATE POLICY "Public Access Images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Auth Upload Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Public Access Evidence" ON storage.objects FOR SELECT USING (bucket_id = 'evidence');
CREATE POLICY "Grove Keeper Upload Evidence" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'evidence' AND auth.role() = 'authenticated');
