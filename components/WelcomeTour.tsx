
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAppState, useAppDispatch } from '../AppContext';
import { XMarkIcon, ArrowLeftIcon, ArrowRightIcon } from './icons';
import { View } from '../types';

interface Step {
    targetId?: string;
    title: string;
    content: string;
    position?: 'bottom' | 'top' | 'left' | 'right' | 'center';
    view?: View; // If we need to change view for the step
}

const steps: Step[] = [
    {
        title: 'به نخلستان معنا خوش آمدید',
        content: 'جایی که فناوری، آموزش و نیکوکاری به هم می‌رسند. در این تور کوتاه با بخش‌های اصلی آشنا می‌شوید.',
        position: 'center',
        view: View.Home
    },
    {
        targetId: 'nav-category-نخلستان',
        title: 'بخش نخلستان',
        content: 'در اینجا می‌توانید نخل‌های واقعی بکارید، میراث خود را ثبت کنید و از فروشگاه محصولات ارگانیک خرید کنید.',
        position: 'bottom',
        view: View.Home
    },
    {
        targetId: 'nav-category-مشاوره تخصصی',
        title: 'مشاوره تخصصی',
        content: 'دریافت راهنمایی‌های عمیق از منتورهای هوشمند و متخصص برای رشد کسب‌وکار و زندگی شخصی.',
        position: 'bottom',
        view: View.Home
    },
    {
        targetId: 'nav-category-آکادمی',
        title: 'آکادمی هوشمانا',
        content: 'یادگیری مهارت‌های آینده. از زبان و بیزینس تا هوش مصنوعی، با متدهای نوین.',
        position: 'bottom',
        view: View.Home
    },
    {
        targetId: 'nav-profile',
        title: 'پروفایل شما',
        content: 'مرکز فرماندهی شما. امتیازات، دستاوردها و مسیر رشد خود را اینجا مدیریت کنید.',
        position: 'bottom',
        view: View.Home
    },
    {
        targetId: 'nav-login', // Fallback if not logged in
        title: 'شروع سفر',
        content: 'برای دسترسی به تمام امکانات، از اینجا وارد شوید یا ثبت‌نام کنید.',
        position: 'bottom',
        view: View.Home
    }
];

const WelcomeTour: React.FC = () => {
    const { user } = useAppState();
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check if tour has been seen
        const hasSeenTour = localStorage.getItem('has_seen_onboarding_tour_v2'); // Increment version to force re-show

        if (!hasSeenTour) {
            const hasSeenWelcomeMat = sessionStorage.getItem('hasSeenWelcomeMat');
            const delay = !hasSeenWelcomeMat ? 5000 : 1500;
            const timer = setTimeout(() => setIsVisible(true), delay);
            return () => clearTimeout(timer);
        }
    }, []);

    // Detect Mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const activeSteps = steps.filter(step => {
        if (step.targetId === 'nav-profile' && !user) return false;
        if (step.targetId === 'nav-login' && user) return false;
        return true;
    });

    const stepData = activeSteps[currentStep];

    useEffect(() => {
        if (!isVisible) return;

        const updateRect = () => {
            if (!stepData.targetId) {
                setTargetRect(null);
                return;
            }
            const element = document.getElementById(stepData.targetId!);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
                // Scroll behavior
                if (!isMobile) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }
            } else {
                setTargetRect(null);
            }
        };

        // Delay slightly to allow menu animations
        setTimeout(updateRect, 300);
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect);

        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect);
        };
    }, [currentStep, isVisible, stepData, isMobile]);

    const handleNext = () => {
        if (currentStep < activeSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('has_seen_onboarding_tour_v2', 'true');
    };

    if (!mounted || !isVisible) return null;

    // --- Styles ---

    // 1. Spotlight Overlay
    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999, // Ultra high z-index
        // If not mobile and we have a target, use the hole effect.
        // Otherwise (mobile or no target), just dark overlay.
        backgroundColor: (!isMobile && targetRect) ? 'transparent' : 'rgba(0,0,0,0.7)',
        boxShadow: (!isMobile && targetRect) ? `0 0 0 9999px rgba(0, 0, 0, 0.75)` : 'none',
        // Position the "hole" if desktop
        ...((!isMobile && targetRect) ? {
            top: targetRect.top - 10,
            left: targetRect.left - 10,
            width: targetRect.width + 20,
            height: targetRect.height + 20,
            borderRadius: '12px',
        } : {}),
        pointerEvents: 'none', // Allow clicks to pass through? No, usually block.
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    };

    // 2. Card Position
    let cardStyle: React.CSSProperties = {
        position: 'fixed',
        zIndex: 10000, // Higher than overlay
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    };

    if (isMobile) {
        // Mobile: Always Bottom Sheet
        cardStyle = {
            ...cardStyle,
            bottom: '20px',
            left: '20px',
            right: '20px',
            width: 'auto',
            maxWidth: 'none',
        };
    } else if (targetRect) {
        // Desktop: Position relative to target
        const gap = 20;
        const cardWidth = 340;

        let top = targetRect.bottom + gap;
        let left = targetRect.left + (targetRect.width / 2) - (cardWidth / 2);

        // Flip to top if too low
        if (top + 200 > window.innerHeight) {
            top = targetRect.top - gap - 200; // Approx height
        }

        // Clamp Horizontal
        if (left < 20) left = 20;
        if (left + cardWidth > window.innerWidth - 20) left = window.innerWidth - cardWidth - 20;

        cardStyle = {
            ...cardStyle,
            top,
            left,
            width: `${cardWidth}px`,
        };
    } else {
        // Center (Desktop fallback)
        cardStyle = {
            ...cardStyle,
            top: '50%',
            left: '50%',
            width: '340px',
            transform: 'translate(-50%, -50%)',
        };
    }

    const tourContent = (
        <>
            {/* Spotlight Hole / Dark Overlay */}
            <div style={overlayStyle} className="hidden md:block" />
            <div className={`fixed inset-0 bg-black/80 z-[9999] md:hidden transition-opacity duration-500`} />

            {/* Content Card */}
            <div
                style={cardStyle}
                className={`
                    backdrop-blur-xl bg-black/60 border border-white/10 
                    rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] 
                    text-white overflow-hidden flex flex-col
                    ${isMobile ? 'animate-slide-up' : 'animate-fade-in'}
                `}
            >
                {/* Decorative Gradient Line */}
                <div className="h-1 w-full bg-gradient-to-r from-green-400 via-amber-300 to-green-500" />

                <div className="p-6 relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 left-4 text-white/40 hover:text-white transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>

                    <div className="mb-6 mt-1">
                        <h3 className="text-xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-400">
                            {stepData.title}
                        </h3>
                        <p className="text-sm text-gray-300 leading-relaxed min-h-[60px]">
                            {stepData.content}
                        </p>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex gap-1.5">
                            {activeSteps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-amber-400 shadow-glow' : 'w-1.5 bg-white/20'
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="flex gap-3">
                            {currentStep > 0 && (
                                <button
                                    onClick={handlePrev}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors font-medium"
                                >
                                    قبلی
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="bg-gradient-to-l from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-green-900/40 transition-all transform active:scale-95"
                            >
                                {currentStep === activeSteps.length - 1 ? 'پایان تور' : 'بعدی'}
                                {currentStep < activeSteps.length - 1 && <ArrowLeftIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .shadow-glow { box-shadow: 0 0 8px rgba(251, 191, 36, 0.5); }
                @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </>
    );

    return createPortal(tourContent, document.body);
};


export default WelcomeTour;
