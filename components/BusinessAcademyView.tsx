
import React, { useState, useMemo, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View, CoachingRole, Course, LMSModule, CoursePersonalization, Product } from '../types';
import { 
    BriefcaseIcon, CpuChipIcon, SparklesIcon, ChartBarIcon, 
    UsersIcon, PlayIcon, ArrowLeftIcon, LockClosedIcon, CheckCircleIcon, 
    RocketLaunchIcon, LightBulbIcon, TargetIcon, PresentationChartLineIcon,
    PuzzlePieceIcon, MagnifyingGlassIcon, BrainCircuitIcon, HandshakeIcon, BoltIcon,
    SitemapIcon, DocumentTextIcon, BanknotesIcon, GlobeIcon, HeartIcon, TrophyIcon,
    GiftIcon, PhotoIcon, UserGroupIcon, CogIcon, StarIcon, PlusCircleIcon, XMarkIcon, MegaphoneIcon
} from './icons';
import CourseReviews, { AddReviewForm } from './CourseReviews';
import ModuleBriefingModal from './coaching-lab/ModuleBriefingModal';
import DeepReadingStep from './coaching-lab/DeepReadingStep';
import CoachingSessionView from './CoachingSessionView';
import CoursePersonalizationModal from './CoursePersonalizationModal';
import Modal from './Modal';
import CountdownTimer from './CountdownTimer';
import AcademyLandingHero from './AcademyLandingHero';
import { ACADEMY_CONTENTS } from '../utils/academyLandingContent';
import PersonalizationChoiceModal from './PersonalizationChoiceModal';
import CourseComparisonModal from './CourseComparisonModal';

// ... Imports for specific courses (unchanged) ...
import { valuePropositionMastery } from '../utils/coaching/courses/valuePropositionMastery';
import { executionMastery } from '../utils/coaching/courses/executionMastery';
import { businessModelReinvention } from '../utils/coaching/courses/businessModelReinvention'; 
import { masterOfAsking } from '../utils/coaching/courses/masterOfAsking';
import { socialEntrepreneurship } from '../utils/coaching/courses/socialEntrepreneurship';
import { incomeAlchemy } from '../utils/coaching/courses/incomeAlchemy';
import { runningLean } from '../utils/coaching/courses/runningLean';
import { actionableGamification } from '../utils/coaching/courses/actionableGamification';
import { zeroToOne } from '../utils/coaching/courses/zeroToOne';
import { invisibleArmy } from '../utils/coaching/courses/invisibleArmy';
import { aiCodingMastery } from '../utils/coaching/courses/aiCodingMastery';
import { creativityStudio } from '../utils/coaching/courses/creativityStudio';
import { promptAlchemy } from '../utils/coaching/courses/promptAlchemy';
import { alchemyPromptCourse } from '../utils/coaching/courses/alchemyPromptCourse';
import { aiMarketingAlchemy } from '../utils/coaching/courses/aiMarketingAlchemy';
import { autonomousOrg } from '../utils/coaching/courses/autonomousOrg';
import { aiDataMastery } from '../utils/coaching/courses/aiDataMastery';
import { deepWorkMastery } from '../utils/coaching/courses/deepWorkMastery';
import { simplyBetter } from '../utils/coaching/courses/simplyBetter';
import { businessCoachingMastery } from '../utils/coaching/courses/businessCoachingMastery';

interface BusinessModule {
    title: string;
    sessions: number;
    summary: string;
    timeEstimate: string;
    status: 'locked' | 'unlocked';
    keyConcepts: string[];
    longContent?: string;
    desc: string; 
    quiz?: { question: string; options: string[]; correctAnswer: number }[];
}

export const mapLmsModuleToBusinessModule = (lmsModule: LMSModule): BusinessModule => {
    const totalMinutes = lmsModule.lessons.reduce((acc, l) => {
        const duration = parseInt(l.duration) || 10;
        return acc + duration;
    }, 0);

    return {
        title: lmsModule.title,
        sessions: lmsModule.lessons.length,
        summary: lmsModule.description,
        timeEstimate: `${totalMinutes} دقیقه`,
        status: 'unlocked',
        keyConcepts: lmsModule.lessons.map(l => l.title),
        longContent: lmsModule.lessons.map(l => `### ${l.title}\n\n${l.content}`).join('\n\n---\n\n'),
        desc: lmsModule.description,
        quiz: lmsModule.quiz
    };
};

