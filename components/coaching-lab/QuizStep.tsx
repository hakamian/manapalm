
import React, { useState } from 'react';
import { CheckCircleIcon, XMarkIcon, TrophyIcon, ArrowLeftIcon, BrainCircuitIcon } from '../icons';

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}

interface QuizStepProps {
    questions: QuizQuestion[];
    onPass: () => void;
    onRetry: () => void;
}

const QuizStep: React.FC<QuizStepProps> = ({ questions, onPass, onRetry }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const currentQuestion = questions[currentIndex];
    const passingScore = 2;

    const handleOptionClick = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        if (index === currentQuestion.correctAnswer) {
            setScore(s => s + 1);
        }

        // Auto advance after delay
        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setSelectedOption(null);
                setIsAnswered(false);
            } else {
                setShowResult(true);
            }
        }, 1500);
    };

    if (showResult) {
        const passed = score >= passingScore;
        return (
            <div className="text-center p-6 animate-fade-in">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {passed ? (
                        <TrophyIcon className="w-12 h-12 text-green-500 animate-bounce" />
                    ) : (
                        <XMarkIcon className="w-12 h-12 text-red-500" />
                    )}
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">
                    {passed ? 'تبریک! شما آماده‌اید.' : 'نیاز به مرور مجدد'}
                </h2>
                
                <p className="text-stone-400 mb-8">
                    {passed 
                        ? `شما به ${score} سوال از ${questions.length} سوال پاسخ درست دادید.` 
                        : `شما فقط به ${score} سوال پاسخ درست دادید. برای ورود به جلسه تمرین حداقل ۲ پاسخ صحیح لازم است.`}
                </p>

                {passed ? (
                    <button 
                        type="button"
                        onClick={onPass}
                        className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transition-all hover:scale-105"
                    >
                        <BrainCircuitIcon className="w-5 h-5" />
                        ورود به جلسه با منتور
                    </button>
                ) : (
                    <button 
                        type="button"
                        onClick={onRetry}
                        className="w-full py-3 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        بازگشت و مرور درس
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="p-4 max-w-lg mx-auto animate-slide-up">
            <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-stone-500">آزمون ورود به جلسه</span>
                <span className="text-xs bg-stone-800 px-3 py-1 rounded-full text-amber-400">
                    سوال {currentIndex + 1} از {questions.length}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-stone-800 h-2 rounded-full mb-8 overflow-hidden">
                <div 
                    className="bg-amber-500 h-full transition-all duration-500" 
                    style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
                ></div>
            </div>

            <h3 className="text-xl font-bold text-white mb-8 leading-relaxed">
                {currentQuestion.question}
            </h3>

            <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                    let buttonStyle = "bg-stone-800 border-stone-700 text-stone-300 hover:border-stone-500";
                    
                    if (isAnswered) {
                        if (idx === currentQuestion.correctAnswer) {
                            buttonStyle = "bg-green-900/40 border-green-500 text-green-100"; // Correct
                        } else if (idx === selectedOption) {
                            buttonStyle = "bg-red-900/40 border-red-500 text-red-100"; // Wrong selected
                        } else {
                            buttonStyle = "bg-stone-800 border-stone-700 text-stone-500 opacity-50"; // Others
                        }
                    } else if (selectedOption === idx) {
                         buttonStyle = "bg-amber-900/30 border-amber-500 text-white";
                    }

                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleOptionClick(idx)}
                            disabled={isAnswered}
                            className={`w-full p-4 text-right rounded-xl border-2 transition-all duration-200 flex justify-between items-center ${buttonStyle}`}
                        >
                            <span>{option}</span>
                            {isAnswered && idx === currentQuestion.correctAnswer && (
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                            )}
                             {isAnswered && idx === selectedOption && idx !== currentQuestion.correctAnswer && (
                                <XMarkIcon className="w-5 h-5 text-red-500" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuizStep;
