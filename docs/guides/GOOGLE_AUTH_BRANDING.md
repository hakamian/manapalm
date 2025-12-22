# راهنمای تنظیم Google OAuth با برند Manapalm

## مشکل
وقتی کاربران با Google وارد می‌شوند، به جای نام سایت ما (Manapalm یا نخلستان معنا)، URL پیش‌فرض Supabase نمایش داده می‌شود:
```
to continue to sbjrayzghjfsmmuygwbw.supabase.co
```

## راه‌حل

### 1️⃣ تنظیمات Supabase Dashboard (بسیار مهم!)

برای اینکه نام سایت شما در صفحه Google Login نمایش داده شود، باید تنظیمات زیر را در پنل Supabase انجام دهید:

#### مرحله 1: ورود به Supabase Dashboard
1. به [https://supabase.com/dashboard](https://supabase.com/dashboard) بروید
2. پروژه `sbjrayzghjfsmmuygwbw` را انتخاب کنید
3. از منوی سمت چپ، به **Authentication** بروید
4. روی تب **URL Configuration** کلیک کنید

#### مرحله 2: تنظیم Site URL
```
Site URL: https://manapalm.com
```
یا برای تست محلی:
```
Site URL: http://localhost:3000
```

#### مرحله 3: تنظیم Redirect URLs
در قسمت **Redirect URLs**، آدرس‌های زیر را اضافه کنید:

**برای Production:**
```
https://manapalm.com/**
https://manapalm.com/auth/callback
https://manapalm.com/profile
```

**برای Development:**
```
http://localhost:3000/**
http://localhost:3000/auth/callback
http://localhost:3000/profile
```

#### مرحله 4: تنظیمات Google Provider
1. در همان بخش Authentication، به تب **Providers** بروید
2. روی **Google** کلیک کنید
3. مطمئن شوید که **Enabled** است
4. **Client ID** و **Client Secret** را از Google Cloud Console وارد کنید

### 2️⃣ تنظیمات Google Cloud Console

برای اینکه نام سایت شما در صفحه Google نمایش داده شود، باید در Google Cloud Console تنظیمات OAuth Consent Screen را کامل کنید:

#### مرحله 1: ورود به Google Cloud Console
1. به [https://console.cloud.google.com](https://console.cloud.google.com) بروید
2. پروژه مربوط به Manapalm را انتخاب کنید
3. از منو، به **APIs & Services** > **OAuth consent screen** بروید

#### مرحله 2: تنظیم OAuth Consent Screen
```
App name: نخلستان معنا (Manapalm)
User support email: support@manapalm.com
Application home page: https://manapalm.com
Application privacy policy link: https://manapalm.com/privacy
Application terms of service link: https://manapalm.com/terms
Authorized domains: manapalm.com
Developer contact information: your-email@example.com
```

#### مرحله 3: تنظیم Authorized Redirect URIs
1. از منو، به **APIs & Services** > **Credentials** بروید
2. روی OAuth 2.0 Client ID خود کلیک کنید
3. در قسمت **Authorized redirect URIs**، آدرس‌های زیر را اضافه کنید:

```
https://sbjrayzghjfsmmuygwbw.supabase.co/auth/v1/callback
https://manapalm.com/auth/callback
http://localhost:3000/auth/callback
```

### 3️⃣ تغییرات کد (انجام شده ✅)

#### فایل: `src/features/auth/AuthModal.tsx`
```typescript
const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            hd: 'manapalm.com', // Hosted domain hint
        },
    }
});
```

#### فایل: `app/auth/callback/route.ts` (جدید)
این فایل برای مدیریت callback از Google ایجاد شده است.

### 4️⃣ تست کردن

#### تست محلی:
1. سرور را اجرا کنید: `npm run dev`
2. به `http://localhost:3000` بروید
3. روی "ورود سریع با گوگل" کلیک کنید
4. باید صفحه Google با متن زیر نمایش داده شود:
   ```
   Choose an account
   to continue to manapalm.com
   ```

#### تست Production:
1. کد را به Vercel یا سرور خود deploy کنید
2. مطمئن شوید که domain به درستی تنظیم شده است
3. تست کنید

### 5️⃣ نکات مهم

#### ⚠️ اگر هنوز URL Supabase نمایش داده می‌شود:
1. **Cache مرورگر را پاک کنید** (Ctrl + Shift + Delete)
2. **Cookies مربوط به Google را پاک کنید**
3. از **حالت Incognito/Private** استفاده کنید
4. مطمئن شوید که **OAuth Consent Screen** در Google Cloud Console به درستی تنظیم شده است
5. صبر کنید تا تغییرات Google (ممکن است تا 24 ساعت طول بکشد)

#### 🔒 امنیت:
- همیشه از HTTPS در production استفاده کنید
- Client Secret را در فایل `.env` نگه دارید و commit نکنید
- Redirect URLs را محدود به domain‌های معتبر کنید

#### 📱 تجربه کاربری:
- بعد از login موفق، کاربر به `/profile` هدایت می‌شود
- در صورت خطا، به صفحه اصلی با پارامتر `?auth_error=true` هدایت می‌شود

### 6️⃣ عیب‌یابی (Troubleshooting)

#### مشکل: "redirect_uri_mismatch"
**راه‌حل:** مطمئن شوید که Redirect URI در Google Cloud Console و Supabase یکسان است.

#### مشکل: "Access blocked: This app's request is invalid"
**راه‌حل:** OAuth Consent Screen را کامل کنید و App را Publish کنید.

#### مشکل: هنوز URL Supabase نمایش داده می‌شود
**راه‌حل:** 
1. OAuth Consent Screen در Google Cloud Console را بررسی کنید
2. App name را به "نخلستان معنا" تغییر دهید
3. Application home page را به `https://manapalm.com` تنظیم کنید
4. تغییرات را Save کنید و 10-15 دقیقه صبر کنید

## نتیجه

با انجام این تنظیمات، کاربران شما هنگام ورود با Google، به جای URL Supabase، نام و برند سایت شما (نخلستان معنا / Manapalm) را خواهند دید.

---

**تاریخ ایجاد:** 2025-12-22  
**آخرین بروزرسانی:** 2025-12-22  
**وضعیت:** ✅ کد آماده - نیاز به تنظیمات Dashboard
