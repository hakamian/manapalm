
import { SproutIcon, SaplingIcon, TreeIcon, MatureTreeIcon, LeafIcon, PalmTreeIcon, PalmTreeSproutIcon } from './NatureIcons';
import { BriefcaseIcon, BuildingOfficeIcon, PresentationChartLineIcon, HandshakeIcon, BanknotesIcon, ChartBarIcon, ChartPieIcon, CalculatorIcon, HandCoinIcon, RocketLaunchIcon, PuzzlePieceIcon } from './BusinessIcons';
import { EnvelopeIcon, HeartIcon, FireIcon, PaperAirplaneIcon, UserPlusIcon, ChatBubbleOvalLeftEllipsisIcon, ChatBubbleLeftRightIcon, ChatBubbleBottomCenterTextIcon, GiftIcon, SparklesIcon, BoltIcon, YouTubeIcon, LinkedInIcon, TelegramIcon, WhatsAppIcon, EitaaIcon, BaleIcon, GoogleIcon, UsersIcon, MegaphoneIcon, FlagIcon, KeyIcon, PhoneIcon, DashboardIcon, GlobeIcon, CreditCardIcon, TruckIcon, QuoteIcon, ShareIcon, BoxIcon, ContributionIcon, SpeakerWaveIcon, SpeakerXMarkIcon, InstagramIcon } from './CommunicationIcons';
import { TrophyIcon, AwardIcon, FirstPlaceIcon, SecondPlaceIcon, ThirdPlaceIcon, CommunityContributorBadgeIcon, PathfinderBadgeIcon, LoyalMemberBadgeIcon, FirstPalmBadgeIcon, BadgeCheckIcon, PartnerIcon1, PartnerIcon2, PartnerIcon3 } from './BadgeIcons';
import { BrainCircuitIcon, CompassIcon, MapIcon, MapPinIcon, BookOpenIcon, AcademicCapIcon, CpuChipIcon, CloudIcon, MicrophoneIcon, ClockIcon, VideoCameraIcon, PalmChatIcon, SunIcon, WandSparklesIcon, WifiSlashIcon, WavesIcon, WellIcon, CalendarDaysIcon, QrCodeIcon, ShieldKeyholeIcon, ShieldCheckIcon, RadarIcon, BullseyeIcon, UserFrownIcon, TargetIcon, LightBulbIcon, SitemapIcon, StarIcon } from './MeaningIcons';
import { HomeIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, ArrowDownIcon, ArrowPathIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ArrowTrendingUpIcon, MagnifyingGlassIcon, XMarkIcon, XIcon, PlusIcon, PlusCircleIcon, MinusIcon, CheckIcon, CheckCircleIcon, Bars3Icon, Squares2x2Icon, FunnelIcon, BellIcon, CogIcon, EyeIcon, LockClosedIcon, PencilIcon, PencilSquareIcon, TrashIcon, CameraIcon, ClockForwardIcon, PhotoIcon, ShoppingCartIcon, UserCircleIcon, PaperClipIcon, PlayIcon, PauseIcon, StopIcon, ExclamationCircleIcon, DocumentTextIcon, KeyboardIcon } from './BasicIcons';
import { ShieldExclamationIcon, ExclamationTriangleIcon, EyeSlashIcon } from './SecurityIcons';

export * from './BasicIcons';
export * from './NatureIcons';
export * from './BusinessIcons';
export * from './CommunicationIcons';
export * from './BadgeIcons';
export * from './MeaningIcons';
export * from './SecurityIcons';

export const GlobeAltIcon = GlobeIcon; // Alias from original file
export const UsersGroupIcon = UsersIcon; // Alias often used in code
export const UserGroupIcon = UsersIcon; // Added alias for UserGroupIcon to UsersIcon
export const TrendingUpIcon = ArrowTrendingUpIcon; // Added alias for TrendingUpIcon to ArrowTrendingUpIcon

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