// Static list of courses
const STATIC_COURSES: Course[] = [
    { id: 'business-coaching-mastery', title: businessCoachingMastery.title, shortDescription: businessCoachingMastery.subtitle, longDescription: businessCoachingMastery.description, instructor: 'دکتر ربانی', level: 'پیشرفته', price: 9800000, xpReward: businessCoachingMastery.xpReward, tags: ['کوچینگ', 'بیزینس', 'فروش'], coverGradient: businessCoachingMastery.coverColor, icon: StarIcon, targetAudience: businessCoachingMastery.targetAudience, modules: businessCoachingMastery.modules as any, duration: '۵ جلسه', imageUrl: '' },
    { id: 'simply-better', title: simplyBetter.title, shortDescription: simplyBetter.subtitle, longDescription: simplyBetter.description, instructor: 'هوشمانا (استراتژی)', level: 'پیشرفته', price: 2800000, xpReward: simplyBetter.xpReward, tags: ['استراتژی', 'تمرکز', 'مدیریت'], coverGradient: simplyBetter.coverColor, icon: StarIcon, targetAudience: simplyBetter.targetAudience, modules: simplyBetter.modules as any, duration: '۵ هفته', imageUrl: '' },
    { id: 'deep-work-mastery', title: deepWorkMastery.title, shortDescription: deepWorkMastery.subtitle, longDescription: deepWorkMastery.description, instructor: 'هوشمانا (بهره‌وری)', level: 'فوق پیشرفته', price: 3900000, xpReward: deepWorkMastery.xpReward, tags: ['تمرکز', 'بهره‌وری', 'روانشناسی', 'Deep Work'], coverGradient: deepWorkMastery.coverColor, icon: BrainCircuitIcon, targetAudience: deepWorkMastery.targetAudience, modules: deepWorkMastery.modules as any, duration: '۵ جلسه', imageUrl: '' },
    { id: 'ai-marketing-alchemy', title: aiMarketingAlchemy.title, shortDescription: aiMarketingAlchemy.subtitle, longDescription: aiMarketingAlchemy.description, instructor: 'هوشمانا (مارکتینگ)', level: 'تخصصی', price: 5500000, xpReward: aiMarketingAlchemy.xpReward, tags: ['فروش', 'مارکتینگ', 'هوش مصنوعی', 'AI'], coverGradient: aiMarketingAlchemy.coverColor, icon: TargetIcon, targetAudience: aiMarketingAlchemy.targetAudience, modules: aiMarketingAlchemy.modules as any, duration: '۴ جلسه', imageUrl: '' },
    { id: 'autonomous-org', title: autonomousOrg.title, shortDescription: autonomousOrg.subtitle, longDescription: autonomousOrg.description, instructor: 'هوشمانا (سیستم‌سازی)', level: 'پیشرفته', price: 7000000, xpReward: autonomousOrg.xpReward, tags: ['اتوماسیون', 'مدیریت', 'هوش مصنوعی', 'AI'], coverGradient: autonomousOrg.coverColor, icon: BoltIcon, targetAudience: autonomousOrg.targetAudience, modules: autonomousOrg.modules as any, duration: '۴ جلسه', imageUrl: '' },
    { id: 'ai-data-mastery', title: aiDataMastery.title, shortDescription: aiDataMastery.subtitle, longDescription: aiDataMastery.description, instructor: 'هوشمانا (تحلیل داده)', level: 'تخصصی', price: 4000000, xpReward: aiDataMastery.xpReward, tags: ['داده', 'استراتژی', 'هوش مصنوعی', 'AI'], coverGradient: aiDataMastery.coverColor, icon: ChartBarIcon, targetAudience: aiDataMastery.targetAudience, modules: aiDataMastery.modules as any, duration: '۴ جلسه', imageUrl: '' },
    { id: 'invisible-army', title: invisibleArmy.title, shortDescription: invisibleArmy.subtitle, longDescription: invisibleArmy.description, instructor: 'هوشمانا (اتوماسیون)', level: 'پیشرفته', price: 4500000, xpReward: invisibleArmy.xpReward, tags: ['ایجنت', 'اتوماسیون', 'هوش مصنوعی', 'AI'], coverGradient: invisibleArmy.coverColor, icon: UserGroupIcon, targetAudience: invisibleArmy.targetAudience, modules: invisibleArmy.modules as any, duration: '۴ جلسه', imageUrl: '' },
    { id: 'ai-coding-mastery', title: aiCodingMastery.title, shortDescription: aiCodingMastery.subtitle, longDescription: aiCodingMastery.description, instructor: 'هوشمانا (فنی)', level: 'تخصصی', price: 3500000, xpReward: aiCodingMastery.xpReward, tags: ['برنامه‌نویسی', 'RAG', 'هوش مصنوعی'], coverGradient: aiCodingMastery.coverColor, icon: CpuChipIcon, targetAudience: aiCodingMastery.targetAudience, modules: aiCodingMastery.modules as any, duration: '۴ جلسه', imageUrl: '' },
    { id: 'creativity-studio', title: creativityStudio.title, shortDescription: creativityStudio.subtitle, longDescription: creativityStudio.description, instructor: 'هوشمانا (هنر دیجیتال)', level: 'کاربردی', price: 2500000, xpReward: creativityStudio.xpReward, tags: ['تولید محتوا', 'ویدیو', 'هوش مصنوعی'], coverGradient: creativityStudio.coverColor, icon: PhotoIcon, targetAudience: creativityStudio.targetAudience, modules: creativityStudio.modules as any, duration: '۴ جلسه', imageUrl: '' },
    { id: 'prompt-alchemy', title: promptAlchemy.title, shortDescription: promptAlchemy.subtitle, longDescription: promptAlchemy.description, instructor: 'هوشمانا (تکنولوژی)', level: 'بنیادین', price: 1500000, xpReward: promptAlchemy.xpReward, tags: ['هوش مصنوعی', 'پرامپت', 'مهارت نرم'], coverGradient: promptAlchemy.coverColor, icon: SparklesIcon, targetAudience: promptAlchemy.targetAudience, modules: promptAlchemy.modules as any, duration: '۵ جلسه', imageUrl: '' },
    { id: 'alchemy-prompt-mastery', title: alchemyPromptCourse.title, shortDescription: alchemyPromptCourse.subtitle, longDescription: alchemyPromptCourse.description, instructor: 'هوشمانا (مسئولیت اجتماعی)', level: 'بنیادین', price: 0, xpReward: alchemyPromptCourse.xpReward, tags: ['هوش مصنوعی', 'رایگان', 'مهارت آینده'], coverGradient: alchemyPromptCourse.coverColor, icon: SparklesIcon, targetAudience: alchemyPromptCourse.targetAudience, modules: alchemyPromptCourse.modules as any, duration: '۴ جلسه', imageUrl: '' },
    { id: 'zero_to_one', title: zeroToOne.title, shortDescription: zeroToOne.subtitle, longDescription: zeroToOne.description, instructor: 'هوشمانا (مسئولیت اجتماعی)', level: 'استراتژیک', price: 0, xpReward: zeroToOne.xpReward, tags: ['استارتاپ', 'نوآوری', 'آینده‌پژوهی'], coverGradient: zeroToOne.coverColor, icon: RocketLaunchIcon, targetAudience: zeroToOne.targetAudience, modules: zeroToOne.modules as BusinessModule[], duration: '۴ جلسه', imageUrl: '' },
    { id: 'actionable_gamification', title: actionableGamification.title, shortDescription: actionableGamification.subtitle, longDescription: actionableGamification.description, instructor: 'هوشمانا (متد یو-کای چو)', level: 'تخصصی', price: 4000000, xpReward: actionableGamification.xpReward, tags: ['گیمیفیکیشن', 'روانشناسی', 'طراحی محصول'], coverGradient: actionableGamification.coverColor, icon: TrophyIcon, targetAudience: actionableGamification.targetAudience, modules: actionableGamification.modules as BusinessModule[], duration: '۸ جلسه', imageUrl: '' },
    { id: 'running_lean', title: runningLean.title, shortDescription: runningLean.subtitle, longDescription: runningLean.description, instructor: 'هوشمانا (متد اش موریا)', level: 'استراتژیک', price: 3500000, xpReward: runningLean.xpReward, tags: ['استارتاپ', 'لین', 'کشش'], coverGradient: runningLean.coverColor, icon: RocketLaunchIcon, targetAudience: runningLean.targetAudience, modules: runningLean.modules as BusinessModule[], duration: '۵ جلسه', imageUrl: '' },
    { id: 'income_alchemy', title: incomeAlchemy.title, shortDescription: incomeAlchemy.subtitle, longDescription: incomeAlchemy.description, instructor: 'هوشمانا (کیمیاگر)', level: 'پیشرفته', price: 5000000, xpReward: incomeAlchemy.xpReward, tags: ['پولسازی', 'کوچینگ', 'بیزینس'], coverGradient: incomeAlchemy.coverColor, icon: BanknotesIcon, targetAudience: incomeAlchemy.targetAudience, modules: incomeAlchemy.modules as BusinessModule[], duration: '۱۲ هفته', imageUrl: '' },
    { id: 'master_of_asking', title: masterOfAsking.title, shortDescription: masterOfAsking.subtitle, longDescription: masterOfAsking.description, instructor: 'هوشمانا (متد مایکل بانگی)', level: 'تخصصی', price: 1500000, xpReward: masterOfAsking.xpReward, tags: ['ارتباط موثر', 'کوچینگ', 'رهبری'], coverGradient: masterOfAsking.coverColor, icon: BrainCircuitIcon, targetAudience: masterOfAsking.targetAudience, modules: masterOfAsking.modules as BusinessModule[], duration: '۴ هفته', imageUrl: '' },
    { id: 'social_entrepreneurship', title: socialEntrepreneurship.title, shortDescription: socialEntrepreneurship.subtitle, longDescription: socialEntrepreneurship.description, instructor: 'هوشمانا (متد کارآفرینی اجتماعی)', level: 'استراتژیک', price: 2000000, xpReward: socialEntrepreneurship.xpReward, tags: ['تأثیر اجتماعی', 'کسب‌وکار', 'پایداری'], coverGradient: socialEntrepreneurship.coverColor, icon: HeartIcon, targetAudience: socialEntrepreneurship.targetAudience, modules: socialEntrepreneurship.modules as BusinessModule[], duration: '۶ هفته', imageUrl: '' },
    { id: 'customer_funded_revolution', title: 'انقلاب تامین مالی با مشتری (بدون سرمایه‌گذار)', shortDescription: 'چگونه بدون دادن سهام به سرمایه‌گذار، با پول پیش‌پرداخت مشتری کسب‌وکارتان را بسازید.', longDescription: '...', instructor: 'هوشمانا (متد جان مولینز)', level: 'استراتژیک', price: 4500000, xpReward: 35000, tags: ['تامین مالی', 'استارتاپ ناب', 'فروش', 'مدل درآمدی'], coverGradient: 'from-green-900 to-emerald-800', icon: BanknotesIcon, targetAudience: 'کارآفرینانی که نمی‌خواهند رئیس داشته باشند', modules: [{ title: "جلسه ۱: سراب سرمایه‌گذار (The VC Trap)", sessions: 1, summary: "چرا پول مفت (سرمایه‌گذار خطرپذیر) باعث تنبلی، تصمیمات غلط و مرگ زودرس استارتاپ می‌شود؟", timeEstimate: '۴۵ دقیقه', status: 'unlocked', keyConcepts: ['اعتبارسنجی با پول نقد', 'آزادی عمل بدون هیئت مدیره', 'تله مقیاس‌پذیری زودرس', 'مشتری = فرشته نجات'], longContent: `...`, desc: "چرا پول مفت باعث تنبلی می‌شود؟", quiz: [] }] as BusinessModule[], duration: '۵ جلسه جامع', imageUrl: '' },
    { id: 'business_model_reinvention', title: businessModelReinvention.title, shortDescription: businessModelReinvention.subtitle, longDescription: businessModelReinvention.description, instructor: 'هوشمانا (متد مارک جانسون)', level: 'پیشرفته', price: 3200000, xpReward: businessModelReinvention.xpReward, tags: ['استراتژی', 'نوآوری', 'مدل کسب‌وکار'], coverGradient: businessModelReinvention.coverColor, icon: SitemapIcon, targetAudience: businessModelReinvention.targetAudience, modules: businessModelReinvention.modules as BusinessModule[], duration: '۴ جلسه', imageUrl: '' },
    { id: 'execution_mastery', title: executionMastery.title, shortDescription: executionMastery.description, longDescription: executionMastery.description, instructor: 'هوشمانا (متد لری باسیدی)', level: 'پیشرفته', price: 2900000, xpReward: executionMastery.xpReward, tags: ['مدیریت', 'اجرا', 'رهبری'], coverGradient: executionMastery.coverColor, icon: BoltIcon, targetAudience: executionMastery.targetAudience, modules: executionMastery.modules as BusinessModule[], duration: '۶ جلسه', imageUrl: '' },
    { id: 'value_prop_mastery', title: valuePropositionMastery.title, shortDescription: valuePropositionMastery.subtitle, longDescription: valuePropositionMastery.description, instructor: 'هوشمانا (متد مالکوم مک‌دونالد)', level: 'پیشرفته', price: 2500000, xpReward: valuePropositionMastery.xpReward, tags: ['فروش B2B', 'استراتژی', 'ارزش‌گذاری'], coverGradient: valuePropositionMastery.coverColor, icon: HandshakeIcon, targetAudience: valuePropositionMastery.targetAudience, modules: valuePropositionMastery.modules as BusinessModule[], duration: '۶ جلسه', imageUrl: '' },
];

