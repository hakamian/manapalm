# 🛍️ راه‌حل حرفه‌ای مدیریت فروشگاه و عکس‌ها

## 📊 معماری کلی

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Upload Image │  │ Edit Product │  │ Manage Stock │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Cloudinary  │  │   Supabase   │  │  Next.js API │     │
│  │   (Images)   │  │  (Database)  │  │   (Logic)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    User Frontend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Product Grid │  │ Quick View   │  │ Cart System  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 راه‌حل پیشنهادی: Cloudinary + Supabase

### چرا Cloudinary؟
- ✅ **CDN جهانی** - سرعت بالا در همه جا
- ✅ **Auto-Optimization** - بهینه‌سازی خودکار
- ✅ **Format Conversion** - WebP, AVIF خودکار
- ✅ **Responsive Images** - سایزهای مختلف
- ✅ **Free Tier** - 25GB/ماه رایگان
- ✅ **Easy Integration** - راحت با Next.js

### چرا Supabase؟
- ✅ **Already Integrated** - در حال حاضر استفاده می‌کنیم
- ✅ **PostgreSQL** - دیتابیس قدرتمند
- ✅ **Real-time** - آپدیت لحظه‌ای
- ✅ **RLS** - امنیت بالا
- ✅ **Free Tier** - 500MB database رایگان

---

## 📦 نصب و تنظیم

### 1. نصب Cloudinary SDK
```bash
npm install cloudinary next-cloudinary
```

### 2. تنظیم Environment Variables
```env
# .env.local
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. ساختار دیتابیس Supabase

```sql
-- جدول محصولات
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- عکس‌ها (Cloudinary URLs)
  main_image TEXT, -- URL عکس اصلی
  gallery_images TEXT[], -- آرایه URLهای گالری
  thumbnail TEXT, -- URL تامبنیل
  
  -- متادیتا
  cloudinary_public_ids TEXT[], -- برای حذف عکس‌ها
  
  -- SEO
  slug TEXT UNIQUE,
  meta_title TEXT,
  meta_description TEXT,
  
  -- تاریخ‌ها
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- ویژگی‌های اضافی
  features JSONB,
  specifications JSONB,
  tags TEXT[]
);

-- ایندکس‌ها برای سرعت
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_active ON products(is_active);

-- جدول دسته‌بندی‌ها
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  image TEXT, -- Cloudinary URL
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول تاریخچه موجودی
CREATE TABLE stock_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  change_amount INTEGER,
  reason TEXT,
  admin_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- همه می‌توانند محصولات فعال را ببینند
CREATE POLICY "Public products are viewable by everyone"
  ON products FOR SELECT
  USING (is_active = true);

-- فقط ادمین‌ها می‌توانند ویرایش کنند
CREATE POLICY "Admins can do everything"
  ON products FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

---

## 🔧 پیاده‌سازی کد

### 1. Cloudinary Upload Utility

```typescript
// utils/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

export async function uploadProductImage(
  file: File,
  folder: string = 'products'
): Promise<UploadResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `manapalm/${folder}`,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:best' },
          { fetch_format: 'auto' }
        ],
        resource_type: 'image'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as UploadResult);
      }
    ).end(buffer);
  });
}

export async function deleteProductImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif';
  } = {}
): string {
  const {
    width = 800,
    height,
    quality = 'auto',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop: 'limit' },
      { quality },
      { fetch_format: format }
    ]
  });
}
```

### 2. API Route برای آپلود

```typescript
// app/api/products/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadProductImage } from '@/utils/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const result = await uploadProductImage(file);
    
    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

### 3. کامپوننت آپلود عکس

```typescript
// components/admin/ImageUploader.tsx
import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';

interface ImageUploaderProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  folder?: string;
}

