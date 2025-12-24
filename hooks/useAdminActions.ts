
import { useAppDispatch, useAppState } from "../AppContext";
import { adminService } from "../services/application/adminService";
import { ProjectUpdate } from "../types";

export const useAdminActions = () => {
    const dispatch = useAppDispatch();
    const state = useAppState();

    return {
        grantBonus: async (userId: string, points: number, type: 'barkat' | 'mana', reason: string) => {
            const updatedUser = await adminService.grantBonus(userId, points, type, reason);
            if (updatedUser) {
                dispatch({ type: 'UPDATE_USER', payload: updatedUser });
                dispatch({
                    type: 'SHOW_POINTS_TOAST',
                    payload: { points, action: `پاداش ادمین: ${reason}`, type }
                });
            }
        },

        updateInsightStatus: async (userId: string, insightId: string, status: 'approved' | 'rejected') => {
            const updatedUser = await adminService.updateInsightStatus(userId, insightId, status);
            if (updatedUser) {
                dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            }
        },

        respondToMentorshipRequest: async (requestId: string, status: 'approved' | 'rejected') => {
            const success = await adminService.updateMentorshipStatus(requestId, status);
            // In a real app, we would refresh the mentorship requests list from the server
            // For now, we assume local state update or just notification
        },

        addProjectUpdate: async (projectId: string, update: Omit<ProjectUpdate, 'date'>) => {
            const success = await adminService.addProjectUpdate(projectId, update);
            // Refresh projects
        }
    };
};
