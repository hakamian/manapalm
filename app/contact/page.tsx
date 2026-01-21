import React from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تماس با نخلستان معنا | همراهی و گفتگو',
  description: 'سوالی دارید؟ می‌خواهید در مقیاس بزرگتر مشارکت کنید؟ با تیم نخلستان معنا در تماس باشید.',
};

const ContactView = dynamic(() => import('../../components/ContactView'), {
  loading: () => <div className="min-h-screen pt-20 flex items-center justify-center"><LoadingSpinner /></div>,
  ssr: true
});

export default function ContactPage() {
  return (
    <ContactView />
  );
}