
import React from 'react';
import { User } from './user';

export enum View {
  Home = 'HOME',
  About = 'ABOUT',
  HallOfHeritage = 'HALL_OF_HERITAGE',
  Shop = 'SHOP',
  Courses = 'COURSES',
  HerosJourney = 'HEROS_JOURNEY',
  UserProfile = 'USER_PROFILE',
  Corporate = 'CORPORATE',
  OurGrove = 'OUR_GROVE',
  MeaningCoachingScholarship = 'MEANING_COACHING_SCHOLARSHIP',
  CompassUnlockChat = 'COMPASS_UNLOCK_CHAT',
  PathOfMeaning = 'PATH_OF_MEANING',
  CommunityHub = 'COMMUNITY_HUB',
  Articles = 'ARTICLES',
  AdminDashboard = 'ADMIN_DASHBOARD',
  CoCreation = 'CO_CREATION',
  DailyOasis = 'DAILY_OASIS',
  DIRECT_MESSAGES = 'DIRECT_MESSAGES',
  TransparencyDashboard = 'TRANSPARENCY_DASHBOARD',
  Contact = 'CONTACT',
  AIPortal = 'AI_PORTAL',
  AI_CREATION_STUDIO = 'AI_CREATION_STUDIO',
  AI_ACADEMY = 'AI_ACADEMY', 
  LIFE_MASTERY_ACADEMY = 'LIFE_MASTERY_ACADEMY', // New View
  MeaningCompanion = 'MEANING_COMPANION',
  ENGLISH_ACADEMY = 'ENGLISH_ACADEMY',
  ENGLISH_PLACEMENT_TEST = 'ENGLISH_PLACEMENT_TEST',
  AI_CONVERSATION_PARTNER = 'AI_CONVERSATION_PARTNER',
  VOCABULARY_BUILDER = 'VOCABULARY_BUILDER',
  BUSINESS_ACADEMY = 'BUSINESS_ACADEMY',
  BUSINESS_PROCESS_MODELER = 'BUSINESS_PROCESS_MODELER',
  DISC_TEST = 'DISC_TEST',
  ENNEAGRAM_TEST = 'ENNEAGRAM_TEST',
  STRENGTHS_TEST = 'STRENGTHS_TEST',
  IKIGAI_TEST = 'IKIGAI_TEST',
  HEROS_JOURNEY_INTRO = 'HEROS_JOURNEY_INTRO',
  COACHING_LAB = 'COACHING_LAB',
  COACHING_SESSION = 'COACHING_SESSION',
  'digital-heritage-architect' = 'DIGITAL_HERITAGE_ARCHITECT',
  GiftConcierge = 'GIFT_CONCIERGE',
  'living-heritage' = 'LIVING_HERITAGE',
  'garden-of-heroes' = 'GARDEN_OF_HEROES',
  'meaning-coach' = 'MEANING_COACH',
  'community-projects' = 'COMMUNITY_PROJECTS',
  Microfinance = 'MICROFINANCE',
  SMART_CONSULTANT = 'SMART_CONSULTANT',
  BUSINESS_MENTOR = 'BUSINESS_MENTOR',
  'ai-tools' = 'AI_TOOLS'
}

export type Page = View;

export interface NavItem {
  title: string;
  description: string;
  icon: string;
  view?: View;
  page?: View; 
}

export interface NavCategory {
  category: string;
  children: NavItem[];
}

export interface LiveActivity {
    id: string;
    icon: React.ReactNode; 
    text: string;
}

export interface UserLevel {
    level: number;
    name: string;
    pointsThreshold: number;
    manaThreshold: number;
    icon: React.FC<any>;
}

export type AchievementId = 'profile_complete' | 'first_palm' | 'first_creative_act' | 'first_course' | 'community_builder' | 'guardian' | 'pathfinder' | 'loyal_member' | 'reach_sapling' | 'digital_cocreator';

export interface Achievement {
    id: AchievementId;
    title: string;
    name: string;
    points: number;
    description: string;
    icon: React.ReactElement;
    cta?: { text: string; page?: View };
}

export interface PathMilestone {
    id: string;
    title: string;
    description: string;
    icon: React.FC<any>;
    isComplete: (user: User) => boolean;
    points?: number;
}

export interface Spotlight {
    id: string;
    icon: React.FC<any>;
    title: string;
    description: string;
    cta: {
        text: string;
        page: View;
    };
}

export interface ProvinceData {
    id: string;
    name: string;
    palms: number;
    jobs: number;
}

export type CoachingRole = 'coach' | 'coachee' | 'observer' | 'business_client';

export interface CoachingStep {
}

export interface InvitationContent {
    milestoneId: string;
    title: string;
    message: string;
}

export interface AdminKPIs {
    userGrowth: { value: number; trend: 'rising' | 'stable' | 'falling' };
    engagementScore: { value: number; trend: 'rising' | 'stable' | 'falling' };
    investmentFlow: { value: number; trend: 'rising' | 'stable' | 'falling' };
}

export interface AdminReport {
    sentiment: {
        score: number;
        label: string;
        trend: 'rising' | 'stable' | 'falling';
        mood: 'happy' | 'concerned' | 'neutral' | 'needs_motivation' | 'angry';
        summary: string;
    };
    keyThemes: KeyTheme[];
    actionableSuggestions: {
        suggestion: string;
        reasoning: string;
    }[];
}

export interface KeyTheme {
    theme: string;
    summary: string;
    insightIds: string[];
    count: number;
}

export interface CommunityProject {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    current: number;
    goal: number;
    jobsCreated: number;
    provinceId: string;
    updates?: ProjectUpdate[];
}

export interface ProjectUpdate {
    date: string;
    title: string;
    description: string;
}

export interface ActionableDraft {
    type: 'projectUpdate';
    title: string;
    description: string;
}

export interface FunnelStep {
    name: string;
    value: number;
}

export interface AppSettings {
    meaningCompassPrice: number;
    alchemyPrompt: string;
    enableSystemUpgrade: boolean;
    usdToTomanRate: number; // New field for currency conversion
}

export interface SiteConfig {
    navigation: NavCategory[];
}

export interface WebsitePackage {
    id: string;
    name: string;
    price: number;
}

export interface DailyChestReward {
    type: 'barkat' | 'mana' | 'epic';
    amount: number;
    message: string;
    bonusMultiplier?: number;
    item?: string; 
}
