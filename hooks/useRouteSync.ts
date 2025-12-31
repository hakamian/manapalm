
import { useEffect, useRef } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View } from '../types';

export const useRouteSync = () => {
    const { currentView } = useAppState();
    const dispatch = useAppDispatch();
    const isInitialMount = useRef(true);
    const lastSyncedView = useRef<View | null>(null);

    // 1. Sync URL -> App State (ONLY on initial page load & PopState/Back button)
    useEffect(() => {
        const handleLocationChange = () => {
            const search = window.location.search;
            if (!search) return;

            const params = new URLSearchParams(search);
            const viewParam = params.get('view');

            if (viewParam && Object.values(View).includes(viewParam as View)) {
                // Only dispatch if this is from browser navigation, not our own updates
                if (viewParam !== lastSyncedView.current) {
                    dispatch({ type: 'SET_VIEW', payload: viewParam as View });
                    lastSyncedView.current = viewParam as View;
                }
            }
        };

        // Only sync from URL on FIRST mount
        if (isInitialMount.current) {
            handleLocationChange();
            isInitialMount.current = false;
        }

        // Handle Back/Forward buttons
        window.addEventListener('popstate', handleLocationChange);
        return () => window.removeEventListener('popstate', handleLocationChange);
    }, [dispatch]); // Removed currentView dependency - this should only react to browser navigation

    // 2. Sync App State -> URL (use replaceState to avoid creating extra history entries)
    useEffect(() => {
        if (window.location.protocol === 'blob:') return;

        // Skip if this view was already synced (prevents loops)
        if (lastSyncedView.current === currentView) return;

        const params = new URLSearchParams(window.location.search);
        const currentUrlView = params.get('view');

        if (currentUrlView !== currentView) {
            params.set('view', currentView);

            if (currentView !== View.Shop) {
                params.delete('product_id');
            }

            const newUrl = `${window.location.pathname}?${params.toString()}`;

            try {
                // Use replaceState for internal navigation to avoid polluting history
                window.history.replaceState({ path: newUrl }, '', newUrl);
                document.title = `نخلستان معنا | ${getViewTitle(currentView)}`;
                lastSyncedView.current = currentView;
            } catch (e) {
                console.debug('History replaceState blocked:', e);
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
        case View.UserProfile: return 'پروفایل';
        default: return 'خوش آمدید';
    }
};
