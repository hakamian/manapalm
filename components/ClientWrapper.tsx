'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

import { useAppState, useAppDispatch } from '../AppContext';
import { View } from '../types';
import GlobalModals from './layout/GlobalModals';

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
    const { currentView, allUsers } = useAppState();
    const dispatch = useAppDispatch();

    useEffect(() => {
        setMounted(true);
        console.log('✅ ClientWrapper mounted');
    }, []);

    const handleLoginSuccess = useCallback((loginData: { phone?: string; email?: string; fullName?: string }) => {
        const existingUser = allUsers.find(u =>
            (loginData.phone && u.phone === loginData.phone) ||
            (loginData.email && u.email === loginData.email)
        );

        const isAdminLogin = loginData.email === 'hhakamian@gmail.com' ||
            loginData.email === 'admin@nakhlestanmana.com' ||
            loginData.phone === '09222453571';

        if (existingUser) {
            const updatedUser = isAdminLogin ? { ...existingUser, isAdmin: true } : existingUser;
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user: updatedUser, orders: [], keepOpen: false } });
        } else {
            const newUser = {
                id: isAdminLogin ? 'user_admin_custom' : `user_${Date.now()}`,
                name: loginData.fullName || 'کاربر جدید',
                fullName: loginData.fullName,
                phone: loginData.phone || '',
                email: loginData.email,
                points: isAdminLogin ? 50000 : 100,
                manaPoints: isAdminLogin ? 10000 : 500,
                level: isAdminLogin ? 'استاد کهنسال' : 'جوانه',
                isAdmin: isAdminLogin,
                joinDate: new Date().toISOString(),
                profileCompletion: { initial: false, additional: false, extra: false },
                conversations: [],
                notifications: [],
                reflectionAnalysesRemaining: 0,
                ambassadorPacksRemaining: 0
            };
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user: newUser as any, orders: [], keepOpen: true } });
        }
    }, [allUsers, dispatch]);

    const isAdminView = currentView === View.AdminDashboard || currentView === View.AutoCEO;

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
            {!isAdminView && <LiveActivityBanner />}
            <Header />

            <div className={`relative z-10 ${!isAdminView ? 'pt-24 md:pt-32' : ''}`}>
                {children}
            </div>

            {!isAdminView && <Footer />}

            <GlobalModals onLoginSuccess={handleLoginSuccess} />
        </div>
    );
}
