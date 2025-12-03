
import React from 'react';
import { Page, Achievement, AchievementId, User, View } from '../types.ts';
// FIX: Added missing icons
import { UserPlusIcon, LeafIcon, BookOpenIcon, SparklesIcon, ShieldKeyholeIcon, HandshakeIcon } from '../components/icons.tsx';

export const ALL_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'profile_complete',
        title: 'شخصیت‌پرداز',
        name: 'شخصیت‌پرداز',
        points: 50,
        description: 'برای تکمیل پروفایل خود و برداشتن اولین قدم.',
        // FIX: Replaced JSX syntax with React.createElement because this is a .ts file.
        icon: React.createElement(UserPlusIcon),
        // FIX: Use View enum instead of string literal
        cta: { text: 'تکمیل پروفایل', page: View.UserProfile }
    },
    {
        id: 'first_palm',
        title: 'بنیان‌گذار میراث',
        name: 'بنیان‌گذار میراث',
        points: 100,
        description: 'برای کاشتن اولین میراث نخل خود.',
        // FIX: Replaced JSX syntax with React.createElement because this is a .ts file.
        icon: React.createElement(LeafIcon),
        // FIX: Use View enum instead of string literal
        cta: { text: 'کاشت اولین نخل', page: View.HallOfHeritage }
    },
    {
        id: 'first_creative_act',
        title: 'جرقه خلاقیت',
        name: 'جرقه خلاقیت',
        points: 20,
        description: 'برای اولین استفاده از ابزارهای هوش مصنوعی.',
        // FIX: Replaced JSX syntax with React.createElement because this is a .ts file.
        icon: React.createElement(SparklesIcon),
        // FIX: Use View enum instead of string literal
        cta: { text: 'ورود به آزمایشگاه', page: View['ai-tools'] }
    },
    {
        id: 'first_course',
        title: 'رهجوی دانش',
        name: 'رهجوی دانش',
        points: 50,
        description: 'برای ثبت‌نام در اولین دوره آموزشی.',
        // FIX: Replaced JSX syntax with React.createElement because this is a .ts file.
        icon: React.createElement(BookOpenIcon),
        // FIX: Use View enum instead of string literal
        cta: { text: 'مشاهده دوره‌ها', page: View.Courses }
    },
     {
        id: 'community_builder',
        title: 'معمار اجتماع',
        name: 'معمار اجتماع',
        points: 75,
        description: 'برای اولین مشارکت در یک پروژه اجتماعی.',
        // FIX: Replaced JSX syntax with React.createElement because this is a .ts file.
        icon: React.createElement(HandshakeIcon),
        // FIX: Use View enum instead of string literal
        cta: { text: 'مشارکت اجتماعی', page: View['community-projects'] }
    },
    {
        id: 'guardian',
        // FIX: Add missing 'name' and 'points' properties
        name: 'نگهبان معنا',
        points: 1500,
        title: 'نگهبان معنا',
        description: 'برای پیوستن به حلقه نگهبانان معنا.',
        // FIX: Replaced JSX syntax with React.createElement because this is a .ts file.
        icon: React.createElement(ShieldKeyholeIcon),
        cta: { text: 'دعوت‌نامه لازم است' }
    }
];

const hasAchievement = (user: User, achievementId: AchievementId): boolean => {
    return user.achievements?.includes(achievementId) ?? false;
};

export const checkAllAchievements = (newUserState: User, oldUserState: User): { user: User, newAchievements: Achievement[] } => {
    const newAchievements: Achievement[] = [];
    const user = { ...newUserState };
    user.achievements = user.achievements ? [...user.achievements] : [];

    const award = (id: AchievementId) => {
        if (!hasAchievement(user, id)) {
            user.achievements.push(id);
            const achievementData = ALL_ACHIEVEMENTS.find(a => a.id === id);
            if (achievementData) {
                newAchievements.push(achievementData);
            }
        }
    };
    
    // Check Profile Completion
    if (newUserState.profileCompletion.extra && !oldUserState.profileCompletion.extra) {
        award('profile_complete');
    }

    // Check First Palm Planted
    const newPalms = newUserState.timeline?.filter(e => e.type === 'palm_planted').length || 0;
    const oldPalms = oldUserState.timeline?.filter(e => e.type === 'palm_planted').length || 0;
    if (newPalms > 0 && oldPalms === 0) {
        award('first_palm');
    }

    // Check First Creative Act
    const newCreativeActs = newUserState.timeline?.filter(e => e.type === 'creative_act').length || 0;
    const oldCreativeActs = oldUserState.timeline?.filter(e => e.type === 'creative_act').length || 0;
    if (newCreativeActs > 0 && oldCreativeActs === 0) {
        award('first_creative_act');
    }
    
    // Check First Community Contribution
    const newContributions = newUserState.timeline?.filter(e => e.type === 'community_contribution').length || 0;
    const oldContributions = oldUserState.timeline?.filter(e => e.type === 'community_contribution').length || 0;
    if (newContributions > 0 && oldContributions === 0) {
        award('community_builder');
    }

    // Check First Course Purchased
    const newCourses = newUserState.purchasedCourseIds?.length || 0;
    const oldCourses = oldUserState.purchasedCourseIds?.length || 0;
    if (newCourses > 0 && oldCourses === 0) {
        award('first_course');
    }

    // Check Became a Guardian
    if (newUserState.isGuardian && !oldUserState.isGuardian) {
        award('guardian');
    }

    return { user, newAchievements };
};