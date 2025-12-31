
import { useEffect, useRef } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View } from '../types';

export const useRouteSync = () => {
    const { currentView } = useAppState();
    const dispatch = useAppDispatch();
    const isInitialMount = useRef(true);

    // 1. Sync URL -> App State (ONLY on initial load & PopState, not on every re-render)
    useEffect(() => {
        const handleLocationChange = () => {
            const search = window.location.search;
            if (!search) return;

            const params = new URLSearchParams(search);
            const viewParam = params.get('view');

            if (viewParam && Object.values(View).includes(viewParam as View)) {
                if (viewParam !== currentView) {
                    dispatch({ type: 'SET_VIEW', payload: viewParam as View });
                }
            }
        };

        // Only sync from URL on FIRST mount, not on subsequent re-renders
        if (isInitialMount.current) {
            handleLocationChange();
            isInitialMount.current = false;
        }

        // Handle Back/Forward buttons (popstate should always work)
        window.addEventListener('popstate', handleLocationChange);
        return () => window.removeEventListener('popstate', handleLocationChange);
    }, [dispatch, currentView]);

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
