
import { Spotlight, Page, View } from '../types.ts';
import { UsersIcon, PalmTreeIcon, BellIcon, BrainCircuitIcon } from '../components/icons.tsx';

export const ALL_SPOTLIGHTS: Spotlight[] = [
    {
        id: 'spotlight-community-feed',
        icon: UsersIcon,
        title: 'باغ عمومی زنده شد!',
        description: 'با آخرین فعالیت‌های اعضای جامعه همراه شوید، با آنها همدلی کنید و در گفتگوها مشارکت نمایید.',
        cta: {
            text: 'ورود به باغ عمومی',
            // FIX: Use View enum instead of string literal
            page: View.CommunityHub,
        },
    },
    {
        id: 'spotlight-garden-of-heroes',
        icon: PalmTreeIcon,
        title: 'باغ قهرمانان افتتاح شد',
        description: 'سفر قهرمانی خود و دیگر اعضای برجسته را به صورت گرافیکی و جذاب در این باغ مشاهده کنید.',
        cta: {
            text: 'مشاهده باغ قهرمانان',
            // FIX: Use View enum instead of string literal
            page: View['garden-of-heroes'],
        },
    },
    {
        id: 'spotlight-notifications',
        icon: BellIcon,
        title: 'مرکز اعلان‌های شما',
        description: 'دیگر هیچ رویداد مهمی را از دست ندهید! همدلی‌ها، دیدگاه‌ها و دستاوردهای خود را در یک مکان ببینید.',
        cta: {
            text: 'فهمیدم!',
            // FIX: Use View enum instead of string literal
            page: View.UserProfile,
        },
    },
    {
        id: 'spotlight-meaning-coach',
        icon: BrainCircuitIcon,
        title: 'مربی معنای شخصی شما',
        description: 'با دستیار هوشمند خود گفتگو کنید و با راهنمایی او، به کاوش در دنیای درون خود بپردازید.',
        cta: {
            text: 'شروع گفتگو',
            // FIX: Use View enum instead of string literal
            page: View['meaning-coach'],
        },
    },
];