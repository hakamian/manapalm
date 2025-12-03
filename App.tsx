
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { View, CartItem, User, Order, Product, Notification, Deed, TimelineEvent, PalmType, CommunityEvent, CommunityPost, ProjectProposal, Campaign, Conversation, PointLog, JournalAnalysisReport, DISCReport, EnneagramReport, StrengthsReport, IkigaiReport, DailyChestReward } from './types';
import { useAppState, useAppDispatch } from './AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import DailyMysteryChest from './components/DailyMysteryChest'; 
import MainContent from './components/layout/MainContent';
import GlobalModals from './components/layout/GlobalModals';
import WelcomeTour from './components/WelcomeTour';
import LiveActivityBanner from './components/LiveActivityBanner';
import AIChatWidget from './components/AIChatWidget';
import MeaningCompanionWidget from './components/MeaningCompanionWidget';
import BottomNavBar from './components/BottomNavBar';


const App: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();

    const { user, allUsers } = state;

    // --- Daily Chest Logic ---
    const canClaimChest = useMemo(() => {
        if (!user) return false;
        const today = new Date().toISOString().split('T')[0];
        return user.lastDailyChestClaimed !== today;
    }, [user]);

    const handleClaimDailyReward = (reward: DailyChestReward) => {
        if (!user) return;
        
        const today = new Date().toISOString().split('T')[0];
        const newPoints = user.points + (reward.type === 'barkat' || reward.type === 'epic' ? reward.amount : 0);
        const newMana = user.manaPoints + (reward.type === 'mana' ? reward.amount : 0);
        
        // Update streak
        let newStreak = user.dailyStreak || 0;
        const lastClaimDate = user.lastDailyChestClaimed ? new Date(user.lastDailyChestClaimed) : null;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastClaimDate && lastClaimDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
            newStreak += 1;
        } else {
            newStreak = 1; // Reset or start new
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

    const handleLoginSuccess = useCallback((loginData: { phone?: string; email?: string; fullName?: string }) => {
        const existingUser = allUsers.find(u => 
            (loginData.phone && u.phone === loginData.phone) || 
            (loginData.email && u.email === loginData.email)
        );
        
        // Check for specific admin email
        const isAdminLogin = loginData.email === 'hhakamian@gmail.com' || loginData.email === 'admin@nakhlestanmana.com';

        if (existingUser) {
            // Ensure admin privileges are updated if logging in via admin button
            const updatedUser = isAdminLogin ? { ...existingUser, isAdmin: true } : existingUser;
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user: updatedUser, orders: [], keepOpen: false } });
        } else {
            // Create new user mock
            const newUser: User = {
                id: isAdminLogin ? 'user_admin_hh' : `user_${Date.now()}`,
                name: loginData.fullName || 'کاربر جدید',
                fullName: loginData.fullName,
                phone: loginData.phone || '',
                email: loginData.email,
                points: isAdminLogin ? 50000 : 100,
                manaPoints: isAdminLogin ? 10000 : 500, // Initial mana for testing tools
                level: isAdminLogin ? 'استاد کهنسال' : 'جوانه',
                isAdmin: isAdminLogin,
                joinDate: new Date().toISOString(),
                profileCompletion: { initial: false, additional: false, extra: false },
                conversations: [],
                notifications: [],
                reflectionAnalysesRemaining: 0,
                ambassadorPacksRemaining: 0
            };
             dispatch({ type: 'LOGIN_SUCCESS', payload: { user: newUser, orders: [], keepOpen: true } });
        }
    }, [allUsers, dispatch]);

    return (
        <div className="bg-gray-900 text-white min-h-screen overflow-x-hidden">
            <WelcomeTour />
            <LiveActivityBanner />
            <Header />
            
            {/* Main Content Router */}
            <MainContent />

            {/* Floating Elements */}
            {user && canClaimChest && (
                <DailyMysteryChest 
                    streak={user.dailyStreak || 0} 
                    onClaim={handleClaimDailyReward} 
                />
            )}

            <Footer />
            <AIChatWidget />
            {user && <MeaningCompanionWidget />}
            <BottomNavBar />
            
            {/* All Modals */}
            <GlobalModals onLoginSuccess={handleLoginSuccess} />
            
        </div>
    );
};

export default App;
