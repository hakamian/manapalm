import React from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'فروشگاه نخلستان معنا | خرید نخل و محصولات معنادار',
  description: 'در فروشگاه نخلستان معنا، نخل‌های واقعی بکارید، از محصولات ارگانیک حمایت کنید و در پروژه‌های اشتغال‌زایی سهیم شوید.',
  keywords: ['خرید نخل', 'کاشت درخت', 'خرما', 'اشتغال‌زایی', 'مسئولیت اجتماعی', 'محصولات بومی'],
  openGraph: {
    title: 'فروشگاه نخلستان معنا',
    description: 'خرید نخل و خلق میراث جاودانه',
    images: ['https://res.cloudinary.com/dk2x11rvs/image/upload/v1768908658/Gemini_Generated_Image_mpvjtqmpvjtqmpvj_vup9c0.png'],
  }
};

const ShopView = dynamic(() => import('../../components/ShopView'), {
  loading: () => <div className="min-h-screen pt-20 flex items-center justify-center"><LoadingSpinner /></div>,
  ssr: true
});

export default function ShopPage() {
  return (
    <ShopView />
  );
}