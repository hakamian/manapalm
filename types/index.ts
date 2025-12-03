
export * from './ui';
export * from './user';
export * from './commerce';
export * from './content';
export * from './education';
export * from './ai';

import { User, PointLog, Contribution } from './user';
import { View, AppSettings, SiteConfig, CoachingRole, NavCategory, Achievement, CommunityProject, AdminKPIs, FunnelStep, DailyChestReward, LiveActivity } from './ui';
import { Order, CartItem, Product, Campaign, PalmType, MicrofinanceProject, HeritageItem, OrderStatus } from './commerce';
import { Notification, CommunityEvent, CommunityPost, Deed, DeedUpdate, ProjectProposal, TimelineEvent, Review } from './content';
import { Course, CoursePersonalization, WebDevProject, LMSLesson, TargetLanguage, MentorshipRequest } from './education';
import { AIConfig } from './ai';

// --- EXECUTIVE OS TYPES ---
export type SmartActionType = 'create_campaign' | 'publish_announcement' | 'grant_bonus' | 'create_project' | 'add_roadmap_item';

export interface SmartAction {
    id: string;
    type: SmartActionType;
    label: string;
    description?: string;
    payload: any;
    status?: 'pending' | 'executed';
}

export interface StrategicDecree {
    decreeText: string;
    actions: SmartAction[];
}
// --------------------------

export interface AppState {
    user: User | null;
    users: User[]; 
    allUsers: User[]; 
    orders: Order[];
    cartItems: CartItem[];
    wishlist: string[];
    notifications: Notification[];
    reviews: Review[];
    generatedCourses: Course[];
    dailyChallenge: any | null;
    isGeneratingChallenge: boolean;
    currentView: View;
    isAuthModalOpen: boolean;
    isCartOpen: boolean;
    isOrderSuccessModalOpen: boolean;
    isWelcomeModalOpen: boolean;
    isPalmSelectionModalOpen: boolean;
    isDeedPersonalizationModalOpen: boolean;
    isCompanionUnlockModalOpen: boolean;
    isCompanionTrialModalOpen: boolean;
    isReflectionAnalysisUnlockModalOpen: boolean;
    isAmbassadorUnlockModalOpen: boolean;
    isSocialPostGeneratorModalOpen: boolean;
    isMeaningPalmActivationModalOpen: boolean;
    isFutureVisionModalOpen: boolean;
    isVoiceOfPalmModalOpen: boolean;
    isBottomNavVisible: boolean; 
    pendingRedirectView?: View;

    lastOrderDeeds: Deed[];
    lastOrderPointsEarned: number;
    pointsToast: { points: number; action: string; type?: 'barkat' | 'mana' } | null;
    selectedPalmForPersonalization: PalmType | null;
    futureVisionDeed: Deed | null;
    voiceOfPalmDeed: Deed | null;
    
    communityEvents: CommunityEvent[];
    communityPosts: CommunityPost[];
    allDeeds: Deed[];
    proposals: ProjectProposal[];
    microfinanceProjects: MicrofinanceProject[];
    campaign: Campaign;
    palmTypes: PalmType[];
    products: Product[];
    
    mentorshipRequests: MentorshipRequest[];
    
    socialPostGeneratorData: { deed: Deed | null };
    
    communityStats: {
        totalPalmsPlanted: number;
        totalJobHours: number;
        totalCo2Absorbed: number;
    };
    personalStats: {
        palms: number;
        jobHours: number;
        co2Absorbed: number;
    };
    
    profileInitialTab?: string;
    
    appSettings: AppSettings;
    apiSettings: {
        budget: number;
        mode: 'optimal' | 'performance';
    };
    aiConfig: AIConfig;
    siteConfig: SiteConfig;
    apiSettingsHistory: any[];
    
    liveActivities: LiveActivity[];
    
    onboardingStep: 'none' | 'certificate';
    
    coachingSession: {
        role: CoachingRole;
        topic: string;
        currentStep: number;
        startTime: string;
        isRealSession: boolean;
        returnView?: View;
    } | null;
    
    currentEnglishScenario?: string;
    currentVocabularyTopic?: string;
    selectedLanguage?: TargetLanguage;
}

