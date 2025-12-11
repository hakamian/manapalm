# 🔧 دستورالعمل تنظیم Environment Variables در Vercel

**پروژه:** nakhlestan-ma-na-grove-of-meaning  
**تاریخ:** 2025-12-11 13:12

---

## 📋 کلیدهای آماده برای کپی

### 1. VITE_SUPABASE_URL
```
https://sbjrayzghjfsmmuygwbw.supabase.co
```

### 2. VITE_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNianJheXpnaGpmc21tdXlnd2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3MjU2NzgsImV4cCI6MjA0OTMwMTY3OH0.A7_rHrRypeOVpMKyEDEd2w_x_msAcBi1QBbPQmRYdJU
```

### 3. GEMINI_API_KEY
```
AIzaSyDwWhL4B3QB0M4HxyPh-h0wQlg-ISgXVVk
```

### 4. ZARINPAL_MERCHANT_ID
```
00000000-0000-0000-0000-000000000000
```

### 5. ZARINPAL_SANDBOX
```
true
```

---

## 🚀 مراحل تنظیم (گام به گام)

### گام 1: لاگین به Vercel
1. به https://vercel.com/login بروید
2. لاگین کنید (GitHub/Google/Email)

---

### گام 2: رفتن به صفحه Environment Variables
1. بعد از لاگین، به این لینک بروید:
   ```
   https://vercel.com/hoshaks-projects/nakhlestan-ma-na-grove-of-meaning/settings/environment-variables
   ```

---

### گام 3: اضافه کردن هر متغیر

**برای هر یک از 5 متغیر بالا:**

1. روی دکمه **"Add New"** کلیک کنید

2. در فیلد **"Key"**، نام متغیر را وارد کنید:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `ZARINPAL_MERCHANT_ID`
   - `ZARINPAL_SANDBOX`

3. در فیلد **"Value"**، مقدار را کپی و پیست کنید (از بالا)

4. در بخش **"Environment"**، **همه** را انتخاب کنید:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. روی **"Save"** کلیک کنید

6. **تکرار** برای متغیر بعدی

---

### گام 4: Redeploy

بعد از اضافه کردن **تمام 5 متغیر**:

1. به تب **"Deployments"** بروید:
   ```
   https://vercel.com/hoshaks-projects/nakhlestan-ma-na-grove-of-meaning/deployments
   ```

2. روی **آخرین Deployment** کلیک کنید

3. روی منوی **"..."** (سه نقطه) در گوشه بالا کلیک کنید

4. روی **"Redeploy"** کلیک کنید

5. منتظر بمانید تا Deploy تکمیل شود (2-3 دقیقه)

---

## ✅ چک‌لیست

قبل از Redeploy، مطمئن شوید:

- [ ] تمام 5 متغیر اضافه شده‌اند
- [ ] هر متغیر برای Production, Preview, Development فعال است
- [ ] مقادیر درست کپی شده‌اند (بدون فاصله اضافی)

---

## 🎯 بعد از Redeploy

وقتی Deploy تکمیل شد:

1. لینک سایت را باز کنید
2. به من بگویید تا تست‌ها را شروع کنیم!

---

**لینک سایت شما:**
```
https://nakhlestan-ma-na-grove-of-meaning.vercel.app
```
(یا هر دامنه سفارشی که دارید)

---

**آماده؟ بعد از تنظیم، به من خبر دهید!** 🌴
