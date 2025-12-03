// Fix: Created the full content for Toast.tsx.
import React, { useEffect, useState } from 'react';
import { CheckIcon, XIcon } from './icons.tsx'; // Assuming you have an X icon for errors

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true); // Animate in
        const timer = setTimeout(() => {
            setShow(false); // Animate out
            setTimeout(onDismiss, 300); // Remove from DOM after animation
        }, 4000); // 4 seconds visible

        return () => clearTimeout(timer);
    }, [onDismiss]);

    const typeStyles = {
        success: {
            bg: 'bg-green-500',
            icon: <CheckIcon className="w-6 h-6" />,
        },
        error: {
            bg: 'bg-red-500',
            icon: <XIcon className="w-6 h-6" />,
        },
        info: {
            bg: 'bg-blue-500',
            icon: <SparklesIcon className="w-6 h-6" />, // Placeholder icon
        },
    };
    
    const { bg, icon } = typeStyles[type];

    return (
        <div
            className={`flex items-center gap-3 p-4 rounded-lg shadow-lg text-white transition-all duration-300 ${bg} ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
            {icon}
            <p className="font-semibold">{message}</p>
            <button onClick={() => setShow(false)} className="ml-auto opacity-70 hover:opacity-100">
                <XIcon className="w-5 h-5"/>
            </button>
        </div>
    );
};

// Placeholder for SparklesIcon if not available in icons.tsx
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);


export default Toast;