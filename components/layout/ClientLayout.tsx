'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { View, DailyChestReward, PointLog } from '../../types';
import { useAppState, useAppDispatch } from '../../AppContext';
import { REFERENCE_DATE_STR } from '../../utils/dummyData';
import DailyMysteryChest from '../DailyMysteryChest';
import GlobalModals from './GlobalModals';
import AIChatWidget from '../AIChatWidget';
import MeaningCompanionWidget from '../MeaningCompanionWidget';
import CommandPalette from '../CommandPalette';
import WhatsNewModal from '../WhatsNewModal';
import { useRouteSync } from '../../hooks/useRouteSync';
import SEOIndex from '../seo/SEOIndex';

// Lazy Load UI Components
const Header = dynamic(() => import('../Header'), { ssr: false });
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
        // Login logic is handled in AuthModal usually, but if needed here:
        // This callback might be redundant if AuthModal dispatches directly
        // Keeping it for compatibility with GlobalModals prop signature
    };

    return (
        <>
            <SEOIndex products={products} />
            <WhatsNewModal />
            <CommandPalette />

            <LiveActivityBanner />
            <Header />
            
            <div className="relative z-10 min-h-screen">
                 {/* This is where the Next.js page content will be injected */}
                {children}
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

export default ClientLayout;
