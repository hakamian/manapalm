
import React, { useState, useEffect, useRef } from 'react';
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
    
    useEffect(() => {
        // Check if tour has been seen
        const hasSeenTour = localStorage.getItem('has_seen_onboarding_tour_v1');
        if (!hasSeenTour) {
            // Delay start slightly to allow app to render
            setTimeout(() => setIsVisible(true), 1500);
        }
    }, []);

    // Adjust steps based on login status dynamically if needed
    const activeSteps = steps.filter(step => {
        if (step.targetId === 'nav-profile' && !user) return false;
        if (step.targetId === 'nav-login' && user) return false;
        return true;
    });

    const stepData = activeSteps[currentStep];

    useEffect(() => {
        if (!isVisible || !stepData.targetId) {
            setTargetRect(null);
            return;
        }

        const updateRect = () => {
            const element = document.getElementById(stepData.targetId!);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
                // Scroll to element if needed
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            } else {
                // If element not found (e.g. mobile menu closed), maybe center or skip
                setTargetRect(null);
            }
        };

        updateRect();
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect);
        
        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect);
        };
    }, [currentStep, isVisible, stepData]);

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
        localStorage.setItem('has_seen_onboarding_tour_v1', 'true');
    };

    if (!isVisible) return null;

    // Overlay Style with Hole (Spotlight)
    // We use a massive box-shadow on the "hole" div to darken everything else
    const spotlightStyle: React.CSSProperties = targetRect ? {
        top: targetRect.top - 5,
        left: targetRect.left - 5,
        width: targetRect.width + 10,
        height: targetRect.height + 10,
        position: 'fixed',
        borderRadius: '8px',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
        zIndex: 100,
        transition: 'all 0.3s ease-out',
        pointerEvents: 'none' // Allow clicking through to target? No, usually tour blocks interaction.
    } : {
        // Full screen dark if no target (center step)
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 100
    };

    // Tooltip positioning logic
    let tooltipStyle: React.CSSProperties = {
        position: 'fixed',
        zIndex: 101,
        width: '300px',
        transition: 'all 0.3s ease-out',
    };

    if (targetRect) {
        // Simple positioning logic
        const gap = 15;
        if (stepData.position === 'bottom') {
            tooltipStyle.top = targetRect.bottom + gap;
            tooltipStyle.left = targetRect.left + (targetRect.width / 2) - 150; // Center horizontally
        } else if (stepData.position === 'top') {
             tooltipStyle.top = targetRect.top - gap - 200; // Approx height
             tooltipStyle.left = targetRect.left + (targetRect.width / 2) - 150;
        }
        // Clamp to screen edges
        if (tooltipStyle.left && (tooltipStyle.left as number) < 10) tooltipStyle.left = 10;
        if (tooltipStyle.left && (tooltipStyle.left as number) + 300 > window.innerWidth) tooltipStyle.left = window.innerWidth - 310;
    } else {
        // Center
        tooltipStyle.top = '50%';
        tooltipStyle.left = '50%';
        tooltipStyle.transform = 'translate(-50%, -50%)';
    }

    return (
        <>
            {/* The Dark Overlay / Spotlight */}
            <div style={spotlightStyle}></div>

            {/* The Tooltip Card */}
            <div style={tooltipStyle} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl p-6 shadow-2xl animate-fade-in border border-gray-200 dark:border-gray-700">
                <button onClick={handleClose} className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <XMarkIcon className="w-5 h-5" />
                </button>
                
                <div className="mb-4 mt-2">
                    <h3 className="text-lg font-bold mb-2">{stepData.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {stepData.content}
                    </p>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <div className="flex gap-1">
                         {activeSteps.map((_, idx) => (
                             <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentStep ? 'w-6 bg-amber-500' : 'w-1.5 bg-gray-300 dark:bg-gray-600'}`}></div>
                         ))}
                    </div>
                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <button onClick={handlePrev} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                قبلی
                            </button>
                        )}
                        <button 
                            onClick={handleNext} 
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
                        >
                            {currentStep === activeSteps.length - 1 ? 'شروع کن' : 'بعدی'}
                            {currentStep < activeSteps.length - 1 && <ArrowLeftIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WelcomeTour;
