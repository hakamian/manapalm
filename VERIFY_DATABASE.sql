-- ✅ VERIFICATION SCRIPT - بررسی وضعیت دیتابیس
-- این اسکریپت وضعیت جداول موجود را بررسی می‌کند

-- 1. لیست تمام جداول
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. تعداد رکوردها در هر جدول
SELECT 
  'profiles' as table_name, 
  COUNT(*) as row_count 
FROM profiles
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'impact_categories', COUNT(*) FROM impact_categories
UNION ALL
SELECT 'payment_plans', COUNT(*) FROM payment_plans
UNION ALL
SELECT 'crowdfunds', COUNT(*) FROM crowdfunds;

-- 3. بررسی RLS (Row Level Security)
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. لیست پالیسی‌های RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ✅ اگر این کوئری‌ها بدون خطا اجرا شدند، یعنی دیتابیس شما آماده است!
