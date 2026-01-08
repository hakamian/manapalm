'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Lazy load HomeView
const HomeView = dynamic(() => import('../components/HomeView'), {
  loading: () => <div className="min-h-screen pt-20 flex items-center justify-center"><div className="animate-pulse text-emerald-400">در حال بارگذاری نخلستان...</div></div>
});

export default function HomePage() {
  return (
      <HomeView />
  );
}