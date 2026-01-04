'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, Action, View, Deed, TimelineEvent, Order, CartItem, WebDevProject, AIConfig, TargetLanguage, Review, User, SmartAction, Campaign, CommunityPost, DeedUpdate } from './types';
import { INITIAL_USERS, INITIAL_ORDERS, INITIAL_POSTS, INITIAL_DEEDS, PALM_TYPES_DATA, INITIAL_PROPOSALS, INITIAL_LIVE_ACTIVITIES, INITIAL_PRODUCTS, INITIAL_NOTIFICATIONS, INITIAL_MENTORSHIP_REQUESTS, INITIAL_MICROFINANCE_PROJECTS, INITIAL_REVIEWS } from './utils/dummyData';
import { dbAdapter } from './services/dbAdapter';
import { supabase, mapSupabaseUser } from './services/supabaseClient';
import { orderService } from './services/application/orderService';
import { userService } from './services/application/userService';
import { communityService } from './services/application/communityService';

const initialNavigation = [
    {
        category: 'نخلستان',
        children: [
            { view: View.HallOfHeritage, icon: 'SproutIcon', title: 'تالار میراث', description: 'میراث خود را با کاشت یک نخل جاودانه کنید.' },
            { view: View.OurGrove, icon: 'TreeIcon', title: 'نخلستان ما', description: 'تاثیر جمعی و نقشه زنده نخلستان را ببینید.' },
            { view: View.Shop, icon: 'ShoppingCartIcon', title: 'فروشگاه', description: 'محصولات ارگانیک و صنایع دستی محلی.' },
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
        category: 'درباره ما',
        children: [
            { view: View.About, icon: 'UsersIcon', title: 'درباره ما', description: 'با داستان، تیم و رسالت ما آشنا شوید.' },
            { view: View.Contact, icon: 'PhoneIcon', title: 'تماس با ما', description: 'راه‌های ارتباطی و ارسال نظرات.' },
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
    users: INITIAL_USERS,
    allUsers: INITIAL_USERS,
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
    searchQuery: '',

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
    gamificationAlerts: [],
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


function appReducer(state: AppState, action: Action): AppState {
    let newState = { ...state };

    switch (action.type) {
        case 'SET_USER':
            console.log("⚛️ Reducer: SET_USER", action.payload?.id || 'null');
            return { ...state, user: action.payload };
        case 'UPDATE_USER':
            console.log("⚛️ Reducer: UPDATE_USER", action.payload);
            if (state.user) {
                // 🛡️ Ensure we are updating the SAME user, not clobbering with a temporary one
                const updatedUser = { ...state.user, ...action.payload };
                const updatedAllUsers = state.allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);

                console.log("📝 UPDATE_USER Syncing to DB:", {
                    id: updatedUser.id,
                    addresses: updatedUser.addresses?.length || 0
                });

                dbAdapter.saveUser(updatedUser);
                return { ...state, user: updatedUser, allUsers: updatedAllUsers };
            }
            return state;
        case 'SAVE_COURSE_PERSONALIZATION':
            if (state.user) {
                const { courseId, personalization } = action.payload;
                const updatedPersonalizations = { ...(state.user.coursePersonalizations || {}), [courseId]: personalization };
                const updatedUser = { ...state.user, coursePersonalizations: updatedPersonalizations };
                const updatedAllUsers = state.allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
                return { ...state, user: updatedUser, allUsers: updatedAllUsers };
            }
            return state;
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
            const { updatedUser, pointsEarned, newNotifications } = orderService.processOrderPlacement(state, action.payload);
            return {
                ...state,
                orders: [...state.orders, action.payload],
                cartItems: [],
                isCartOpen: false,
                isOrderSuccessModalOpen: true,
                lastOrderDeeds: action.payload.deeds || [],
                lastOrderPointsEarned: pointsEarned,
                user: updatedUser,
                notifications: [...newNotifications, ...state.notifications]
            };
        }
        case 'LOGIN_SUCCESS':
            console.log("⚛️ Reducer: LOGIN_SUCCESS", action.payload.user?.id);
            return {
                ...state,
                user: action.payload.user,
                orders: action.payload.orders,
                isAuthModalOpen: action.payload.keepOpen ? true : false
            };
        case 'LOGOUT':
            return { ...state, user: null, orders: [], cartItems: [], currentView: View.Home };
        case 'SET_DAILY_CHALLENGE': return { ...state, dailyChallenge: action.payload };
        case 'SET_IS_GENERATING_CHALLENGE': return { ...state, isGeneratingChallenge: action.payload };
        case 'MARK_NOTIFICATION_READ': return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true, isRead: true } : n) };
        case 'MARK_ALL_NOTIFICATIONS_READ': return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true, isRead: true })) };
        case 'CLOSE_DEED_MODALS': return { ...state, isOrderSuccessModalOpen: false, isPalmSelectionModalOpen: false, isDeedPersonalizationModalOpen: false };
        case 'SET_WELCOME_MODAL': return { ...state, isWelcomeModalOpen: action.payload };
        case 'SET_PROFILE_TAB_AND_NAVIGATE': return { ...state, currentView: View.UserProfile, profileInitialTab: action.payload, isCartOpen: false };
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
            return { ...state, isMeaningPalmActivationModalOpen: false };
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
            return state; // Handling logic moved to components
        case 'ADD_POST': dbAdapter.savePost(action.payload); return { ...state, communityPosts: [action.payload, ...state.communityPosts] };
        case 'UPDATE_APP_SETTINGS': return { ...state, appSettings: { ...state.appSettings, ...action.payload } };
        case 'UPDATE_API_SETTINGS': const newHistory = [...state.apiSettingsHistory, { settings: state.apiSettings, timestamp: new Date().toISOString() }]; return { ...state, apiSettings: { ...state.apiSettings, ...action.payload }, apiSettingsHistory: newHistory };
        case 'UPDATE_AI_CONFIG': return { ...state, aiConfig: { ...state.aiConfig, ...action.payload } };
        case 'UPDATE_NAVIGATION': return { ...state, siteConfig: { ...state.siteConfig, navigation: action.payload } };
        case 'UPDATE_CAMPAIGN': return { ...state, campaign: action.payload };
        case 'UPDATE_PALM_TYPES': return { ...state, palmTypes: action.payload };
        case 'UPDATE_PRODUCT':
            dbAdapter.updateProduct(action.payload.id, action.payload.data);
            return {
                ...state,
                products: state.products.map(p => p.id === action.payload.id ? { ...p, ...action.payload.data } : p)
            };
        case 'ADD_PRODUCT':
            dbAdapter.createProduct(action.payload.product);
            return {
                ...state,
                products: [action.payload.product, ...state.products]
            };
        case 'DELETE_PRODUCT':
            dbAdapter.deleteProduct(action.payload.id);
            return {
                ...state,
                products: state.products.filter(p => p.id !== action.payload.id)
            };
        case 'START_PLANTING_FLOW': return { ...state, isPalmSelectionModalOpen: true };
        case 'QUICK_PAY': {
            const { palm, quantity, deedDetails, selectedPlan } = action.payload;
            const qpOrder = orderService.createQuickOrder(state.user, palm, quantity, deedDetails, selectedPlan);
            const { updatedUser, pointsEarned, newNotifications } = orderService.processOrderPlacement(state, qpOrder);

            return {
                ...state,
                orders: [...state.orders, qpOrder],
                isOrderSuccessModalOpen: true,
                isDeedPersonalizationModalOpen: false,
                lastOrderDeeds: qpOrder.deeds || [],
                lastOrderPointsEarned: pointsEarned,
                user: updatedUser,
                notifications: [...newNotifications, ...state.notifications]
            };
        }
        case 'CONFIRM_PLANTING': const updatedDeeds = state.allDeeds.map(deed => deed.id === action.payload.deedId ? { ...deed, isPlanted: true, plantedPhotoUrl: `data:image/jpeg;base64,${action.payload.photoBase64}` } : deed); return { ...state, allDeeds: updatedDeeds };
        case 'ADD_DEED_UPDATE': const deedsWithUpdate = state.allDeeds.map(deed => deed.id === action.payload.deedId ? { ...deed, updates: [...(deed.updates || []), action.payload.update] } : deed); return { ...state, allDeeds: deedsWithUpdate };
        case 'ADD_PROPOSAL': return { ...state, proposals: [action.payload, ...state.proposals] };
        case 'UPDATE_PROPOSAL': return { ...state, proposals: state.proposals.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) };
        case 'SPEND_MANA_POINTS':
            return state; // Handling logic moved to components
        case 'SET_ENGLISH_SCENARIO': return { ...state, currentEnglishScenario: action.payload };
        case 'SET_CURRENT_VOCABULARY_TOPIC': return { ...state, currentVocabularyTopic: action.payload };
        case 'START_COACHING_SESSION': return { ...state, coachingSession: action.payload };
        case 'SET_ONBOARDING_STEP': return { ...state, onboardingStep: action.payload as any };
        case 'CLAIM_GIFT_PALM': return { ...state, onboardingStep: 'certificate' };
        case 'END_TOUR': return { ...state, onboardingStep: 'none' };
        case 'SET_SELECTED_LANGUAGE': return { ...state, selectedLanguage: action.payload };
        case 'INVEST_IN_PROJECT':
            return state; // Handling logic moved to components
        case 'ADD_REVIEW':
            return state; // Handling logic moved to components
        case 'LIKE_REVIEW': { const { reviewId } = action.payload; const updatedReviews = state.reviews.map(r => r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r); return { ...state, reviews: updatedReviews }; }
        case 'UPDATE_REVIEW_STATUS': { const { reviewId, status } = action.payload; const updatedReviews = state.reviews.map(r => r.id === reviewId ? { ...r, status: status as 'approved' | 'rejected' | 'pending' } : r); return { ...state, reviews: updatedReviews }; }
        case 'DELETE_REVIEW': { const { reviewId } = action.payload; const updatedReviews = state.reviews.filter(r => r.id !== reviewId); return { ...state, reviews: updatedReviews }; }
        case 'ADD_GENERATED_COURSE': { const newCourse = action.payload; return { ...state, generatedCourses: [...(state.generatedCourses || []), newCourse] }; }
        case 'SET_BOTTOM_NAV_VISIBLE': return { ...state, isBottomNavVisible: action.payload };
        // Duplicate SET_PROFILE_TAB_AND_NAVIGATE removed
        case 'LOAD_INITIAL_DATA':
            // 🛡️ CRITICAL GUARD: Never overwrite an already authenticated user with null/default data.
            // This fixes the case where Google Auth finishes before Initial Load.
            if (state.user && !action.payload.user) {
                console.log("🛡️ [AuthGate] Blocking attempt to overwrite active session with null initial data");
                const { user, ...otherData } = action.payload;
                return { ...state, ...otherData };
            }
            return { ...state, ...action.payload };
        case 'LOAD_ADMIN_DATA': return { ...state, allUsers: action.payload.users, users: action.payload.users, orders: action.payload.orders };
        case 'ADD_GAMIFICATION_ALERT': return { ...state, gamificationAlerts: [...state.gamificationAlerts, action.payload] };
        case 'DISMISS_GAMIFICATION_ALERT': return { ...state, gamificationAlerts: state.gamificationAlerts.slice(1) };
        case 'SET_PENDING_REDIRECT': return { ...state, pendingRedirectView: action.payload };
        case 'SET_SEARCH_QUERY': return { ...state, searchQuery: action.payload };

        // --- NEW EXECUTIVE OS HANDLER ---
        case 'EXECUTE_SMART_ACTION': {
            const actionData = action.payload;
            const payload = actionData.payload;

            if (actionData.type === 'create_campaign') {
                const newCampaign = communityService.createCampaign(payload);
                return { ...state, campaign: newCampaign, pointsToast: { points: 0, action: `کمپین "${payload.title}" فعال شد` } };
            }

            // Other admin actions moved to component or utility
            return state;
        }

        default: return state;
    }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);



    useEffect(() => {
        console.log("💎 AppProvider Mounted. Current storage user ID:", dbAdapter.getCurrentUserId());
    }, []);

    // 🛡️ Consolidated Auth & Initial Load Sync
    useEffect(() => {
        const cleanAuthUrl = () => {
            if (typeof window === 'undefined') return false;
            const params = new URLSearchParams(window.location.search);
            const hasAuthParams = params.has('code') || params.has('error') || params.has('access_token') || window.location.hash.includes('access_token');

            if (hasAuthParams) {
                params.delete('code');
                params.delete('error');
                params.delete('error_description');
                params.delete('access_token');
                params.delete('refresh_token');
                params.delete('expires_in');
                params.delete('token_type');
                const newQuery = params.toString();
                const newUrl = window.location.pathname + (newQuery ? '?' + newQuery : '');
                window.history.replaceState({}, document.title, newUrl);
                return true;
            }
            return false;
        };

        const loadInit = async () => {
            console.log("🚀 [StallTrace] loadInit started");
            try {
                const currentUserId = dbAdapter.getCurrentUserId();
                console.log("🚀 [StallTrace] currentUserId from storage:", currentUserId);

                console.log("🚀 [StallTrace] Fetching posts and products...");
                const [posts, products] = await Promise.all([
                    dbAdapter.getAllPosts().catch(e => { console.error("❌ posts fetch failed", e); return []; }),
                    dbAdapter.getAllProducts().catch(e => { console.error("❌ products fetch failed", e); return []; })
                ]);
                console.log("🚀 [StallTrace] Posts/Products fetched successfully");

                let currentUser: User | null = null;
                let userOrders: Order[] = [];

                if (currentUserId) {
                    console.log("🚀 [StallTrace] Fetching user by ID:", currentUserId);
                    currentUser = await dbAdapter.getUserById(currentUserId).catch(e => { console.error("❌ getUserById failed", e); return null; });
                    console.log("🚀 [StallTrace] User fetch result:", currentUser?.id || 'null');

                    if (currentUser) {
                        console.log("🚀 [StallTrace] Fetching orders for user...");
                        userOrders = await dbAdapter.getOrders(currentUserId).catch(e => { console.error("❌ getOrders failed", e); return []; });
                        console.log("🚀 [StallTrace] Orders fetched:", userOrders.length);
                    }
                }

                console.log("🚀 [StallTrace] Dispatching LOAD_INITIAL_DATA");
                dispatch({
                    type: 'LOAD_INITIAL_DATA',
                    payload: {
                        communityPosts: posts,
                        products: products.length > 0 ? products : INITIAL_PRODUCTS,
                        // 🛡️ Only load user if it's NOT already set by a faster Auth event
                        user: currentUser,
                        orders: userOrders
                    }
                });

                if (cleanAuthUrl()) {
                    console.log("🔄 Detected Auth Redirect - Navigating to Profile");
                    dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: 'profile' });
                }
            } catch (err) {
                console.error("❌ [StallTrace] loadInit FATAL ERROR:", err);
            }
        };
        loadInit();
    }, []);


    // 🟢 UNIFIED AUTH LISTENER
    useEffect(() => {
        if (!supabase) return;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("🔐 [AuthEvent]:", event, session?.user?.id);

            if (session?.user) {
                const realId = session.user.id;
                dbAdapter.setCurrentUserId(realId);

                // 🛡️ Immediate Fallback Identity: Use mapped Google user as a baseline 
                // so the app never shows 'null' while loading DB profile.
                const fallbackUser = mapSupabaseUser(session.user);

                dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: { user: fallbackUser as User, orders: [] }
                });

                // Try to load detailed profile from DB
                try {
                    const appUser = await dbAdapter.getUserById(realId);
                    if (appUser) {
                        dispatch({ type: 'SET_USER', payload: appUser });
                    } else {
                        console.log("🌱 Creating profile record for new user:", realId);
                        await dbAdapter.saveUser(fallbackUser as User);
                    }
                } catch (err) {
                    console.error("❌ Failed to sync detailed profile, staying with fallback identity.", err);
                }

                // Close modal and potential redirect
                dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: false });
            }
            else if (event === 'SIGNED_OUT') {
                dbAdapter.setCurrentUserId(null);
                dispatch({ type: 'LOGOUT' });
            }
        });

        return () => subscription.unsubscribe();
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
