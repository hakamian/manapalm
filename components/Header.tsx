'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, NavCategory } from '../types';
import { useAppState, useAppDispatch } from '../AppContext';
import SmartLink from './ui/SmartLink';
import { supabase } from '../services/supabaseClient';
import {
    ChevronDownIcon, ShoppingCartIcon, UserCircleIcon, HeartIcon, BellIcon, XMarkIcon, EnvelopeIcon,
    SproutIcon, TreeIcon, UsersIcon, CompassIcon, FlagIcon, BookOpenIcon, UserGroupIcon, PencilSquareIcon, SparklesIcon,
    PresentationChartLineIcon, BuildingOfficeIcon, CpuChipIcon, TrophyIcon,
    AcademicCapIcon,
    BriefcaseIcon,
    BrainCircuitIcon,
    MagnifyingGlassIcon,
    SitemapIcon,
    HandCoinIcon,
    LightBulbIcon
} from './icons';
import { timeAgo } from '../utils/time';

// Icon mapping for dynamic rendering
const ICON_MAP: { [key: string]: React.FC<any> } = {
    'SproutIcon': SproutIcon,
    'TreeIcon': TreeIcon,
    'ShoppingCartIcon': ShoppingCartIcon,
    'UsersIcon': UsersIcon,
    'BuildingOfficeIcon': BuildingOfficeIcon,
    'CompassIcon': CompassIcon,
    'SparklesIcon': SparklesIcon,
    'FlagIcon': FlagIcon,
    'BookOpenIcon': BookOpenIcon,
    'BrainCircuitIcon': BrainCircuitIcon,
    'PresentationChartLineIcon': PresentationChartLineIcon,
    'AcademicCapIcon': AcademicCapIcon,
    'BriefcaseIcon': BriefcaseIcon,
    'SitemapIcon': SitemapIcon,
    'TrophyIcon': TrophyIcon,
    'UserGroupIcon': UserGroupIcon,
    'PencilSquareIcon': PencilSquareIcon,
    'HandCoinIcon': HandCoinIcon,
    'LightBulbIcon': LightBulbIcon
};

const UserMenu: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const leaveTimer = useRef<number | null>(null);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleEnter = () => {
        if (leaveTimer.current) {
            clearTimeout(leaveTimer.current);
        }
        setIsOpen(true);
    };

    const handleLeave = () => {
        leaveTimer.current = window.setTimeout(() => {
            setIsOpen(false);
        }, 300);
    };

    return (
        <div className="relative" onMouseLeave={handleLeave} id="nav-profile">
            <button
                onMouseEnter={handleEnter}
                onClick={toggleMenu}
                className="text-white hover:text-green-300 transition-colors duration-200 flex items-center"
                aria-label="User menu"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <UserCircleIcon className="w-6 h-6" />
            </button>
            {isOpen && (
                <ul id="user-menu-dropdown" onMouseEnter={handleEnter} className="absolute top-full left-0 mt-2 w-48 bg-black bg-opacity-80 backdrop-blur-sm text-white rounded-md shadow-lg py-2 transition-all duration-300 ease-in-out z-50">
                    <li>
                        <SmartLink view={View.UserProfile} className="block px-4 py-2 hover:bg-green-800 transition-colors duration-200" onClick={() => setIsOpen(false)}>
                            پروفایل کاربری
                        </SmartLink>
                    </li>
                    {user?.isAdmin && (
                        <li>
                            <SmartLink view={View.AdminDashboard} className="block px-4 py-2 hover:bg-green-800 transition-colors duration-200" onClick={() => setIsOpen(false)}>
                                داشبورد ادمین
                            </SmartLink>
                        </li>
                    )}
                    <li>
                        <a href="#" onClick={async (e) => {
                            e.preventDefault();
                            try {
                                // Clear local state immediately for responsiveness
                                dispatch({ type: 'LOGOUT' });
                                setIsOpen(false);

                                // Sign out from Supabase to clear session (prevents auto-relogin)
                                if (supabase) {
                                    await supabase.auth.signOut();
                                }
                            } catch (error) {
                                console.error("Logout error:", error);
                            }
                        }} className="block px-4 py-2 hover:bg-green-800 transition-colors duration-200">
                            خروج
                        </a>
                    </li>
                </ul>
            )}
        </div>
    );
};

