
import { SparklesIcon, CogIcon, ShoppingCartIcon, AcademicCapIcon, UsersIcon } from '../components/icons';

export interface ReleaseNote {
    version: string;
    date: string;
    title: string;
    description: string;
    features: {
        category: string;
        icon: any;
        items: string[];
    }[];
    isMajor: boolean; // If true, automatically show modal on first visit
}

export const RELEASE_NOTES: ReleaseNote[] = [
    {
        version: '0.1.0',
        date: '۱۴۰۳/۰۵/۲۵',
        title: 'نسخه نمایشی پیشرفته: هوش مصنوعی زنده شد!',
        description: 'در این بروزرسانی بزرگ، ما مغز متفکر نخلستان را ارتقا دادیم. اکنون مشاوران هوشمند، تولیدکنندگان محتوا و سیستم‌های تحلیلگر در خدمت شما هستند.',
        isMajor: true,
        features: [
            {
                category: 'هوش مصنوعی',
                icon: SparklesIcon,
                items: [
                    'اضافه شدن ۵ مشاور تخصصی در پنل مدیریت',
                    'قابلیت گفتگو با اسناد (PDF/Audio) در استودیو',
                    'تولید خودکار دوره‌های آموزشی از روی ویدیوهای یوتیوب'
                ]
            },
            {
                category: 'فروشگاه',
                icon: ShoppingCartIcon,
                items: [
                    'خرید اقساطی بر اساس اعتبار امتیاز شما',
                    'امکان خرید گروهی (Crowdfunding) برای هدایا'
                ]
            },
            {
                category: 'زیرساخت',
                icon: CogIcon,
                items: [
                    'افزایش امنیت و سرعت با معماری جدید',
                    'قابلیت نصب برنامه روی موبایل (PWA)'
                ]
            }
        ]
    }
];

export const getLatestRelease = () => RELEASE_NOTES[0];
