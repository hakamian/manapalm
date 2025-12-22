'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

interface ClientWrapperProps {
    children: React.ReactNode;
}

// Dynamically import client-only components with loading fallback
const Header = dynamic(() => import('./Header'), {
    ssr: false,
    loading: () => <div className="h-20 bg-gray-900/50" />
});
const Footer = dynamic(() => import('./Footer'), {
    ssr: false,
    loading: () => <div className="h-40 bg-gray-900/50" />
});
const LiveActivityBanner = dynamic(() => import('./LiveActivityBanner'), {
    ssr: false,
    loading: () => <div className="h-10 bg-gray-900/50" />
});

/**
 * ClientWrapper handles the client-side only components (Header, Footer, LiveActivityBanner)
 * to prevent hydration mismatches by using dynamic imports with ssr: false.
 */
export default function ClientWrapper({ children }: ClientWrapperProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        console.log('✅ ClientWrapper mounted');
    }, []);

    return (
        <div className="relative min-h-screen text-white overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-100">
            {/* Debug indicator */}
            {!mounted && (
                <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 z-50">
                    Loading...
                </div>
            )}

            {/* 1. Atmospheric Background - Static, no hydration issues */}
            <div className="aurora-bg">
                <div className="aurora-blob blob-1"></div>
                <div className="aurora-blob blob-2"></div>
                <div className="aurora-blob blob-3"></div>
            </div>
            <div className="noise-overlay"></div>

            {/* Client-only components loaded dynamically */}
            <LiveActivityBanner />
            <Header />

            <div className="relative z-10">
                {children}
            </div>

            <Footer />
        </div>
    );
}
