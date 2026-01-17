'use client';

import React from 'react';
import { AppProvider } from '../AppContext';
import { CartProvider } from '../contexts/CartContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AppProvider>
  );
}