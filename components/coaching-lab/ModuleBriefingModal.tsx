
import React, { useState, useEffect } from 'react';
import { bookJourneys } from '../../utils/coachingData';
import ModuleOverviewStep from './ModuleOverviewStep';
import FocusModeStep from './FocusModeStep';
import DeepReadingStep from './DeepReadingStep';
import QuizStep from './QuizStep';

interface ModuleBriefingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: () => void;
    module: typeof bookJourneys[0]['modules'][0] & { quiz?: any[] }; // Extended type to include quiz
    bookTitle: string;
    isUnlocked?: boolean;
    onUnlockRequest?: () => void;
}

type Step = 'overview' | 'focus' | 'reading' | 'quiz';

const ModuleBriefingModal: React.FC<ModuleBriefingModalProps> = ({ 
    isOpen, onClose, onStart, module, bookTitle, isUnlocked = false, onUnlockRequest 
}) => {
    const [step, setStep] = useState<Step>('overview');

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep('overview');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleStartFocus = () => {
        setStep('focus');
    };

    const handleStartReading = () => {
        setStep('reading');
    };

    const handleFinishReading = () => {
        // If module has a quiz with at least 1 question, go to quiz
        if (module.quiz && module.quiz.length > 0) {
            setStep('quiz');
        } else {
            // If no quiz, go straight to session (fallback)
            onStart();
        }
    };

    const handleRetryQuiz = () => {
        setStep('reading'); // Send back to reading to review
    };

    // --- RENDER ORCHESTRATION ---
    
    if (step === 'overview') {
        return (
            <ModuleOverviewStep 
                isOpen={isOpen}
                onClose={onClose}
                onStart={handleStartFocus}
                module={module}
                bookTitle={bookTitle}
                isUnlocked={isUnlocked}
                onUnlockRequest={onUnlockRequest}
            />
        );
    }

    if (step === 'focus') {
        return (
            <FocusModeStep onStartReading={handleStartReading} />
        );
    }

    if (step === 'reading') {
        return (
            <DeepReadingStep 
                module={module}
                bookTitle={bookTitle}
                onStartPractice={handleFinishReading} // Changed to trigger quiz flow
                onClose={onClose}
            />
        );
    }

    if (step === 'quiz') {
        return (
            // Reusing the Modal wrapper look from other steps would be consistent, 
            // but QuizStep is designed to be embedded. Let's wrap it.
            <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-stone-900 rounded-2xl border border-stone-700 overflow-hidden">
                     <QuizStep 
                        questions={module.quiz || []}
                        onPass={onStart}
                        onRetry={handleRetryQuiz}
                    />
                </div>
            </div>
        );
    }

    return null;
};

export default ModuleBriefingModal;
