
import { AppState, User, CommunityPost, Review, Campaign, MicrofinanceProject } from '../../types';
import { dbAdapter } from './database';
import { userService } from './userService';

/**
 * Community Service (Application Layer)
 * Handles Community interactions, microfinance, and feedback.
 */

export const communityService = {
    /**
     * Invests in a microfinance project using either wallet or points.
     */
    investInProject: async (
        state: AppState,
        projectId: string,
        amount: number,
        method: 'wallet' | 'points'
    ): Promise<{ updatedUser: User, updatedProjects: MicrofinanceProject[] } | null> => {
        if (!state.user) return null;

        let updatedUser = { ...state.user! };
        const pointsCost = amount / 10;

        if (method === 'points') {
            if (updatedUser.points < pointsCost) return null;
            updatedUser = await userService.updateBarkatPoints(
                updatedUser,
                -pointsCost,
                'سرمایه‌گذاری در صندوق رویش'
            );
        }

        const updatedProjects = state.microfinanceProjects.map(p => {
            if (p.id === projectId) {
                return { ...p, amountFunded: p.amountFunded + amount, backersCount: p.backersCount + 1 };
            }
            return p;
        });

        updatedUser.impactPortfolio = [
            ...(updatedUser.impactPortfolio || []),
            { projectId, amountLent: amount, dateLent: new Date().toISOString(), status: 'active' }
        ];

        await dbAdapter.saveUser(updatedUser);
        return { updatedUser, updatedProjects };
    },

    /**
     * Submits a new review and awards points.
     */
    submitReview: async (user: User, review: Review): Promise<{ updatedUser: User, reviewWithStatus: Review }> => {
        const pointsAwarded = 50;
        const updatedUser = await userService.updateBarkatPoints(
            user,
            pointsAwarded,
            'ثبت تجربه و نظر'
        );

        const reviewWithStatus: Review = { ...review, status: 'pending' as const };
        // Note: Review saving should ideally be in dbAdapter
        // await dbAdapter.saveReview(reviewWithStatus); 

        return { updatedUser, reviewWithStatus };
    },

    /**
     * Admin: Creates a new campaign.
     */
    createCampaign: (payload: any): Campaign => {
        return {
            id: `camp-${Date.now()}`,
            title: payload.title,
            description: payload.description,
            goal: payload.goal,
            current: 0,
            unit: payload.unit,
            ctaText: 'مشارکت در کمپین',
            rewardPoints: 500
        };
    },

    /**
     * Admin: Publishes an announcement post.
     */
    publishAnnouncement: async (payload: any): Promise<CommunityPost> => {
        const newPost: CommunityPost = {
            id: `post-exec-${Date.now()}`,
            authorId: 'admin-bot',
            authorName: 'دفتر استراتژی (هوشمانا)',
            authorAvatar: 'https://picsum.photos/seed/ai-strategy/100/100',
            timestamp: new Date().toISOString(),
            text: `# ${payload.title}\n\n${payload.text}`,
            likes: 0
        };
        await dbAdapter.savePost(newPost);
        return newPost;
    }
};
