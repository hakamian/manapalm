
import { AppState, Order, User, TimelineEvent, Deed, Notification, View, WebDevProject } from '../../types';
import { dbAdapter } from './database';

/**
 * Order Service (Application Layer)
 * Handles Business Logic for Orders, Points, and Unlocks.
 * Mirror for future Go Backend logic.
 */

export const createTimelineEventFromDeed = (deed: Deed): TimelineEvent => ({
    id: `evt_plant_${deed.id}`,
    date: deed.date,
    type: 'palm_planted',
    title: `کاشت نخل: ${deed.intention}`,
    description: deed.message || 'یک نخل جدید کاشته شد.',
    deedId: deed.id,
    details: {
        id: deed.productId,
        title: deed.palmType,
        recipient: deed.name,
        plantedBy: deed.fromName,
        message: deed.message,
        certificateId: deed.id
    },
    userReflection: { notes: '' },
    isSharedAnonymously: false,
    status: 'approved'
});

export const orderService = {
    /**
     * Processes a new order, calculates points, handles feature unlocks,
     * and persists changes to the database.
     */
    processOrderPlacement: (state: AppState, newOrder: Order) => {
        const rawPointsEarned = newOrder.items.reduce((sum, item) => sum + (item.points || 0) * item.quantity, 0);
        const pointsEarned = Math.min(rawPointsEarned, 20000);
        const newTimelineEvents = (newOrder.deeds || []).map(createTimelineEventFromDeed);

        // Create Notifications for Deeds
        const newNotifications: Notification[] = (newOrder.deeds || []).map((deed, i) => ({
            id: `notif-deed-${Date.now()}-${i}`,
            title: 'نخل جدید کاشته شد!',
            description: `نخل "${deed.intention}" با موفقیت ثبت شد.`,
            text: `برای مشاهده سند و جزئیات نخل "${deed.intention}" کلیک کنید.`,
            date: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            read: false,
            isRead: false,
            type: 'success' as const,
            icon: 'SproutIcon',
            link: { view: View.HallOfHeritage }
        }));

        let unlockUpdates: Partial<User> = {};
        let newUnlockedTools = [...(state.user?.unlockedTools || [])];

        // --- Feature Unlock Logic ---
        if (newOrder.items.some(item => item.id === 'p_heritage_language')) {
            unlockUpdates.hasUnlockedEnglishTest = true;
        }
        if (newOrder.items.some(item => item.id === 'p_companion_unlock')) {
            unlockUpdates.hasUnlockedCompanion = true;
        }
        if (newOrder.items.some(item => item.id === 'p_reflection_unlock')) {
            const currentUses = state.user?.reflectionAnalysesRemaining || 0;
            unlockUpdates.reflectionAnalysesRemaining = currentUses + 1;
        }
        if (newOrder.items.some(item => item.id === 'p_coaching_lab_access' || item.id === 'p_hoshmana_live_weekly')) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            unlockUpdates.coachingLabAccess = { expiresAt: expiresAt.toISOString() };
            unlockUpdates.hoshmanaLiveAccess = {
                expiresAt: expiresAt.toISOString(),
                remainingSeconds: (state.user?.hoshmanaLiveAccess?.remainingSeconds || 0) + 3600
            };
        }

        // Generic Feature Unlocks via metadata
        newOrder.items.forEach(item => {
            if (item.unlocksFeatureId) {
                const featureId = item.unlocksFeatureId;
                if (!newUnlockedTools.includes(featureId)) {
                    newUnlockedTools.push(featureId);
                }
            }
        });

        if (newUnlockedTools.length > (state.user?.unlockedTools?.length || 0)) {
            unlockUpdates.unlockedTools = newUnlockedTools;
        }

        // --- Web Project Logic ---
        let webProjectUpdate: Partial<User> = {};
        const webDevItem = newOrder.items.find(item => item.webDevDetails);
        if (webDevItem && webDevItem.webDevDetails) {
            const newProject: WebDevProject = {
                packageName: webDevItem.name.replace('معمار میراث دیجیتال: ', ''),
                packagePrice: webDevItem.price,
                status: 'requested',
                initialRequest: webDevItem.webDevDetails
            };
            webProjectUpdate = { webDevProject: newProject };
            newTimelineEvents.push({
                id: `evt_project_start_${Date.now()}`,
                date: new Date().toISOString(),
                type: 'creative_act',
                title: 'آغاز پروژه میراث دیجیتال',
                description: `شروع ساخت ${webDevItem.name}`,
                details: {
                    mediaType: 'image',
                    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=400',
                    prompt: webDevItem.name
                }
            }
            });
    }

        // --- Standard Merchandise Timeline Event ---
        // Identify items that are NOT deeds, NOT web projects, and NOT special unlocks (which might have their own logic, but usually products are just products)
        const merchandiseItems = newOrder.items.filter(item =>
        item.type !== 'heritage' && // Deeds are handled separately
        !item.webDevDetails && // Web projects handled separately
        !newUnlockedTools.includes(item.id) && // Unlocks usually don't need "shopping" event, or maybe they do? Let's include everything else.
        !['p_life_coach_session', 'p_business_mentor_session', 'p_coaching_lab_access'].includes(item.productId) // Services handled separately or fine as is
    );

    // Actually, let's just make a "Shopping Spree" event for any non-deed physical/digital goods to rely on "Seeing what they bought"
    const standardProducts = newOrder.items.filter(item => item.type !== 'heritage' && !item.webDevDetails); // Simplify: All non-deed, non-project items

    if(standardProducts.length > 0) {
        const productNames = standardProducts.map(p => p.name).join('، ');
newTimelineEvents.push({
    id: `evt_shop_${newOrder.id}`,
    date: newOrder.createdAt, // Use order date
    type: 'creative_act', // Using 'creative_act' or 'milestone' generic type. Maybe need a 'purchase' type but 'creative_act' logic works for now or generic. 
    // Let's use 'creative_act' as a catch-all specific event type might not exist in enum yet, checking types... 
    // types/content.ts -> TimelineEventType = 'milestone' | 'creative_act' | 'palm_planted' | 'community_event' ...
    // 'milestone' seems appropriate for a purchase.
    title: 'خرید از بازارچه نخلستان',
    description: `خرید ${standardProducts.length} محصول: ${productNames}`,
    details: {
        imageUrl: standardProducts[0].image,
        prompt: productNames // abusing prompt field for metadata text
    }
} as any); // Type assertion if needed, but fitting TimelineEvent structure
        }

