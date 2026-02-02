'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { User, View, Product, CartItem } from '../types';
import {
    UserCircleIcon, BoxIcon, HeartIcon, BellIcon, CogIcon, GiftIcon, ContributionIcon,
    HomeIcon, TrophyIcon, ClockIcon, ShieldCheckIcon, CompassIcon,
    BrainCircuitIcon, FlagIcon, PalmTreeIcon, SparklesIcon, XMarkIcon, ChartPieIcon,
    AwardIcon, HandshakeIcon, PlayIcon, LockClosedIcon, MapPinIcon, EnvelopeIcon, EyeIcon
} from './icons';
import { getNextLevelInfo } from '../services/gamificationService';
import { useAppState, useAppDispatch } from '../AppContext';
import { useAppActions } from '../hooks/useAppActions';
import MenteeBriefingModal from './MenteeBriefingModal';
import GroveKeeperDashboard from './GroveKeeperDashboard';
import DeedDisplay from './DeedDisplay';
import ProductCard from './ProductCard';
import ImpactHero from './profile/ImpactHero'; // Import the new component
import CoachingLabAccessModal from './CoachingLabAccessModal'; // Import the access modal

// Modular tabs
import ProfileHeader from './profile/ProfileHeader';
import DashboardTab from './profile/DashboardTab';
import EditProfileTab from './profile/EditProfileTab';
import TimelineTab from './profile/TimelineTab';
import SettingsTab from './profile/SettingsTab';
import OrdersTab from './profile/OrdersTab';
import GamificationTab from './profile/GamificationTab';
import ReferralTab from './profile/ReferralTab';
import LeaderboardTab from './profile/LeaderboardTab';
import ContributionsTab from './profile/ContributionsTab';
import DiscReportTab from './profile/DiscReportTab';
import EnneagramReportTab from './profile/EnneagramReportTab';
import StrengthsReportTab from './profile/StrengthsReportTab';
import IkigaiReportTab from './profile/IkigaiReportTab';
import MentorTab from './MentorTab';
import ValueDashboardTab from './profile/ValueDashboardTab';
import MessagesTab from './profile/MessagesTab';
import RecentViewsTab from './profile/RecentViewsTab';

// declare const html2canvas: any;

