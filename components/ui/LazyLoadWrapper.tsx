
import React, { useState, useEffect, useRef } from 'react';

interface LazyLoadWrapperProps {
    children: React.ReactNode;
    height?: string; // Placeholder height to prevent layout shift
    threshold?: number;
}

const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({ children, height = '400px', threshold = 0.1 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '100px', threshold } // Load slightly before it comes into view
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.disconnect();
        };
    }, [threshold]);

    return (
        <div ref={ref} style={{ minHeight: height }} className="w-full relative">
            {isVisible ? (
                <div className="animate-fade-in">
                    {children}
                </div>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800/30 rounded-xl animate-pulse">
                    <span className="text-gray-500 text-sm">در حال بارگذاری محتوا...</span>
                </div>
            )}
        </div>
    );
};

export default LazyLoadWrapper;
