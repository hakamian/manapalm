# ⚙️ راهنمای تنظیم Environment Variables

> **تاریخ:** 2025-12-11  
> **پلتفرم:** Vercel (یا هر سرور Node.js)

---

## 📋 لیست متغیرهای مورد نیاز

| متغیر | توضیح | نمونه | اجباری؟ |
|-------|-------|-------|---------|
| `GEMINI_API_KEY` | کلید API هوش مصنوعی Google Gemini | `AIza...` | ✅ بله |
| `ZARINPAL_MERCHANT_ID` | شناسه درگاه پرداخت زرین‌پال | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | ✅ بله (Production) |
| `ZARINPAL_SANDBOX` | حالت تست (true) یا واقعی (false) | `true` | ⚠️ پیشنهادی |
| `VITE_SUPABASE_URL` | آدرس پروژه Supabase | `https://xxx.supabase.co` | ✅ بله |
| `VITE_SUPABASE_ANON_KEY` | کلید عمومی Supabase | `eyJ...` | ✅ بله |

---

## 🔑 نحوه دریافت کلیدها

### 1. GEMINI_API_KEY

1. به [Google AI Studio](https://aistudio.google.com/apikey) بروید
2. لاگین کنید
3. روی **"Get API Key"** کلیک کنید
4. روی **"Create API Key"** کلیک کنید
5. کلید را کپی کنید

**⚠️ نکته امنیتی:** این کلید را **هرگز** در کد Frontend قرار ندهید!

---

### 2. ZARINPAL_MERCHANT_ID

#### حالت Sandbox (تست):
- مقدار: `00000000-0000-0000-0000-000000000000`
- نیازی به ثبت‌نام نیست

#### حالت Production (واقعی):
1. به [ZarinPal](https://www.zarinpal.com/) بروید
2. ثبت‌نام کنید
3. درخواست درگاه پرداخت دهید
4. بعد از تأیید، Merchant ID را دریافت کنید

---

### 3. VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY

1. به [Supabase Dashboard](https://app.supabase.com/project/sbjrayzghjfsmmuygwbw) بروید
2. از منوی سمت چپ، روی **"Settings"** کلیک کنید
3. روی **"API"** کلیک کنید
4. اطلاعات زیر را کپی کنید:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

**مقادیر فعلی پروژه:**
```
VITE_SUPABASE_URL=https://sbjrayzghjfsmmuygwbw.supabase.co
VITE_SUPABASE_ANON_KEY=<کلید شما>
```

---

## 🚀 تنظیم در Vercel

### گام 1: ورود به Vercel Dashboard

1. به [Vercel](https://vercel.com/dashboard) بروید
2. پروژه `manapalm` را انتخاب کنید

---

### گام 2: رفتن به تنظیمات

1. روی **"Settings"** کلیک کنید
2. از منوی سمت چپ، روی **"Environment Variables"** کلیک کنید

---

### گام 3: اضافه کردن متغیرها

برای هر متغیر:

1. روی **"Add New"** کلیک کنید
2. در فیلد **"Key"**، نام متغیر را وارد کنید (مثلاً `GEMINI_API_KEY`)
3. در فیلد **"Value"**، مقدار را وارد کنید
4. در بخش **"Environment"**، تمام گزینه‌ها را انتخاب کنید:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. روی **"Save"** کلیک کنید

**متغیرهایی که باید اضافه کنید:**

```env
GEMINI_API_KEY=<کلید Gemini شما>
ZARINPAL_MERCHANT_ID=00000000-0000-0000-0000-000000000000
ZARINPAL_SANDBOX=true
VITE_SUPABASE_URL=https://sbjrayzghjfsmmuygwbw.supabase.co
VITE_SUPABASE_ANON_KEY=<کلید Supabase شما>
```

---

### گام 4: Redeploy پروژه

بعد از اضافه کردن تمام متغیرها:

1. به تب **"Deployments"** بروید
2. روی آخرین Deployment کلیک کنید
3. روی منوی سه‌نقطه (**...**) کلیک کنید
4. روی **"Redeploy"** کلیک کنید
5. منتظر بمانید تا Deploy تکمیل شود

---

## 💻 تنظیم در Local (Development)

### گام 1: ایجاد فایل .env

در ریشه پروژه، فایل `.env` ایجاد کنید:

```bash
# در ترمینال
cd "g:\My Drive\Agent\web\manapalm\rep\manapalm-atg\manapalm"
New-Item -ItemType File -Name ".env" -Force
```

---

### گام 2: اضافه کردن متغیرها

محتوای زیر را در فایل `.env` قرار دهید:

```env
# AI Service
GEMINI_API_KEY=<کلید Gemini شما>

# Payment Gateway
ZARINPAL_MERCHANT_ID=00000000-0000-0000-0000-000000000000
ZARINPAL_SANDBOX=true

# Supabase
VITE_SUPABASE_URL=https://sbjrayzghjfsmmuygwbw.supabase.co
VITE_SUPABASE_ANON_KEY=<کلید Supabase شما>
```

---

### گام 3: Restart Dev Server

```bash
# توقف سرور (Ctrl+C)
# شروع مجدد
npm run dev
```

---

## 🧪 تست Environment Variables

### تست 1: بررسی در Console

بعد از Redeploy، در مرورگر:

1. F12 را بزنید (Developer Tools)
2. به تب **Console** بروید
3. این کد را اجرا کنید:

```javascript
// تست Supabase
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**نتیجه مورد انتظار:**
```
Supabase URL: https://sbjrayzghjfsmmuygwbw.supabase.co
Supabase Key exists: true
```

---

### تست 2: تست AI Proxy

در Console:

```javascript
// تست Gemini API
const response = await fetch('/api/proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'generateContent',
    model: 'gemini-2.5-flash',
    data: {
      contents: [{ role: 'user', parts: [{ text: 'سلام' }] }],
      config: {}
    }
  })
});

const result = await response.json();
console.log('AI Response:', result);
```

**نتیجه مورد انتظار:**
- اگر موفق: پاسخ AI دریافت می‌شود
- اگر ناموفق: پیام خطا نشان داده می‌شود

---

### تست 3: تست Payment Gateway

در Console:

```javascript
// تست ZarinPal
const response = await fetch('/api/payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'request',
    amount: 10000,
    description: 'تست پرداخت',
    email: 'test@example.com',
    mobile: '09123456789'
  })
});

