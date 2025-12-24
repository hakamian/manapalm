
import { User, TimelineEvent } from "../../types";

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    rewardBarkat?: number;
    rewardMana?: number;
    check: (user: User) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_palm',
        title: 'اولین ریشه',
        description: 'کاشت اولین نخل در نخلستان معنا',
        icon: 'SproutIcon',
        rewardBarkat: 500,
        check: (user) => (user.timeline || []).some(e => e.type === 'palm_planted')
    },
    {
        id: 'meaning_seeker',
        title: 'جوینده معنا',
        description: 'تکمیل اولین تامل در خلوت روزانه',
        icon: 'SparklesIcon',
        rewardMana: 200,
        check: (user) => (user.timeline || []).some(e => e.type === 'reflection')
    },
    {
        id: 'generous_soul',
        title: 'روح بخشنده',
        description: 'اهدای امتیاز به دیگران برای اولین بار',
        icon: 'HeartIcon',
        rewardMana: 300,
        check: (user) => (user.pointsHistory || []).some(p => p.action === 'اهدای امتیاز')
    },
    {
        id: 'self_aware_level_1',
        title: 'خودشناس نوپا',
        description: 'تکمیل حداقل ۲ آزمون خودشناسی',
        icon: 'BookOpenIcon',
        rewardMana: 500,
        check: (user) => {
            const reports = [user.discReport, user.enneagramReport, user.strengthsReport, user.ikigaiReport];
            return reports.filter(Boolean).length >= 2;
        }
    },
    {
        id: 'consistent_gardener',
        title: 'باغبان ثابت‌قدم',
        description: 'حفظ استمرار حضور به مدت ۷ روز متوالی',
        icon: 'ArrowTrendingUpIcon',
        rewardBarkat: 1000,
        check: (user) => (user.dailyStreak || 0) >= 7
    },
    {
        id: 'digital_architect',
        title: 'معمار دیجیتال',
        description: 'آغاز اولین پروژه ساخت میراث دیجیتال',
        icon: 'CpuChipIcon',
        rewardBarkat: 1000,
        check: (user) => !!user.webDevProject
    }
];

/**
 * Checks for newly unlocked achievements.
 * Returns an array of newly unlocked achievement IDs.
 */
export const checkAchievements = (user: User): Achievement[] => {
    const unlocked = user.unlockedAchievements || [];
    return ACHIEVEMENTS.filter(a => !unlocked.includes(a.id) && a.check(user));
};
