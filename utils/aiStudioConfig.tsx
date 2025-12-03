
import React from 'react';
import { PhotoIcon, PencilSquareIcon, ChatBubbleBottomCenterTextIcon, VideoCameraIcon, MicrophoneIcon, BrainCircuitIcon, WandSparklesIcon, ArrowDownTrayIcon, MegaphoneIcon, CpuChipIcon, DocumentTextIcon, BookOpenIcon, AcademicCapIcon, PresentationChartLineIcon, UsersGroupIcon, ArrowPathIcon, SpeakerWaveIcon, ShareIcon } from '../components/icons';

export type ToolCategory = 'all' | 'visual' | 'text' | 'audio' | 'strategy' | 'education';

export interface CreationToolConfig {
    id: string;
    title: string;
    description: string;
    icon: React.FC<any>;
    color: string;
    category: ToolCategory;
    isPremium: boolean;
    unlockCost?: number; // Legacy hardcoded points (fallback)
    baseCostUSD?: number; // New field for dynamic pricing
    relatedProduct?: string;
    isNew?: boolean;
    isPopular?: boolean;
}

export const CREATION_TOOLS: CreationToolConfig[] = [
    {
        id: 'socialMediaArchitect',
        title: 'معمار شبکه‌های اجتماعی (Social Architect)',
        description: 'تولید محتوای تخصصی و وایرال برای اینستاگرام، لینکدین، یوتیوب و توییتر به صورت یکپارچه.',
        icon: ShareIcon,
        color: 'indigo',
        category: 'text',
        isPremium: true,
        baseCostUSD: 0.05, // ~600 Points at 120k
        isNew: true,
        isPopular: true
    },
    {
        id: 'podcastProducer',
        title: 'استودیو پادکست (Podcast Producer)',
        description: 'تبدیل متون و ایده‌ها به اسکریپت حرفه‌ای پادکست با کارگردانی صوتی.',
        icon: SpeakerWaveIcon,
        color: 'pink',
        category: 'audio',
        isPremium: true,
        baseCostUSD: 0.10, // ~1200 Points
        isNew: true,
        isPopular: true
    },
    {
        id: 'presentationArchitect',
        title: 'معمار ارائه (Presentation Architect)',
        description: 'طراحی هوشمند اسلاید دک، اینفوگرافیک و استوری‌بورد ویدیویی.',
        icon: PresentationChartLineIcon,
        color: 'cyan',
        category: 'visual',
        isPremium: true,
        baseCostUSD: 0.15, // ~1800 Points
        isNew: true,
        isPopular: true
    },
    {
        id: 'omniConverter',
        title: 'مبدل جامع محتوا (Omni-Converter)',
        description: 'تبدیل تخصصی پادکست، ویدیو یوتیوب، صدا و موضوعات به محتوای متنی کامل و جزوه.',
        icon: ArrowPathIcon,
        color: 'orange',
        category: 'text',
        isPremium: true,
        baseCostUSD: 0.10, // ~1200 Points
        isNew: true,
        isPopular: true
    },
    {
        id: 'articleAlchemist',
        title: 'کیمیاگر مقاله (Article Alchemist)',
        description: 'دستیار هوشمند برای نگارش مقالات وبلاگی و سئو شده از روی ایده یا متن کوتاه.',
        icon: DocumentTextIcon,
        color: 'emerald',
        category: 'text',
        isPremium: true,
        baseCostUSD: 0.10, 
        isNew: false,
        isPopular: true
    },
    {
        id: 'consultantCourse',
        title: 'اتاق فکر استراتژیک (Strategic Think Tank)',
        description: 'استخدام تیم متخصص هوش مصنوعی برای تحلیل مشکل شما و طراحی دوره/راهکار جامع.',
        icon: UsersGroupIcon,
        color: 'amber',
        category: 'strategy',
        isPremium: true,
        baseCostUSD: 0.30, // ~3600 Points
        isNew: true,
        isPopular: true
    },
    {
        id: 'omniCourseArchitect',
        title: 'ابرفراوری دانش و دوره (Omni-Course)',
        description: 'تبدیل هر چیزی (فایل صوتی، کتاب، لینک یوتیوب یا موضوع) به یک دوره آموزشی کامل و ساختاریافته.',
        icon: AcademicCapIcon,
        color: 'fuchsia',
        category: 'education',
        isPremium: true,
        baseCostUSD: 0.50, // ~6000 Points (High value)
        isNew: true,
        isPopular: true
    },
    {
        id: 'youtubeContent',
        title: 'معمار محتوای یوتیوب (SEO)',
        description: 'تبدیل ویدیوهای یوتیوب به مقالات وبلاگ سئو شده و خلاصه‌های مدیریتی.',
        icon: VideoCameraIcon,
        color: 'red',
        category: 'text',
        isPremium: true,
        baseCostUSD: 0.10,
        isNew: true,
        isPopular: true
    },
    {
        id: 'videoCourseBuilder',
        title: 'کیمیاگر دوره ویدیویی (Edu-Architect)',
        description: 'تبدیل ویدیوهای آموزشی یوتیوب به سرفصل‌های کامل دوره، تمرین و جزوه درسی.',
        icon: AcademicCapIcon,
        color: 'indigo',
        category: 'education',
        isPremium: true,
        baseCostUSD: 0.50,
        isNew: true,
        isPopular: false
    },
    {
        id: 'knowledgeRefiner',
        title: 'پالایشگر دانش (Knowledge Refiner)',
        description: 'تبدیل کتاب‌ها، مقالات، تصاویر و اسناد حجیم به دانش ناب و ساختاریافته.',
        icon: BookOpenIcon,
        color: 'amber',
        category: 'education',
        isPremium: true,
        baseCostUSD: 0.15,
        isNew: true,
        isPopular: true
    },
    {
        id: 'videoGen',
        title: 'رویاساز متحرک (Veo)',
        description: 'تبدیل متن و تصویر به ویدیوهای سینمایی با کیفیت بالا.',
        icon: VideoCameraIcon,
        color: 'purple',
        category: 'visual',
        isPremium: true,
        baseCostUSD: 1.50, // ~18000 Points (Very High Cost)
        relatedProduct: 'p_unlock_video_gen',
        isNew: true
    },
    {
        id: 'imageGen',
        title: 'باغ تصویر (Imagen 3)',
        description: 'خلق تصاویر هنری، فوتورئالیستیک و نمادین با هوش مصنوعی.',
        icon: PhotoIcon,
        color: 'pink',
        category: 'visual',
        isPremium: true, 
        baseCostUSD: 0.15,
        isPopular: true
    },
    {
        id: 'contentGen',
        title: 'کاتب هوشمند',
        description: 'دستیار نویسندگی خلاق برای وبلاگ، سوشال مدیا و داستان.',
        icon: PencilSquareIcon,
        color: 'blue',
        category: 'text',
        isPremium: false,
        baseCostUSD: 0.01,
        isPopular: true
    },
    {
        id: 'liveChat',
        title: 'هم‌کلام (Live API)',
        description: 'گفتگوی صوتی بی‌درنگ و طبیعی با هوش مصنوعی.',
        icon: MicrophoneIcon,
        color: 'red',
        category: 'audio',
        isPremium: true,
        baseCostUSD: 0.30, // Per session
        relatedProduct: 'p_hoshmana_live_weekly',
        isNew: true
    },
    {
        id: 'thinking',
        title: 'حکیم دانا (Reasoning)',
        description: 'حل مسائل پیچیده، استدلال منطقی و مشاوره استراتژیک.',
        icon: BrainCircuitIcon,
        color: 'amber',
        category: 'strategy',
        isPremium: true,
        baseCostUSD: 0.20, 
        relatedProduct: 'p_unlock_deep_chat'
    },
    {
        id: 'imageEdit',
        title: 'ویرایشگر جادویی',
        description: 'تغییر، حذف و اضافه کردن اجزای تصویر با دستور متنی.',
        icon: WandSparklesIcon,
        color: 'indigo',
        category: 'visual',
        isPremium: true,
        baseCostUSD: 0.15, 
        relatedProduct: 'p_unlock_image_edit'
    },
    {
        id: 'codeGen',
        title: 'معمار کد',
        description: 'تبدیل ایده به پروتوتایپ وب‌سایت و کدهای برنامه.',
        icon: CpuChipIcon,
        color: 'stone',
        category: 'strategy',
        isPremium: true,
        baseCostUSD: 0.25, 
        relatedProduct: 'p_unlock_deep_chat'
    },
    {
        id: 'transcribe',
        title: 'کاتب شنوا (Transcribe)',
        description: 'تبدیل دقیق فایل‌های صوتی جلسات و پادکست‌ها به متن.',
        icon: ArrowDownTrayIcon,
        color: 'orange',
        category: 'audio',
        isPremium: true,
        baseCostUSD: 0.05, 
        relatedProduct: 'p_mana_pack'
    },
    {
        id: 'tts',
        title: 'آوای سخن (TTS)',
        description: 'تبدیل متن به گفتار طبیعی با صداهای متنوع فارسی.',
        icon: MegaphoneIcon,
        color: 'teal',
        category: 'audio',
        isPremium: true,
        baseCostUSD: 0.05, 
        relatedProduct: 'p_mana_pack'
    },
    {
        id: 'chatbot',
        title: 'همدم دانا (Chat)',
        description: 'دستیار عمومی برای ایده‌پردازی و پاسخ به سوالات.',
        icon: ChatBubbleBottomCenterTextIcon,
        color: 'green',
        category: 'text',
        isPremium: false,
    },
];