const result = await response.json();
console.log('Payment Response:', result);
```

**نتیجه مورد انتظار (Sandbox):**
```json
{
  "success": true,
  "authority": "A00000000000000000000000000123456789",
  "url": "https://sandbox.zarinpal.com/pg/StartPay/..."
}
```

---

## ⚠️ نکات امنیتی

### ✅ انجام دهید:
- کلیدهای API را در Environment Variables قرار دهید
- فایل `.env` را به `.gitignore` اضافه کنید
- از HTTPS استفاده کنید
- کلیدها را به صورت دوره‌ای تغییر دهید

### ❌ انجام ندهید:
- کلیدها را در کد Frontend قرار ندهید
- کلیدها را در Git Commit کنید
- کلیدها را در Console لاگ کنید
- کلیدها را با دیگران به اشتراک بگذارید

---

## 🔄 مرحله بعدی

بعد از تنظیم موفق Environment Variables:

✅ Task 2.1 تکمیل شد  
⏭️ Task 3.1: تست End-to-End (فلو خرید)  
⏭️ Task 3.2: تست LMS  
⏭️ Task 3.3: تست AI Features

---

## 📞 در صورت بروز مشکل

اگر با خطا مواجه شدید:

1. پیام خطا را از Console کپی کنید
2. بررسی کنید که تمام متغیرها درست تنظیم شده‌اند
3. Redeploy کنید
4. اگر مشکل ادامه داشت، به من بفرستید

من به شما کمک می‌کنم! 🌴