// --- Assembly of Updated User ---
const updatedUser: User | null = state.user ? {
    ...state.user,
    points: state.user.points + pointsEarned,
    pointsHistory: [
        ...(state.user.pointsHistory || []),
        { action: 'خرید', points: pointsEarned, type: 'barkat' as const, date: new Date().toISOString() }
    ],
    timeline: [...newTimelineEvents, ...(state.user.timeline || [])],
    ...webProjectUpdate,
    ...unlockUpdates,
    notifications: [...newNotifications, ...(state.user.notifications || [])]
} : null;

// --- Persistence (Side Effects) ---
dbAdapter.saveOrder(newOrder);
if (updatedUser) dbAdapter.saveUser(updatedUser);

return {
    updatedUser,
    pointsEarned,
    newNotifications
};
    },

/**
 * Helper to create a quick order object
 */
createQuickOrder: (user: User | null, palm: any, quantity: number, deedDetails: any, selectedPlan: number): Order => {
    const total = palm.price * quantity;
    const orderId = `order-${Date.now()}`;
    const deedId = `deed-${Date.now()}`;

    const deed: Deed = {
        id: deedId,
        productId: palm.id,
        intention: deedDetails.intention,
        name: deedDetails.name,
        date: new Date().toISOString(),
        palmType: palm.name,
        message: deedDetails.message,
        fromName: deedDetails.fromName,
        groveKeeperId: deedDetails.groveKeeperId,
        isPlanted: false
    };

    return {
        id: orderId,
        userId: user?.id || 'guest',
        status: 'pending',
        totalAmount: total,
        createdAt: new Date().toISOString(),
        items: [{
            ...palm,
            id: `${palm.id}-${Date.now()}`,
            quantity: quantity,
            image: `https://picsum.photos/seed/${palm.id}/400/400`,
            paymentPlan: selectedPlan > 1 ? { installments: selectedPlan } : undefined
        }],
        statusHistory: [{ status: 'pending', date: new Date().toISOString() }],
        deeds: [deed]
    };
}
};
