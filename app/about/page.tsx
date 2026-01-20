'use client';

import React from 'react';
import ClientWrapper from '../../components/ClientWrapper';
// We need to dynamically import the view component to avoid hydration mismatches
// similar to how MainContent does it
import dynamic from 'next/dynamic';
import LoadingSpinner from '../../components/LoadingSpinner';

const AboutView = dynamic(() => import('../../components/AboutView'), {
  loading: () => <div className="min-h-screen pt-20 flex items-center justify-center"><LoadingSpinner /></div>,
  ssr: false // Views are currently client-side heavy
});

export default function AboutPage() {
  return (
    <AboutView />
  );
}