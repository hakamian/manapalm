import { useAppDispatch, useAppState } from '../AppContext';
import { userService } from '../services/application/userService';
import { orderService } from '../services/application/orderService';
import { communityService } from '../services/application/communityService';
import { dbAdapter } from '../services/application/database';
import { Review, Order, User } from '../types';

/**
 * useAppActions Hook
 * The primary way for UI components to trigger business logic.
 * Orchestrates calls to Application Services and updates AppContext.
 */
export const useAppActions = () => {
    const dispatch = useAppDispatch();
    const state = useAppState();
    const user = state.user;

    return {
        /**
         * Generic Point/Mana management
         */
        spendMana: async (points: number, actionLabel: string) => {
            if (!user) return;
            const updatedUser = await userService.updateManaPoints(user, points, actionLabel);
            const { updatedUser: finalUser, newAchievements, leveledUp } = await userService.processGamificationUpdates(updatedUser);

            // Queue Alerts
            newAchievements.forEach(a => dispatch({ type: 'ADD_GAMIFICATION_ALERT', payload: { type: 'achievement', data: a } }));
            if (leveledUp) {
                const newLevel = finalUser.level;
                dispatch({ type: 'ADD_GAMIFICATION_ALERT', payload: { type: 'level_up', data: { title: newLevel, description: 'تبریک! شما به مرحله جدیدی از مسیر معنا صعود کردید.' } } });
            }

            dispatch({ type: 'UPDATE_USER', payload: finalUser });
        },

        donateBarkatPoints: async (amount: number) => {
            if (!user) return;
            const updatedUser = await userService.updateBarkatPoints(user, -amount, 'اهدای امتیاز');
            const { updatedUser: finalUser } = await userService.processGamificationUpdates(updatedUser);
            dispatch({ type: 'UPDATE_USER', payload: finalUser });
        },

        addBarkatPoints: async (amount: number, reason: string) => {
            if (!user) return;
            const updatedUser = await userService.updateBarkatPoints(user, amount, reason);
            const { updatedUser: finalUser, newAchievements, leveledUp } = await userService.processGamificationUpdates(updatedUser);

            newAchievements.forEach(a => dispatch({ type: 'ADD_GAMIFICATION_ALERT', payload: { type: 'achievement', data: a } }));
            if (leveledUp) {
                dispatch({ type: 'ADD_GAMIFICATION_ALERT', payload: { type: 'level_up', data: { title: finalUser.level, description: 'صعود به آگاهی برتر!' } } });
            }

            dispatch({ type: 'UPDATE_USER', payload: finalUser });
        },

        /**
         * Orders & Payments
         */
        placeOrder: async (order: Order) => {
            const { updatedUser, pointsEarned, newNotifications } = orderService.processOrderPlacement(state, order);
            if (updatedUser) {
                const { updatedUser: finalUser, newAchievements, leveledUp } = await userService.processGamificationUpdates(updatedUser);

                newAchievements.forEach(a => dispatch({ type: 'ADD_GAMIFICATION_ALERT', payload: { type: 'achievement', data: a } }));
                if (leveledUp) {
                    dispatch({ type: 'ADD_GAMIFICATION_ALERT', payload: { type: 'level_up', data: { title: finalUser.level, description: 'برکت درخت شما فزونی یافت!' } } });
                }

                dispatch({
                    type: 'PLACE_ORDER',
                    payload: order
                });
                dispatch({ type: 'UPDATE_USER', payload: finalUser });
            }
        },

        /**
         * Community Actions
         */
        submitReview: async (review: Review) => {
            if (!user) return;
            const { updatedUser, reviewWithStatus } = await communityService.submitReview(user, review);
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        },

        investInMicrofinance: async (projectId: string, amount: number, method: 'wallet' | 'points') => {
            const result = await communityService.investInProject(state, projectId, amount, method);
            if (result) {
                dispatch({ type: 'UPDATE_USER', payload: result.updatedUser });
            }
        },

        /**
         * Admin Actions
         */
        publishAnnouncement: async (payload: any) => {
            const newPost = await communityService.publishAnnouncement(payload);
            dispatch({ type: 'ADD_POST', payload: newPost });
        },

        grantAdminBonus: async (amount: number, reason: string) => {
            if (!user) return;
            const updatedUser = await userService.updateBarkatPoints(user, amount, reason);
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        },

        /**
         * Profile & Identity
         */
        updateProfile: async (updatedUser: User) => {
            console.log("🛠️ [Actions] updateProfile starting for:", updatedUser.id);
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            try {
                const confirmedUser = await dbAdapter.saveUser(updatedUser);
                if (confirmedUser) {
                    console.log("✅ [Actions] Profile confirmed by DB");
                    dispatch({ type: 'UPDATE_USER', payload: confirmedUser });
                }
            } catch (err: any) {
                console.error("❌ Failed to persist profile update:", err.message);
            }
        }
    };
};
