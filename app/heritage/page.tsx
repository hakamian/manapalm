'use client';

import React from 'react';
import ClientWrapper from '../../components/ClientWrapper';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../../components/LoadingSpinner';

// Using HallOfHeritageView as the main heritage view
const HallOfHeritageView = dynamic(() => import('../../components/HallOfHeritageView'), {
  loading: () => <div className="min-h-screen pt-20 flex items-center justify-center"><LoadingSpinner /></div>,
  ssr: false
});

export default function HeritagePage() {
  return (
    <HallOfHeritageView />
  );
}