
import React from 'react';

// Re-export all icons from the icons subdirectory
export * from './icons/BasicIcons';
export * from './icons/NatureIcons';
export * from './icons/BusinessIcons';
export * from './icons/CommunicationIcons';
export * from './icons/BadgeIcons';
export * from './icons/MeaningIcons';
export * from './icons/SecurityIcons';

// Import specific icons for aliases and iconMap
import { 
    HomeIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon, 
    ArrowRightIcon, ArrowUpIcon, ArrowDownIcon, ArrowPathIcon, ArrowDownTrayIcon, 
    ArrowUpTrayIcon, MagnifyingGlassIcon, XMarkIcon, XIcon, PlusIcon, PlusCircleIcon, 
    MinusIcon, CheckIcon, CheckCircleIcon, Bars3Icon, Squares2x2Icon, FunnelIcon, 
    BellIcon, CogIcon, EyeIcon, LockClosedIcon, PencilIcon, PencilSquareIcon, 
    TrashIcon, CameraIcon, ClockForwardIcon, PhotoIcon, ShoppingCartIcon, 
    UserCircleIcon, PaperClipIcon, PlayIcon, PauseIcon, StopIcon, ExclamationCircleIcon, 
    DocumentTextIcon, DoubleCheckIcon, ArrowTrendingUpIcon, KeyboardIcon
} from './icons/BasicIcons';

import { 
    SproutIcon, SaplingIcon, TreeIcon, MatureTreeIcon, LeafIcon, PalmTreeIcon, 
    PalmTreeSproutIcon 
} from './icons/NatureIcons';

import { 
    BriefcaseIcon, BuildingOfficeIcon, PresentationChartLineIcon, HandshakeIcon, 
    BanknotesIcon, ChartBarIcon, ChartPieIcon, CalculatorIcon, HandCoinIcon, 
    RocketLaunchIcon, PuzzlePieceIcon 
} from './icons/BusinessIcons';

import { 
    EnvelopeIcon, HeartIcon, FireIcon, PaperAirplaneIcon, UserPlusIcon, 
    ChatBubbleOvalLeftEllipsisIcon, ChatBubbleLeftRightIcon, ChatBubbleBottomCenterTextIcon, 
    GiftIcon, SparklesIcon, BoltIcon, YouTubeIcon, LinkedInIcon, TelegramIcon, 
    WhatsAppIcon, EitaaIcon, BaleIcon, GoogleIcon, MegaphoneIcon, FlagIcon, 
    KeyIcon, PhoneIcon, DashboardIcon, CreditCardIcon, TruckIcon, QuoteIcon, 
    ShareIcon, BoxIcon, ContributionIcon, SpeakerWaveIcon, SpeakerXMarkIcon, 
    InstagramIcon, GlobeIcon, UsersIcon 
} from './icons/CommunicationIcons';

import { 
    TrophyIcon, AwardIcon, FirstPlaceIcon, SecondPlaceIcon, ThirdPlaceIcon, 
    CommunityContributorBadgeIcon, PathfinderBadgeIcon, LoyalMemberBadgeIcon, 
    FirstPalmBadgeIcon, BadgeCheckIcon, PartnerIcon1, PartnerIcon2, PartnerIcon3 
} from './icons/BadgeIcons';

import { 
    BrainCircuitIcon, CompassIcon, MapIcon, MapPinIcon, BookOpenIcon, 
    AcademicCapIcon, CpuChipIcon, CloudIcon, MicrophoneIcon, ClockIcon, 
    VideoCameraIcon, PalmChatIcon, SunIcon, WandSparklesIcon, WifiSlashIcon, 
    WavesIcon, WellIcon, CalendarDaysIcon, QrCodeIcon, ShieldKeyholeIcon, 
    ShieldCheckIcon, RadarIcon, BullseyeIcon, UserFrownIcon, TargetIcon, 
    LightBulbIcon, SitemapIcon, StarIcon 
} from './icons/MeaningIcons';

import { 
    ShieldExclamationIcon, ExclamationTriangleIcon, EyeSlashIcon 
} from './icons/SecurityIcons';

// Re-export aliases
export const GlobeAltIcon = GlobeIcon; 
export const UsersGroupIcon = UsersIcon; 
export const UserGroupIcon = UsersIcon; 
export const TrendingUpIcon = ArrowTrendingUpIcon; 

export const CubeTransparentIcon = React.memo(({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
));

// New Icons for Daily Chest
export const TreasureIcon = React.memo(({ className = "w-8 h-8" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Zm2 6v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8H4Zm9 4h-2v-2h2v2Z" />
    </svg>
));

export const OpenTreasureIcon = React.memo(({ className = "w-8 h-8" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M5 12h14v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8Zm-1.8-2.4 1.6-3.2A2 2 0 0 1 6.6 5h10.8a2 2 0 0 1 1.8 1.4l1.6 3.2a1 1 0 0 1-1 1.4H4.2a1 1 0 0 1-1-1.4Z" />
    </svg>
));

export const SparklesBurstIcon = React.memo(({ className = "w-8 h-8" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
));

// Map for dynamic icons
export const iconMap = {
    'palm_planted': SproutIcon,
    'account_created': UserPlusIcon,
    'creative_act': SparklesIcon,
    'reflection': BookOpenIcon,
    'decision': BrainCircuitIcon,
    'success': TrophyIcon,
    'appreciation': HeartIcon,
    'level_up': AwardIcon,
    'community_contribution': HandshakeIcon,
    'course_completed': BookOpenIcon,
    'mention': UserCircleIcon,
    'default': SparklesIcon,
    'well': WellIcon,
    'birth': SproutIcon,
    'gratitude': HeartIcon,
    'memory': QuoteIcon, 
    'community': UsersIcon,
    'clock_forward': ClockForwardIcon,
};
