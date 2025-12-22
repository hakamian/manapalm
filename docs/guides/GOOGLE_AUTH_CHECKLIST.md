# ✅ چک‌لیست تنظیمات Google OAuth

## 🎯 هدف
نمایش "نخلستان معنا" یا "Manapalm" به جای URL Supabase در صفحه ورود Google

---

## 📋 مراحل (به ترتیب اولویت)

### ✅ مرحله 1: Google Cloud Console (مهم‌ترین!)

- [ ] ورود به [Google Cloud Console](https://console.cloud.google.com)
- [ ] انتخاب پروژه مربوطه
- [ ] رفتن به **APIs & Services** > **OAuth consent screen**
- [ ] تنظیم موارد زیر:
  - [ ] **App name**: `نخلستان معنا` یا `Manapalm`
  - [ ] **User support email**: ایمیل پشتیبانی شما
  - [ ] **Application home page**: `https://manapalm.com`
  - [ ] **Authorized domains**: `manapalm.com`
  - [ ] **Developer contact**: ایمیل توسعه‌دهنده
- [ ] ذخیره تغییرات

### ✅ مرحله 2: Google OAuth Credentials

- [ ] رفتن به **APIs & Services** > **Credentials**
- [ ] کلیک روی OAuth 2.0 Client ID
- [ ] در **Authorized redirect URIs** موارد زیر را اضافه کنید:
  ```
  https://sbjrayzghjfsmmuygwbw.supabase.co/auth/v1/callback
  https://manapalm.com/auth/callback
  http://localhost:3000/auth/callback
  ```
- [ ] ذخیره تغییرات

### ✅ مرحله 3: Supabase Dashboard

- [ ] ورود به [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] انتخاب پروژه `sbjrayzghjfsmmuygwbw`
- [ ] رفتن به **Authentication** > **URL Configuration**
- [ ] تنظیم **Site URL**:
  - Development: `http://localhost:3000`
  - Production: `https://manapalm.com`
- [ ] تنظیم **Redirect URLs**:
  ```
  https://manapalm.com/**
  https://manapalm.com/auth/callback
  http://localhost:3000/**
  http://localhost:3000/auth/callback
  ```
- [ ] ذخیره تغییرات

### ✅ مرحله 4: تست محلی

- [ ] اجرای سرور: `npm run dev`
- [ ] باز کردن `http://localhost:3000`
- [ ] کلیک روی "ورود سریع با گوگل"
- [ ] بررسی متن صفحه Google:
  - ❌ اگر می‌بینید: `to continue to sbjrayzghjfsmmuygwbw.supabase.co`
  - ✅ باید ببینید: `to continue to Manapalm` یا `to continue to نخلستان معنا`

### ✅ مرحله 5: عیب‌یابی (در صورت نیاز)

اگر هنوز URL Supabase نمایش داده می‌شود:

- [ ] پاک کردن Cache مرورگر (Ctrl + Shift + Delete)
- [ ] پاک کردن Cookies مربوط به Google
- [ ] استفاده از حالت Incognito/Private
- [ ] صبر کردن 10-15 دقیقه (برای اعمال تغییرات Google)
- [ ] بررسی مجدد OAuth Consent Screen
- [ ] مطمئن شدن از Publish شدن App در Google Cloud Console

---

## 🔍 نکات مهم

### زمان اعمال تغییرات:
- **Supabase**: فوری (1-2 دقیقه)
- **Google Cloud Console**: 10-15 دقیقه (گاهی تا 24 ساعت)

### اولویت‌بندی:
1. **OAuth Consent Screen** (مهم‌ترین!)
2. **Redirect URIs**
3. **Supabase Site URL**

### امنیت:
- ✅ همیشه از HTTPS در production استفاده کنید
- ✅ Client Secret را در `.env` نگه دارید
- ✅ فایل `.env` را commit نکنید

---

## 📸 تصاویر مرجع

### قبل از تنظیمات:
```
Choose an account
to continue to sbjrayzghjfsmmuygwbw.supabase.co
```

### بعد از تنظیمات:
```
Choose an account
to continue to Manapalm
```
یا
```
Choose an account
to continue to نخلستان معنا
```

---

## 🆘 کمک بیشتر

اگر مشکلی داشتید:
1. فایل `docs/guides/GOOGLE_AUTH_BRANDING.md` را مطالعه کنید
2. لاگ‌های Console مرورگر را بررسی کنید
3. Network tab را در DevTools چک کنید

---

**آخرین بروزرسانی:** 2025-12-22
