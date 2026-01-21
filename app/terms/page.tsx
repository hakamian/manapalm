import React from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'قوانین و مقررات | نخلستان معنا',
  description: 'قوانین، مقررات و تعهدات نخلستان معنا در قبال حامیان و میراث‌داران.',
};

const TermsView = dynamic(() => import('../../components/TermsView'), {
  loading: () => <div className="min-h-screen pt-20 flex items-center justify-center"><LoadingSpinner /></div>,
  ssr: true
});

export default function TermsPage() {
  return (
    <TermsView />
  );
}