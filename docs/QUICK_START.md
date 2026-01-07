# 🚀 راهنمای شروع سریع - نخلستان معنا

**هدف:** راه‌اندازی پروژه در 5 دقیقه

---

## ✅ پیش‌نیازها

- Node.js 18+ نصب شده باشد
- Git نصب شده باشد
- دسترسی به اینترنت (برای دانلود packages)

---

## 🔧 گام 1: Clone و نصب Dependencies

```bash
# Clone کردن پروژه (اگر هنوز clone نکرده‌اید)
git clone <repository-url>
cd manapalm

# نصب packages
npm install
```

---

## 🔑 گام 2: تنظیم Environment Variables

فایل `.env.local` از قبل ایجاد شده است با مقادیر پیش‌فرض برای توسعه محلی.

**✅ کلیدهای تنظیم شده:**
- Supabase URL و Anon Key
- Gemini API Key
- ZarinPal Sandbox

**⚠️ کلیدهایی که باید خودتان اضافه کنید:**

باز کردن `.env.local` و جایگزینی این مقادیر:

```bash
# برای دریافت کلید Service Role:
# https://app.supabase.com/project/sbjrayzghjfsmmuygwbw/settings/api
SUPABASE_SERVICE_ROLE_KEY=<کلید service_role از Supabase>

# برای دریافت کلیدهای Cloudinary (اختیاری - فقط برای تولید تصویر):
# https://cloudinary.com/console
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud name>
CLOUDINARY_API_KEY=<api key>
CLOUDINARY_API_SECRET=<api secret>

# برای OpenRouter (اختیاری - fallback AI):
OPENROUTER_API_KEY=<کلید از https://openrouter.ai>

# برای OpenAI (اختیاری - legacy image generation):
OPENAI_API_KEY=<کلید از https://platform.openai.com>
```

---

## ✅ گام 3: بررسی تنظیمات

```bash
# بررسی صحت Schema و Environment Variables
npm run verify:setup
```

**خروجی مورد انتظار:**
```
✅ supabase_schema.sql validated successfully.
   Tables detected (8): profiles, products, orders, order_items, payments, cart, posts, agent_tasks

✅ Environment variables verified.
```

---

## 🎯 گام 4: اجرای پروژه

### حالت 1: اجرای کامل (Vite + API Server)

```bash
npm run dev
```

- کلاینت Vite: http://localhost:3002
- API Server: http://localhost:3001

### حالت 2: اجرای Next.js (90% مهاجرت انجام شده)

```bash
npm run next:dev
```

- Next.js App: http://localhost:3000

---

## 📋 دستورات مفید

| دستور | توضیح |
|-------|-------|
| `npm run dev` | اجرای کامل (Vite + API Server) |
| `npm run next:dev` | اجرای Next.js Dev Server |
| `npm run build` | Build کردن Next.js برای Production |
| `npm run verify:schema` | بررسی Schema دیتابیس |
| `npm run verify:env` | بررسی Environment Variables |
| `npm run verify:setup` | بررسی کامل (Schema + Env) |

---

## 🧪 تست سریع

بعد از اجرای `npm run dev` یا `npm run next:dev`:

1. باز کردن http://localhost:3002 (یا 3000)
2. F12 → Console
3. اجرای این کد:

```javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL);
```

باید URL صحیح Supabase را نشان دهد: `https://sbjrayzghjfsmmuygwbw.supabase.co`

---

## 🚨 عیب‌یابی سریع

### مشکل: "Cannot find package 'dotenv'"
**حل:** اسکریپت `check-env.mjs` دیگر به dotenv نیاز ندارد و خودش .env را می‌خواند.

### مشکل: "Missing environment variables"
**حل:** 
1. بررسی کنید `.env.local` وجود دارد
2. اجرای `npm run verify:env` برای دیدن کدام کلید مفقود است
3. اضافه کردن کلید مفقود به `.env.local`

### مشکل: "Database connection failed"
**حل:**
1. بررسی اینترنت
2. تست اتصال: https://app.supabase.com/project/sbjrayzghjfsmmuygwbw
3. بررسی صحت `SUPABASE_SERVICE_ROLE_KEY`

### مشکل: "AI not responding"
**حل:**
1. بررسی `GEMINI_API_KEY` در `.env.local`
2. تست کلید: https://aistudio.google.com/apikey
3. چک کردن Quota استفاده از Gemini

---

## 📚 مستندات بیشتر

- **تنظیمات کامل Environment:** `docs/guides/VERCEL_ENV_SETUP.md`
- **راهنمای Database:** `docs/guides/SUPABASE_DEPLOYMENT.md`
- **وضعیت کلی پروژه:** `MANA_MEMORY.md`
- **گزارش تکمیل زیرساخت:** `docs/SETUP_COMPLETE.md`

---

## 🎯 گام بعدی

بعد از راه‌اندازی موفق:

1. **تست فیچرها:**
   - ثبت‌نام / ورود
   - مرور فروشگاه
   - چت با AI

2. **توسعه:**
   - مطالعه `MANA_MEMORY.md` برای درک معماری
   - مطالعه `docs/SETUP_COMPLETE.md` برای مسیر مهاجرت Next.js

3. **Deployment:**
   - تنظیم Environment Variables در Vercel
   - Redeploy پروژه
   - تست Production

---

**🌴 خوش آمدید به نخلستان معنا! اگر مشکلی داشتید، MANA_MEMORY.md را چک کنید.**
