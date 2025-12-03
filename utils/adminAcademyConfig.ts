
import React from 'react';
import { AcademicCapIcon, BriefcaseIcon, BrainCircuitIcon, SitemapIcon, StarIcon, UserCircleIcon, MegaphoneIcon, BanknotesIcon, BoltIcon, SparklesIcon } from '../components/icons';

export interface AcademyConfig {
    id: string;
    title: string;
    description: string;
    icon: React.FC<any>;
    color: string;
    relatedProductIds: string[]; // To calculate revenue
    courseIds: string[]; // To filter reviews/students
}

export const ACADEMY_MODULES: AcademyConfig[] = [
    {
        id: 'ai_academy',
        title: 'آکادمی هوش مصنوعی و اتوماسیون',
        description: 'ساخت ارتش یک‌نفره با ابزارهای AI و ایجنت‌ها',
        icon: SparklesIcon,
        color: 'purple',
        relatedProductIds: ['p_unlock_video_gen', 'p_unlock_deep_chat', 'p_unlock_image_edit'],
        courseIds: ['prompt-alchemy', 'invisible-army', 'ai-coding-mastery', 'creativity-studio', 'ai-marketing-alchemy', 'alchemy-prompt-mastery', 'ai-data-mastery']
    },
    {
        id: 'creator_academy',
        title: 'آکادمی اقتصاد محتوا و برندسازی',
        description: 'مهندسی شهرت، استراتژی محتوا و تبدیل مخاطب به ثروت',
        icon: MegaphoneIcon,
        color: 'rose',
        relatedProductIds: ['p_ambassador_pack'],
        courseIds: ['value-proposition-mastery', 'master-of-asking', 'social-entrepreneurship']
    },
    {
        id: 'finance_academy',
        title: 'آکادمی ثروت و سرمایه‌گذاری',
        description: 'هوش مالی نوین، جریان نقدینگی و اقتصاد توکنایز شده',
        icon: BanknotesIcon,
        color: 'emerald',
        relatedProductIds: ['p_mana_pack'],
        courseIds: ['income-alchemy', 'customer-funded-revolution']
    },
    {
        id: 'leadership_academy',
        title: 'آکادمی رهبری و سیستم‌سازی',
        description: 'معماری کسب‌وکارهای خودران، اسکیل کردن و مدیریت مدرن',
        icon: SitemapIcon,
        color: 'blue',
        relatedProductIds: ['p_business_mentor_session'],
        courseIds: ['service-business-academy', 'service-business-mentor', 'autonomous-org', 'business-model-reinvention', 'execution-mastery', 'running-lean', 'zero-to-one', 'business-coaching-mastery']
    },
    {
        id: 'bio_performance_academy',
        title: 'آکادمی عملکرد زیستی (Bio-Performance)',
        description: 'مهندسی انرژی، خواب، تمرکز عمیق و تاب‌آوری',
        icon: BoltIcon,
        color: 'amber',
        relatedProductIds: ['p_life_coach_session'],
        courseIds: ['new-world-skills', 'deep-work-mastery', 'simply-better']
    },
    {
        id: 'english_academy',
        title: 'آکادمی زبان جهانی',
        description: 'تسلط بر زبان تجارت و تکنولوژی',
        icon: AcademicCapIcon,
        color: 'cyan',
        relatedProductIds: ['p_heritage_language'],
        courseIds: ['service-english-academy']
    },
    {
        id: 'coaching_lab',
        title: 'آزمایشگاه کوچینگ (تخصصی)',
        description: 'فضای تمرین و مسیرهای تسلط کوچ‌ها',
        icon: BrainCircuitIcon,
        color: 'indigo',
        relatedProductIds: ['p_coaching_lab_access'],
        courseIds: ['service-coaching-lab', 'co-active-mastery']
    }
];
