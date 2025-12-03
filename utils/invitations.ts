

import { User, InvitationContent } from '../types.ts';

export const INVITATION_MESSAGES: { [key: string]: InvitationContent } = {
    'guardian_invite': {
        milestoneId: 'guardian_invite',
        title: 'شما به حلقه نگهبانان دعوت شده‌اید!',
        message: `تعهد و مشارکت شما در جنبش نخلستان معنا دیده شده است. ما شما را شایسته پیوستن به حلقه درونی "نگهبانان" می‌دانیم. نگهبانان، راهنمایان و ستون‌های این جامعه هستند.\n\nآیا این مسئولیت را می‌پذیرید؟`
    }
};

/**
 * Checks if a user is eligible to be invited to become a guardian.
 * In a real app, this logic would be more complex.
 * @param user The user object.
 * @returns boolean indicating eligibility.
 */
export const checkGuardianInvitationEligibility = (user: User): boolean => {
    // Already invited or is a guardian
    if (user.isGuardian || user.hasBeenInvitedToGuardians) {
        return false;
    }

    // Eligibility criteria:
    // 1. Must be at least level 4
    // 2. Must have planted at least 5 palms
    // 3. Must have completed at least 2 courses
    const isLevelEligible = user.points >= 1500; // Level 4 threshold
    const palmsPlanted = user.timeline?.filter(e => e.type === 'palm_planted').length || 0;
    const hasPlantedEnough = palmsPlanted >= 5;
    const coursesCompleted = user.purchasedCourseIds?.length || 0;
    const hasCompletedCourses = coursesCompleted >= 2;

    return isLevelEligible && hasPlantedEnough && hasCompletedCourses;
};