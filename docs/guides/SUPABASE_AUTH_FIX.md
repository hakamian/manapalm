# 🔧 راهنمای رفع مشکل Google Authentication

**مشکل:** Google Login موفق است اما session ایجاد نمی‌شود.

---

## ✅ گام 1: تنظیم Redirect URLs در Supabase

1. به Supabase Dashboard بروید:
   ```
   https://supabase.com/dashboard/project/sbjrayzghjfsmmuygwbw
   ```

2. از منوی سمت چپ: **Authentication** → **URL Configuration**

3. در بخش **"Redirect URLs"**، این URLها را اضافه کنید:
   ```
   https://manapalm.com
   https://manapalm.com/
   https://www.manapalm.com
   https://www.manapalm.com/
   https://nakhlestan-ma-na-grove-of-meaning.vercel.app
   https://nakhlestan-ma-na-grove-of-meaning.vercel.app/
   ```

4. **Save** کنید

---

## ✅ گام 2: فعال‌سازی Google Provider

1. در همان صفحه Authentication، به **Providers** بروید

2. **Google** را پیدا کنید و روی آن کلیک کنید

3. مطمئن شوید که:
   - ✅ **Enabled** است
   - ✅ **Client ID** و **Client Secret** تنظیم شده‌اند

4. اگر تنظیم نشده، باید از Google Cloud Console کلیدها را بگیرید

---

## ✅ گام 3: بررسی Site URL

1. در **URL Configuration**، مطمئن شوید:
   - **Site URL**: `https://manapalm.com`

---

## 🔍 تست

بعد از تنظیمات:

1. سایت را Refresh کنید
2. دوباره Google Login را امتحان کنید
3. بعد از redirect، باید وارد شوید

---

## ⚠️ اگر هنوز کار نکرد

لطفاً Console را باز کنید (F12) و:
1. به تب **Network** بروید
2. Google Login را امتحان کنید
3. اسکرین‌شات از خطاها بفرستید
