import React from 'react';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'نخلستان معنا | خرید نخل، محصولات ارگانیک و مسئولیت اجتماعی',
  description: 'پلتفرم جامع نخل معنا و مسئولیت اجتماعی. با کاشت نخل در جنوب ایران و خرید محصولات ارگانیک، معنا را در زندگی خود و جامعه جاری کنید.',
  keywords: ['نخلستان معنا', 'نخل معنا', 'خرید نخل', 'محصولات ارگانیک', 'خرید خرما', 'مسئولیت اجتماعی', 'میراث جاودان', 'فقرزدایی', 'اشتغال زایی'],
  openGraph: {
    title: 'نخلستان معنا | جایی که معنا جاودانه می‌شود',
    description: 'کاشت نخل، خرید محصولات ارگانیک و مشارکت در مسئولیت‌های اجتماعی برای خلق تاثیری ابدی.',
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