const NotificationsPanel: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const { notifications } = useAppState();
    const dispatch = useAppDispatch();
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = (notification: typeof notifications[0]) => {
        dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notification.id });
        if (notification.link) {
            dispatch({ type: 'SET_VIEW', payload: notification.link.view });
        }
        onClose();
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-80 max-w-sm bg-gray-900 text-white rounded-lg shadow-2xl transition-all duration-300 ease-in-out border border-gray-700 z-50">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <h3 className="font-bold text-lg">اعلان‌ها</h3>
                {unreadCount > 0 && (
                    <button onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })} className="text-xs text-green-400 hover:text-white transition-colors">
                        علامت زدن همه به عنوان خوانده شده
                    </button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 flex items-start space-x-reverse space-x-3 border-b border-gray-800 last:border-b-0 cursor-pointer ${!notification.read ? 'bg-green-900/20' : ''} hover:bg-gray-800 transition-colors`}
                        >
                            {!notification.read && <div className="w-2.5 h-2.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>}
                            <div className={`flex-grow ${notification.read ? 'pl-5' : ''}`}>
                                <p className="text-sm text-gray-200">{notification.text}</p>
                                <p className="text-xs text-gray-500 mt-1">{timeAgo(notification.timestamp)}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-12">هیچ اعلان جدیدی وجود ندارد.</p>
                )}
            </div>
        </div>
    );
};

const Header: React.FC = () => {
    const { user, cartItems, wishlist, notifications, siteConfig, liveActivities } = useAppState();
    const dispatch = useAppDispatch();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const notificationsContainerRef = useRef<HTMLDivElement>(null);
    const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
    const desktopSearchRef = useRef<HTMLDivElement>(null);
    const desktopInputRef = useRef<HTMLInputElement>(null);

    // Use dynamic navigation from siteConfig and filter for Admin
    const megaNavItems: NavCategory[] = useMemo(() => {
        return siteConfig.navigation
            .filter(cat => {
                // HIDE MANAGEMENT FOR NON-ADMINS
                if (cat.category === 'مدیریت' || cat.category === 'Management') {
                    return user && user.isAdmin;
                }
                return true;
            })
            .map(cat => ({
                ...cat,
                children: cat.children.map(item => ({
                    ...item,
                    title: item.title.replace('{{userName}}', user?.name || '')
                }))
            }));
    }, [siteConfig.navigation, user?.name, user?.isAdmin]);


    const cartItemCount = cartItems.length;
    const wishlistItemCount = wishlist.length;
    const unreadNotificationsCount = notifications.filter(n => !n.read).length;
    const unreadMessagesCount = user?.conversations?.reduce((acc, c) => acc + (c.unreadCount || 0), 0) || 0;

    useEffect(() => {
        if (isDesktopSearchOpen) {
            desktopInputRef.current?.focus();
        }
    }, [isDesktopSearchOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);

        const handleClickOutside = (event: MouseEvent) => {
            if (notificationsContainerRef.current && !notificationsContainerRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
            if (desktopSearchRef.current && !desktopSearchRef.current.contains(event.target as Node)) {
                setIsDesktopSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            console.log(`Performing search for: "${searchQuery.trim()}"`);
            if (isMobileSearchOpen) {
                setIsMobileSearchOpen(false);
            }
            if (isDesktopSearchOpen) {
                setIsDesktopSearchOpen(false);
            }
        }
    };


    const hasBanner = liveActivities && liveActivities.length > 0;

    return (
        <>
            <header className={`fixed ${hasBanner ? 'top-10' : 'top-4'} left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[95%] max-w-7xl rounded-2xl border border-white/5 ${isScrolled ? 'glass-panel h-16 py-2' : 'bg-white/5 backdrop-blur-md h-20 py-4'} flex items-center shadow-2xl`}>
                <div className="container mx-auto px-6 h-full flex items-center">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                            <img src="https://picsum.photos/seed/nakhlestan-logo/40/40" alt="Logo" className="rounded-full" />
                            <SmartLink view={View.Home} className="text-xl font-bold text-white mr-4 cursor-pointer">نخلستان معنا</SmartLink>
                        </div>

                        {/* Desktop Mega Menu */}
                        <nav className="hidden md:flex items-center space-x-reverse space-x-1">
                            {megaNavItems.map((categoryItem) => (
                                <div key={categoryItem.category} className="relative group px-3 py-2" id={`nav-category-${categoryItem.category}`}>
                                    <button className="flex items-center text-white hover:text-green-300 transition-colors duration-200">
                                        <span>{categoryItem.category}</span>
                                        <ChevronDownIcon />
                                    </button>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 p-4 w-max max-w-4xl bg-black bg-opacity-80 backdrop-blur-sm text-white rounded-lg shadow-lg transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 invisible group-hover:visible transform translate-y-2 group-hover:translate-y-0">
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                            {categoryItem.children.map(child => {
                                                const IconComponent = ICON_MAP[child.icon] || SparklesIcon;
                                                return (
                                                    child.view ? (
                                                        <SmartLink
                                                            key={child.title}
                                                            view={child.view}
                                                            className="flex items-start p-3 rounded-lg hover:bg-green-800/50 transition-colors duration-200 w-72"
                                                        >
                                                            <div className="flex-shrink-0 text-green-400 mt-1">
                                                                <IconComponent className="w-6 h-6" />
                                                            </div>
                                                            <div className="mr-4">
                                                                <p className="font-semibold text-white">{child.title}</p>
                                                                <p className="text-sm text-gray-400">{child.description}</p>
                                                            </div>
                                                        </SmartLink>
                                                    ) : null
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </nav>

                        <div className="flex items-center space-x-reverse space-x-4">
                            <div ref={desktopSearchRef} className="relative hidden md:flex items-center h-10">
                                <input
                                    ref={desktopInputRef}
                                    type="search"
                                    placeholder={isDesktopSearchOpen ? "جستجو..." : ""}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleSearch}
                                    className={`bg-gray-800/60 border rounded-full h-full text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-300 ease-in-out ${isDesktopSearchOpen ? 'w-64 pl-10 pr-4 border-gray-600' : 'w-10 border-transparent bg-transparent cursor-pointer'}`}
                                />
                                <button
                                    onClick={() => setIsDesktopSearchOpen(true)}
                                    className={`absolute top-0 left-0 h-full w-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-200 ${isDesktopSearchOpen ? 'pointer-events-none' : ''}`}
                                    aria-label="Open search bar"
                                >
                                    <MagnifyingGlassIcon className="h-5 w-5" />
                                </button>
                            </div>

                            <button onClick={() => setIsMobileSearchOpen(true)} className="md:hidden text-white hover:text-green-300 transition-colors duration-200" aria-label="Search">
                                <MagnifyingGlassIcon className="h-6 w-6" />
                            </button>

                            {user && (
                                <SmartLink view={View.DIRECT_MESSAGES} className="relative text-white hover:text-green-300 transition-colors duration-200" ariaLabel={`Direct messages with ${unreadMessagesCount} unread items`}>
                                    <EnvelopeIcon className="h-6 w-6" />
                                    {unreadMessagesCount > 0 && (
                                        <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 rounded-full bg-red-600 text-xs font-bold text-white">
                                            {unreadMessagesCount}
                                        </span>
                                    )}
                                </SmartLink>
                            )}
                            <div ref={notificationsContainerRef} className="relative hidden md:block">
                                <button onClick={() => setIsNotificationsOpen(prev => !prev)} className="relative text-white hover:text-green-300 transition-colors duration-200" aria-label={`Notifications with ${unreadNotificationsCount} unread items`}>
                                    <BellIcon className="h-6 w-6" />
                                    {unreadNotificationsCount > 0 && (
                                        <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 rounded-full bg-red-600 text-xs font-bold text-white">
                                            {unreadNotificationsCount}
                                        </span>
                                    )}
                                </button>
                                {isNotificationsOpen && (
                                    <NotificationsPanel onClose={() => setIsNotificationsOpen(false)} />
                                )}
                            </div>

                            {/* Campaign Button (Desktop) */}
                            <SmartLink
                                view={View.CampaignLanding}
                                className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold py-2 px-4 rounded-full shadow-lg transition-all hover:scale-105 animate-pulse"
                            >
                                <SparklesIcon className="w-5 h-5" />
                                <span>طرح معنا</span>
                            </SmartLink>

                            <button className="relative text-white hover:text-green-300 transition-colors duration-200 hidden md:block" aria-label={`Wishlist with ${wishlistItemCount} items`}>
                                <HeartIcon className="w-6 h-6" />
                                {wishlistItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 rounded-full bg-red-600 text-xs font-bold text-white">
                                        {wishlistItemCount}
                                    </span>
                                )}
                            </button>
                            <button id="nav-cart" onClick={() => dispatch({ type: 'TOGGLE_CART', payload: true })} className="relative text-white hover:text-green-300 transition-colors duration-200" aria-label={`Shopping cart with ${cartItemCount} items`}>
                                <ShoppingCartIcon />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 rounded-full bg-red-600 text-xs font-bold text-white">
                                        {cartItemCount}
                                    </span>
                                )}
                            </button>

                            {user ? (
                                <UserMenu />
                            ) : (
                                <>
                                    <button id="nav-login" onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })} className="hidden md:block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">ورود / ثبت‌نام</button>
                                    <button onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })} className="md:hidden text-white hover:text-green-300 transition-colors duration-200 flex items-center" aria-label="ورود">
                                        <UserCircleIcon className="w-6 h-6" />
                                    </button>
                                </>
                            )}

                            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Open menu"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg></button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Search Overlay */}
            {isMobileSearchOpen && (
                <div className="fixed inset-0 bg-gray-900 z-[60] p-4 flex flex-col md:hidden">
                    <style>{`.animate-fade-in { animation: fadeIn 0.2s ease-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
                    <div className="flex items-center gap-2 border-b border-gray-700 pb-4">
                        <div className="relative flex-grow">
                            <input
                                type="search"
                                placeholder="جستجو در نخلستان معنا..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleSearch}
                                className="w-full bg-gray-800 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none"
                                autoFocus
                            />
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <button onClick={() => setIsMobileSearchOpen(false)} className="text-gray-400 font-semibold">بستن</button>
                    </div>
                    {/* Potential search results/suggestions can go here */}
                </div>
            )}

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 p-6 md:hidden overflow-y-auto">
                    <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 left-6 text-white"><XMarkIcon /></button>
                    <nav className="mt-16 space-y-4">
                        {megaNavItems.map(categoryItem => (
                            <div key={categoryItem.category} className="border-b border-gray-700 pb-4">
                                <h3 className="text-lg font-bold text-green-400 mb-2">{categoryItem.category}</h3>
                                <ul className="space-y-2">
                                    {categoryItem.children.map(child => {
                                        const IconComponent = ICON_MAP[child.icon] || SparklesIcon;
                                        return child.view ? (
                                            <li key={child.title}>
                                                <SmartLink view={child.view} className="flex items-center p-2 rounded-md hover:bg-gray-800 transition-colors" onClick={() => setIsMenuOpen(false)}>
                                                    <IconComponent className="w-6 h-6 text-gray-400" />
                                                    <span className="mr-3 text-white">{child.title}</span>
                                                </SmartLink>
                                            </li>
                                        ) : null
                                    })}
                                </ul>
                            </div>
                        ))}
                        {/* Campaign Button (Mobile) */}
                        <div className="border-t border-gray-700 pt-4">
                            <SmartLink
                                view={View.CampaignLanding}
                                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 px-4 rounded-md w-full"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <SparklesIcon className="w-6 h-6" />
                                <span>طرح ویژه معنا (طراحی سایت)</span>
                            </SmartLink>
                        </div>
                    </nav>
                    {user ? null : <button onClick={() => { dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true }); setIsMenuOpen(false); }} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors">ورود / ثبت‌نام</button>}
                </div>
            )}
        </>
    );
};

export default Header;
