
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
import { useRouteSync } from './hooks/useRouteSync'; // Virtual Router
import SmartLanding from './components/SmartLanding'; // Smart Landing
import SEOIndex from './components/seo/SEOIndex'; // Live Sitemap

const App: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    
    // Activate Virtual Router
    useRouteSync();

    const { user, allUsers, products } = state; // products needed for Sitemap

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

    const mapSupabaseUserToAppUser = (supabaseUser: any, existingAppUser?: User): User => {
        const isAdmin = supabaseUser.email === 'hhakamian@gmail.com' || 
                        supabaseUser.email === 'admin@nakhlestanmana.com' ||
                        (supabaseUser.phone && supabaseUser.phone === '09222453571');
        
        // Handle Google Metadata variations
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

    useEffect(() => {
        if (!supabase) return;
        
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                const existingUser = allUsers.find(u => u.email === session.user.email);
                const appUser = mapSupabaseUserToAppUser(session.user, existingUser);
                dispatch({ type: 'LOGIN_SUCCESS', payload: { user: appUser, orders: [], keepOpen: false } });
                
                // Clean up URL if code is present
                const params = new URLSearchParams(window.location.search);
                if (params.has('code')) {
                     params.delete('code');
                     // Reconstruct URL without code
                     const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
                     window.history.replaceState({}, document.title, newUrl);
                }
            }
        });

        // Listen for auth changes (e.g. Google Redirect)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                 const existingUser = allUsers.find(u => u.email === session.user.email);
                 const appUser = mapSupabaseUserToAppUser(session.user, existingUser);
                 
                 // Update state if user changed or was null
                 if (!user || user.id !== appUser.id) {
                     dispatch({ type: 'LOGIN_SUCCESS', payload: { user: appUser, orders: [], keepOpen: false } });
                     dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: false });
                 }
                 
                 // Cosmetic: Remove ?code=... from URL after successful auth
                 const params = new URLSearchParams(window.location.search);
                 if (params.has('code')) {
                     params.delete('code');
                     const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
                     window.history.replaceState({}, document.title, newUrl);
                 }
            } else {
                if (user) {
                    dispatch({ type: 'LOGOUT' });
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [dispatch, allUsers]); // 'user' removed from dep array to avoid stale closure issues during initial load

    return (
        <div className="bg-gray-900 text-white min-h-screen overflow-x-hidden">
            <SEOIndex products={products} />
            <WelcomeTour />
            <LiveActivityBanner />
            <Header />
            
            {/* Conditional Rendering for Smart Landing */}
            {state.currentView === 'HOME' && (
                <SmartLanding 
                    user={user} 
                    onStartJourneyClick={() => dispatch({ type: 'START_PLANTING_FLOW' })} 
                />
            )}
            
            {/* Main Content Router */}
            <MainContent />

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
            
            <GlobalModals onLoginSuccess={handleLoginSuccess} />
            
        </div>
    );
};

export default App;