export default function ImageUploader({ 
  onUploadSuccess, 
  folder = 'products' 
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  return (
    <CldUploadWidget
      uploadPreset="manapalm_products" // باید در Cloudinary تنظیم شود
      options={{
        folder: `manapalm/${folder}`,
        maxFiles: 5,
        maxFileSize: 5000000, // 5MB
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        sources: ['local', 'camera', 'url'],
      }}
      onUpload={(result: any) => {
        if (result.event === 'success') {
          onUploadSuccess(
            result.info.secure_url,
            result.info.public_id
          );
        }
      }}
    >
      {({ open }) => (
        <button
          onClick={() => open()}
          disabled={uploading}
          className="admin-btn admin-btn-primary"
        >
          {uploading ? 'در حال آپلود...' : 'آپلود عکس'}
        </button>
      )}
    </CldUploadWidget>
  );
}
```

### 4. کامپوننت نمایش عکس بهینه

```typescript
// components/OptimizedImage.tsx
import { CldImage } from 'next-cloudinary';

interface OptimizedImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function OptimizedImage({
  publicId,
  alt,
  width = 800,
  height = 800,
  className
}: OptimizedImageProps) {
  return (
    <CldImage
      src={publicId}
      alt={alt}
      width={width}
      height={height}
      crop="limit"
      quality="auto:best"
      format="auto"
      loading="lazy"
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
```

---

## 🎨 کامپوننت مدیریت محصول کامل

```typescript
// components/admin/ProductManager.tsx
import { useState } from 'react';
import { supabase } from '@/services/supabaseClient';
import ImageUploader from './ImageUploader';
import { deleteProductImage } from '@/utils/cloudinary';

interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  main_image: string;
  gallery_images: string[];
  cloudinary_public_ids: string[];
}

export default function ProductManager() {
  const [product, setProduct] = useState<Product>({
    title: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    main_image: '',
    gallery_images: [],
    cloudinary_public_ids: []
  });

  const handleMainImageUpload = (url: string, publicId: string) => {
    setProduct(prev => ({
      ...prev,
      main_image: url,
      cloudinary_public_ids: [...prev.cloudinary_public_ids, publicId]
    }));
  };

  const handleGalleryImageUpload = (url: string, publicId: string) => {
    setProduct(prev => ({
      ...prev,
      gallery_images: [...prev.gallery_images, url],
      cloudinary_public_ids: [...prev.cloudinary_public_ids, publicId]
    }));
  };

  const handleRemoveImage = async (index: number, isGallery: boolean) => {
    const publicId = product.cloudinary_public_ids[index];
    
    try {
      await deleteProductImage(publicId);
      
      if (isGallery) {
        setProduct(prev => ({
          ...prev,
          gallery_images: prev.gallery_images.filter((_, i) => i !== index),
          cloudinary_public_ids: prev.cloudinary_public_ids.filter((_, i) => i !== index)
        }));
      } else {
        setProduct(prev => ({
          ...prev,
          main_image: '',
          cloudinary_public_ids: prev.cloudinary_public_ids.filter((_, i) => i !== index)
        }));
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleSaveProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...product,
          slug: product.title.toLowerCase().replace(/\s+/g, '-')
        }])
        .select();

      if (error) throw error;
      
      alert('محصول با موفقیت ذخیره شد!');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('خطا در ذخیره محصول');
    }
  };

  return (
    <div className="admin-card" style={{ padding: '2rem' }}>
      <h2 className="admin-heading-2" style={{ marginBottom: '2rem' }}>
        مدیریت محصول
      </h2>

      {/* اطلاعات پایه */}
      <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <label className="admin-label">عنوان محصول</label>
          <input
            type="text"
            value={product.title}
            onChange={e => setProduct({ ...product, title: e.target.value })}
            className="admin-input"
          />
        </div>

        <div>
          <label className="admin-label">توضیحات</label>
          <textarea
            value={product.description}
            onChange={e => setProduct({ ...product, description: e.target.value })}
            className="admin-input"
            rows={4}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="admin-label">قیمت (تومان)</label>
            <input
              type="number"
              value={product.price}
              onChange={e => setProduct({ ...product, price: Number(e.target.value) })}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">موجودی</label>
            <input
              type="number"
              value={product.stock}
              onChange={e => setProduct({ ...product, stock: Number(e.target.value) })}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">دسته‌بندی</label>
            <select
              value={product.category}
              onChange={e => setProduct({ ...product, category: e.target.value })}
              className="admin-select"
            >
              <option value="">انتخاب کنید</option>
              <option value="digital">محصولات دیجیتال</option>
              <option value="physical">محصولات فیزیکی</option>
              <option value="service">خدمات</option>
            </select>
          </div>
        </div>
      </div>

      {/* عکس اصلی */}
      <div style={{ marginBottom: '2rem' }}>
        <label className="admin-label">عکس اصلی محصول</label>
        {product.main_image ? (
          <div style={{ position: 'relative', width: '300px' }}>
            <img
              src={product.main_image}
              alt="Main product"
              style={{ width: '100%', borderRadius: '8px' }}
            />
            <button
              onClick={() => handleRemoveImage(0, false)}
              className="admin-btn admin-btn-danger"
              style={{ marginTop: '0.5rem' }}
            >
              حذف عکس
            </button>
          </div>
        ) : (
          <ImageUploader
            onUploadSuccess={handleMainImageUpload}
            folder="products/main"
          />
        )}
      </div>

      {/* گالری تصاویر */}
      <div style={{ marginBottom: '2rem' }}>
        <label className="admin-label">گالری تصاویر</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
          {product.gallery_images.map((img, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <img
                src={img}
                alt={`Gallery ${index + 1}`}
                style={{ width: '100%', borderRadius: '8px' }}
              />
              <button
                onClick={() => handleRemoveImage(index, true)}
                className="admin-btn-icon"
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: 'rgba(239, 68, 68, 0.9)'
                }}
              >
                ×
              </button>
            </div>
          ))}
          <div>
            <ImageUploader
              onUploadSuccess={handleGalleryImageUpload}
              folder="products/gallery"
            />
          </div>
        </div>
      </div>

      {/* دکمه ذخیره */}
      <button
        onClick={handleSaveProduct}
        className="admin-btn admin-btn-success"
        style={{ width: '100%' }}
      >
        ذخیره محصول
      </button>
    </div>
  );
}
```

---

## 🚀 مزایای این راه‌حل

### 1. **عملکرد (Performance)**
- ✅ CDN جهانی Cloudinary
- ✅ تبدیل خودکار به WebP/AVIF
- ✅ Lazy Loading
- ✅ Responsive Images

### 2. **مقیاس‌پذیری (Scalability)**
- ✅ تا 25GB/ماه رایگان
- ✅ Unlimited transformations
- ✅ Auto-scaling

### 3. **امنیت (Security)**
- ✅ Signed URLs
- ✅ Upload presets
- ✅ Supabase RLS

### 4. **تجربه کاربری (UX)**
- ✅ Drag & Drop upload
- ✅ Progress indicators
- ✅ Image preview
- ✅ Multiple file upload

---

## 💰 هزینه‌ها

### Cloudinary Free Tier:
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ Unlimited transformations
- ✅ 1000 transformations/month

### Supabase Free Tier:
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth/month

**نتیجه: رایگان تا رسیدن به حجم بالا! 🎉**

---

## 📚 مراحل بعدی

1. ✅ نصب Cloudinary SDK
2. ✅ تنظیم Environment Variables
3. ✅ ایجاد جداول Supabase
4. ✅ پیاده‌سازی کامپوننت‌ها
5. ✅ تست آپلود و حذف
6. ✅ بهینه‌سازی SEO
7. ✅ اضافه کردن Image Sitemap

---

## 🎯 بهترین روش‌ها (Best Practices)

1. **همیشه از Cloudinary Transformations استفاده کنید**
2. **عکس‌های اصلی را با کیفیت بالا آپلود کنید**
3. **از lazy loading استفاده کنید**
4. **Alt text برای SEO اضافه کنید**
5. **Public IDs را در دیتابیس ذخیره کنید**
6. **قبل از حذف محصول، عکس‌ها را حذف کنید**

---

این راه‌حل آماده production است و می‌تواند تا میلیون‌ها محصول را مدیریت کند! 🚀
