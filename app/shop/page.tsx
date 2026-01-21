import React from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'فروشگاه نخلستان معنا | خرید خرما و محصولات ارگانیک جنوب',
  description: 'خرید مستقیم خرما ارگانیک (پیارم، مضافتی، زاهدی) و کاشت نخل معنا. با هر خرید، در زنجیره مسئولیت اجتماعی و اشتغال‌زایی سهیم شوید.',
  keywords: ['خرید خرما', 'خرید خرمای ارگانیک', 'خرید نخل معنا', 'کاشت نخل', 'محصولات سالم جنوب', 'مسئولیت اجتماعی شرکتی', 'هدیه معنادار'],
  openGraph: {
    title: 'فروشگاه محصولات ارگانیک نخلستان معنا',
    description: 'تجربه طعم واقعی خرما و مشارکت در مسیر معنا و آبادانی.',
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