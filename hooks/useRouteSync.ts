
import { useEffect } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View } from '../types';

export const useRouteSync = () => {
    const { currentView } = useAppState();
    const dispatch = useAppDispatch();

    // 1. Sync URL -> App State (On Load & PopState)
    useEffect(() => {
        const handleLocationChange = () => {
            // In blob environments or if search is empty, this might be safe or empty
            const search = window.location.search;
            if (!search) return;

            const params = new URLSearchParams(search);
            const viewParam = params.get('view');
            
            // Map string param to View enum
            if (viewParam && Object.values(View).includes(viewParam as View)) {
                // Only dispatch if different to prevent loops
                if (viewParam !== currentView) {
                    dispatch({ type: 'SET_VIEW', payload: viewParam as View });
                }
            }
        };

        // Handle initial load
        handleLocationChange();

        // Handle Back/Forward buttons
        window.addEventListener('popstate', handleLocationChange);
        return () => window.removeEventListener('popstate', handleLocationChange);
    }, [dispatch]); // Removed currentView dependency to avoid overwrite on back

    // 2. Sync App State -> URL
    useEffect(() => {
        // Skip if running in a blob/sandbox environment where location manipulation is restricted
        if (window.location.protocol === 'blob:') return;

        const params = new URLSearchParams(window.location.search);
        const currentUrlView = params.get('view');

        if (currentUrlView !== currentView) {
            params.set('view', currentView);
            
            // Preserve other params like 'intent' or 'id' if we are just switching views
            // But clear 'product_id' if we leave the shop, etc.
            if (currentView !== View.Shop) {
                params.delete('product_id');
            }

            const newUrl = `${window.location.pathname}?${params.toString()}`;
            
            try {
                window.history.pushState({ path: newUrl }, '', newUrl);
                // Update Page Title for History
                document.title = `نخلستان معنا | ${getViewTitle(currentView)}`;
            } catch (e) {
                // Ignore security errors in sandboxed environments
                console.debug('History pushState blocked:', e);
            }
        }
    }, [currentView]);
};

const getViewTitle = (view: View): string => {
    switch (view) {
        case View.Home: return 'خانه';
        case View.Shop: return 'فروشگاه';
        case View.HallOfHeritage: return 'تالار میراث';
        case View.CommunityHub: return 'کانون جامعه';
        case View.Courses: return 'آکادمی';
        default: return 'خوش آمدید';
    }
};
