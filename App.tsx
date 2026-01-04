
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


const Header = dynamic(() => import('./components/Header'), { ssr: false });
const LiveActivityBanner = dynamic(() => import('./components/LiveActivityBanner'), { ssr: false });
const BottomNavBar = dynamic(() => import('./components/BottomNavBar'), { ssr: false });

const App: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        console.log("🏁 App.tsx mounted. User:", state.user?.id || 'null');
    }, [state.user?.id]);

    useRouteSync();

    const { user, allUsers, products, liveActivities } = state;
    const hasBanner = liveActivities && liveActivities.length > 0;
    const isAdminView = state.currentView === View.AdminDashboard || state.currentView === View.AutoCEO;

    const canClaimChest = useMemo(() => {
        if (!user) return false;
        const today = (typeof window === 'undefined' ? REFERENCE_DATE_STR : new Date().toISOString()).split('T')[0];
        return user.lastDailyChestClaimed !== today;
    }, [user]);

    // ... (rest of methods) ...

    const handleClaimDailyReward = (reward: DailyChestReward) => {
        if (!user) return;
        // ... (implementation)
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

    // ... (rest of methods) ...

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

    return (
        <>
            <SEOIndex products={products} />
            {/* <WelcomeTour /> */}
            <WhatsNewModal />
            <CommandPalette />

            <LiveActivityBanner />
            <Header />
            <div className="relative z-10">
                <MainContent />
            </div>

            {mounted && user && canClaimChest && (
                <DailyMysteryChest
                    streak={user.dailyStreak || 0}
                    onClaim={handleClaimDailyReward}
                />
            )}

            {mounted && <AIChatWidget />}
            {mounted && user && <MeaningCompanionWidget />}

            {!isAdminView && <BottomNavBar />}

            <GlobalModals onLoginSuccess={handleLoginSuccess} />


        </>
    );
};

export default App;
