'use client';

import React from 'react';
import ClientWrapper from '../../components/ClientWrapper';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../../components/LoadingSpinner';

const ContactView = dynamic(() => import('../../components/ContactView'), {
  loading: () => <div className="min-h-screen pt-20 flex items-center justify-center"><LoadingSpinner /></div>,
  ssr: false
});

export default function ContactPage() {
  return (
    <ClientWrapper>
      <ContactView />
    </ClientWrapper>
  );
}