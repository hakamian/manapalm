# 🚀 راهنمای تنظیم Environment Variables در Vercel

**تاریخ:** 2025-12-11 12:56  
**وضعیت:** آماده برای تنظیم

---

## 📋 کلیدهای مورد نیاز



- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

- **AI Providers:** `GEMINI_API_KEY`, `VITE_GEMINI_API_KEY`, `NEXT_PUBLIC_GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `API_KEY`

- **Media/CDN:** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

- **Payments:** `ZARINPAL_MERCHANT_ID`, `ZARINPAL_SANDBOX`



> ✅ تمام این متغیرها در `.env.example` لیست شده‌اند. کافی است فایل را به `.env.local` کپی و مقادیر واقعی را جایگزین کنید.



### نحوه دریافت مقادیر



1. **Supabase** → Dashboard → Settings → API → Project URL & anon/service keys

2. **Gemini** → [Google AI Studio](https://aistudio.google.com/apikey) → Create API Key

3. **OpenRouter/OpenAI** → داشبورد مربوطه

4. **Cloudinary** → Dashboard → Programmable Media → API Keys

5. **ZarinPal** → Sandbox (کد صفر) یا Merchant واقعی از داشبورد پرداخت‌یار



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

Key: NEXT_PUBLIC_SUPABASE_URL          → https://sbjrayzghjfsmmuygwbw.supabase.co

Key: NEXT_PUBLIC_SUPABASE_ANON_KEY     → <Supabase anon key>

Key: VITE_SUPABASE_URL                 → https://sbjrayzghjfsmmuygwbw.supabase.co

Key: VITE_SUPABASE_ANON_KEY            → <Supabase anon key>

Key: SUPABASE_SERVICE_ROLE_KEY         → <Supabase service role key> (Server-only)



Key: GEMINI_API_KEY                    → <Server-side Gemini key>

Key: VITE_GEMINI_API_KEY               → <Client Gemini key for local dev>

Key: NEXT_PUBLIC_GEMINI_API_KEY        → <Client Gemini key for local dev>

Key: OPENROUTER_API_KEY                → <OpenRouter key>

Key: OPENAI_API_KEY                    → <OpenAI key> (optional)

Key: API_KEY                           → <Fallback key if required>



Key: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME → <Cloudinary cloud name>

Key: VITE_CLOUDINARY_CLOUD_NAME        → <Cloudinary cloud name>

Key: CLOUDINARY_API_KEY                → <Cloudinary API key>

Key: CLOUDINARY_API_SECRET             → <Cloudinary API secret>



Key: ZARINPAL_MERCHANT_ID              → 00000000-0000-0000-0000-000000000000 (Sandbox) یا Merchant واقعی

Key: ZARINPAL_SANDBOX                  → true (Sandbox) / false (Production)

```



بعد از افزودن تمام متغیرها، در ترمینال اجرای پروژه این دستور را بزنید تا تنظیمات به شکل خودکار بررسی شوند:



```bash

npm run verify:env

```



اگر خروجی اسکریپت "✅ Environment variables verified" بود، می‌توانید سراغ Redeploy بروید.



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