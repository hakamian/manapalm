
import { User } from "../../types";

export type LeaderboardCategory = 'barkat' | 'mana' | 'impact';

export interface LeaderboardEntry {
    rank: number;
    user: User;
    score: number;
    isCurrentUser: boolean;
}

export const leaderboardService = {
    /**
     * Get sorted entries for a specific category
     */
    getLeaderboard: (allUsers: User[], currentUser: User | null, category: LeaderboardCategory): LeaderboardEntry[] => {
        const usersWithCurrent = currentUser
            ? [...allUsers.filter(u => u.id !== currentUser.id), currentUser]
            : allUsers;

        const sorted = [...usersWithCurrent].sort((a, b) => {
            if (category === 'mana') return (b.manaPoints || 0) - (a.manaPoints || 0);
            if (category === 'impact') {
                const aImpact = (a.impactPortfolio?.length || 0) + (a.timeline?.filter(e => e.type === 'palm_planted').length || 0);
                const bImpact = (b.impactPortfolio?.length || 0) + (b.timeline?.filter(e => e.type === 'palm_planted').length || 0);
                return bImpact - aImpact;
            }
            return b.points - a.points; // Default: Barkat
        });

        return sorted.map((u, index) => ({
            rank: index + 1,
            user: u,
            score: category === 'mana' ? (u.manaPoints || 0) : (category === 'impact' ? ((u.impactPortfolio?.length || 0) + (u.timeline?.filter(e => e.type === 'palm_planted').length || 0)) : u.points),
            isCurrentUser: u.id === currentUser?.id
        }));
    },

    /**
     * Gets the rank of a specific user in a category
     */
    getUserRank: (allUsers: User[], userId: string, category: LeaderboardCategory): number => {
        const sorted = [...allUsers].sort((a, b) => {
            if (category === 'mana') return (b.manaPoints || 0) - (a.manaPoints || 0);
            return b.points - a.points;
        });
        return sorted.findIndex(u => u.id === userId) + 1;
    }
};
