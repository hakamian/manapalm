
import React from 'react';
import { useAppDispatch } from '../../AppContext';
import { View } from '../../types';

interface SmartLinkProps {
    view: View;
    children: React.ReactNode;
    className?: string;
    ariaLabel?: string;
    params?: string; // Optional URL params like "product_id=123"
}

const SmartLink: React.FC<SmartLinkProps> = ({ view, children, className, ariaLabel, params }) => {
    const dispatch = useAppDispatch();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Allow opening in new tab with Ctrl/Cmd + Click
        if (e.ctrlKey || e.metaKey) return;
        
        e.preventDefault();
        
        // Update URL visually for user feedback and history
        const newUrl = `/?view=${view}${params ? `&${params}` : ''}`;
        
        try {
            window.history.pushState({}, '', newUrl);
        } catch (error) {
            // Ignore security errors in sandboxed environments (e.g. blob URLs)
            console.debug('Navigation history update blocked:', error);
        }
        
        dispatch({ type: 'SET_VIEW', payload: view });
    };

    const href = `/?view=${view}${params ? `&${params}` : ''}`;

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
