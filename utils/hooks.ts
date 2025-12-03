import { useState, useEffect, useRef } from 'react';

export const useAnimatedCounter = (target: number, duration = 2000) => {
    const [count, setCount] = useState(0);
    // FIX: Changed ref type from HTMLSpanElement to HTMLParagraphElement to match usage.
    const ref = useRef<HTMLParagraphElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    useEffect(() => {
        if (!isInView) return;

        let start = 0;
        const end = Math.floor(target);
        if (start === end) {
            setCount(end);
            return;
        }

        const range = end - start;
        let startTime: number | null = null;

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const currentCount = Math.floor(progress * range + start);
            setCount(currentCount);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                setCount(end);
            }
        };
        
        requestAnimationFrame(step);

    }, [target, duration, isInView]);

    return { count, ref };
};

export const useAnimatedValue = (endValue: number, duration = 1500) => {
    const [value, setValue] = useState(0);
    
    useEffect(() => {
        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setValue(Math.floor(progress * endValue));
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                setValue(endValue); // Ensure it ends on the exact value
            }
        };
        
        // Start the animation
        requestAnimationFrame(step);
        
    }, [endValue, duration]);
    
    return value;
};

export const useScrollAnimation = () => {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('scroll-in-view');
                    }
                });
            },
            {
                threshold: 0.1,
            }
        );

        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach((el) => observer.observe(el));

        return () => elements.forEach((el) => observer.unobserve(el));
    }, []);
};
