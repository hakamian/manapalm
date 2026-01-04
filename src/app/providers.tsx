'use client';

import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider } from '../../AppContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <HelmetProvider>
            <AppProvider>
                {children}
            </AppProvider>
        </HelmetProvider>
    );
}