const AdvisorSection: React.FC<{ onRecommend: (courseId: string) => void }> = ({ onRecommend }) => {
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const handleAsk = () => {
        if (!input.trim()) return;
        setIsThinking(true);
        setTimeout(() => {
            setIsThinking(false);
            if (input.includes('سوال') || input.includes('پرسش') || input.includes('ارتباط')) onRecommend('master_of_asking');
            else if (input.includes('اجرا') || input.includes('تیم') || input.includes('نتیجه')) onRecommend('execution_mastery');
            else if (input.includes('مدل') || input.includes('رقابت') || input.includes('جدید')) onRecommend('business_model_reinvention');
            else if (input.includes('سرمایه') || input.includes('پول') || input.includes('تامین')) onRecommend('customer_funded_revolution');
            else if (input.includes('ارزش') || input.includes('قیمت')) onRecommend('value_prop_mastery');
            else if (input.includes('اجتماعی') || input.includes('تاثیر') || input.includes('خیر')) onRecommend('social_entrepreneurship');
            else if (input.includes('درآمد') || input.includes('ثروت')) onRecommend('income_alchemy');
            else if (input.includes('ایده') || input.includes('استارتاپ') || input.includes('ناب')) onRecommend('running_lean');
            else if (input.includes('بازی') || input.includes('انگیزه') || input.includes('مشتری')) onRecommend('actionable_gamification');
            else if (input.includes('آینده') || input.includes('خلق') || input.includes('صفر')) onRecommend('zero_to_one');
            else if (input.includes('کد') || input.includes('برنامه') || input.includes('اپ')) onRecommend('ai-coding-mastery');
            else if (input.includes('ایجنت') || input.includes('اتوماسیون') || input.includes('کارمند')) onRecommend('invisible-army');
            else if (input.includes('مارکتینگ') || input.includes('فروش') || input.includes('شخصی‌سازی')) onRecommend('ai-marketing-alchemy');
            else if (input.includes('داده') || input.includes('تحلیل') || input.includes('اکسل')) onRecommend('ai-data-mastery');
            else if (input.includes('تمرکز') || input.includes('عمیق') || input.includes('پرت') || input.includes('گوشی')) onRecommend('deep-work-mastery');
            else if (input.includes('سادگی') || input.includes('پیچیده') || input.includes('تمرکز') || input.includes('اصول')) onRecommend('simply-better');
            else onRecommend('business_model_reinvention');
        }, 1500);
    };

    return (
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-lg relative overflow-hidden mb-12">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/3 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center border-2 border-amber-500 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                        <LightBulbIcon className="w-10 h-10 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">مشاور هوشمند آکادمی</h3>
                    <p className="text-sm text-gray-400 mt-2">نمی‌دانید از کجا شروع کنید؟ چالش فعلی کسب‌وکارتان را بگویید.</p>
                </div>
                <div className="md:w-2/3 w-full">
                    <div className="bg-gray-900/50 p-2 rounded-2xl border border-gray-600 flex items-center focus-within:border-amber-500 transition-colors">
                        <MagnifyingGlassIcon className="w-6 h-6 text-gray-500 ml-2 mr-3" />
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="مثال: فروش دارم اما سودم کمه... یا ... می‌خواهم با هوش مصنوعی کار کنم..."
                            className="bg-transparent border-none text-white w-full focus:ring-0 placeholder-gray-500 text-sm"
                            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                        />
                        <button 
                            onClick={handleAsk}
                            disabled={isThinking}
                            className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 min-w-[120px]"
                        >
                            {isThinking ? 'در حال تحلیل...' : 'پیشنهاد بده'}
                        </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                        <span className="text-xs text-gray-500">پیشنهادات:</span>
                        <button onClick={() => setInput("چطور کارهای تکراری را به ایجنت بسپارم؟")} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-full transition-colors">اتوماسیون با AI</button>
                        <button onClick={() => setInput("چطور انگیزه کارمندانم را بالا ببرم؟")} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-full transition-colors">انگیزه تیم</button>
                        <button onClick={() => setInput("چطور تمرکز خودم را بالا ببرم و کمتر حواسم پرت شود؟")} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-full transition-colors">افزایش تمرکز</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CourseCard: React.FC<{ course: Course, onClick: () => void, hasPurchased: boolean, onCompare: (id: string) => void, isComparing: boolean }> = ({ course, onClick, hasPurchased, onCompare, isComparing }) => {
    const Icon = course.icon || DocumentTextIcon;
    const isFree = course.price === 0;

    return (
        <div className={`group bg-gray-800 rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-2xl flex flex-col h-full relative ${isFree ? 'border-amber-400/50 shadow-amber-500/10' : 'border-gray-700 hover:border-gray-500'}`}>
            {isFree && (
                 <div className="absolute top-3 right-3 z-20 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                    هدیه مسئولیت اجتماعی 🎁
                </div>
            )}
            {/* Click handler on image area to go to detail */}
            <div onClick={onClick} className={`cursor-pointer h-32 bg-gradient-to-r ${course.coverGradient || 'from-gray-700 to-gray-900'} p-6 flex items-end justify-between relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl z-10">
                    <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-bold border border-white/10 z-10">
                    {course.level}
                </div>
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
                <div onClick={onClick} className="cursor-pointer">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{course.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 flex-grow line-clamp-3">{course.shortDescription}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                        {course.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-gray-700 text-gray-300 px-2 py-1 rounded-md">#{tag}</span>
                        ))}
                    </div>
                </div>

                <div className="mt-auto border-t border-gray-700 pt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                         <button 
                            onClick={(e) => { e.stopPropagation(); onCompare(course.id); }}
                            className={`p-2 rounded-lg border text-xs transition-colors ${isComparing ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-400 hover:text-white'}`}
                            title="افزودن به مقایسه"
                        >
                            {isComparing ? <CheckCircleIcon className="w-4 h-4"/> : <PlusCircleIcon className="w-4 h-4"/>}
                        </button>
                        <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold py-2">
                            <SparklesIcon className="w-4 h-4" />
                            <span>{course.xpReward?.toLocaleString('fa-IR')} XP</span>
                        </div>
                    </div>
                    {hasPurchased ? (
                         <span className="flex items-center gap-1 text-green-400 text-sm font-bold bg-green-900/30 px-3 py-1 rounded-lg">
                             <PlayIcon className="w-4 h-4" /> ادامه یادگیری
                         </span>
                    ) : (
                        <span className={`font-bold ${isFree ? 'text-amber-400 text-lg' : 'text-white'}`}>
                            {course.price === 0 ? 'رایگان' : `${course.price.toLocaleString('fa-IR')} تومان`}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

type AcademyTab = 'business_academy' | 'creator_academy' | 'finance_academy' | 'leadership_academy' | 'all';

const BusinessAcademyView: React.FC = () => {
    const { user, generatedCourses } = useAppState();
    const dispatch = useAppDispatch();
    
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [selectedModuleIndex, setSelectedModuleIndex] = useState<number>(0);
    const [viewMode, setViewMode] = useState<'landing' | 'course_detail' | 'briefing' | 'reading' | 'chat'>('landing');
    const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(0);
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<AcademyTab>('business_academy');
    const [isPersonalizationModalOpen, setIsPersonalizationModalOpen] = useState(false);
    const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
    const [pendingModuleIndex, setPendingModuleIndex] = useState<number>(0);
    
    // Comparison State
    const [compareList, setCompareList] = useState<string[]>([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
    
    // Scarcity Timer for a specific course
    const courseOfferDeadline = new Date();
    courseOfferDeadline.setHours(courseOfferDeadline.getHours() + 48);
    const courseOfferDateStr = courseOfferDeadline.toISOString();

    const allCourses = useMemo(() => {
        return [...(generatedCourses || []), ...STATIC_COURSES];
    }, [generatedCourses]);

    const filteredCourses = useMemo(() => {
        const aiIds = ['prompt-alchemy', 'alchemy-prompt-mastery', 'creativity-studio', 'ai-coding-mastery', 'invisible-army', 'ai-marketing-alchemy', 'autonomous-org', 'ai-data-mastery'];
        const creatorIds = ['value-proposition-mastery', 'master-of-asking', 'social-entrepreneurship', 'creativity-studio', 'ai-marketing-alchemy'];
        const financeIds = ['income-alchemy', 'customer-funded-revolution', 'business-model-reinvention'];
        const leadershipIds = ['execution-mastery', 'running-lean', 'zero-to-one', 'business-coaching-mastery', 'autonomous-org', 'simply-better'];
        
        // This maps the NEW academy structure to the existing courses
        let targetIds: string[] = [];
        
        switch (activeTab) {
            case 'creator_academy': targetIds = creatorIds; break;
            case 'finance_academy': targetIds = financeIds; break;
            case 'leadership_academy': targetIds = leadershipIds; break;
            case 'business_academy': targetIds = [...creatorIds, ...financeIds, ...leadershipIds, ...aiIds]; break; // General view shows everything or curated list
            default: targetIds = [...creatorIds, ...financeIds, ...leadershipIds, ...aiIds];
        }
        
        // Ensure user generated courses are visible
        const userGenIds = (generatedCourses || []).map(c => c.id);
        if (activeTab === 'business_academy' || activeTab === 'all') {
             targetIds = [...targetIds, ...userGenIds];
        }

        // Filter unique
        const uniqueIds = Array.from(new Set(targetIds));
        return allCourses.filter(c => uniqueIds.includes(c.id));
    }, [activeTab, allCourses, generatedCourses]);

    const selectedCourse = useMemo(() => allCourses.find(c => c.id === selectedCourseId), [selectedCourseId, allCourses]);
    
    const selectedModule = useMemo(() => {
        if (!selectedCourse || !selectedCourse.modules) return null;
        const module = selectedCourse.modules[selectedModuleIndex];
        if ('lessons' in module) {
            return mapLmsModuleToBusinessModule(module as LMSModule);
        }
        return module as BusinessModule;
    }, [selectedCourse, selectedModuleIndex]);

    const hasPurchased = selectedCourseId ? (user?.purchasedCourseIds?.includes(`course-${selectedCourseId}`) || user?.isAdmin || selectedCourse?.price === 0) : false;
    const hasPersonalization = selectedCourseId && user?.coursePersonalizations?.[selectedCourseId];

    const handleCourseSelect = (courseId: string) => {
        setSelectedCourseId(courseId);
        setViewMode('course_detail');
        window.scrollTo(0, 0);
    };
    
    const handleCompareToggle = (courseId: string) => {
        setCompareList(prev => {
            if (prev.includes(courseId)) {
                return prev.filter(id => id !== courseId);
            }
            if (prev.length >= 3) {
                alert("حداکثر ۳ دوره را می‌توانید همزمان مقایسه کنید.");
                return prev;
            }
            return [...prev, courseId];
        });
    };

    const handleBackToCatalog = () => {
        setSelectedCourseId(null);
        setViewMode('landing');
    };

    const handleSelectModule = (index: number) => {
        if (hasPersonalization) {
            setSelectedModuleIndex(index);
            setViewMode('briefing');
            return;
        }
        setPendingModuleIndex(index);
        setIsChoiceModalOpen(true);
    };

    const handleChooseStandard = () => {
        if (selectedCourseId) {
            const standardPersona: CoursePersonalization = { role: 'General', industry: 'General', challenge: 'None', goal: 'Standard Learning' };
            dispatch({ 
                type: 'SAVE_COURSE_PERSONALIZATION', 
                payload: { courseId: selectedCourseId, personalization: standardPersona } 
            });
        }
        setIsChoiceModalOpen(false);
        setSelectedModuleIndex(pendingModuleIndex);
        setViewMode('briefing');
    };

    const handleChoosePersonalized = () => {
        if (user && user.manaPoints >= 500) {
            dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: 500, action: 'شخصی‌سازی دوره' } });
            setIsChoiceModalOpen(false);
            setSelectedModuleIndex(pendingModuleIndex);
            setIsPersonalizationModalOpen(true); 
        } else {
            alert("امتیاز معنا کافی نیست! (۵۰۰ امتیاز مورد نیاز است)");
        }
    };
    
    const handlePersonalizationComplete = (persona: CoursePersonalization) => {
        if (selectedCourseId) {
            dispatch({ 
                type: 'SAVE_COURSE_PERSONALIZATION', 
                payload: { courseId: selectedCourseId, personalization: persona } 
            });
            setIsPersonalizationModalOpen(false);
            setViewMode('briefing');
        }
    };
    
    const handleRepersonalize = () => {
        if (user && user.manaPoints >= 500 && selectedCourseId) {
             if (window.confirm("تغییر تنظیمات پرسونا ۵۰۰ امتیاز معنا هزینه دارد. آیا ادامه می‌دهید؟")) {
                  dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: 500, action: 'به‌روزرسانی پرسونای دوره' } });
                  setIsPersonalizationModalOpen(true);
             }
        } else if (selectedCourseId) {
             alert("امتیاز معنای کافی ندارید (۵۰۰ امتیاز نیاز است).");
        }
    };

    const handleStartPractice = () => {
        if (!user) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
            return;
        }
        if (!selectedModule || !selectedCourse) return;
        const topic = `تمرین عملی: ${selectedModule.title} (${selectedCourse.title})`;
        dispatch({ 
            type: 'START_COACHING_SESSION', 
            payload: { 
                role: 'business_client', 
                topic: topic, 
                currentStep: 1, 
                startTime: new Date().toISOString(), 
                isRealSession: true,
                returnView: View.BUSINESS_ACADEMY
            }
        });
        dispatch({ type: 'SET_VIEW', payload: View.COACHING_SESSION });
    };

    if (viewMode === 'chat') return <CoachingSessionView />;

    if (viewMode === 'reading' && selectedModule && selectedCourse) {
        return (
            <DeepReadingStep 
                module={selectedModule as any}
                bookTitle={selectedCourse.title}
                courseId={selectedCourse.id}
                onStartPractice={handleStartPractice} 
                onClose={() => setViewMode('course_detail')}
            />
        );
    }

    if (viewMode === 'briefing' && selectedModule && selectedCourse) {
        return (
            <ModuleBriefingModal
                isOpen={true}
                onClose={() => setViewMode('course_detail')}
                onStart={handleStartPractice} 
                module={selectedModule as any}
                bookTitle={selectedCourse.title}
                isUnlocked={hasPurchased || selectedModule.status === 'unlocked'}
                onUnlockRequest={() => {
                    setViewMode('course_detail');
                    setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }}
            />
        );
    }

    if (viewMode === 'course_detail' && selectedCourse) {
        const normalizedModules: BusinessModule[] = (selectedCourse.modules || []).map(m => {
             if ('lessons' in m) return mapLmsModuleToBusinessModule(m as LMSModule);
             return m as BusinessModule;
        });
        
        const showTimer = selectedCourse.id === 'ai-marketing-alchemy' || selectedCourse.id === 'deep-work-mastery';

        return (
            <div className="bg-gray-900 text-white pt-22 pb-24 min-h-screen">
                 <div className={`relative pb-24 pt-12 bg-gradient-to-r ${selectedCourse.coverGradient || 'from-gray-800 to-gray-900'} overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="flex justify-between items-start mb-6">
                             <button onClick={handleBackToCatalog} className="flex items-center gap-2 text-white/80 hover:text-white bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm w-fit transition-colors">
                                <ArrowLeftIcon className="w-4 h-4" /> بازگشت به آکادمی
                            </button>
                            {hasPersonalization && (
                                <button onClick={handleRepersonalize} className="flex items-center gap-1 text-white/80 hover:text-white bg-black/20 px-3 py-2 rounded-lg backdrop-blur-sm text-xs transition-colors">
                                    <CogIcon className="w-4 h-4" /> تنظیمات پرسونا
                                </button>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">{selectedCourse.title}</h1>
                        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl leading-relaxed">{selectedCourse.subtitle || selectedCourse.shortDescription}</p>
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm"><TrophyIcon className="w-5 h-5 text-yellow-400" /><span>{selectedCourse.xpReward?.toLocaleString('fa-IR')} XP پاداش</span></div>
                            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm"><UsersIcon className="w-5 h-5 text-blue-400" /><span>{selectedCourse.targetAudience}</span></div>
                            {showTimer && !hasPurchased && <div className="hidden md:block"><CountdownTimer targetDate={courseOfferDateStr} label="مهلت ثبت‌نام" size="sm"/></div>}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-6 -mt-12 relative z-20">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                             <AcademyLandingHero content={ACADEMY_CONTENTS[activeTab]} />
                            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
                                <h3 className="text-xl font-bold mb-4 text-white">درباره دوره</h3>
                                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedCourse.longDescription}</p>
                            </div>
                            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
                                <h3 className="text-xl font-bold mb-6 text-white">سرفصل‌های دوره</h3>
                                <div className="space-y-4">
                                    {normalizedModules.map((module, index) => (
                                        <div key={index} className={`border rounded-xl overflow-hidden transition-all ${openAccordionIndex === index ? 'border-blue-500 bg-gray-700/30' : 'border-gray-700 bg-gray-800'}`}>
                                            <button onClick={() => setOpenAccordionIndex(openAccordionIndex === index ? null : index)} className="w-full flex items-center justify-between p-5 text-right">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${openAccordionIndex === index ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>{index + 1}</div>
                                                    <div><h4 className={`font-bold ${openAccordionIndex === index ? 'text-white' : 'text-gray-300'}`}>{module.title}</h4><p className="text-xs text-gray-500 mt-1">{module.timeEstimate}</p></div>
                                                </div>
                                                {hasPurchased || module.status === 'unlocked' ? <LockClosedIcon className="w-5 h-5 text-green-500 opacity-0" /> : <LockClosedIcon className="w-5 h-5 text-gray-500" />}
                                            </button>
                                            {openAccordionIndex === index && (
                                                <div className="px-5 pb-5 pl-16 animate-fade-in">
                                                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">{module.summary}</p>
                                                    <button onClick={() => handleSelectModule(index)} className={`w-full py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${hasPurchased || module.status === 'unlocked' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`} disabled={!hasPurchased && module.status === 'locked'}>
                                                        {hasPurchased || module.status === 'unlocked' ? <><PlayIcon className="w-5 h-5" /> شروع یادگیری</> : <><LockClosedIcon className="w-5 h-5" /> قفل است</>}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <CourseReviews courseId={`course-${selectedCourse.id}`} onAddReviewClick={() => setIsReviewFormOpen(true)} />
                        </div>
                        <div className="lg:col-span-1">
                            <div id="pricing" className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl sticky top-24">
                                <div className="text-center mb-6">
                                    <p className="text-gray-400 text-sm mb-2">سرمایه‌گذاری شما</p>
                                    {selectedCourse.price === 0 ? <p className="text-4xl font-black text-green-400">رایگان</p> : <div className="flex items-end justify-center gap-1"><p className="text-4xl font-black text-white">{selectedCourse.price.toLocaleString('fa-IR')}</p><span className="text-gray-400 mb-1">تومان</span></div>}
                                </div>
                                {hasPurchased ? (
                                    <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4 text-center mb-6"><CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" /><p className="text-green-400 font-bold">شما دانشجوی این دوره هستید</p></div>
                                ) : (
                                    <button onClick={() => {
                                            const product: Product = { id: `course-${selectedCourse.id}`, name: selectedCourse.title, price: selectedCourse.price, type: 'course', image: 'https://picsum.photos/seed/course/400/400', points: selectedCourse.xpReward || 0, stock: 999, popularity: 100, dateAdded: new Date().toISOString(), description: selectedCourse.shortDescription, category: 'دوره' };
                                            dispatch({ type: 'ADD_TO_CART', payload: { product, quantity: 1 } });
                                            dispatch({ type: 'TOGGLE_CART', payload: true });
                                        }} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 mb-4"
                                    >
                                        {selectedCourse.price === 0 ? 'ثبت‌نام رایگان' : 'ثبت‌نام و شروع آنی'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                <AddReviewForm isOpen={isReviewFormOpen} onClose={() => setIsReviewFormOpen(false)} courseId={`course-${selectedCourse?.id}`} />
                <CoursePersonalizationModal isOpen={isPersonalizationModalOpen} onClose={() => setIsPersonalizationModalOpen(false)} onComplete={handlePersonalizationComplete} courseTitle={selectedCourse.title} />
                <PersonalizationChoiceModal 
                    isOpen={isChoiceModalOpen} 
                    onClose={() => setIsChoiceModalOpen(false)} 
                    onChooseStandard={handleChooseStandard} 
                    onChoosePersonalized={handleChoosePersonalized}
                    manaCost={500}
                />
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white pt-22 pb-24 min-h-screen">
            <div className="container mx-auto px-6 max-w-6xl animate-fade-in-up">
                {/* AI Advisor Section */}
                <div className="mb-12">
                     <AcademyLandingHero content={ACADEMY_CONTENTS[activeTab]} />
                </div>

                {/* Tabs for Switching Academies (The "Track" System) */}
                <div className="flex justify-center mb-10 overflow-x-auto">
                    <div className="bg-gray-800 p-1.5 rounded-full flex shadow-lg border border-gray-700">
                         <button onClick={() => setActiveTab('business_academy')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'business_academy' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>دانشکده جامع</button>
                         <button onClick={() => setActiveTab('creator_academy')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'creator_academy' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>برند و محتوا</button>
                         <button onClick={() => setActiveTab('leadership_academy')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'leadership_academy' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>رهبری</button>
                         <button onClick={() => setActiveTab('finance_academy')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'finance_academy' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>ثروت</button>
                    </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map(course => {
                        const isPurchased = user?.purchasedCourseIds?.includes(`course-${course.id}`) || user?.isAdmin || course.price === 0;
                        const isComparing = compareList.includes(course.id);
                        return (
                            <CourseCard 
                                key={course.id} 
                                course={course} 
                                hasPurchased={isPurchased}
                                onClick={() => handleCourseSelect(course.id)} 
                                onCompare={handleCompareToggle}
                                isComparing={isComparing}
                            />
                        );
                    })}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p>دوره‌ای در این دسته‌بندی یافت نشد.</p>
                    </div>
                )}
            </div>

            <CourseComparisonModal 
                isOpen={isCompareModalOpen}
                onClose={() => setIsCompareModalOpen(false)}
                courses={allCourses.filter(c => compareList.includes(c.id))}
            />
        </div>
    );
};

export default BusinessAcademyView;
