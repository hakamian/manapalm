import Link from 'next/link';
import { useAppDispatch } from '../../AppContext';
import { View } from '../../types';

interface SmartLinkProps {
    view: View;
    children: React.ReactNode;
    className?: string;
    ariaLabel?: string;
    params?: string; // Optional URL params like "product_id=123"
    onClick?: () => void;
}

const VIEW_TO_ROUTE: Partial<Record<View, string>> = {
    [View.About]: '/about',
    [View.Contact]: '/contact',
    [View.Shop]: '/shop',
    [View.Courses]: '/courses',
    [View.UserProfile]: '/profile',
    [View.Articles]: '/articles',
    [View.HallOfHeritage]: '/heritage',
    // Add more routes here as we migrate them
};

const SmartLink: React.FC<SmartLinkProps> = ({ view, children, className, ariaLabel, params, onClick }) => {
    const dispatch = useAppDispatch();
    const route = VIEW_TO_ROUTE[view];

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (onClick) onClick();

        // If it's a real route, let next/link handle it (unless it's ctrl+click)
        if (route && !e.ctrlKey && !e.metaKey) {
            // We still dispatch to keep legacy state in sync (optional but safer)
            dispatch({ type: 'SET_VIEW', payload: view });
            return;
        }

        // Legacy View-based navigation
        if (e.ctrlKey || e.metaKey) return;
        e.preventDefault();

        const newUrl = `/?view=${view}${params ? `&${params}` : ''}`;
        try {
            window.history.pushState({}, '', newUrl);
        } catch (error) {
            console.debug('Navigation history update blocked:', error);
        }

        dispatch({ type: 'SET_VIEW', payload: view });
    };

    const href = route ? route : `/?view=${view}${params ? `&${params}` : ''}`;

    if (route) {
        return (
            <Link
                href={href}
                onClick={handleClick}
                className={className}
                aria-label={ariaLabel}
            >
                {children}
            </Link>
        );
    }

    return (
        <a
            href={href}
            onClick={handleClick}
            className={className}
            aria-label={ariaLabel}
        >
            {children}
        </a>
    );
};

export default SmartLink;
