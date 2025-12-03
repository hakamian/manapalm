

import React, { useState, useEffect, useRef } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { PointLog, EnglishLevelReport, View, TargetLanguage } from '../types';
import { getEnglishLevel, generatePlacementQuestions } from '../services/geminiService';
import { SparklesIcon, TrophyIcon, BrainCircuitIcon, GlobeIcon, ChartBarIcon, BookOpenIcon, TargetIcon, CheckCircleIcon, LockClosedIcon, FireIcon } from './icons';

const RETAKE_COST = 500; // Mana Points
const MESSAGE_DURATION = 3000; // 3 seconds per message

// Personalized Loading Steps based on interest
const getGenerationSteps = (lang: string, userName: string, interest: string) => {
    const interestLabel = interest === 'tech' ? 'تکنولوژی' : 
                          interest === 'art' ? 'هنر' : 
                          interest === 'business' ? 'کسب‌وکار' : 'عمومی';
    
    return [
        `در حال برقراری ارتباط امن با هسته پردازشی زبان ${lang === 'English' ? 'انگلیسی' : lang === 'German' ? 'آلمانی' : 'فرانسوی'}...`,
        `در حال بازیابی پرونده یادگیری ${userName}...`,
        `شناسایی علاقه‌مندی شما به حوزه ${interestLabel}...`,
        "اسکن الگوهای ذهنی و شناختی...",
        "طراحی سوالات بر اساس واژگان تخصصی مورد نیاز شما...",
        "تحلیل عمق دانش فعلی...",
        "بررسی دقیق استانداردهای CEFR...",
        `تطبیق سناریوهای آزمون با هدف ${userName}...`,
        "طراحی الگوریتم هوشمند برای سنجش مهارت...",
        "شبیه‌سازی مکالمات احتمالی در زمینه مورد علاقه...",
        "کالیبراسیون سطح دشواری سوالات...",
        `تشکیل شورای متخصصان هوش مصنوعی برای ${userName}...`,
        "بهینه‌سازی مسیر برای صرفه‌جویی در زمان یادگیری...",
        "نهایی‌سازی ساختار سوالات اختصاصی...",
        `آماده‌سازی محیط آزمون شخصی‌سازی شده...`
    ];
};

const analysisSteps = [
    { message: "در حال تحلیل ساختار گرامری...", icon: <BrainCircuitIcon className="w-10 h-10 text-blue-400" />, progress: 15 },
    { message: "سنجش دقیق دایره واژگان...", icon: <BookOpenIcon className="w-10 h-10 text-yellow-400" />, progress: 30 },
    { message: "شناسایی الگوهای ذهنی...", icon: <ChartBarIcon className="w-10 h-10 text-red-400" />, progress: 50 },
    { message: "مقایسه با استانداردهای جهانی...", icon: <GlobeIcon className="w-10 h-10 text-green-400" />, progress: 70 },
    { message: "طراحی نقشه راه اختصاصی...", icon: <TargetIcon className="w-10 h-10 text-teal-400" />, progress: 85 },
    { message: "نهایی‌سازی پروفایل...", icon: <TrophyIcon className="w-10 h-10 text-amber-500" />, progress: 100 }
];

