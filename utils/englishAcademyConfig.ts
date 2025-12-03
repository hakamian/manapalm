
import React from 'react';
import { 
    BriefcaseIcon, MapIcon, UsersIcon, AcademicCapIcon, PaperAirplaneIcon, BrainCircuitIcon, ClockIcon
} from '../components/icons';

export type UserGoal = 'career' | 'travel' | 'connection' | 'academic' | 'migration' | 'coaching';
export type UserBarrier = 'fear' | 'vocabulary' | 'grammar' | 'time';
export type UserInterest = 'tech' | 'art' | 'business' | 'culture' | 'other';
export type TimeCommitment = 'casual' | 'regular' | 'serious' | 'intense' | 'other';

export interface EnglishAcademyConfig {
    goal: UserGoal;
    barrier: UserBarrier;
    interest: UserInterest;
    timeCommitment: TimeCommitment;
}

export const GOAL_CONFIG: Record<UserGoal, { title: string; icon: React.FC<any>; color: string; moduleAlias: string }> = {
    career: { title: 'ارتقای شغلی (Tycoon)', icon: BriefcaseIcon, color: 'blue', moduleAlias: 'مذاکره و رهبری در جلسات' },
    travel: { title: 'جهانگردی (Explorer)', icon: MapIcon, color: 'green', moduleAlias: 'بقا در سفر و کشف فرهنگ‌ها' },
    connection: { title: 'ارتباطات (Socialite)', icon: UsersIcon, color: 'pink', moduleAlias: 'دوست‌یابی و قصه‌گویی' },
    academic: { title: 'تحصیل (Scholar)', icon: AcademicCapIcon, color: 'indigo', moduleAlias: 'تحلیل آکادمیک و مقاله‌نویسی' },
    migration: { title: 'مهاجرت (Nomad)', icon: PaperAirplaneIcon, color: 'orange', moduleAlias: 'زندگی روزمره و کار در خارج' },
    coaching: { title: 'آموزش کوچینگ (Coach)', icon: BrainCircuitIcon, color: 'purple', moduleAlias: 'سوالات قدرتمند و گوش دادن فعال' },
};

export const TIME_COMMITMENT_CONFIG: Record<TimeCommitment, { title: string; description: string; daily: string }> = {
    casual: { title: 'تفریحی', description: 'یادگیری آهسته و پیوسته بدون فشار.', daily: '۱۵ دقیقه' },
    regular: { title: 'منظم', description: 'تعادل خوب بین زندگی و یادگیری.', daily: '۳۰ دقیقه' },
    serious: { title: 'جدی', description: 'پیشرفت سریع برای رسیدن به هدف.', daily: '۱ ساعت' },
    intense: { title: 'فشرده (Immersive)', description: 'غرق شدن کامل در زبان برای نتایج فوری.', daily: '۲+ ساعت' },
    other: { title: 'سفارشی', description: 'برنامه زمانی خاص خود را دارید.', daily: '؟' },
};
