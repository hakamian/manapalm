import React from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'درباره نخلستان معنا | داستان ما و رویای آبادانی',
  description: 'ما در نخلستان معنا به دنبال پیوند دوباره انسان با زمین و خلق ارزش‌های ماندگار هستیم. بیاموزید که چگونه یک نخل می‌تواند آینده یک منطقه را تغییر دهد.',
};

const AboutView = dynamic(() => import('../../components/AboutView'), {
  loading: () => <div className="min-h-screen pt-20 flex items-center justify-center"><LoadingSpinner /></div>,
  ssr: true
});

export default function AboutPage() {
  return (
    <AboutView />
  );
}