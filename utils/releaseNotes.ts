
import { SparklesIcon, CogIcon, ShoppingCartIcon, AcademicCapIcon, UsersIcon, ShieldCheckIcon } from '../components/icons';

export interface Feature {
    category: string;
    icon: any;
    items: string[];
    audience: 'all' | 'admin'; // 'all' for everyone, 'admin' for admins/devs only
}

export interface ReleaseNote {
    version: string;
    date: string;
    title: string;
    description: string;
    features: Feature[];
    isMajor: boolean; 
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
                category: 'هوش مصنوعی (برای همه)',
                icon: SparklesIcon,
                audience: 'all',
                items: [
                    'قابلیت گفتگو با اسناد (PDF/Audio) در استودیو',
                    'دستیار نویسنده هوشمند برای خلق داستان نخل'
                ]
            },
            {
                category: 'فروشگاه',
                icon: ShoppingCartIcon,
                audience: 'all',
                items: [
                    'خرید اقساطی بر اساس اعتبار امتیاز شما',
                    'امکان خرید گروهی (Crowdfunding) برای هدایا'
                ]
            },
            {
                category: 'پنل مدیریت (ویژه مدیران)',
                icon: ShieldCheckIcon,
                audience: 'admin',
                items: [
                    'اضافه شدن ۵ مشاور تخصصی در پنل ادمین',
                    'داشبورد تحلیل احساسات کاربران',
                    'سیستم تشخیص تقلب (Fraud Detection)'
                ]
            },
            {
                category: 'زیرساخت فنی',
                icon: CogIcon,
                audience: 'admin',
                items: [
                    'افزایش امنیت و سرعت با معماری جدید',
                    'بهینه‌سازی دیتابیس برای لود سریع‌تر',
                    'اتصال پروکسی برای هوش مصنوعی'
                ]
            }
        ]
    }
];

export const getLatestRelease = () => RELEASE_NOTES[0];
