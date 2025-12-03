
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, User, DailyChestReward, PointLog } from './types';
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
import { supabase } from './services/supabaseClient';

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

    // Helper to convert Google user to App User
    const mapSupabaseUserToAppUser = (supabaseUser: any, existingAppUser?: User): User => {
        const isAdmin = supabaseUser.email === 'hhakamian@gmail.com' || 
                        supabaseUser.email === 'admin@nakhlestanmana.com' ||
                        (supabaseUser.phone && supabaseUser.phone === '09222453571'); // Added phone check for admin
        
        // If user already exists in our local "DB" (mock or real), preserve their data
        if (existingAppUser) {
             return {
                 ...existingAppUser,
                 // Update fields that might have changed from Google
                 email: supabaseUser.email,
                 profileImageUrl: supabaseUser.user_metadata?.avatar_url || existingAppUser.profileImageUrl,
                 isAdmin: isAdmin, // Force admin check based on email/phone
                 id: supabaseUser.id // Use Supabase ID as authentic ID
             };
        }

        // Create new user
        return {
            id: supabaseUser.id,
            name: supabaseUser.user_metadata?.full_name || 'کاربر جدید',
            fullName: supabaseUser.user_metadata?.full_name,
            phone: '', // Google doesn't always provide phone
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
            profileImageUrl: supabaseUser.user_metadata?.avatar_url
        };
    };

    const handleLoginSuccess = useCallback((loginData: { phone?: string; email?: string; fullName?: string }) => {
        // This handles phone login manual triggers from AuthModal (mock)
        const existingUser = allUsers.find(u => 
            (loginData.phone && u.phone === loginData.phone) || 
            (loginData.email && u.email === loginData.email)
        );
        
        // Admin check logic for manual login (dev fallback)
        const isAdminLogin = loginData.email === 'hhakamian@gmail.com' || 
                             loginData.email === 'admin@nakhlestanmana.com' ||
                             loginData.phone === '09222453571'; // Specific admin phone

        if (existingUser) {
            const updatedUser = isAdminLogin ? { ...existingUser, isAdmin: true } : existingUser;
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user: updatedUser, orders: [], keepOpen: false } });
        } else {
            const newUser: User = {
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
             dispatch({ type: 'LOGIN_SUCCESS', payload: { user: newUser, orders: [], keepOpen: true } });
        }
    }, [allUsers, dispatch]);

    // --- SUPABASE SESSION LISTENER ---
    useEffect(() => {
        if (!supabase) return;

        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                const existingUser = allUsers.find(u => u.email === session.user.email);
                const appUser = mapSupabaseUserToAppUser(session.user, existingUser);
                dispatch({ type: 'LOGIN_SUCCESS', payload: { user: appUser, orders: [], keepOpen: false } });
            }
        });

        // Listen for auth changes (e.g., redirect back from Google)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                 // User just logged in or session refreshed
                 const existingUser = allUsers.find(u => u.email === session.user.email);
                 const appUser = mapSupabaseUserToAppUser(session.user, existingUser);
                 
                 // Only dispatch if user is different to avoid loops
                 if (!user || user.id !== appUser.id) {
                     dispatch({ type: 'LOGIN_SUCCESS', payload: { user: appUser, orders: [], keepOpen: false } });
                     dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: false });
                 }
            } else {
                // User logged out
                if (user) {
                    dispatch({ type: 'LOGOUT' });
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [dispatch, allUsers]); // Dependency on allUsers to find existing data

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