
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, Action, View, Deed, TimelineEvent, Order, CartItem, WebDevProject, AIConfig, TargetLanguage, Review, User, SmartAction, Campaign, CommunityPost, DeedUpdate } from './types';
import { INITIAL_USERS, INITIAL_ORDERS, INITIAL_POSTS, INITIAL_DEEDS, PALM_TYPES_DATA, INITIAL_PROPOSALS, INITIAL_LIVE_ACTIVITIES, INITIAL_PRODUCTS, INITIAL_NOTIFICATIONS, INITIAL_MENTORSHIP_REQUESTS, INITIAL_MICROFINANCE_PROJECTS, INITIAL_REVIEWS } from './utils/dummyData';
import { dbAdapter } from './services/dbAdapter';
import { supabase, mapSupabaseUser } from './services/supabaseClient';

const initialNavigation = [
    {
        category: 'نخلستان',
        children: [
            { view: View.HallOfHeritage, icon: 'SproutIcon', title: 'تالار میراث', description: 'میراث خود را با کاشت یک نخل جاودانه کنید.' },
            { view: View.OurGrove, icon: 'TreeIcon', title: 'نخلستان ما', description: 'تاثیر جمعی و نقشه زنده نخلستان را ببینید.' },
            { view: View.Shop, icon: 'ShoppingCartIcon', title: 'فروشگاه', description: 'محصولات ارگانیک و صنایع دستی محلی.' },
            { view: View.About, icon: 'UsersIcon', title: 'درباره ما', description: 'با داستان، تیم و رسالت ما آشنا شوید.' },
            { view: View.Corporate, icon: 'BuildingOfficeIcon', title: 'همکاری سازمانی', description: 'با سازمان خود در این جنبش شریک شوید.' },
        ]
    },
    {
        category: 'سفر',
        children: [
            { view: View.HEROS_JOURNEY_INTRO, icon: 'CompassIcon', title: 'سفر قهرمانی', description: 'ماجراجویی خود را برای کشف معنا آغاز کنید.' },
            { view: View.AI_CREATION_STUDIO, icon: 'SparklesIcon', title: 'خلوت آفرینش', description: 'با ابزارهای هوشمند، میراث دیجیتال خود را خلق کنید.' },
            { view: View.PathOfMeaning, icon: 'FlagIcon', title: 'مسیر معنا', description: 'با انجام ماموریت‌ها، در مسیر رشد کنید.' },
            { view: View.DailyOasis, icon: 'BookOpenIcon', title: 'خلوت روزانه', description: 'فضایی برای تامل و نوشتن یادداشت‌های روزانه.' },
            { view: View.DISC_TEST, icon: 'BrainCircuitIcon', title: 'آینه رفتارشناسی', description: 'سبک رفتاری خود را بشناسید.' },
            { view: View.ENNEAGRAM_TEST, icon: 'CompassIcon', title: 'نقشه روان انیاگرام', description: 'نقشه روان خود را کشف کنید.' },
        ]
    },
    {
        category: 'مشاوره تخصصی',
        children: [
            { view: View.SMART_CONSULTANT, icon: 'LightBulbIcon', title: 'مشاور هوشمند زندگی', description: 'گفتگو برای شفاف‌سازی، آرامش و تعادل در زندگی.' },
            { view: View.BUSINESS_MENTOR, icon: 'BriefcaseIcon', title: 'منتور متخصص بیزینس', description: 'استراتژی، رشد و حل چالش‌های کسب‌وکار.' }
        ]
    },
    {
        category: 'آکادمی',
        children: [
            { view: View.AI_ACADEMY, icon: 'SparklesIcon', title: 'آکادمی هوش مصنوعی', description: 'اتوماسیون، ایجنت‌ها و مهارت‌های آینده.' },
            { view: View.BUSINESS_ACADEMY, icon: 'MegaphoneIcon', title: 'آکادمی برند و محتوا', description: 'اقتصاد خالق (Creator Economy) و بازاریابی.' },
            { view: View.BUSINESS_ACADEMY, icon: 'BanknotesIcon', title: 'آکادمی ثروت', description: 'سواد مالی و استراتژی‌های سرمایه‌گذاری.' },
            { view: View.BUSINESS_ACADEMY, icon: 'BriefcaseIcon', title: 'آکادمی رهبری و سیستم', description: 'معماری کسب‌وکارهای مقیاس‌پذیر و خودران.' },
            { view: View.LIFE_MASTERY_ACADEMY, icon: 'BoltIcon', title: 'آکادمی عملکرد زیستی', description: 'مدیریت انرژی، تمرکز و تاب‌آوری.' },
            { view: View.ENGLISH_ACADEMY, icon: 'AcademicCapIcon', title: 'آکادمی زبان جهانی', description: 'ارتباطات بین‌المللی با متد هوشمانا.' },
            { view: View['digital-heritage-architect'], icon: 'SitemapIcon', title: 'معمار میراث دیجیتال', description: 'وب‌سایت حرفه‌ای خود را بسازید و در اشتغال‌زایی سهیم شوید.' },
            { view: View.COACHING_LAB, icon: 'BrainCircuitIcon', title: 'آزمایشگاه کوچینگ', description: 'فضای تمرین اختصاصی برای کوچ‌ها.' },
        ]
    },
    {
        category: 'جامعه',
        children: [
            { view: View.CommunityHub, icon: 'UserGroupIcon', title: 'کانون', description: 'به جامعه ما بپیوندید و با دیگران ارتباط برقرار کنید.' },
            { view: View.Articles, icon: 'PencilSquareIcon', title: 'مقالات', description: 'دانش خود را با مقالات ما افزایش دهید.' },
            { view: View.CoCreation, icon: 'SparklesIcon', title: 'هم‌آفرینی', description: 'در ساختن آینده نخلستان مشارکت کنید.' },
            { view: View.Microfinance, icon: 'HandCoinIcon', title: 'صندوق رویش', description: 'سرمایه‌گذاری خرد بر روی کارآفرینان و توسعه نخلستان.' },
        ]
    },
    {
        category: 'مدیریت',
        children: [
            { view: View.AutoCEO, icon: 'BoltIcon', title: 'مدیر عامل خودکار', description: 'دستیار هوشمند مدیریت استراتژیک.' },
            { view: View.AdminDashboard, icon: 'ChartBarIcon', title: 'داشبورد ادمین', description: 'مدیریت کاربران و سفارشات.' },
        ]
    }
];

