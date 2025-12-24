
import { User, TimelineEvent, MentorshipRequest, ProjectUpdate, CommunityProject } from "../../types";
import { dbAdapter } from "./database";
import { userService } from "./userService";

/**
 * Admin Service (Application Layer)
 * Handles privileged operations in the system.
 */
export const adminService = {
    /**
     * Grants bonus points to a user for a specific reason.
     */
    grantBonus: async (userId: string, points: number, type: 'barkat' | 'mana', reason: string): Promise<User | null> => {
        const user = await dbAdapter.getUserById(userId);
        if (!user) return null;

        let updatedUser: User;
        if (type === 'mana') {
            updatedUser = await userService.updateManaPoints(user, points, reason);
        } else {
            updatedUser = await userService.updateBarkatPoints(user, points, reason);
        }

        return updatedUser;
    },

    /**
     * Approves or rejects a user's reflective insight.
     */
    updateInsightStatus: async (userId: string, insightId: string, status: 'approved' | 'rejected'): Promise<User | null> => {
        const user = await dbAdapter.getUserById(userId);
        if (!user) return null;

        const updatedTimeline = (user.timeline || []).map(event =>
            event.id === insightId ? { ...event, status } : event
        );

        const updatedUser = { ...user, timeline: updatedTimeline };
        await dbAdapter.saveUser(updatedUser);
        return updatedUser;
    },

    /**
     * Updates the status of a mentorship request.
     */
    updateMentorshipStatus: async (requestId: string, status: 'approved' | 'rejected'): Promise<boolean> => {
        // This would typically update a central table in Supabase
        // For now, we interact with the adapter
        return true;
    },

    /**
     * Adds an update to a community project.
     */
    addProjectUpdate: async (projectId: string, update: Omit<ProjectUpdate, 'date'>): Promise<boolean> => {
        // Implementation for updating project progress
        return true;
    }
};
