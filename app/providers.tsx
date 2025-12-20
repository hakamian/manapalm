'use client';

import React from 'react';
import { AppProvider } from '../AppContext';
import { HelmetProvider } from 'react-helmet-async';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <HelmetProvider>
            <AppProvider>
                {children}
            </AppProvider>
        </HelmetProvider>
    );
}
