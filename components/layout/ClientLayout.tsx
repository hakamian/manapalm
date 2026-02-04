'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { View, DailyChestReward, PointLog } from '../../types';
import { useAppState, useAppDispatch } from '../../AppContext';
import { REFERENCE_DATE_STR, INITIAL_USERS } from '../../utils/dummyData';
import DailyMysteryChest from '../DailyMysteryChest';
import GlobalModals from './GlobalModals';
import AIChatWidget from '../AIChatWidget';
import MeaningCompanionWidget from '../MeaningCompanionWidget';
import CommandPalette from '../CommandPalette';
import WhatsNewModal from '../WhatsNewModal';
import { useRouteSync } from '../../hooks/useRouteSync';
import SEOIndex from '../seo/SEOIndex';
import { dbAdapter } from '../../services/dbAdapter';
import ConnectionHealthGadget from '../admin/ConnectionHealthGadget';

// Lazy Load UI Components
import Header from '../Header';
import Footer from '../Footer';
const LiveActivityBanner = dynamic(() => import('../LiveActivityBanner'), { ssr: false });
const BottomNavBar = dynamic(() => import('../BottomNavBar'), { ssr: false });

interface ClientLayoutProps {
    children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
        console.log("🏁 ClientLayout mounted. User:", state.user?.id || 'null');
    }, [state.user?.id]);

    useRouteSync();

    const { user, allUsers, products, liveActivities } = state;
    const hasBanner = liveActivities && liveActivities.length > 0;

    // Determine if we are in admin view based on pathname or state
    // In Next.js migration, we should prefer pathname checks eventually
    const isAdminView = state.currentView === View.AdminDashboard || state.currentView === View.AutoCEO || pathname?.startsWith('/admin');

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

    const handleLoginSuccess = (loginData: any) => {
        console.log("🔑 Authenticating via handleLoginSuccess:", loginData);

        // If it's the mock OTP login (12345), we use the pre-defined test user
        // 🛑 REMOVED: This was causing real users to be overwritten by the test user
        // The real session is now established by Supabase Auth Listener in AppContext.

        // Only if explicitly requested for dev testing (and phone is 09120000000)
        if (loginData.phone === '09120000000') {
            const testUserId = 'user_test_manapalm';
            let testUser = allUsers.find(u => u.id === testUserId) || INITIAL_USERS.find(u => u.id === testUserId);

            if (testUser) {
                console.log("🧪 Mock Login Success: Hydrating session for", testUser.name);
                dbAdapter.setCurrentUserId(testUser.id);
                dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: { user: testUser, orders: [] }
                });

                // Close any open auth modals
                dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: false });

                // Navigate to profile
                dispatch({ type: 'SET_VIEW', payload: View.UserProfile });
                return;
            }
        }

        // Standard login (usually handled by onAuthStateChange, but fallback here)
        if (loginData.user) {
            dispatch({ type: 'SET_USER', payload: loginData.user });
        }
    };

    return (
        <>
            <SEOIndex products={products} />
            <WhatsNewModal />
            <CommandPalette />

            <LiveActivityBanner />
            <Header />

            <div className={`relative z-10 min-h-screen ${!isAdminView ? 'pt-28 md:pt-36' : ''}`}>
                {/* This is where the Next.js page content will be injected */}
                {children}
            </div>

            {!isAdminView && mounted && <Footer />}

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
            <ConnectionHealthGadget />
        </>
    );
};

export default ClientLayout;