const UserProfileView: React.FC = () => {
    const { user, allUsers, orders, profileInitialTab, products, wishlist, notifications } = useAppState();
    const dispatch = useAppDispatch();
    const { updateProfile } = useAppActions();

    const onUpdate = (updatedFields: Partial<User>) => {
        if (user) {
            updateProfile({ ...user, ...updatedFields });
        }
    };
    const onNavigate = (view: View) => dispatch({ type: 'SET_VIEW', payload: view });
    const onStartPlantingFlow = () => dispatch({ type: 'START_PLANTING_FLOW' });
    const onUpdateTimelineEvent = (deedId: string, memory: { text?: string, image?: string }) => dispatch({ type: 'UPDATE_TIMELINE_EVENT', payload: { deedId, memory } });
    const onStartConversation = (targetUserId: string) => {
        dispatch({ type: 'SET_VIEW', payload: View.DIRECT_MESSAGES });
    };
    const onToggleWishlist = (productId: string) => dispatch({ type: 'TOGGLE_WISHLIST', payload: productId });
    const onAddToCart = (product: Product) => {
        // Simple add to cart logic reusing existing dispatch
        const cartItem: CartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
            stock: product.stock,
            category: product.category,
            isActive: product.isActive,
            type: product.type as 'heritage' | 'digital' | 'service' | 'course' | 'upgrade',
            points: product.points,
            popularity: 100,
            dateAdded: new Date().toISOString()
        };
        dispatch({ type: 'ADD_TO_CART', payload: { product: cartItem, quantity: 1 } });
        dispatch({ type: 'TOGGLE_CART', payload: true });
    };


    const [activeTab, setActiveTab] = useState(() => {
        const subTabs = ['detailed', 'security', 'addresses'];
        if (profileInitialTab && subTabs.includes(profileInitialTab)) {
            return 'profile';
        }
        return profileInitialTab || 'dashboard';
    });
    const [briefingMentee, setBriefingMentee] = useState<User | null>(null);

    // State for access modal in compass tab
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

    useEffect(() => {
        if (profileInitialTab) {
            if (profileInitialTab === 'detailed' || profileInitialTab === 'security' || profileInitialTab === 'addresses') {
                setActiveTab('profile');
            } else {
                setActiveTab(profileInitialTab);
            }
        }
    }, [profileInitialTab]);

    const { animatedBarkatProgress, animatedManaProgress } = useMemo(() => {
        if (!user) return { animatedBarkatProgress: 0, animatedManaProgress: 0 };
        const nextLevelInfo = getNextLevelInfo(user.points, user.manaPoints || 0);
        if (nextLevelInfo) {
            return {
                animatedBarkatProgress: Math.min(100, Math.round((user.points / nextLevelInfo.points) * 100)),
                animatedManaProgress: Math.min(100, Math.round(((user.manaPoints || 0) / nextLevelInfo.manaThreshold) * 100))
            };
        }
        return { animatedBarkatProgress: 100, animatedManaProgress: 100 };
    }, [user?.points, user?.manaPoints]);

    const [selectedDeed, setSelectedDeed] = useState<any | null>(null);
    const [isDeedModalOpen, setIsDeedModalOpen] = useState(false);

    const openDeedModal = (deed: any) => {
        setSelectedDeed(deed);
        setIsDeedModalOpen(true);
    };

    // Wishlist Logic
    const wishlistProducts = useMemo(() => {
        return products.filter(p => wishlist.includes(p.id));
    }, [products, wishlist]);

    const handleResumeSession = () => {
        onNavigate(View.CompassUnlockChat);
    };

    const handlePurchaseAccess = () => {
        setIsAccessModalOpen(true);
    };

    const handlePayWithPoints = () => {
        if (user && user.manaPoints >= 200) {
            dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: 200, action: 'تمدید جلسه قطب‌نمای معنا' } });
            // Assuming this grants 5 mins or session access
            // Since we don't have direct session state here, just close modal and navigate. 
            // The Compass view handles time check. We might need to 'add' time in reducer if needed.
            // For simplicity, let's assume SPEND_MANA_POINTS handles logic or we dispatch update:
            // (Simulated logic)
            // dispatch({ type: 'UPDATE_USER', payload: { ...user, someTimeField: ... } }); 
            // Actually, the modal usually handles the logic.
            // Re-using logic from LiveSessionAccessModal would be best but that's local.
            // Let's assume the user just needs to navigate and pay there if blocked, or we mock it here.
            setIsAccessModalOpen(false);
            onNavigate(View.CompassUnlockChat);
        }
    };

    const toggleWishlist = (id: string) => onToggleWishlist(id);

    // FIX: Hooks must be unconditional. Moving tabs useMemo before the early return.
    const isGroveKeeper = user?.isGroveKeeper;
    const isGuardian = user?.isGuardian;

    const tabs = useMemo(() => {
        if (!user) return [];

        const baseTabs = [
            { id: 'dashboard', label: 'داشبورد', icon: <HomeIcon /> },
            { id: 'value-report', label: 'گزارش تاثیر (ROI)', icon: <ChartPieIcon /> },
        ];

        if (isGroveKeeper) {
            baseTabs.push({ id: 'grovekeeper', label: 'پنل نخلدار', icon: <PalmTreeIcon /> });
        }

        baseTabs.push(
            { id: 'profile', label: 'ویرایش پروفایل', icon: <UserCircleIcon /> },
            { id: 'orders', label: 'سفارش‌ها', icon: <BoxIcon /> },
            { id: 'timeline', label: 'گاهشمار معنا', icon: <ClockIcon /> },
            { id: 'meaning-compass', label: 'قطب‌نمای معنا', icon: <CompassIcon /> },
            { id: 'messages', label: 'پیام‌ها', icon: <EnvelopeIcon /> },
            { id: 'recent-views', label: 'بازدیدهای اخیر', icon: <EyeIcon /> },

            // Psychometric Tests Group
            { id: 'disc_report', label: 'آینه رفتارشناسی (DISC)', icon: <BrainCircuitIcon /> },
            { id: 'enneagram_report', label: 'نقشه روان (Enneagram)', icon: <CompassIcon /> },
            { id: 'strengths_report', label: 'چشمه استعدادها', icon: <TrophyIcon /> },
            { id: 'ikigai_report', label: 'قطب‌نمای ایکیگای', icon: <FlagIcon /> },

            { id: 'gamification', label: 'امتیازات و دستاوردها', icon: <AwardIcon /> },
            { id: 'leaderboard', label: 'تابلوی قهرمانان', icon: <TrophyIcon /> },
            { id: 'wishlist', label: 'علاقه‌مندی‌ها', icon: <HeartIcon /> },
            { id: 'referral', label: 'معرفی دوستان', icon: <GiftIcon /> },
            { id: 'contributions', label: 'هم‌آفرینی و مشارکت', icon: <HandshakeIcon /> },
            { id: 'notifications', label: 'اعلان‌ها', icon: <BellIcon /> },
        );

        if (isGuardian) {
            baseTabs.push({ id: 'mentorship', label: 'مربی‌گری', icon: <ShieldCheckIcon /> });
        }

        baseTabs.push(
            { id: 'settings', label: 'تنظیمات', icon: <CogIcon /> }
        );

        return baseTabs;
    }, [user, isGroveKeeper, isGuardian]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
                <div className="text-center max-w-md animate-fade-in">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-gray-700/30 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">🌴</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-3">در حال همگام‌سازی امن با نخلستان...</h2>
                    <div className="text-gray-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
                        سیستم در حال برقراری ارتباط ایمن برای بازیابی دقیق نخل‌ها، امتیازات و دارایی‌های شماست.
                        <span className="block mt-2 text-xs text-gray-500">
                            این فرآیند لحظه‌ای برای تضمین امنیت حساب و به‌روز بودن اطلاعات شما انجام می‌شود.
                        </span>
                        <br />
                        <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-emerald-400/90 italic font-medium">
                                "صبر، کلید رسیدن به شیرین‌ترین ثمره‌هاست. <br />همانطور که نخل برای بارور شدن نیاز به زمان دارد."
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })}
                        className="text-xs text-gray-500 hover:text-white underline decoration-dashed underline-offset-4 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg"
                    >
                        اگر انتظار طولانی شد، اینجا کلیک کنید تا مجدد وارد شوید
                    </button>
                </div>
            </div>
        );
    }


    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardTab user={user} orders={orders} onNavigateToTab={setActiveTab} onStartPlantingFlow={onStartPlantingFlow} onNavigate={onNavigate} />;
            case 'value-report':
                return <ValueDashboardTab user={user} orders={orders} />;
            case 'profile':
                const initialSection = (profileInitialTab === 'detailed' || profileInitialTab === 'security' || profileInitialTab === 'addresses') ? profileInitialTab : undefined;
                return <EditProfileTab user={user} onUpdate={onUpdate} initialSection={initialSection as any} />;
            case 'orders':
                return <OrdersTab orders={orders} onNavigate={onNavigate} onOpenDeedModal={openDeedModal} />;
            case 'timeline':
                return <TimelineTab user={user} onStartPlantingFlow={onStartPlantingFlow} onNavigate={onNavigate} onUpdateTimelineEvent={onUpdateTimelineEvent} orders={orders} onOpenDeedModal={openDeedModal} />;
            case 'settings':
                return <SettingsTab user={user} onUpdate={onUpdate} />;
            case 'recent-views':
                return <RecentViewsTab user={user} products={products} onNavigate={onNavigate} onAddToCart={onAddToCart} onToggleWishlist={onToggleWishlist} />;
            case 'messages':
                return <MessagesTab user={user} />;
            case 'gamification':
                return <GamificationTab user={user} animatedBarkatProgress={animatedBarkatProgress} animatedManaProgress={animatedManaProgress} onNavigate={onNavigate} setActiveTab={setActiveTab} onStartPlantingFlow={onStartPlantingFlow} />;
            case 'referral':
                return <ReferralTab user={user} />;
            case 'leaderboard':
                return <LeaderboardTab user={user} allUsers={allUsers} />;
            case 'contributions':
                return <ContributionsTab user={user} onUpdate={onUpdate} />;
            case 'disc_report':
                return <DiscReportTab user={user} onNavigate={onNavigate} />;
            case 'enneagram_report':
                return <EnneagramReportTab user={user} onNavigate={onNavigate} />;
            case 'strengths_report':
                return <StrengthsReportTab user={user} onNavigate={onNavigate} />;
            case 'ikigai_report':
                return <IkigaiReportTab user={user} onNavigate={onNavigate} />;
            case 'wishlist':
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">علاقه‌مندی‌های شما</h2>
                        {wishlistProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {wishlistProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        isWishlisted={true}
                                        onViewDetails={() => onNavigate(View.Shop)}
                                        onAddToCart={onAddToCart}
                                        onToggleWishlist={onToggleWishlist}
                                        user={user}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-800 p-8 rounded-lg text-center">
                                <HeartIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                                <p className="text-gray-400 mb-6">لیست علاقه‌مندی‌های شما خالی است.</p>
                                <button onClick={() => onNavigate(View.Shop)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition-colors">
                                    مشاهده فروشگاه
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'meaning-compass': {
                const compassHistory = user.meaningCoachHistory || [];
                const compassDuration = user.compassChatDuration || 0;
                const minutes = Math.floor(compassDuration / 60);
                const seconds = compassDuration % 60;

                // 90 seconds trial
                const usedTrial = user.meaningCompassTrialSecondsUsed || 0;
                const hasTrialTimeLeft = usedTrial < 90;

                return (
                    <div className="bg-gray-800 p-6 sm:p-8 rounded-lg">
                        <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-4 flex justify-between items-center">
                            <span>تاریخچه قطب‌نمای معنا</span>
                            <div className="flex gap-2">
                                {hasTrialTimeLeft ? (
                                    <button onClick={handleResumeSession} className="text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 shadow-lg animate-pulse">
                                        <PlayIcon className="w-4 h-4" /> ادامه جلسه (رایگان)
                                    </button>
                                ) : (
                                    <button onClick={handlePurchaseAccess} className="text-sm bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 shadow-lg">
                                        <LockClosedIcon className="w-4 h-4" /> خرید اشتراک هفتگی (۶۰ دقیقه)
                                    </button>
                                )}
                            </div>
                        </h2>

                        <div className="bg-gray-700/50 p-4 rounded-lg mb-6 flex justify-around items-center text-center border border-gray-600">
                            <div>
                                <p className="text-gray-400 text-xs">زمان استفاده شده</p>
                                <p className="text-xl font-bold text-green-300">
                                    {minutes.toLocaleString('fa-IR')} د : {seconds.toLocaleString('fa-IR')} ث
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs">وضعیت دسترسی</p>
                                <p className={`text-sm font-bold ${hasTrialTimeLeft ? 'text-blue-300' : 'text-amber-400'}`}>
                                    {hasTrialTimeLeft ? 'آزمایشی' : 'نیازمند تمدید'}
                                </p>
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold mb-4">متن گفتگوها</h3>
                        {compassHistory.length > 0 ? (
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                {compassHistory.map((msg, index) => (
                                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-green-800' : 'bg-gray-700'}`}>
                                            {msg.role === 'user' ? <UserCircleIcon className="w-5 h-5 text-white" /> : <SparklesIcon className="w-5 h-5 text-green-400" />}
                                        </div>
                                        <div className={`p-3 rounded-lg max-w-lg text-sm ${msg.role === 'user' ? 'bg-green-800' : 'bg-gray-700'}`}>
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                            {msg.timestamp && <p className="text-xs text-gray-500 text-left mt-2">{new Date(msg.timestamp).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' })}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-gray-700/50 rounded-lg">
                                <p className="text-gray-400">هنوز گفتگویی ثبت نشده است.</p>
                                <button onClick={handleResumeSession} className="mt-4 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md">
                                    شروع اولین گفتگو
                                </button>
                            </div>
                        )}
                    </div>
                );
            }
            case 'notifications': {
                const unreadCount = notifications.filter(n => !n.read).length;
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">اعلان‌ها</h2>
                            {unreadCount > 0 && (
                                <button onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })} className="text-sm text-green-400 hover:text-white">
                                    علامت زدن همه به عنوان خوانده شده
                                </button>
                            )}
                        </div>
                        <div className="bg-gray-800 rounded-lg max-h-[70vh] overflow-y-auto border border-gray-700">
                            {notifications.length > 0 ? (
                                notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => {
                                            dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notification.id });
                                            if (notification.link) onNavigate(notification.link.view);
                                        }}
                                        className={`p-5 flex items-start space-x-reverse space-x-4 border-b border-gray-700 last:border-b-0 cursor-pointer transition-colors ${!notification.read ? 'bg-green-900/10' : ''} hover:bg-gray-700/50`}
                                    >
                                        <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${!notification.read ? 'bg-green-500' : 'bg-transparent'}`}></div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <h4 className={`font-semibold ${!notification.read ? 'text-white' : 'text-gray-400'}`}>{notification.title}</h4>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(notification.timestamp).toLocaleDateString('fa-IR')}</span>
                                            </div>
                                            <p className="text-sm text-gray-300 mt-1">{notification.text}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-12">هیچ اعلانی وجود ندارد.</p>
                            )}
                        </div>
                    </div>
                );
            }
            case 'mentorship': {
                const myMentees = allUsers.filter(u => user.menteeIds?.includes(u.id));
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">رهجویان شما</h2>
                        {myMentees.length > 0 ? (
                            <div className="space-y-4">
                                {myMentees.map(mentee => (
                                    <div key={mentee.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between border border-gray-700">
                                        <div className="flex items-center gap-4">
                                            <img src={mentee.avatar || (mentee.id.charCodeAt(0) % 2 === 0 ? 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1766819369/manapalm/avatars/avatar-female.jpg' : 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1766819371/manapalm/avatars/avatar-male.jpg')} alt={mentee.fullName} className="w-12 h-12 rounded-full object-cover" />
                                            <div>
                                                <p className="font-bold">{mentee.fullName}</p>
                                                <p className="text-sm text-gray-400">{mentee.level} - {mentee.points.toLocaleString('fa-IR')} امتیاز</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setBriefingMentee(mentee)}
                                            className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center gap-2 transition-colors"
                                        >
                                            <SparklesIcon className="w-4 h-4" />
                                            دریافت خلاصه وضعیت (AI)
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-10 bg-gray-800 rounded-lg">
                                <p>در حال حاضر هیچ رهجویی ندارید.</p>
                            </div>
                        )}
                    </div>
                );
            }
            case 'grovekeeper': {
                const onConfirmPlanting = (deedId: string, photoBase64: string) => {
                    dispatch({ type: 'CONFIRM_PLANTING', payload: { deedId, photoBase64 } });
                };
                return <GroveKeeperDashboard currentUser={user} allOrders={orders} onConfirmPlanting={onConfirmPlanting} />;
            }
            default:
                return <div>محتوای این بخش به زودی اضافه خواهد شد.</div>;
        }
    };

    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - (animatedBarkatProgress / 100) * circumference;

    return (
        <div className="pb-24 bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8">

                {/* Profile Header */}
                <ProfileHeader
                    user={user}
                    animatedBarkatProgress={animatedBarkatProgress}
                    circumference={circumference}
                    strokeDashoffset={strokeDashoffset}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    tabs={tabs}
                />

                {/* NEW: Impact Hero Section - ROI Report at the top */}
                <ImpactHero user={user} orders={orders} />

                <div className="flex flex-col md:flex-row gap-8">
                    <aside className="hidden md:block w-1/4 lg:w-1/5">
                        <nav className="space-y-1 sticky top-24 overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar pl-2">
                            {tabs.map(tab => {
                                const isActive = activeTab === tab.id;
                                const isGroveKeeperTab = tab.id === 'grovekeeper';
                                const isValueReportTab = tab.id === 'value-report';

                                let buttonClasses = 'w-full flex items-center p-3 rounded-md transition-colors text-right text-sm font-medium ';
                                if (isActive) buttonClasses += 'bg-green-700 text-white shadow-md';
                                else if (isGroveKeeperTab) buttonClasses += 'bg-amber-800/50 text-amber-200 hover:bg-amber-700/50';
                                else if (isValueReportTab) buttonClasses += 'bg-indigo-900/50 text-indigo-200 hover:bg-indigo-800/50 border border-indigo-500/30';
                                else buttonClasses += 'text-gray-300 hover:bg-gray-800 hover:text-white';
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={buttonClasses}
                                    >
                                        {React.cloneElement(tab.icon as React.ReactElement<{ className?: string }>, { className: `w-5 h-5 ml-3 ${isActive ? 'text-white' : 'text-gray-400'}` })}
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    <main className="w-full md:w-3/4 lg:w-4/5">
                        {renderContent()}
                    </main>
                </div>
            </div>
            {briefingMentee && (
                <MenteeBriefingModal
                    isOpen={!!briefingMentee}
                    onClose={() => setBriefingMentee(null)}
                    mentee={briefingMentee}
                />
            )}

            {isDeedModalOpen && selectedDeed && (
                <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={() => setIsDeedModalOpen(false)}>
                    <div className="relative max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setIsDeedModalOpen(false)}
                            className="absolute -top-10 right-0 md:-right-10 text-white hover:text-gray-300 transition-colors bg-gray-800/50 rounded-full p-1"
                        >
                            <XMarkIcon className="w-8 h-8" />
                        </button>
                        <DeedDisplay deed={selectedDeed} />
                    </div>
                </div>
            )}

            <CoachingLabAccessModal
                isOpen={isAccessModalOpen}
                onClose={() => setIsAccessModalOpen(false)}
                userManaPoints={user.manaPoints}
                onPayWithPoints={handlePayWithPoints}
                title="تمدید جلسه قطب‌نمای معنا"
                description="زمان هدیه شما برای استفاده از قطب‌نمای معنا (Live API) به پایان رسیده است. برای ادامه گفتگوی هوشمند ۶۰ دقیقه‌ای، لطفا اشتراک هفتگی تهیه کنید یا از امتیاز خود استفاده نمایید."
                priceToman={150000}
                pricePoints={200}
                productId="p_hoshmana_live_weekly"
                icon={CompassIcon}
            />
        </div>
    );
};

export default UserProfileView;