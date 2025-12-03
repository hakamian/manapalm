import React from 'react';
import { LeafIcon } from './icons.tsx';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-amber-200 dark:border-amber-800 rounded-full animate-pulse"></div>
                <LeafIcon className="w-10 h-10 text-amber-500 dark:text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
            </div>
            <p className="mt-4 font-semibold text-stone-600 dark:text-stone-300">در حال بارگذاری...</p>
        </div>
    );
};

export default LoadingSpinner;
