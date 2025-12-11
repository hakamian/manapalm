# 🚀 راهنمای تنظیم Environment Variables در Vercel

**تاریخ:** 2025-12-11 12:56  
**وضعیت:** آماده برای تنظیم

---

## 📋 کلیدهای شما

من کلیدهای زیر را برای شما آماده کردم:

### 1. Supabase
```
VITE_SUPABASE_URL=https://sbjrayzghjfsmmuygwbw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNianJheXpnaGpmc21tdXlnd2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3MjU2NzgsImV4cCI6MjA0OTMwMTY3OH0.A7_rHrRypeOVpMKyEDEd2w_x_msAcBi1QBbPQmRYdJU
```

### 2. Gemini AI
```
GEMINI_API_KEY=AIzaSyDwWhL4B3QB0M4HxyPh-h0wQlg-ISgXVVk
```

### 3. ZarinPal (Sandbox)
```
ZARINPAL_MERCHANT_ID=00000000-0000-0000-0000-000000000000
ZARINPAL_SANDBOX=true
```

---

## 🔧 مراحل تنظیم در Vercel

### گام 1: ورود به Vercel Dashboard

1. به https://vercel.com/dashboard بروید
2. پروژه `manapalm` را پیدا و باز کنید

---

### گام 2: رفتن به تنظیمات

1. روی **"Settings"** کلیک کنید
2. از منوی چپ، روی **"Environment Variables"** کلیک کنید

---

### گام 3: اضافه کردن متغیرها

برای **هر یک** از متغیرهای زیر:

1. روی **"Add New"** کلیک کنید
2. در فیلد **"Key"**، نام متغیر را وارد کنید
3. در فیلد **"Value"**، مقدار را کپی و پیست کنید
4. در بخش **"Environment"**، **همه** را انتخاب کنید:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. روی **"Save"** کلیک کنید

**متغیرهایی که باید اضافه کنید:**

```
Key: VITE_SUPABASE_URL
Value: https://sbjrayzghjfsmmuygwbw.supabase.co

Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNianJheXpnaGpmc21tdXlnd2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3MjU2NzgsImV4cCI6MjA0OTMwMTY3OH0.A7_rHrRypeOVpMKyEDEd2w_x_msAcBi1QBbPQmRYdJU

Key: GEMINI_API_KEY
Value: AIzaSyDwWhL4B3QB0M4HxyPh-h0wQlg-ISgXVVk

Key: ZARINPAL_MERCHANT_ID
Value: 00000000-0000-0000-0000-000000000000

Key: ZARINPAL_SANDBOX
Value: true
```

---

### گام 4: Redeploy پروژه

بعد از اضافه کردن **تمام** متغیرها:

1. به تب **"Deployments"** بروید
2. روی آخرین Deployment کلیک کنید
3. روی منوی **"..."** (سه نقطه) کلیک کنید
4. روی **"Redeploy"** کلیک کنید
5. منتظر بمانید تا Deploy تکمیل شود (2-3 دقیقه)

---

## ✅ تست اتصال

بعد از Redeploy، سایت خود را باز کنید و:

1. F12 را بزنید (Developer Tools)
2. به تب **Console** بروید
3. این کد را اجرا کنید:

```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Keys configured:', {
  supabase: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  gemini: !!import.meta.env.VITE_GEMINI_API_KEY
});
```

**نتیجه مورد انتظار:**
```
Supabase URL: https://sbjrayzghjfsmmuygwbw.supabase.co
Keys configured: { supabase: true, gemini: true }
```

---

## 📝 نکته مهم

فایل `.env` در پروژه محلی شما نیز آپدیت شده است. اگر می‌خواهید Local اجرا کنید:

```bash
npm run dev
```

همه چیز باید کار کند! 🌴

---

## ⏭️ مرحله بعدی

بعد از تنظیم موفق:
- ✅ Task 2.1 تکمیل می‌شود
- ⏭️ Task 3.1: تست End-to-End (فلو خرید)
