
import { PathMilestone, User } from '../types.ts';
import {
    UserPlusIcon, LeafIcon, BookOpenIcon, SparklesIcon,
    ShieldKeyholeIcon, AwardIcon, CompassIcon, QuoteIcon, UsersGroupIcon
} from '../components/icons.tsx';
import { SaplingIcon, YoungPalmIcon } from '../components/icons-garden.tsx';
import { getUserLevel } from './gamification.ts';

export const PATH_MILESTONES: PathMilestone[] = [
    {
        id: 'welcome',
        title: 'آغاز سفر',
        description: 'به خانواده نخلستان معنا خوش آمدید! سفر شما برای خلق معنا آغاز شد.',
        icon: CompassIcon,
        isComplete: (user: User) => true, // Always complete
    },
    {
        id: 'profile_complete',
        title: 'تکمیل پروفایل',
        description: 'شما هویت خود را در این مسیر مشخص کردید و ۱۰۰ امتیاز هدیه گرفتید.',
        points: 100,
        icon: UserPlusIcon,
        isComplete: (user: User) => user.profileCompletion.initial,
    },
    {
        id: 'first_palm',
        title: 'اولین میراث',
        description: 'شما اولین نخل خود را کاشتید و داستانی را در دل زمین جاودانه کردید.',
        icon: LeafIcon,
        isComplete: (user: User) => user.timeline?.some(e => e.type === 'palm_planted') ?? false,
    },
    {
        id: 'first_reflection',
        title: 'ثبت اولین خاطره',
        description: 'شما با نوشتن اولین تامل، به لحظات خود عمق بیشتری بخشیدید.',
        icon: QuoteIcon,
        isComplete: (user: User) => user.timeline?.some(e => !!e.userReflection?.notes) ?? false,
    },
    {
        id: 'first_creative_act',
        title: 'جرقه خلاقیت',
        description: 'با کمک هوش مصنوعی، اولین اثر هنری خود را خلق کردید.',
        icon: SparklesIcon,
        isComplete: (user: User) => user.timeline?.some(e => e.type === 'creative_act') ?? false,
    },
    {
        id: 'level_2',
        title: 'ترفیع به شریک کوشا',
        description: 'تبریک! شما با کسب ۲۵۰ امتیاز به سطح جدیدی از همراهی رسیدید.',
        points: 250,
        icon: SaplingIcon,
        isComplete: (user: User) => getUserLevel(user.points).level >= 2,
    },
    {
        id: 'find_mentor',
        title: 'یافتن مربی راهنما',
        description: 'شما برای ادامه مسیر خود یک نگهبان راهنما و باتجربه پیدا کردید.',
        icon: UsersGroupIcon,
        isComplete: (user: User) => !!user.mentorId,
    },
    {
        id: 'first_course',
        title: 'اولین گام در آکادمی',
        description: 'شما با ثبت‌نام در اولین دوره، مسیر آگاهی و رشد را آغاز کردید.',
        icon: BookOpenIcon,
        isComplete: (user: User) => (user.purchasedCourseIds?.length ?? 0) > 0,
    },
    {
        id: 'level_3',
        title: 'ترفیع به شریک فرازگر',
        description: 'همراهی شما ارزشمند است! شما با ۷۵۰ امتیاز، به جایگاه فرازگران رسیدید.',
        points: 750,
        icon: YoungPalmIcon,
        isComplete: (user: User) => getUserLevel(user.points).level >= 3,
    },
    {
        id: 'guardian_invite',
        title: 'دعوت به حلقه نگهبانان',
        description: 'شما به دلیل تعهدتان، شایسته عضویت در حلقه خصوصی نگهبانان معنا شدید.',
        points: 1500,
        icon: AwardIcon,
        isComplete: (user: User) => user.hasBeenInvitedToGuardians ?? false,
    },
    {
        id: 'guardian',
        title: 'نگهبان معنا',
        description: 'به حلقه درونی نخلستان معنا خوش آمدید. حضور شما، آینده این جنبش را می‌سازد.',
        icon: ShieldKeyholeIcon,
        isComplete: (user: User) => user.isGuardian ?? false,
    },
];