const DEFAULT_ALCHEMY_PROMPT = `
# SYSTEM ROLE — GRANDMASTER ARCHITECT (V6.0 - LONG CONTEXT EDITION)
... (Same as before)
`;

const initialState: AppState = {
    user: null,
    users: [],
    allUsers: [],
    orders: [],
    cartItems: [],
    wishlist: [],
    notifications: INITIAL_NOTIFICATIONS,
    reviews: INITIAL_REVIEWS,
    generatedCourses: [],
    dailyChallenge: null,
    isGeneratingChallenge: false,
    currentView: View.Home,
    isAuthModalOpen: false,
    isCartOpen: false,
    isOrderSuccessModalOpen: false,
    isWelcomeModalOpen: false,
    isPalmSelectionModalOpen: false,
    isDeedPersonalizationModalOpen: false,
    isCompanionUnlockModalOpen: false,
    isCompanionTrialModalOpen: false,
    isReflectionAnalysisUnlockModalOpen: false,
    isAmbassadorUnlockModalOpen: false,
    isSocialPostGeneratorModalOpen: false,
    isMeaningPalmActivationModalOpen: false,
    isFutureVisionModalOpen: false,
    isVoiceOfPalmModalOpen: false,
    isBottomNavVisible: true,
    pendingRedirectView: undefined,

    lastOrderDeeds: [],
    lastOrderPointsEarned: 0,
    pointsToast: null,
    selectedPalmForPersonalization: null,
    futureVisionDeed: null,
    voiceOfPalmDeed: null,

    communityEvents: [],
    communityPosts: [],
    allDeeds: INITIAL_DEEDS,
    proposals: INITIAL_PROPOSALS,
    microfinanceProjects: INITIAL_MICROFINANCE_PROJECTS,
    campaign: {
        id: 'camp_1',
        title: 'کمپین ۱۰۰ نخل',
        description: 'برای آبادانی مناطق محروم',
        goal: 100,
        current: 35,
        unit: 'نخل',
        ctaText: 'مشارکت در کمپین',
        rewardPoints: 1000
    },
    palmTypes: PALM_TYPES_DATA,
    products: INITIAL_PRODUCTS,

    mentorshipRequests: INITIAL_MENTORSHIP_REQUESTS,

    socialPostGeneratorData: { deed: null },

    communityStats: {
        totalPalmsPlanted: 1250,
        totalJobHours: 5000,
        totalCo2Absorbed: 25000,
    },
    personalStats: {
        palms: 0,
        jobHours: 0,
        co2Absorbed: 0,
    },

    appSettings: {
        meaningCompassPrice: 50000,
        alchemyPrompt: DEFAULT_ALCHEMY_PROMPT,
        enableSystemUpgrade: false,
        usdToTomanRate: 120000,
    },
    apiSettings: {
        budget: 100,
        mode: 'optimal',
    },
    aiConfig: {
        activeProvider: 'google',
        activeTextModel: 'gemini-2.5-flash',
        activeImageModel: 'imagen-4.0-generate-001',
        fallbackEnabled: true,
        safetyThreshold: 'medium',
        systemStatus: 'online'
    },
    siteConfig: {
        navigation: initialNavigation
    },
    apiSettingsHistory: [],
    liveActivities: INITIAL_LIVE_ACTIVITIES,
    onboardingStep: 'none',
    coachingSession: null,
    currentEnglishScenario: undefined,
    currentVocabularyTopic: undefined,
    selectedLanguage: undefined,
};

