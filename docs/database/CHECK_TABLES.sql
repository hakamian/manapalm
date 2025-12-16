-- کوئری ساده برای بررسی جداول موجود
-- این کوئری را در SQL Editor کپی و اجرا کنید

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
