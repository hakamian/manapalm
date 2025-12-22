
'use client';

import React, { useState, useCallback, useEffect, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { View, DailyChestReward, PointLog } from './types';
import { useAppState, useAppDispatch } from './AppContext';
import { REFERENCE_DATE_STR } from './utils/dummyData';
import AuthModal from './src/features/auth/AuthModal';
import DailyMysteryChest from './components/DailyMysteryChest';
import MainContent from './components/layout/MainContent';
import GlobalModals from './components/layout/GlobalModals';
import WelcomeTour from './components/WelcomeTour';
import AIChatWidget from './components/AIChatWidget';
import MeaningCompanionWidget from './components/MeaningCompanionWidget';
import CommandPalette from './components/CommandPalette';
import WhatsNewModal from './components/WhatsNewModal';
import { supabase } from './services/supabaseClient';
import { useRouteSync } from './hooks/useRouteSync';
import SEOIndex from './components/seo/SEOIndex';

// Lazy Load UI Components
const Header = React.lazy(() => import('./components/Header'));
const Footer = React.lazy(() => import('./components/Footer'));
const LiveActivityBanner = React.lazy(() => import('./components/LiveActivityBanner'));

const BottomNavBar = dynamic(() => import('./components/BottomNavBar'), { ssr: false });

const App: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        console.log('✅ App.tsx mounted');
        console.log('Current view:', state.currentView);
        console.log('User:', state.user);
    }, []);

    useRouteSync();

    const { user, allUsers, products } = state;

    const canClaimChest = useMemo(() => {
        if (!user) return false;
        const today = (typeof window === 'undefined' ? REFERENCE_DATE_STR : new Date().toISOString()).split('T')[0];
        return user.lastDailyChestClaimed !== today;
    }, [user]);

    const handleClaimDailyReward = (reward: DailyChestReward) => {
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];
        const newPoints = user.points + (reward.type === 'barkat' || reward.type === 'epic' ? reward.amount : 0);
        const newMana = user.manaPoints + (reward.type === 'mana' ? reward.amount : 0);

        let newStreak = user.dailyStreak || 0;
        const lastClaimDate = user.lastDailyChestClaimed ? new Date(user.lastDailyChestClaimed) : null;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastClaimDate && lastClaimDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
            newStreak += 1;
        } else {
            newStreak = 1;
        }

        const newPointLog: PointLog = {
            action: 'صندوقچه راز روزانه',
            points: reward.amount,
            type: reward.type === 'mana' ? 'mana' : 'barkat',
            date: new Date().toISOString()
        };

        dispatch({
            type: 'UPDATE_USER',
            payload: {
                points: newPoints,
                manaPoints: newMana,
                lastDailyChestClaimed: today,
                dailyStreak: newStreak,
                pointsHistory: [newPointLog, ...(user.pointsHistory || [])]
            }
        });

        dispatch({
            type: 'SHOW_POINTS_TOAST',
            payload: { points: reward.amount, action: reward.message, type: reward.type === 'mana' ? 'mana' : 'barkat' }
        });
    };

    const mapSupabaseUserToAppUser = (supabaseUser: any, existingAppUser?: any): any => {
        const isAdmin = supabaseUser.email === 'hhakamian@gmail.com' ||
            supabaseUser.email === 'admin@nakhlestanmana.com' ||
            (supabaseUser.phone && supabaseUser.phone === '09222453571');

        const meta = supabaseUser.user_metadata || {};
        const fullName = meta.full_name || meta.name || meta.user_name;
        const avatarUrl = meta.avatar_url || meta.picture || existingAppUser?.profileImageUrl;

        if (existingAppUser) {
            return {
                ...existingAppUser,
                email: supabaseUser.email,
                profileImageUrl: avatarUrl,
                fullName: fullName || existingAppUser.fullName,
                name: fullName || existingAppUser.name,
                isAdmin: isAdmin || existingAppUser.isAdmin,
                id: supabaseUser.id
            };
        }

        return {
            id: supabaseUser.id,
            name: fullName || 'کاربر جدید',
            fullName: fullName,
            phone: '',
            email: supabaseUser.email,
            points: 100,
            manaPoints: 50,
            level: 'جوانه',
            isAdmin: isAdmin,
            joinDate: new Date().toISOString(),
            profileCompletion: { initial: false, additional: false, extra: false },
            conversations: [],
            notifications: [],
            reflectionAnalysesRemaining: 0,
            ambassadorPacksRemaining: 0,
            profileImageUrl: avatarUrl
        };
    };

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

    const cleanAuthUrl = () => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        if (params.has('code') || params.has('error') || params.has('access_token')) {
            params.delete('code');
            params.delete('error');
            params.delete('error_description');
            params.delete('access_token');
            params.delete('refresh_token');
            params.delete('expires_in');
            params.delete('token_type');
            const newQuery = params.toString();
            const newUrl = window.location.pathname + (newQuery ? '?' + newQuery : '');
            window.history.replaceState({}, document.title, newUrl);
        }
    };

    useEffect(() => {
        if (!supabase) return;

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                const existingUser = allUsers.find(u => u.email === session.user.email);
                const appUser = mapSupabaseUserToAppUser(session.user, existingUser);
                dispatch({ type: 'LOGIN_SUCCESS', payload: { user: appUser, orders: [], keepOpen: false } });
                cleanAuthUrl();
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                const existingUser = allUsers.find(u => u.email === session.user.email);
                const appUser = mapSupabaseUserToAppUser(session.user, existingUser);
                if (!user || user.id !== appUser.id) {
                    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: appUser, orders: [], keepOpen: false } });
                    dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: false });
                }
                cleanAuthUrl();
            } else if (_event === 'SIGNED_OUT') {
                if (user) {
                    dispatch({ type: 'LOGOUT' });
                }
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [dispatch, allUsers]);

    return (
        <>
            <SEOIndex products={products} />
            <WelcomeTour />
            <WhatsNewModal />
            <CommandPalette />

            <div className="relative min-h-screen text-white overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-100">
                <div className="aurora-bg">
                    <div className="aurora-blob blob-1"></div>
                    <div className="aurora-blob blob-2"></div>
                    <div className="aurora-blob blob-3"></div>
                </div>
                <div className="noise-overlay"></div>

                <Suspense fallback={null}><LiveActivityBanner /></Suspense>
                <Suspense fallback={<div className="h-20" />}><Header /></Suspense>

                <div className="relative z-10">
                    <MainContent />
                </div>
            </div>

            {mounted && user && canClaimChest && (
                <DailyMysteryChest
                    streak={user.dailyStreak || 0}
                    onClaim={handleClaimDailyReward}
                />
            )}

            {mounted && <AIChatWidget />}
            {mounted && user && <MeaningCompanionWidget />}
            <BottomNavBar />

            <Suspense fallback={null}><Footer /></Suspense>

            <GlobalModals onLoginSuccess={handleLoginSuccess} />
        </>
    );
};

export default App;
