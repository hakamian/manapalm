
import { User, UserLevel } from '../types.ts';
import { SproutIcon, SaplingIcon, YoungPalmIcon, SturdyPalmIcon, AncientPalmIcon } from '../components/icons-garden.tsx';

export const userLevels: UserLevel[] = [
    {
        level: 1,
        name: 'شریک رهجو',
        pointsThreshold: 0,
        manaThreshold: 0,
        icon: SproutIcon,
    },
    {
        level: 2,
        name: 'شریک کوشا',
        pointsThreshold: 500,
        manaThreshold: 100,
        icon: SaplingIcon,
    },
    {
        level: 3,
        name: 'شریک فرازگر',
        pointsThreshold: 1500,
        manaThreshold: 300,
        icon: YoungPalmIcon,
    },
    {
        level: 4,
        name: 'شریک برتر',
        pointsThreshold: 4000,
        manaThreshold: 800,
        icon: SturdyPalmIcon,
    },
    {
        level: 5,
        name: 'شریک نخبه',
        pointsThreshold: 10000,
        manaThreshold: 2000,
        icon: AncientPalmIcon,
    },
    {
        level: 6,
        name: 'شریک گوهر',
        pointsThreshold: 25000,
        manaThreshold: 5000,
        icon: AncientPalmIcon,
    },
    {
        level: 7,
        name: 'شریک اسطوره',
        pointsThreshold: 50000,
        manaThreshold: 10000,
        icon: AncientPalmIcon,
    },
    {
        level: 8,
        name: 'شریک جاودان',
        pointsThreshold: 100000,
        manaThreshold: 20000,
        icon: AncientPalmIcon,
    },
];

export const ALL_INSTALLMENT_OPTIONS = [4, 6, 8, 10, 12];

/**
 * Gets the user's current level based on their points.
 * @param points The number of points the user has.
 * @returns The UserLevel object for the user's current level.
 */
export const getUserLevel = (points: number): UserLevel => {
    let currentLevel: UserLevel = userLevels[0];
    for (const level of userLevels) {
        if (points >= level.pointsThreshold) {
            currentLevel = level;
        } else {
            break; // Levels are sorted, so we can stop once we find a level the user hasn't reached.
        }
    }
    return currentLevel;
};

/**
 * Gets the available installment options based on user level.
 * @param user The user object.
 * @returns An array of numbers representing the available installment months.
 */
export const getInstallmentOptions = (user: User | null): number[] => {
    if (!user) {
        return [4];
    }
    const level = getUserLevel(user.points).level;
    switch (level) {
        case 1:
            return [4];
        case 2:
            return [4, 6];
        case 3:
            return [4, 6, 8];
        case 4:
            return [4, 6, 8, 10];
        default: // Level 5 and above
            return [4, 6, 8, 10, 12];
    }
};

/**
 * Gets the required user level to unlock a specific installment plan.
 * @param months The number of months for the installment plan.
 * @returns The UserLevel object required for the plan, or null if not applicable.
 */
export const getUnlockLevelForInstallment = (months: number): UserLevel | null => {
    if (months <= 4) return userLevels[0]; // Base level
    if (months === 6) return userLevels.find(l => l.level === 2) || null;
    if (months === 8) return userLevels.find(l => l.level === 3) || null;
    if (months === 10) return userLevels.find(l => l.level === 4) || null;
    if (months === 12) return userLevels.find(l => l.level === 5) || null;
    return null;
};