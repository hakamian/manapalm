import React, { useEffect } from 'react';
import { XIcon } from './icons.tsx';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-end md:items-center p-0 md:p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className="relative bg-white dark:bg-stone-800 shadow-xl w-full max-h-[85vh] overflow-y-auto transform transition-transform duration-300 md:scale-95 animate-slide-in-up md:animate-scale-in rounded-t-2xl md:rounded-2xl md:max-w-fit md:w-auto p-4 sm:p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Mobile Grabber Handle */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-stone-300 dark:bg-stone-600 rounded-full md:hidden"></div>
                
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 bg-stone-100/50 dark:bg-stone-700/50 rounded-full z-10"
                    aria-label="بستن"
                >
                    <XIcon className="w-5 h-5"/>
                </button>

                <div className="pt-6 md:pt-0">
                  {children}
                </div>
            </div>
             <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes slide-in-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-in-up { animation: slide-in-up 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards; }

                @media (min-width: 768px) {
                  .md\\:animate-scale-in { 
                    animation: scale-in 0.2s ease-out forwards;
                  }
                  /* On desktop, we don't want the slide-in animation */
                  .animate-slide-in-up {
                    animation: none;
                  }
                }
            `}</style>
        </div>
    );
};

export default Modal;
