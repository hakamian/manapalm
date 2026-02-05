'use client';

import React from 'react';
import { AppProvider } from '../AppContext';
import { CartProvider } from '../contexts/CartContext';

import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <CartProvider>
        {children}
        <Toaster position="bottom-center" toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            direction: 'rtl',
            fontFamily: 'inherit'
          }
        }} />
      </CartProvider>
    </AppProvider>
  );
}