import React from 'react';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'نخلستان معنا | نخل بکارید، اثر بگذارید، جاودانه شوید',
  description: 'پلتفرم جامع معنا و مسئولیت اجتماعی. با کاشت نخل در جنوب ایران، هم به محیط زیست کمک کنید و هم میراثی ماندگار برای خود بسازید.',
  keywords: ['نخلستان معنا', 'کاشت نخل', 'مسئولیت اجتماعی', 'میراث جاودان', 'رشد فردی', 'محیط زیست ایران'],
  openGraph: {
    title: 'نخلستان معنا',
    description: 'جایی که معنا و تاثیر جاودانه می‌شود',
    images: ['https://res.cloudinary.com/dk2x11rvs/image/upload/v1768905595/Gemini_Generated_Image_psyf3epsyf3epsyf_uckzp1.png'],
  }
};

const HomeView = dynamic(() => import('../components/HomeView'), {
  loading: () => <div className="min-h-screen pt-20 flex items-center justify-center"><div className="animate-pulse text-emerald-400">در حال بارگذاری نخلستان...</div></div>,
  ssr: true
});

export default function HomePage() {
  return (
    <HomeView />
  );
}