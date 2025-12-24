import { User, AppState, Notification, View } from '../../types';
import { dbAdapter } from './database';
import { getLevelForPoints } from '../domain/gamification';
import { checkAchievements, Achievement } from '../domain/achievements';

/**
 * User Service (Application Layer)
 * Handles User actions, points, mana, and profile updates.
 */

export const userService = {
    /**
     * Deducts or grants Barkat points with history logging.
     */
    updateBarkatPoints: async (user: User, amount: number, actionLabel: string): Promise<User> => {
        // SECURE CALL: Persistent update
        if (amount < 0) {
            await dbAdapter.spendBarkatPoints(Math.abs(amount));
        } else {
            // Grant points (negative spend in adapter terms if supported, or just saveUser)
            await dbAdapter.spendBarkatPoints(-amount);
        }

        const updatedUser = {
            ...user,
            points: user.points + amount,
            pointsHistory: [
                ...(user.pointsHistory || []),
                {
                    action: actionLabel,
                    points: amount,
                    type: 'barkat' as const,
                    date: new Date().toISOString()
                }
            ]
        };

        await dbAdapter.saveUser(updatedUser);
        return updatedUser;
    },

    /**
     * Deducts or grants Mana points with history logging.
     */
    updateManaPoints: async (user: User, points: number, actionLabel: string): Promise<User> => {
        // SECURE CALL
        if (points > 0) {
            await dbAdapter.spendManaPoints(points);
        }

        const updatedUser = {
            ...user,
            manaPoints: user.manaPoints - points,
            pointsHistory: [
                ...(user.pointsHistory || []),
                {
                    action: actionLabel,
                    points: -points,
                    type: 'mana' as const,
                    date: new Date().toISOString()
                }
            ]
        };

        await dbAdapter.saveUser(updatedUser);
        return updatedUser;
    },

    /**
     * Unlocks the Meaning Palm for a user.
     */
    unlockMeaningPalm: async (user: User): Promise<User | null> => {
        if (user.manaPoints < 15000) return null;

        await dbAdapter.spendManaPoints(15000);
        const updatedUser = {
            ...user,
            manaPoints: user.manaPoints - 15000,
            hasUnlockedMeaningPalm: true
        };
        await dbAdapter.saveUser(updatedUser);
        return updatedUser;
    },

    /**
     * Checks for level-ups and achievements after any profile/point change.
     */
    processGamificationUpdates: async (user: User): Promise<{ updatedUser: User, newAchievements: Achievement[], leveledUp: boolean }> => {
        let updatedUser = { ...user };
        const newAchievements = checkAchievements(updatedUser);
        let leveledUp = false;

        // Apply Achievement Rewards
        for (const achievement of newAchievements) {
            if (achievement.rewardBarkat) {
                updatedUser.points += achievement.rewardBarkat;
                updatedUser.pointsHistory = [
                    ...(updatedUser.pointsHistory || []),
                    { action: `نشان: ${achievement.title}`, points: achievement.rewardBarkat, type: 'barkat', date: new Date().toISOString() }
                ];
            }
            if (achievement.rewardMana) {
                updatedUser.manaPoints += achievement.rewardMana;
                updatedUser.pointsHistory = [
                    ...(updatedUser.pointsHistory || []),
                    { action: `نشان: ${achievement.title}`, points: achievement.rewardMana, type: 'mana', date: new Date().toISOString() }
                ];
            }
            updatedUser.unlockedAchievements = [...(updatedUser.unlockedAchievements || []), achievement.id];

            // Notification for achievement
            const notif: Notification = {
                id: `achieve-${achievement.id}-${Date.now()}`,
                title: 'دستاورد جدید قفل‌گشایی شد!',
                description: achievement.title,
                text: achievement.description,
                date: new Date().toISOString(),
                timestamp: new Date().toISOString(),
                read: false,
                isRead: false,
                type: 'success',
                icon: achievement.icon as any
            };
            updatedUser.notifications = [notif, ...(updatedUser.notifications || [])];
        }

        // Check for Level Up
        const newLevel = getLevelForPoints(updatedUser.points, updatedUser.manaPoints);
        if (newLevel.name !== updatedUser.level) {
            leveledUp = true;
            updatedUser.level = newLevel.name;

            const levelNotif: Notification = {
                id: `level-up-${Date.now()}`,
                title: 'ارتقای سطح!',
                description: `شما به سطح "${newLevel.name}" رسیدید.`,
                text: newLevel.description,
                date: new Date().toISOString(),
                timestamp: new Date().toISOString(),
                read: false,
                isRead: false,
                type: 'success',
                icon: 'TrophyIcon'
            };
            updatedUser.notifications = [levelNotif, ...(updatedUser.notifications || [])];
        }

        if (newAchievements.length > 0 || leveledUp) {
            await dbAdapter.saveUser(updatedUser);
        }

        return { updatedUser, newAchievements, leveledUp };
    }
};