const EnglishPlacementTestView: React.FC = () => {
    const { user, selectedLanguage } = useAppState();
    const dispatch = useAppDispatch();
    
    const targetLang: TargetLanguage = selectedLanguage || user?.languageConfig?.targetLanguage || 'English';
    const userName = user?.name || 'شما';
    const userInterest = user?.languageConfig?.interest || 'general';
    
    const savedLang = user?.languageConfig?.targetLanguage;
    const hasLevel = !!user?.languageConfig?.level;
    const isRetakeMode = hasLevel && (savedLang === targetLang || !savedLang);

    const [isPaid, setIsPaid] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [justFinished, setJustFinished] = useState(false);

    const [questions, setQuestions] = useState<{ text: string, options: string[] }[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ question: string, answer: string }[]>([]);
    
    const [isGeneratingFlow, setIsGeneratingFlow] = useState(true);
    const [generationStepIndex, setGenerationStepIndex] = useState(0);
    const [tempQuestions, setTempQuestions] = useState<{ text: string, options: string[] }[]>([]);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisStepIndex, setAnalysisStepIndex] = useState(0);
    
    const [report, setReport] = useState<EnglishLevelReport | null>(null);
    const [tempResult, setTempResult] = useState<EnglishLevelReport | null>(null);
    const analysisTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const generationSteps = getGenerationSteps(targetLang, userName, userInterest);

    const showPaywall = isRetakeMode && !isPaid && !justFinished && !hasStarted && !isAnalyzing;

    // --- Auto-Start Logic ---
    useEffect(() => {
        if (!showPaywall && !hasStarted && !justFinished) {
            const timer = setTimeout(() => {
                handleStartTest();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [showPaywall, hasStarted, justFinished]);

    const handlePayment = () => {
        if (user && user.manaPoints >= RETAKE_COST) {
            dispatch({ 
                type: 'SPEND_MANA_POINTS', 
                payload: { points: RETAKE_COST, action: `تعیین سطح مجدد ${targetLang}` } 
            });
            setIsPaid(true);
        } else {
            alert("امتیاز معنای کافی ندارید. می‌توانید با فعالیت در سایت امتیاز کسب کنید.");
        }
    };

    const handleStartTest = () => {
        setHasStarted(true);
        setIsGeneratingFlow(true);
        setGenerationStepIndex(0);
        loadQuestions();
    };

    const loadQuestions = async () => {
        try {
            // Pass interest to generate context-aware questions
            const generatedQuestions = await generatePlacementQuestions(targetLang, userInterest);
            setTempQuestions(generatedQuestions);
        } catch (e) {
            console.error("Critical Error in View:", e);
            setTempQuestions([
                 { text: "Select the correct sentence:", options: ["He go to school.", "He goes to school.", "He going to school.", "He gone to school."] }
            ]);
        }
    };

    // --- Generation Animation ---
    useEffect(() => {
        if (!hasStarted || !isGeneratingFlow) return;

        const interval = setInterval(() => {
            setGenerationStepIndex(prev => {
                if (prev >= generationSteps.length - 1) return prev;
                return prev + 1;
            });
        }, MESSAGE_DURATION);

        return () => clearInterval(interval);
    }, [hasStarted, isGeneratingFlow, generationSteps.length]); 

    // --- Transition Logic ---
    useEffect(() => {
        if (!hasStarted || !isGeneratingFlow) return;
        
        const hasQuestions = tempQuestions.length > 0;
        const isAnimationComplete = generationStepIndex >= generationSteps.length - 1; 
        
        if (hasQuestions && isAnimationComplete) {
             const finishTimer = setTimeout(() => {
                 setQuestions(tempQuestions);
                 setIsGeneratingFlow(false);
             }, 1000);
             return () => clearTimeout(finishTimer);
        }
        
        const safetyTimer = setTimeout(() => {
             if (isGeneratingFlow && hasQuestions) {
                setQuestions(tempQuestions);
                setIsGeneratingFlow(false);
             }
        }, 50000);

        return () => clearTimeout(safetyTimer);

    }, [isGeneratingFlow, tempQuestions, generationStepIndex, hasStarted, generationSteps.length]);

    // --- Analysis Animation ---
    useEffect(() => {
        if (isAnalyzing) {
            if (analysisStepIndex < analysisSteps.length - 1) {
                analysisTimerRef.current = setTimeout(() => {
                    setAnalysisStepIndex(prev => prev + 1);
                }, 2000); 
            } else if (tempResult) {
                analysisTimerRef.current = setTimeout(() => {
                    setIsAnalyzing(false);
                    setReport(tempResult);
                    setJustFinished(true);
                }, 1000);
            }
        }
        return () => {
            if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
        };
    }, [isAnalyzing, analysisStepIndex, tempResult]);


    const handleAnswer = (answer: string) => {
        const newAnswers = [...answers, { question: questions[currentQuestionIndex].text, answer }];
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleSubmit(newAnswers);
        }
    };

    const handleSubmit = async (finalAnswers: { question: string, answer: string }[]) => {
        if (!user) return;
        setIsAnalyzing(true);
        setAnalysisStepIndex(0);
        
        try {
            const result = await getEnglishLevel(finalAnswers);
            setTempResult({ ...result, language: targetLang });

            if (!isRetakeMode) {
                const pointsToAdd = 150;
                const newManaPoints = (user.manaPoints || 0) + pointsToAdd;
                const newPointLog: PointLog = {
                    action: `تکمیل آزمون تعیین سطح ${targetLang}`,
                    points: pointsToAdd,
                    type: 'mana',
                    date: new Date().toISOString()
                };
                dispatch({ 
                    type: 'UPDATE_USER', 
                    payload: {
                        ...user,
                        manaPoints: newManaPoints,
                        pointsHistory: [newPointLog, ...(user.pointsHistory || [])],
                        languageConfig: { ...user.languageConfig, targetLanguage: targetLang, level: result.level }
                    } 
                });
                dispatch({ type: 'SHOW_POINTS_TOAST', payload: { points: pointsToAdd, action: 'تکمیل آزمون تعیین سطح' } });
            } else {
                 dispatch({ 
                    type: 'UPDATE_USER', 
                    payload: {
                        ...user,
                        languageConfig: { ...user.languageConfig, targetLanguage: targetLang, level: result.level }
                    } 
                });
            }

        } catch (e) {
            console.error(e);
            setTempResult({ level: "Beginner", language: targetLang });
        }
    };

    if (!user) return null;

    // --- RESULT VIEW (PERSONALIZED PLAN) ---
    if (report) {
        const getLevelTitle = (lvl: string) => {
            if (lvl === 'Advanced') return 'پیشرفته (استاد)';
            if (lvl === 'Intermediate') return 'متوسط (مستقل)';
            return 'مبتدی (کاشف)';
        };
        const levelTitle = getLevelTitle(report.level);
        
        const quickWins = report.level === 'Beginner' ? [
            { day: 'همین امروز', task: 'یادگیری ۱۰ عبارت کلیدی برای معرفی خود', locked: false },
            { day: 'روز سوم', task: 'شروع اولین مکالمه ۹۰ ثانیه‌ای با هوش مصنوعی', locked: true },
            { day: 'هفته اول', task: 'فهمیدن یک ویدیو کوتاه بدون زیرنویس', locked: true }
        ] : report.level === 'Intermediate' ? [
            { day: 'همین امروز', task: 'تحلیل نقاط ضعف گرامری در مکالمه', locked: false },
            { day: 'روز سوم', task: 'بحث درباره یک موضوع کاری با هوش مصنوعی', locked: true },
            { day: 'هفته اول', task: 'نوشتن یک ایمیل حرفه‌ای بدون غلط', locked: true }
        ] : [
            { day: 'همین امروز', task: 'شبیه‌سازی یک مذاکره پیچیده', locked: false },
            { day: 'روز سوم', task: 'سخنرانی ۳ دقیقه‌ای بداهه (Impromptu)', locked: true },
            { day: 'هفته اول', task: 'تحلیل یک مقاله تخصصی', locked: true }
        ];

        return (
            <div className="min-h-screen bg-gray-900 text-white pt-10 pb-24 px-4 overflow-y-auto">
                <div className="max-w-4xl mx-auto animate-slide-up space-y-8">
                    
                    <div className="text-center relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-green-500/10 blur-3xl -z-10 rounded-full"></div>
                        <div className="inline-block p-4 bg-gray-800 rounded-full border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)] mb-4 animate-bounce-short">
                            <TrophyIcon className="w-12 h-12 text-yellow-400" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                            برنامه اختصاصی برای {user.name}
                        </h1>
                        <p className="text-lg text-gray-300">
                            تحلیل هوش مصنوعی تکمیل شد. سطح فعلی شما: <span className="text-green-400 font-bold text-xl px-2 py-1 bg-green-900/30 rounded-lg border border-green-500/30">{levelTitle}</span>
                        </p>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl text-center">
                        <h3 className="text-xl font-bold text-blue-300 mb-2">چرا این برنامه برای شماست؟</h3>
                        <p className="text-gray-300 leading-relaxed">
                            با توجه به علاقه شما به <strong>{userInterest === 'tech' ? 'تکنولوژی' : userInterest === 'business' ? 'کسب‌وکار' : userInterest}</strong> و سطح فعلی‌تان، ما تمرکز را روی <strong>مکالمه کاربردی</strong> و <strong>اصطلاحات تخصصی</strong> گذاشته‌ایم.
                        </p>
                    </div>

                    {/* Quick Wins */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 md:p-8 rounded-3xl border border-gray-700 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <FireIcon className="w-6 h-6 text-orange-500 animate-pulse" />
                            <h3 className="text-xl font-bold text-white">پیروزی‌های سریع (هفته اول)</h3>
                        </div>
                        <div className="space-y-4 relative z-10">
                             <div className="absolute right-[19px] top-4 bottom-4 w-0.5 bg-gray-700"></div>
                             {quickWins.map((win, idx) => (
                                 <div key={idx} className={`relative flex items-center gap-4 ${win.locked ? 'opacity-60' : ''}`}>
                                     <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 ${win.locked ? 'bg-gray-800 border-gray-600 text-gray-500' : 'bg-green-600 border-green-400 text-white shadow-lg shadow-green-500/30'}`}>
                                         {win.locked ? <LockClosedIcon className="w-4 h-4"/> : <CheckCircleIcon className="w-5 h-5"/>}
                                     </div>
                                     <div className="bg-gray-700/50 p-4 rounded-xl flex-grow border border-gray-600/50">
                                         <p className="text-xs text-amber-400 font-bold mb-1">{win.day}</p>
                                         <p className="text-sm text-gray-200 font-medium">{win.task}</p>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>

                    <div className="text-center pt-4 pb-8">
                        <button 
                            onClick={() => dispatch({type: 'SET_VIEW', payload: View.ENGLISH_ACADEMY})} 
                            className="w-full md:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-12 rounded-2xl text-lg shadow-xl shadow-green-900/40 transform transition hover:scale-105 flex items-center justify-center gap-3 mx-auto animate-pulse"
                        >
                            <SparklesIcon className="w-6 h-6 text-yellow-200"/>
                            ورود به آکادمی و شروع
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ... (Keep PAYWALL VIEW logic) ...
    if (showPaywall) {
        // (Existing Paywall JSX)
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
               {/* Same paywall content as before */}
                <div className="bg-gray-800 p-8 rounded-2xl border-2 border-amber-500/30 shadow-2xl max-w-md text-center">
                    <div className="w-20 h-20 bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LockClosedIcon className="w-10 h-10 text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-white">تعیین سطح مجدد ({targetLang})</h2>
                    <p className="text-gray-400 mb-6 leading-relaxed">
                        شما قبلاً برای این زبان تعیین سطح شده‌اید. برای انجام مجدد آزمون و به‌روزرسانی نقشه راه خود، نیاز به پرداخت امتیاز معنا دارید.
                    </p>
                    <div className="bg-gray-700/50 p-4 rounded-xl mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300">هزینه آزمون:</span>
                            <span className="text-amber-400 font-bold">{RETAKE_COST} امتیاز</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">موجودی شما:</span>
                            <span className={`font-bold ${user.manaPoints >= RETAKE_COST ? 'text-green-400' : 'text-red-400'}`}>
                                {user.manaPoints.toLocaleString('fa-IR')} امتیاز
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handlePayment}
                            disabled={user.manaPoints < RETAKE_COST}
                            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <SparklesIcon className="w-5 h-5"/>
                            پرداخت و شروع آزمون
                        </button>
                        <button onClick={() => dispatch({ type: 'SET_VIEW', payload: View.ENGLISH_ACADEMY })} className="text-sm text-gray-500 hover:text-white">
                            بازگشت به آکادمی
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- LOADING VIEW ---
    if (!hasStarted) {
         return (
             <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
                <div className="animate-pulse">در حال آماده‌سازی آزمون...</div>
            </div>
        );
    }
    
    // --- GENERATION VIEW ---
    if (isGeneratingFlow) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
                 <style>{`
                    @keyframes pulse-ring {
                        0% { transform: scale(0.8); opacity: 0.5; }
                        100% { transform: scale(1.2); opacity: 0; }
                    }
                    .pulse-ring { position: absolute; border-radius: 50%; animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
                `}</style>
                <div className="relative w-48 h-48 flex items-center justify-center mb-12">
                     <div className="pulse-ring w-full h-full border-4 border-blue-500"></div>
                     <div className="pulse-ring w-3/4 h-3/4 border-4 border-purple-500" style={{ animationDelay: '0.5s' }}></div>
                     <div className="relative z-10 bg-gray-800 p-6 rounded-full border-2 border-gray-600 shadow-2xl">
                        <BrainCircuitIcon className="w-16 h-16 text-amber-400 animate-pulse" />
                     </div>
                </div>
                
                <div className="h-24 flex flex-col items-center justify-center mb-8 px-4 w-full max-w-xl">
                    <h2 className="text-lg md:text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 transition-all duration-500 animate-fade-in">
                        {generationSteps[generationStepIndex]}
                    </h2>
                </div>
                
                <div className="w-64 md:w-96 bg-gray-800 rounded-full h-2 mb-6 overflow-hidden border border-gray-700">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500 ease-linear" style={{ width: `${((generationStepIndex + 1) / generationSteps.length) * 100}%` }}></div>
                </div>
            </div>
        );
    }

    // ... (Keep Analysis View and Question View same as original, just re-rendering context)
    if (isAnalyzing) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-8 animate-slide-up w-full max-w-md">
                     <div className="relative w-40 h-40 mx-auto flex items-center justify-center bg-gray-800 rounded-full border-4 border-gray-700 animate-pulse-glow">
                        <div className="absolute inset-0 rounded-full border-4 border-t-yellow-400 border-r-yellow-400 border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '3s' }}></div>
                        {analysisSteps[analysisStepIndex].icon}
                    </div>
                    <div className="min-h-[80px]">
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-2 transition-all duration-500">
                            {analysisSteps[analysisStepIndex].message}
                        </h2>
                    </div>
                </div>
            </div>
        );
    }

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="mb-6">
                    <div className="flex justify-between items-end mb-2 px-1">
                        <p className="text-sm text-gray-400">سوال {currentQuestionIndex + 1} از {questions.length}</p>
                        <span className="text-xs font-mono text-gray-500">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-600 to-green-400 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 text-center relative overflow-hidden">
                    <span className="absolute top-4 right-6 text-8xl font-bold text-gray-700/20 select-none pointer-events-none">{currentQuestionIndex + 1}</span>
                    <h2 className="text-2xl font-semibold mb-8 min-h-[4rem] flex items-center justify-center relative z-10" dir="ltr">
                        {questions[currentQuestionIndex]?.text}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                        {questions[currentQuestionIndex]?.options.map((option, idx) => (
                            <button 
                                key={option} 
                                onClick={() => handleAnswer(option)} 
                                className="p-4 bg-gray-700/50 hover:bg-green-600/20 border border-gray-600 hover:border-green-500 rounded-xl transition-all duration-200 text-lg font-medium focus:ring-2 focus:ring-green-400 focus:outline-none hover:shadow-lg hover:-translate-y-0.5"
                                dir="ltr"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnglishPlacementTestView;

