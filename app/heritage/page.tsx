import React from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تالار میراث نخلستان معنا | یادگارهای ماندگار',
  description: 'مشاهده لیست حامیان و میراث‌دارانی که با کاشت نخل در نخلستان معنا، نام خود را در تاریخ آبادانی ایران جاودانه کرده‌اند.',
};

const HallOfHeritageView = dynamic(() => import('../../components/HallOfHeritageView'), {
  loading: () => <div className="min-h-screen pt-20 flex items-center justify-center"><LoadingSpinner /></div>,
  ssr: true
});

export default function HeritagePage() {
  return (
    <HallOfHeritageView />
  );
}