
import React, { useState, useEffect } from 'react';
import { ClockIcon } from './icons';

interface CountdownTimerProps {
    targetDate: string;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, label = "زمان باقی‌مانده", size = 'md' }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft: any = {};

        if (difference > 0) {
            timeLeft = {
                D: Math.floor(difference / (1000 * 60 * 60 * 24)),
                H: Math.floor((difference / (1000 * 60 * 60)) % 24),
                M: Math.floor((difference / 1000 / 60) % 60),
                S: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
            if (Object.keys(newTimeLeft).length === 0) {
                setIsExpired(true);
            }
        }, 1000);
        return () => clearTimeout(timer);
    });

    const sizeClasses = {
        sm: "text-xs px-2 py-1",
        md: "text-sm px-3 py-1.5",
        lg: "text-base px-4 py-2"
    };

    if (isExpired) {
         return null;
    }

    return (
        <div className={`flex items-center gap-2 bg-red-900/30 border border-red-500/40 rounded-lg text-red-200 animate-pulse ${sizeClasses[size]}`}>
            <ClockIcon className={`flex-shrink-0 ${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <span className="opacity-80 whitespace-nowrap">{label}:</span>
            <div className="flex items-center gap-1 font-mono font-bold dir-ltr">
                {timeLeft.D > 0 && <span>{timeLeft.D}d :</span>}
                <span>{String(timeLeft.H).padStart(2, '0')}h :</span>
                <span>{String(timeLeft.M).padStart(2, '0')}m :</span>
                <span className="text-red-400">{String(timeLeft.S).padStart(2, '0')}s</span>
            </div>
        </div>
    );
};

export default CountdownTimer;