export type Action = 
    | { type: 'SET_USER'; payload: User | null }
    | { type: 'UPDATE_USER'; payload: Partial<User> }
    | { type: 'SAVE_COURSE_PERSONALIZATION'; payload: { courseId: string, personalization: CoursePersonalization } }
    | { type: 'SET_VIEW'; payload: View }
    | { type: 'TOGGLE_AUTH_MODAL'; payload: boolean }
    | { type: 'TOGGLE_CART'; payload: boolean }
    | { type: 'ADD_TO_CART'; payload: { product: Product | CartItem, quantity: number, deedDetails?: any, paymentPlan?: any } }
    | { type: 'REMOVE_FROM_CART'; payload: string }
    | { type: 'SET_CART_ITEMS'; payload: CartItem[] }
    | { type: 'PLACE_ORDER'; payload: Order }
    | { type: 'LOGIN_SUCCESS'; payload: { user: User, orders: Order[], keepOpen?: boolean } }
    | { type: 'LOGOUT' }
    | { type: 'SET_DAILY_CHALLENGE'; payload: any }
    | { type: 'SET_IS_GENERATING_CHALLENGE'; payload: boolean }
    | { type: 'MARK_NOTIFICATION_READ'; payload: string }
    | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
    | { type: 'CLOSE_DEED_MODALS' }
    | { type: 'SET_WELCOME_MODAL'; payload: boolean }
    | { type: 'SET_PROFILE_TAB_AND_NAVIGATE'; payload: string }
    | { type: 'HIDE_POINTS_TOAST' }
    | { type: 'SHOW_POINTS_TOAST'; payload: { points: number; action: string; type?: 'barkat' | 'mana' } }
    | { type: 'SELECT_PALM_FOR_DEED'; payload: PalmType }
    | { type: 'PERSONALIZE_DEED_AND_ADD_TO_CART'; payload: { palm: PalmType, quantity: number, deedDetails: any, selectedPlan: number } }
    | { type: 'SHOW_COMPANION_UNLOCK_MODAL'; payload: boolean }
    | { type: 'START_COMPANION_PURCHASE' }
    | { type: 'SHOW_COMPANION_TRIAL_MODAL'; payload: boolean }
    | { type: 'SHOW_REFLECTION_UNLOCK_MODAL'; payload: boolean }
    | { type: 'START_REFLECTION_PURCHASE' }
    | { type: 'SHOW_AMBASSADOR_UNLOCK_MODAL'; payload: boolean }
    | { type: 'START_AMBASSADOR_PURCHASE' }
    | { type: 'SHOW_SOCIAL_POST_GENERATOR_MODAL'; payload: { isOpen: boolean, deed: Deed | null } }
    | { type: 'TOGGLE_MEANING_PALM_ACTIVATION_MODAL'; payload: boolean }
    | { type: 'UNLOCK_MEANING_PALM' }
    | { type: 'OPEN_FUTURE_VISION_MODAL'; payload: Deed }
    | { type: 'CLOSE_FUTURE_VISION_MODAL' }
    | { type: 'OPEN_VOICE_OF_PALM_MODAL'; payload: Deed }
    | { type: 'CLOSE_VOICE_OF_PALM_MODAL' }
    | { type: 'SUBSCRIBE_MONTHLY' }
    | { type: 'ADD_TIMELINE_EVENT'; payload: TimelineEvent }
    | { type: 'UPDATE_TIMELINE_EVENT'; payload: { deedId: string, memory: any } }
    | { type: 'TOGGLE_WISHLIST'; payload: string }
    | { type: 'DONATE_POINTS'; payload: { recipientId?: string, amount: number } }
    | { type: 'ADD_POST'; payload: CommunityPost }
    | { type: 'UPDATE_APP_SETTINGS'; payload: Partial<AppSettings> }
    | { type: 'UPDATE_API_SETTINGS'; payload: any }
    | { type: 'UPDATE_AI_CONFIG'; payload: Partial<AIConfig> }
    | { type: 'UPDATE_NAVIGATION'; payload: NavCategory[] }
    | { type: 'UPDATE_CAMPAIGN'; payload: Campaign }
    | { type: 'UPDATE_PALM_TYPES'; payload: PalmType[] }
    | { type: 'START_PLANTING_FLOW' }
    | { type: 'QUICK_PAY'; payload: any }
    | { type: 'CONFIRM_PLANTING'; payload: { deedId: string, photoBase64: string } }
    | { type: 'ADD_DEED_UPDATE'; payload: { deedId: string, update: DeedUpdate } }
    | { type: 'ADD_PROPOSAL'; payload: ProjectProposal }
    | { type: 'UPDATE_PROPOSAL'; payload: Partial<ProjectProposal> & { id: string } }
    | { type: 'SPEND_MANA_POINTS'; payload: { points: number, action: string } }
    | { type: 'SET_ENGLISH_SCENARIO'; payload: string }
    | { type: 'SET_CURRENT_VOCABULARY_TOPIC'; payload: string }
    | { type: 'START_COACHING_SESSION'; payload: any }
    | { type: 'SET_ONBOARDING_STEP'; payload: string }
    | { type: 'CLAIM_GIFT_PALM' }
    | { type: 'END_TOUR' }
    | { type: 'SET_SELECTED_LANGUAGE'; payload: TargetLanguage }
    | { type: 'INVEST_IN_PROJECT'; payload: { projectId: string, amount: number, method: 'wallet' | 'points' } }
    | { type: 'ADD_REVIEW'; payload: { review: Review } }
    | { type: 'LIKE_REVIEW'; payload: { reviewId: string } }
    | { type: 'UPDATE_REVIEW_STATUS'; payload: { reviewId: string, status: string } }
    | { type: 'DELETE_REVIEW'; payload: { reviewId: string } }
    | { type: 'ADD_GENERATED_COURSE'; payload: Course }
    | { type: 'SET_BOTTOM_NAV_VISIBLE'; payload: boolean }
    | { type: 'LOAD_INITIAL_DATA'; payload: Partial<AppState> }
    | { type: 'SET_PENDING_REDIRECT'; payload: View | undefined }
    | { type: 'EXECUTE_SMART_ACTION'; payload: SmartAction }; // New Action

// Global Constants
export const CREATIVE_ACT_STORAGE_LIMIT = 20;
export const MIN_POINTS_FOR_MESSAGING = 500;
export const STORAGE_UPGRADE_COST_POINTS = 1000;
export const STORAGE_UPGRADE_AMOUNT = 50;
export const COMPASS_TRIAL_SECONDS = 600;
export const COMPANION_TRIAL_SECONDS = 90;
