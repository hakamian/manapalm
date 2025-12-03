
import { View } from './ui';
import { Product, CartItem, Order } from './commerce';
import { TimelineEvent, Conversation, Notification } from './content';
import { CoursePersonalization, LMSModule, TargetLanguage, EnglishLevelReport, MeaningCompassAnalysis, HyperPersonalizedReport, JournalAnalysisReport, DISCReport, EnneagramReport, StrengthsReport, IkigaiReport, WebDevProject, LanguageConfig } from './education';
import { ChatMessage } from './ai';

export interface User {
  id: string;
  name: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string;
  avatar?: string;
  points: number;
  manaPoints: number; 
  level: string;
  isAdmin?: boolean;
  joinDate: string;
  profileCompletion: {
      initial: boolean;
      additional: boolean;
      extra: boolean;
  };
  creativeStorageCapacity?: number;
  storageUsed?: number;
  storageLimit?: number;
  following?: string[];
  followers?: string[];
  conversations: Conversation[];
  timeline?: TimelineEvent[];
  pointsHistory?: PointLog[];
  contributions?: Contribution[];
  notifications: Notification[];
  values?: string[];
  isGroveKeeper?: boolean;
  groveDescription?: string;
  achievements?: string[]; 
  unlockedAchievements?: string[];
  meaningCoachingState?: { currentDay: number };
  purchasedCourseIds?: string[];
  coursePersonalizations?: Record<string, CoursePersonalization>;
  scholarshipStatus?: 'none' | 'applied' | 'awarded';
  allowDirectMessages?: boolean;
  hasUnlockedCompass?: boolean;
  compassChatDuration?: number;
  hasUnlockedHerosJourney?: boolean;
  meaningCompassAnalysis?: MeaningCompassAnalysis | null;
  meaningGoal?: string; 
  hasUnlockedCompanion?: boolean;
  companionTrialSecondsUsed?: number;
  reflectionAnalysesRemaining: number;
  ambassadorPacksRemaining: number;
  hyperPersonalizedReport?: HyperPersonalizedReport | null;
  journalAnalysisReport?: JournalAnalysisReport | null;
  englishAcademyStats?: { totalPracticeSeconds: number; sessionsCompleted: number };
  englishAcademyLevel?: string;
  englishAcademyProgress?: Record<string, any>;
  discReport?: DISCReport | null;
  enneagramReport?: EnneagramReport | null;
  strengthsReport?: StrengthsReport | null;
  ikigaiReport?: IkigaiReport | null;
  englishAcademyTrialSecondsUsed?: number;
  meaningCompassTrialSecondsUsed?: number;
  address?: string;
  maritalStatus?: 'مجرد' | 'متاهل';
  childrenCount?: number;
  birthYear?: number;
  nationalId?: string;
  fatherName?: string;
  motherName?: string;
  occupation?: string;
  isCoach?: boolean;
  isGuardian?: boolean;
  menteeIds?: string[];
  mentorId?: string;
  mentorName?: string;
  mentorBio?: string;
  description?: string;
  profileImageUrl?: string;
  checkIns?: any[];
  meaningCoachHistory?: ChatMessage[];
  webDevProject?: WebDevProject;
  hasUnlockedMeaningPalm?: boolean;
  hoshmanaLiveAccess?: {
      expiresAt: string;
      remainingSeconds: number;
  };
  coachingLabAccess?: {
      expiresAt: string;
  };
  languageConfig?: LanguageConfig;
  hasUnlockedEnglishTest?: boolean;
  impactPortfolio?: {
      projectId: string;
      amountLent: number;
      dateLent: string;
      status: 'active' | 'repaid' | 'defaulted';
  }[];
  referralPointsEarned?: number;
  notificationPreferences?: {
      orders: boolean;
      promotions: boolean;
      newsletter: boolean;
  };
  apiKey?: string;
  googleDriveEmail?: string;
  googleDriveLastBackup?: string;
  hasBeenInvitedToGuardians?: boolean;
  unlockedTools?: string[];
  isMonthlySubscriber?: boolean;
  lastDailyChestClaimed?: string; 
  dailyStreak?: number; 
}

export interface PointLog {
  action: string;
  points: number;
  type: 'barkat' | 'mana';
  date: string;
}

export interface Contribution {
    id: string;
    type: 'course' | 'product' | 'other';
    title: string;
    dateSubmitted: string;
    status: 'در حال بررسی' | 'تایید شده' | 'رد شده';
    price?: number;
    socialImpactPercentage?: number;
    provinceId?: string; 
}
