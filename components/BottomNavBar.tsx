
import React, { useState, useEffect, useRef } from 'react';
import { View } from '../types';
import { HomeIcon, Squares2x2Icon, UsersIcon, CompassIcon, PlusIcon } from './icons';
import { useAppState, useAppDispatch } from '../AppContext';

const NavItem: React.FC<{
    page: View;
    label: string;
    icon: React.FC<any>;
    isActive: boolean;
    onClick: () => void;
}> = ({ page, label, icon: Icon, isActive, onClick }) => {
    return (
        <button onClick={onClick} className="flex flex-col items-center justify-center gap-1 w-full h-full text-gray-500 transition-colors">
            <Icon className={`w-6 h-6 transition-all ${isActive ? 'text-green-500 -mt-1' : ''}`} />
            <span className={`text-xs font-semibold transition-all ${isActive ? 'text-green-600 scale-100' : 'scale-0'}`}>{label}</span>
        </button>
    );
}

const BottomNavBar: React.FC = () => {
    const { currentView: page, user: currentUser, isBottomNavVisible } = useAppState();
    const dispatch = useAppDispatch();

    const lastScrollY = useRef(0);
    const isVisibleRef = useRef(true); // Local ref to avoid dependency loop/excessive dispatch
    
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            // Calculate desired visibility: Hide when scrolling down past 100px, show when scrolling up
            const shouldBeVisible = !(currentScrollY > lastScrollY.current && currentScrollY > 100);

            // Dispatch only if state changes
            if (shouldBeVisible !== isVisibleRef.current) {
                isVisibleRef.current = shouldBeVisible;
                dispatch({ type: 'SET_BOTTOM_NAV_VISIBLE', payload: shouldBeVisible });
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [dispatch]);

    const handleNav = (targetPage: View) => {
        if ((targetPage === View.UserProfile || targetPage === View.PathOfMeaning) && !currentUser) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
        } else {
            dispatch({ type: 'SET_VIEW', payload: targetPage });
        }
    }

    const navItems = [
        { page: View.Home, label: 'خانه', icon: HomeIcon },
        { page: View.UserProfile, label: 'پروفایل', icon: Squares2x2Icon },
        { page: View.CommunityHub, label: 'کانون', icon: UsersIcon },
        { page: View.PathOfMeaning, label: 'مسیر', icon: CompassIcon },
    ];

    return (
        <div className={`fixed bottom-0 left-0 right-0 h-20 bg-gray-900/80 backdrop-blur-lg border-t border-gray-700/50 z-40 transition-transform duration-300 ease-in-out md:hidden ${isBottomNavVisible ? 'translate-y-0' : 'translate-y-full'}`}>
             <style>{`
                @keyframes pulse-gentle {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(74, 222, 128, 0); }
                }
                .animate-pulse-gentle {
                    animation: pulse-gentle 2s infinite;
                }
            `}</style>
            <div className="flex justify-around items-center h-full">
                <div className="w-full h-full">
                    <NavItem {...navItems[0]} isActive={page === navItems[0].page} onClick={() => handleNav(navItems[0].page)} />
                </div>
                 <div className="w-full h-full">
                    <NavItem {...navItems[1]} isActive={page === navItems[1].page} onClick={() => handleNav(navItems[1].page)} />
                </div>

                <div className="w-20 -mt-10">
                    <button 
                        onClick={() => dispatch({ type: 'START_PLANTING_FLOW' })}
                        className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30 transform transition-transform hover:scale-105 animate-pulse-gentle"
                        aria-label="کاشت نخل جدید"
                    >
                        <PlusIcon className="w-8 h-8" />
                    </button>
                </div>
                
                 <div className="w-full h-full">
                    <NavItem {...navItems[2]} isActive={page === navItems[2].page} onClick={() => handleNav(navItems[2].page)} />
                </div>
                 <div className="w-full h-full">
                    <NavItem {...navItems[3]} isActive={page === navItems[3].page} onClick={() => handleNav(navItems[3].page)} />
                </div>
            </div>
        </div>
    );
};

export default BottomNavBar;