const createTimelineEventFromDeed = (deed: Deed): TimelineEvent => ({
    id: `evt_plant_${deed.id}`,
    date: deed.date,
    type: 'palm_planted',
    title: `کاشت نخل: ${deed.intention}`,
    description: deed.message || 'یک نخل جدید کاشته شد.',
    deedId: deed.id,
    details: {
        id: deed.productId,
        title: deed.palmType,
        recipient: deed.name,
        plantedBy: deed.fromName,
        message: deed.message,
        certificateId: deed.id
    },
    userReflection: { notes: '' },
    isSharedAnonymously: false,
    status: 'approved'
});

function appReducer(state: AppState, action: Action): AppState {
    let newState = { ...state };

    switch (action.type) {
        case 'SET_USER':
            newState = { ...state, user: action.payload };
            if (action.payload) { dbAdapter.setCurrentUserId(action.payload.id); dbAdapter.saveUser(action.payload); } else { dbAdapter.setCurrentUserId(null); }
            return newState;
        case 'UPDATE_USER':
            if (state.user) {
                const updatedUser = { ...state.user, ...action.payload };
                newState = { ...state, user: updatedUser };
                dbAdapter.saveUser(updatedUser);
                const updatedAllUsers = state.allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
                newState.allUsers = updatedAllUsers;
            }
            return newState;
        case 'SAVE_COURSE_PERSONALIZATION':
            if (state.user) {
                const { courseId, personalization } = action.payload;
                const updatedPersonalizations = { ...(state.user.coursePersonalizations || {}), [courseId]: personalization };
                const updatedUser = { ...state.user, coursePersonalizations: updatedPersonalizations };
                newState = { ...state, user: updatedUser };
                dbAdapter.saveUser(updatedUser);
                const updatedAllUsers = state.allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
                newState.allUsers = updatedAllUsers;
            }
            return newState;
        case 'SET_VIEW': return { ...state, currentView: action.payload };
        case 'TOGGLE_AUTH_MODAL': return { ...state, isAuthModalOpen: action.payload };
        case 'TOGGLE_CART': return { ...state, isCartOpen: action.payload };
        case 'ADD_TO_CART': {
            const { product, quantity, deedDetails, paymentPlan } = action.payload;
            const existingItemIndex = state.cartItems.findIndex(item => item.id === product.id);
            let newCartItems;
            if (existingItemIndex > -1) { newCartItems = state.cartItems.map((item, index) => index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item); } else { newCartItems = [...state.cartItems, { ...product, productId: product.id, quantity, deedDetails, paymentPlan }]; }
            return { ...state, cartItems: newCartItems, isCartOpen: true };
        }
        case 'REMOVE_FROM_CART': return { ...state, cartItems: state.cartItems.filter(item => item.id !== action.payload) };
        case 'SET_CART_ITEMS': return { ...state, cartItems: action.payload };
        case 'PLACE_ORDER': {
            const newOrder = action.payload;
            const rawPointsEarned = newOrder.items.reduce((sum, item) => sum + (item.points || 0) * item.quantity, 0);
            const pointsEarned = Math.min(rawPointsEarned, 20000);
            const newTimelineEvents = (newOrder.deeds || []).map(createTimelineEventFromDeed);

            // Create Notifications for Deeds
            const newNotifications = (newOrder.deeds || []).map((deed, i) => ({
                id: `notif-deed-${Date.now()}-${i}`,
                title: 'نخل جدید کاشته شد!',
                description: `نخل "${deed.intention}" با موفقیت ثبت شد.`,
                text: `برای مشاهده سند و جزئیات نخل "${deed.intention}" کلیک کنید.`,
                date: new Date().toISOString(),
                timestamp: new Date().toISOString(),
                read: false,
                isRead: false,
                type: 'success' as const,
                icon: 'SproutIcon',
                // Add direct link to heritage view or timeline
                link: { view: View.HallOfHeritage }
            }));

            let unlockUpdates: Partial<User> = {};
            let newUnlockedTools = state.user?.unlockedTools || [];
            if (newOrder.items.some(item => item.id === 'p_heritage_language')) { unlockUpdates = { ...unlockUpdates, hasUnlockedEnglishTest: true }; }
            if (newOrder.items.some(item => item.id === 'p_companion_unlock')) { unlockUpdates = { ...unlockUpdates, hasUnlockedCompanion: true }; }
            if (newOrder.items.some(item => item.id === 'p_reflection_unlock')) { const currentUses = state.user?.reflectionAnalysesRemaining || 0; unlockUpdates = { ...unlockUpdates, reflectionAnalysesRemaining: currentUses + 1 }; }
            if (newOrder.items.some(item => item.id === 'p_coaching_lab_access' || item.id === 'p_hoshmana_live_weekly')) { const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + 7); unlockUpdates = { ...unlockUpdates, coachingLabAccess: { expiresAt: expiresAt.toISOString() }, hoshmanaLiveAccess: { expiresAt: expiresAt.toISOString(), remainingSeconds: 3600 } }; }
            newOrder.items.forEach(item => { if (item.unlocksFeatureId) { const featureId = item.unlocksFeatureId; if (!newUnlockedTools.includes(featureId)) { newUnlockedTools = [...newUnlockedTools, featureId]; } } });
            if (newUnlockedTools.length > (state.user?.unlockedTools?.length || 0)) { unlockUpdates = { ...unlockUpdates, unlockedTools: newUnlockedTools }; }
            let webProjectUpdate = {};
            const webDevItem = newOrder.items.find(item => item.webDevDetails);
            if (webDevItem && webDevItem.webDevDetails) {
                const newProject: WebDevProject = { packageName: webDevItem.name.replace('معمار میراث دیجیتال: ', ''), packagePrice: webDevItem.price, status: 'requested', initialRequest: webDevItem.webDevDetails };
                webProjectUpdate = { webDevProject: newProject };
                newTimelineEvents.push({ id: `evt_project_start_${Date.now()}`, date: new Date().toISOString(), type: 'creative_act', title: 'آغاز پروژه میراث دیجیتال', description: `شروع ساخت ${webDevItem.name}`, details: { mediaType: 'image', imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=400?q=80&w=400', prompt: webDevItem.name } });
            }
            // NOTE: Points are just updated in local state for UI responsiveness, but DB uses RPC elsewhere if needed.
            // Ideally, order processing should trigger DB functions to award points.
            const updatedUser = state.user ? { ...state.user, points: state.user.points + pointsEarned, pointsHistory: [...(state.user.pointsHistory || []), { action: 'خرید', points: pointsEarned, type: 'barkat' as const, date: new Date().toISOString() }], timeline: [...newTimelineEvents, ...(state.user.timeline || [])], ...webProjectUpdate, ...unlockUpdates, notifications: [...newNotifications, ...(state.user.notifications || [])] } : null;
            dbAdapter.saveOrder(newOrder);
            if (updatedUser) dbAdapter.saveUser(updatedUser);
            return { ...state, orders: [...state.orders, newOrder], cartItems: [], isCartOpen: false, isOrderSuccessModalOpen: true, lastOrderDeeds: newOrder.deeds || [], lastOrderPointsEarned: pointsEarned, user: updatedUser, notifications: [...newNotifications, ...state.notifications] };
        }
        case 'LOGIN_SUCCESS': const loggedInUser = action.payload.user; dbAdapter.setCurrentUserId(loggedInUser.id); dbAdapter.saveUser(loggedInUser); return { ...state, user: loggedInUser, orders: action.payload.orders, isAuthModalOpen: action.payload.keepOpen ? true : false };
        case 'LOGOUT': dbAdapter.setCurrentUserId(null); return { ...state, user: null, orders: [], cartItems: [], currentView: View.Home };
        case 'SET_DAILY_CHALLENGE': return { ...state, dailyChallenge: action.payload };
        case 'SET_IS_GENERATING_CHALLENGE': return { ...state, isGeneratingChallenge: action.payload };
        case 'MARK_NOTIFICATION_READ': return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true, isRead: true } : n) };
        case 'MARK_ALL_NOTIFICATIONS_READ': return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true, isRead: true })) };
        case 'CLOSE_DEED_MODALS': return { ...state, isOrderSuccessModalOpen: false, isPalmSelectionModalOpen: false, isDeedPersonalizationModalOpen: false };
        case 'SET_WELCOME_MODAL': return { ...state, isWelcomeModalOpen: action.payload };
        case 'SET_PROFILE_TAB_AND_NAVIGATE': return { ...state, currentView: View.UserProfile, profileInitialTab: action.payload };
        case 'HIDE_POINTS_TOAST': return { ...state, pointsToast: null };
        case 'SHOW_POINTS_TOAST': return { ...state, pointsToast: action.payload };
        case 'SELECT_PALM_FOR_DEED': return { ...state, selectedPalmForPersonalization: action.payload, isPalmSelectionModalOpen: false, isDeedPersonalizationModalOpen: true };
        case 'PERSONALIZE_DEED_AND_ADD_TO_CART': {
            const { palm, quantity, deedDetails, selectedPlan } = action.payload;
            const paymentPlan = selectedPlan > 1 ? { installments: selectedPlan } : undefined;
            const cartItem = { id: `${palm.id}-${Date.now()}`, productId: palm.id, name: palm.name, price: palm.price, quantity: quantity, image: `https://picsum.photos/seed/${palm.id}/400/400`, stock: 999, type: 'heritage', points: palm.points, popularity: 100, dateAdded: new Date().toISOString(), deedDetails, paymentPlan };
            return { ...state, cartItems: [...state.cartItems, cartItem as any], isDeedPersonalizationModalOpen: false, isCartOpen: true };
        }
        case 'SHOW_COMPANION_UNLOCK_MODAL': return { ...state, isCompanionUnlockModalOpen: action.payload };
        case 'START_COMPANION_PURCHASE':
            const companionProduct = state.products.find(p => p.id === 'p_companion_unlock');
            if (companionProduct) { return { ...state, isCompanionUnlockModalOpen: false, cartItems: [...state.cartItems, { ...companionProduct, quantity: 1, productId: companionProduct.id } as any], isCartOpen: true }; }
            return state;
        case 'SHOW_COMPANION_TRIAL_MODAL': return { ...state, isCompanionTrialModalOpen: action.payload };
        case 'SHOW_REFLECTION_UNLOCK_MODAL': return { ...state, isReflectionAnalysisUnlockModalOpen: action.payload };
        case 'START_REFLECTION_PURCHASE':
            const reflectionProduct = state.products.find(p => p.id === 'p_reflection_unlock');
            if (reflectionProduct) { return { ...state, isReflectionAnalysisUnlockModalOpen: false, cartItems: [...state.cartItems, { ...reflectionProduct, quantity: 1, productId: reflectionProduct.id } as any], isCartOpen: true }; }
            return state;
        case 'SHOW_AMBASSADOR_UNLOCK_MODAL': return { ...state, isAmbassadorUnlockModalOpen: action.payload };
        case 'START_AMBASSADOR_PURCHASE':
            const ambassadorProduct = state.products.find(p => p.id === 'p_ambassador_pack');
            if (ambassadorProduct) { return { ...state, isAmbassadorUnlockModalOpen: false, cartItems: [...state.cartItems, { ...ambassadorProduct, quantity: 1, productId: ambassadorProduct.id } as any], isCartOpen: true }; }
            return state;
        case 'SHOW_SOCIAL_POST_GENERATOR_MODAL': return { ...state, isSocialPostGeneratorModalOpen: action.payload.isOpen, socialPostGeneratorData: { deed: action.payload.deed } };
        case 'TOGGLE_MEANING_PALM_ACTIVATION_MODAL': return { ...state, isMeaningPalmActivationModalOpen: action.payload };
        case 'UNLOCK_MEANING_PALM':
            if (state.user && state.user.manaPoints >= 15000) {
                // SECURE CALL
                dbAdapter.spendManaPoints(15000).then(success => {
                    if (success) {
                        const updatedUser = { ...state.user!, manaPoints: state.user!.manaPoints - 15000, hasUnlockedMeaningPalm: true };
                        dbAdapter.saveUser(updatedUser);
                    }
                });
                // Optimistic UI Update
                const updatedUser = { ...state.user, manaPoints: state.user.manaPoints - 15000, hasUnlockedMeaningPalm: true };
                return { ...state, user: updatedUser, isMeaningPalmActivationModalOpen: false };
            }
            return state;
        case 'OPEN_FUTURE_VISION_MODAL': return { ...state, isFutureVisionModalOpen: true, futureVisionDeed: action.payload };
        case 'CLOSE_FUTURE_VISION_MODAL': return { ...state, isFutureVisionModalOpen: false, futureVisionDeed: null };
        case 'OPEN_VOICE_OF_PALM_MODAL': return { ...state, isVoiceOfPalmModalOpen: true, voiceOfPalmDeed: action.payload };
        case 'CLOSE_VOICE_OF_PALM_MODAL': return { ...state, isVoiceOfPalmModalOpen: false, voiceOfPalmDeed: null };
        case 'SUBSCRIBE_MONTHLY': return state;
        case 'ADD_TIMELINE_EVENT':
            if (state.user) { const updatedTimeline = [action.payload, ...(state.user.timeline || [])]; const updatedUser = { ...state.user, timeline: updatedTimeline }; dbAdapter.saveUser(updatedUser); return { ...state, user: updatedUser }; }
            return state;
        case 'UPDATE_TIMELINE_EVENT':
            if (state.user) { const updatedTimeline = (state.user.timeline || []).map(event => event.deedId === action.payload.deedId ? { ...event, ...action.payload.memory } : event); const updatedUser = { ...state.user, timeline: updatedTimeline }; dbAdapter.saveUser(updatedUser); return { ...state, user: updatedUser }; }
            return state;
        case 'TOGGLE_WISHLIST': if (state.wishlist.includes(action.payload)) { return { ...state, wishlist: state.wishlist.filter(id => id !== action.payload) }; } else { return { ...state, wishlist: [...state.wishlist, action.payload] }; }
        case 'DONATE_POINTS':
            if (state.user && state.user.points >= action.payload.amount) {
                // SECURE CALL
                dbAdapter.spendBarkatPoints(action.payload.amount).then(success => {
                    if (success) console.log("Points donated");
                });
                // Optimistic UI
                const updatedUser = { ...state.user, points: state.user.points - action.payload.amount, pointsHistory: [...(state.user.pointsHistory || []), { action: 'اهدای امتیاز', points: -action.payload.amount, type: 'barkat' as const, date: new Date().toISOString() }] };
                dbAdapter.saveUser(updatedUser);
                return { ...state, user: updatedUser };
            }
            return state;
        case 'ADD_POST': dbAdapter.savePost(action.payload); return { ...state, communityPosts: [action.payload, ...state.communityPosts] };
        case 'UPDATE_APP_SETTINGS': return { ...state, appSettings: { ...state.appSettings, ...action.payload } };
        case 'UPDATE_API_SETTINGS': const newHistory = [...state.apiSettingsHistory, { settings: state.apiSettings, timestamp: new Date().toISOString() }]; return { ...state, apiSettings: { ...state.apiSettings, ...action.payload }, apiSettingsHistory: newHistory };
        case 'UPDATE_AI_CONFIG': return { ...state, aiConfig: { ...state.aiConfig, ...action.payload } };
        case 'UPDATE_NAVIGATION': return { ...state, siteConfig: { ...state.siteConfig, navigation: action.payload } };
        case 'UPDATE_CAMPAIGN': return { ...state, campaign: action.payload };
        case 'UPDATE_PALM_TYPES': return { ...state, palmTypes: action.payload };
        case 'START_PLANTING_FLOW': return { ...state, isPalmSelectionModalOpen: true };
        case 'QUICK_PAY':
            const { palm: qpPalm, quantity: qpQuantity, deedDetails: qpDeedDetails, selectedPlan: qpSelectedPlan } = action.payload;
            const qpTotal = qpPalm.price * qpQuantity;
            const qpDeed: Deed = { id: `deed-${Date.now()}`, productId: qpPalm.id, intention: qpDeedDetails.intention, name: qpDeedDetails.name, date: new Date().toISOString(), palmType: qpPalm.name, message: qpDeedDetails.message, fromName: qpDeedDetails.fromName, groveKeeperId: qpDeedDetails.groveKeeperId, isPlanted: false };
            const qpOrder: Order = { id: `order-${Date.now()}`, userId: state.user?.id || 'guest', status: 'pending', totalAmount: qpTotal, createdAt: new Date().toISOString(), items: [{ ...qpPalm, id: `${qpPalm.id}-${Date.now()}`, quantity: qpQuantity, image: `https://picsum.photos/seed/${qpPalm.id}/400/400`, paymentPlan: qpSelectedPlan > 1 ? { installments: qpSelectedPlan } : undefined }], statusHistory: [{ status: 'pending', date: new Date().toISOString() }], deeds: [qpDeed] };
            const qpPointsEarned = Math.min((qpPalm.points || 0) * qpQuantity, 20000);
            const qpTimelineEvents = [createTimelineEventFromDeed(qpDeed)];
            let qpUnlockUpdates = {};
            if (qpPalm.id === 'p_heritage_language') { qpUnlockUpdates = { hasUnlockedEnglishTest: true }; }
            const qpUpdatedUser = state.user ? { ...state.user, points: state.user.points + qpPointsEarned, pointsHistory: [...(state.user.pointsHistory || []), { action: 'خرید سریع', points: qpPointsEarned, type: 'barkat' as const, date: new Date().toISOString() }], timeline: [...qpTimelineEvents, ...(state.user.timeline || [])], ...qpUnlockUpdates } : null;
            dbAdapter.saveOrder(qpOrder);
            if (qpUpdatedUser) dbAdapter.saveUser(qpUpdatedUser);
            return { ...state, orders: [...state.orders, qpOrder], isOrderSuccessModalOpen: true, isDeedPersonalizationModalOpen: false, lastOrderDeeds: [qpDeed], lastOrderPointsEarned: qpPointsEarned, user: qpUpdatedUser };
        case 'CONFIRM_PLANTING': const updatedDeeds = state.allDeeds.map(deed => deed.id === action.payload.deedId ? { ...deed, isPlanted: true, plantedPhotoUrl: `data:image/jpeg;base64,${action.payload.photoBase64}` } : deed); return { ...state, allDeeds: updatedDeeds };
        case 'ADD_DEED_UPDATE': const deedsWithUpdate = state.allDeeds.map(deed => deed.id === action.payload.deedId ? { ...deed, updates: [...(deed.updates || []), action.payload.update] } : deed); return { ...state, allDeeds: deedsWithUpdate };
        case 'ADD_PROPOSAL': return { ...state, proposals: [action.payload, ...state.proposals] };
        case 'UPDATE_PROPOSAL': return { ...state, proposals: state.proposals.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) };
        case 'SPEND_MANA_POINTS':
            if (state.user && state.user.manaPoints >= action.payload.points) {
                // SECURE CALL
                dbAdapter.spendManaPoints(action.payload.points).then(success => {
                    // Handle failure if needed
                });
                // Optimistic UI Update
                const updatedUser = { ...state.user, manaPoints: state.user.manaPoints - action.payload.points, pointsHistory: [...(state.user.pointsHistory || []), { action: action.payload.action, points: -action.payload.points, type: 'mana' as const, date: new Date().toISOString() }] };
                dbAdapter.saveUser(updatedUser);
                return { ...state, user: updatedUser };
            }
            return state;
        case 'SET_ENGLISH_SCENARIO': return { ...state, currentEnglishScenario: action.payload };
        case 'SET_CURRENT_VOCABULARY_TOPIC': return { ...state, currentVocabularyTopic: action.payload };
        case 'START_COACHING_SESSION': return { ...state, coachingSession: action.payload };
        case 'SET_ONBOARDING_STEP': return { ...state, onboardingStep: action.payload as any };
        case 'CLAIM_GIFT_PALM': return { ...state, onboardingStep: 'certificate' };
        case 'END_TOUR': return { ...state, onboardingStep: 'none' };
        case 'SET_SELECTED_LANGUAGE': return { ...state, selectedLanguage: action.payload };
        case 'INVEST_IN_PROJECT': { const { projectId, amount, method } = action.payload; if (!state.user) return state; const updatedProjects = state.microfinanceProjects.map(p => { if (p.id === projectId) { return { ...p, amountFunded: p.amountFunded + amount, backersCount: p.backersCount + 1 }; } return p; }); let updatedUser = { ...state.user }; const pointsCost = amount / 10; if (method === 'points') { if (updatedUser.points < pointsCost) return state; updatedUser.points -= pointsCost; updatedUser.pointsHistory = [...(updatedUser.pointsHistory || []), { action: 'سرمایه‌گذاری در صندوق رویش', points: -pointsCost, type: 'barkat', date: new Date().toISOString() }]; } updatedUser.impactPortfolio = [...(updatedUser.impactPortfolio || []), { projectId, amountLent: amount, dateLent: new Date().toISOString(), status: 'active' }]; dbAdapter.saveUser(updatedUser); return { ...state, microfinanceProjects: updatedProjects, user: updatedUser }; }
        case 'ADD_REVIEW': { const { review } = action.payload; if (!state.user) return state; const pointsAwarded = 50; const updatedUser = { ...state.user, points: state.user.points + pointsAwarded, pointsHistory: [...(state.user.pointsHistory || []), { action: 'ثبت تجربه و نظر', points: pointsAwarded, type: 'barkat' as const, date: new Date().toISOString() }] }; const reviewWithStatus = { ...review, status: 'pending' as const }; const updatedReviews = [reviewWithStatus, ...state.reviews]; dbAdapter.saveUser(updatedUser); return { ...state, reviews: updatedReviews, user: updatedUser, pointsToast: { points: pointsAwarded, action: 'ثبت بازتاب تجربه' } }; }
        case 'LIKE_REVIEW': { const { reviewId } = action.payload; const updatedReviews = state.reviews.map(r => r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r); return { ...state, reviews: updatedReviews }; }
        case 'UPDATE_REVIEW_STATUS': { const { reviewId, status } = action.payload; const updatedReviews = state.reviews.map(r => r.id === reviewId ? { ...r, status: status as 'approved' | 'rejected' | 'pending' } : r); return { ...state, reviews: updatedReviews }; }
        case 'DELETE_REVIEW': { const { reviewId } = action.payload; const updatedReviews = state.reviews.filter(r => r.id !== reviewId); return { ...state, reviews: updatedReviews }; }
        case 'ADD_GENERATED_COURSE': { const newCourse = action.payload; return { ...state, generatedCourses: [...(state.generatedCourses || []), newCourse] }; }
        case 'SET_BOTTOM_NAV_VISIBLE': return { ...state, isBottomNavVisible: action.payload };
        case 'LOAD_INITIAL_DATA': return { ...state, ...action.payload };
        case 'SET_PENDING_REDIRECT': return { ...state, pendingRedirectView: action.payload };

        // --- NEW EXECUTIVE OS HANDLER ---
        case 'EXECUTE_SMART_ACTION': {
            const actionData = action.payload;
            const payload = actionData.payload;

            if (actionData.type === 'create_campaign') {
                const newCampaign: Campaign = {
                    id: `camp-${Date.now()}`,
                    title: payload.title,
                    description: payload.description,
                    goal: payload.goal,
                    current: 0,
                    unit: payload.unit,
                    ctaText: 'مشارکت در کمپین',
                    rewardPoints: 500
                };
                return { ...state, campaign: newCampaign, pointsToast: { points: 0, action: `کمپین "${payload.title}" فعال شد` } };
            }

            if (actionData.type === 'publish_announcement') {
                const newPost: CommunityPost = {
                    id: `post-exec-${Date.now()}`,
                    authorId: 'admin-bot',
                    authorName: 'دفتر استراتژی (هوشمانا)',
                    authorAvatar: 'https://picsum.photos/seed/ai-strategy/100/100',
                    timestamp: new Date().toISOString(),
                    text: `# ${payload.title}\n\n${payload.text}`,
                    likes: 0
                };
                dbAdapter.savePost(newPost);
                return { ...state, communityPosts: [newPost, ...state.communityPosts], pointsToast: { points: 0, action: 'اطلاعیه منتشر شد' } };
            }

            if (actionData.type === 'grant_bonus') {
                if (state.user) {
                    const bonus = payload.amount;
                    // SECURE CALL for Admin action
                    // In real world this would be a bulk operation via API
                    dbAdapter.spendBarkatPoints(-bonus); // Negative spend = Grant

                    const updatedUser = {
                        ...state.user,
                        points: state.user.points + bonus,
                        pointsHistory: [...(state.user.pointsHistory || []), { action: payload.reason, points: bonus, type: 'barkat' as const, date: new Date().toISOString() }]
                    };
                    dbAdapter.saveUser(updatedUser);
                    return { ...state, user: updatedUser, pointsToast: { points: bonus, action: payload.reason } };
                }
            }

            return state;
        }

        default: return state;
    }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);



    useEffect(() => {
        const loadData = async () => {
            const [users, orders, posts, products] = await Promise.all([
                dbAdapter.getAllUsers(),
                dbAdapter.getAllOrders(),
                dbAdapter.getAllPosts(),
                dbAdapter.getAllProducts()
            ]);

            const currentUserId = dbAdapter.getCurrentUserId();
            const currentUser = currentUserId ? await dbAdapter.getUserById(currentUserId) : null;

            dispatch({
                type: 'LOAD_INITIAL_DATA',
                payload: {
                    users,
                    allUsers: users,
                    orders,
                    communityPosts: posts,
                    products: products.length > 0 ? products : INITIAL_PRODUCTS,
                    user: currentUser
                }
            });
        };
        loadData();

        // 🟢 AUTH LISTENER (Unified Meaning OS Fix)
        // Keeps local state in sync with Supabase Auth (Google Login support)
        if (supabase) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                console.log("🔐 Auth Event:", event);

                if (event === 'SIGNED_IN' && session?.user) {
                    const currentId = dbAdapter.getCurrentUserId();
                    // Prevent redundant updates if already logged in matches
                    if (currentId === session.user.id) return;

                    console.log("✅ User Signed In, Syncing...");

                    // 1. Try to get full profile from our DB
                    let appUser = await dbAdapter.getUserById(session.user.id);

                    // 2. If new user, map from Supabase and save
                    if (!appUser) {
                        console.log("🌱 New User/First Login - Creating Profile");
                        appUser = {
                            ...mapSupabaseUser(session.user),
                            id: session.user.id // Ensure ID matches
                        } as User;
                        await dbAdapter.saveUser(appUser);
                    }

                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: {
                            user: appUser!,
                            orders: [],
                            keepOpen: false
                        }
                    });
                }
                else if (event === 'SIGNED_OUT') {
                    dispatch({ type: 'LOGOUT' });
                }
            });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, []);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppState = () => {
    const context = useContext(AppContext);
    if (!context) { throw new Error('useAppState must be used within an AppProvider'); }
    return context.state;
};

export const useAppDispatch = () => {
    const context = useContext(AppContext);
    if (!context) { throw new Error('useAppDispatch must be used within an AppProvider'); }
    return context.dispatch;
};
