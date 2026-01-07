'use client';

import React from 'react';
import ClientWrapper from '../../components/ClientWrapper';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../../components/LoadingSpinner';

// Assuming HomeView handles the shop logic or we have a dedicated ShopView
// Based on file list, ShopView seems to have been deleted or moved. 
// Checking MainContent.tsx, Shop view wasn't explicitly listed in the switch case in the provided snippet,
// but let's check if there is a 'shop' folder in components or features.
// Wait, looking at file list: src/features/shop/ShopView.tsx was deleted.
// But looking at MainContent.tsx provided earlier:
// case View.Shop: return <HomeView />; 
// It seems Shop is currently part of HomeView or not fully separated.
// HOWEVER, for the payment gateway review, we need a dedicated page.
// Let's use OurGroveView or HomeView for now, or check if there is a Shop component.

// Re-reading MainContent.tsx:
// case View.Shop is NOT in the switch case provided in the snippet!
// But View.OurGrove is.
// Let's check components list again. 
// I see 'components/shop' folder in the file list.

const HomeView = dynamic(() => import('../../components/HomeView'), {
  loading: () => <div className="min-h-screen pt-20 flex items-center justify-center"><LoadingSpinner /></div>,
  ssr: false
});

export default function ShopPage() {
  return (
    <ClientWrapper>
      {/* For now, redirecting Shop to HomeView as per current logic, 
          but having the route /shop is important for SEO and structure */}
      <HomeView />
    </ClientWrapper>
  );
}