// This is a simple wrapper for Google Analytics events.
// In a real-world app, you might use a more robust library.

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

/**
 * Logs a page view event to Google Analytics.
 * @param page The page that was viewed (e.g., 'home', 'heritage').
 */
export const logPageView = (page: string) => {
    if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
            page_title: page,
            page_path: `/${page}`,
        });
    } else {
        console.log(`Analytics: Page View - ${page}`);
    }
};

/**
 * Logs a custom event to Google Analytics.
 * @param eventName The name of the event (e.g., 'add_to_cart', 'sign_up').
 * @param eventParams Optional parameters for the event.
 */
export const logEvent = (eventName: string, eventParams: object = {}) => {
     if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, eventParams);
    } else {
        console.log(`Analytics: Event - ${eventName}`, eventParams);
    }
};
