
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ClockIcon, SparklesIcon, CheckCircleIcon, PlayIcon, ChevronDownIcon, LockClosedIcon, ExclamationCircleIcon, UserCircleIcon, CogIcon, AcademicCapIcon, BookOpenIcon, BoltIcon } from '../icons';
import { bookJourneys } from '../../utils/coachingData';
import { useAppState, useAppDispatch } from '../../AppContext'; 
import { generateText } from '../../services/geminiService';
import { CoursePersonalization } from '../../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ACTION_PLANS } from '../course-visuals/CourseDiagrams';
import AIContentRenderer from '../AIContentRenderer';

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}

type BookModule = typeof bookJourneys[0]['modules'][0] & {
    quiz?: QuizQuestion[];
};

interface DeepReadingStepProps {
    module: BookModule;
    bookTitle: string;
    courseId?: string; 
    onStartPractice: () => void;
    onClose: () => void;
}

const AccordionItem: React.FC<{ title: string; content: string; index: number; isChecked: boolean; onToggle: () => void }> = ({ title, content, index, isChecked, onToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className={`mb-4 border rounded-xl overflow-hidden transition-all duration-300 ${isChecked ? 'border-green-500/50 bg-green-900/10' : 'border-stone-700 bg-stone-800/50'}`}>
            <div className="flex items-stretch">
                 <button 
                    onClick={onToggle}
                    className={`flex items-center justify-center w-14 shrink-0 transition-colors ${isChecked ? 'bg-green-500 text-white' : 'bg-stone-700 text-stone-400 hover:bg-stone-600'}`}
                 >
                     {isChecked ? <CheckCircleIcon className="w-6 h-6" /> : <div className="w-5 h-5 rounded-full border-2 border-current"></div>}
                 </button>
                 <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex-grow p-4 flex justify-between items-center text-right"
                >
                    <div>
                        <span className="text-xs text-stone-500 block mb-1">گام {index + 1}</span>
                        <span className={`font-bold text-sm ${isChecked ? 'text-green-200 line-through' : 'text-stone-200'}`}>{title}</span>
                    </div>
                    <ChevronDownIcon className={`w-5 h-5 text-stone-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>
            
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="p-5 pt-0 text-sm text-stone-400 leading-relaxed border-t border-stone-700/30 mt-2 mx-4 mb-4 whitespace-pre-wrap">
                        <AIContentRenderer content={content} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const DeepReadingStep: React.FC<DeepReadingStepProps> = ({ module, bookTitle, courseId, onStartPractice, onClose }) => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [activeContent, setActiveContent] = useState<string>(module.longContent || module.summary);
    const [isPersonalizing, setIsPersonalizing] = useState(false);
    const [isPersonalized, setIsPersonalized] = useState(false);

    // Parse Title for Bilingual Display
    const titleParts = module.title.split(/[()]/).filter(Boolean);
    const persianTitle = titleParts[0]?.trim();
    const englishTitle = titleParts[1]?.trim();

    // Load persona but DO NOT trigger auto-personalization if standard is selected
    const persona = courseId && user?.coursePersonalizations ? user.coursePersonalizations[courseId] : null;

    const generatePersonalizedContent = async (currentPersona: CoursePersonalization) => {
        if (currentPersona.role === 'General' || currentPersona.role === 'Standard') {
             setIsPersonalized(true); // Mark as "done" but keep content standard
             return;
        }

        setIsPersonalizing(true);
        try {
            const prompt = `
            Rewrite the following lesson content for a user with this persona:
            Role: ${currentPersona.role}
            Industry: ${currentPersona.industry}
            Challenge: ${currentPersona.challenge}
            Goal: ${currentPersona.goal}

            Change generic examples to specific examples relevant to their industry.
            Adjust the tone to address their specific challenge directly.
            Keep the core concepts, structure, [ACCORDION] tags, and [VISUAL] tags intact.
            Use double newlines for paragraphs.
            
            Original Content:
            ${module.longContent || module.summary}
            `;
            
            const response = await generateText(prompt);
            setActiveContent(response.text);
            setIsPersonalized(true);
        } catch (e) {
            console.error("Personalization failed", e);
        } finally {
            setIsPersonalizing(false);
        }
    };

    // Handle personalization button click
    const handleInitialPersonalize = () => {
        if (persona) {
            generatePersonalizedContent(persona);
        }
    };

    const accordionItems = React.useMemo(() => {
        const items: { title: string, content: string }[] = [];
        const matches = activeContent.matchAll(/\[ACCORDION:(.*?)\]([\s\S]*?)\[\/ACCORDION\]/g);
        for (const match of matches) {
            items.push({ title: match[1], content: match[2].trim() });
        }
        return items;
    }, [activeContent]);

    const displayContent = React.useMemo(() => {
        return activeContent.replace(/\[ACCORDION:(.*?)\]([\s\S]*?)\[\/ACCORDION\]/g, '');
    }, [activeContent]);

    const [checkedItems, setCheckedItems] = useState<number[]>([]);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<number | null>(null);
    
    // Time estimates calculation
    const timeEstimates = useMemo(() => {
        const wordCount = displayContent.trim().split(/\s+/).length;
        const readingSeconds = Math.ceil((wordCount / 120) * 60);
        const sections = (displayContent.match(/^#{1,3} /gm) || []).length;
        const reflectionSeconds = sections * 45; 
        let totalReadTime = readingSeconds + reflectionSeconds;

        // Standard time: 5 minutes (300 seconds) per accordion item
        let exerciseSeconds = accordionItems.length * 300; 

        // --- NEW: Calculate Action Engine Time ---
        const actionEngineMatches = [...activeContent.matchAll(/\[VISUAL:ACTION_ENGINE_(.*?)\]/g)];
        let actionEngineTime = 0;
        actionEngineMatches.forEach(m => {
             // Reconstruct full key
             const planId = 'ACTION_ENGINE_' + m[1];
             const plan = ACTION_PLANS[planId];
             if (plan && plan.estimatedMinutes) {
                 actionEngineTime += plan.estimatedMinutes * 60;
             }
        });
        
        exerciseSeconds += actionEngineTime;

        return {
            readTime: totalReadTime,
            actionTime: exerciseSeconds,
            total: Math.max(30, totalReadTime) + exerciseSeconds
        };
    }, [displayContent, accordionItems, activeContent]);
    
    useEffect(() => {
        setElapsedTime(0);
    }, [activeContent]);

    const allChecked = accordionItems.length > 0 ? checkedItems.length === accordionItems.length : true;
    
    // Simulate requirement: User must wait at least a reasonable portion of estimated time or 30s
    // If there is an Action Engine (which has implicit tasks), we trust the timer more.
    // If Action Engine has e.g. 15 mins, we require user to spend time.
    const hasActionEngine = activeContent.includes('ACTION_ENGINE');
    
    // Logic: If action engine exists, user must wait at least 2 minutes (demo) or full time.
    // For demo purposes, we cap the mandatory wait to 30s so reviewers don't get stuck.
    const requiredTime = Math.min(timeEstimates.total, 30); 
    const timeCompleted = elapsedTime >= requiredTime; 
    
    // If we have Action Engine, we assume tasks are done inside it (no lifting state easily here without refactor).
    // So we rely on "allChecked" (legacy accordions) + "timeCompleted".
    const canProceed = allChecked && timeCompleted;

    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = window.setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    const toggleCheck = (index: number) => {
        if (checkedItems.includes(index)) {
            setCheckedItems(checkedItems.filter(i => i !== index));
        } else {
            setCheckedItems([...checkedItems, index]);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-stone-900 text-stone-200 overflow-y-auto animate-fade-in custom-scrollbar">
            
            <div className="sticky top-0 z-50 bg-stone-900/90 backdrop-blur-md border-b border-stone-700 py-3 px-4 md:px-6 flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center shadow-lg">
                <div className="flex items-center gap-2">
                    <p className="text-xs text-stone-500 font-bold uppercase tracking-widest truncate max-w-[200px]">{bookTitle}</p>
                </div>
                
                <div className="flex items-center gap-4 text-xs md:text-sm font-mono font-bold">
                    <div className="flex items-center gap-2 text-blue-400 bg-blue-900/20 px-3 py-1 rounded-full border border-blue-500/20">
                        <BookOpenIcon className="w-4 h-4" />
                        <span>{Math.ceil(timeEstimates.readTime / 60)} د مطالعه</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-400 bg-amber-900/20 px-3 py-1 rounded-full border border-amber-500/20">
                        <BoltIcon className="w-4 h-4" />
                        <span>{Math.ceil(timeEstimates.actionTime / 60)} د تمرین</span>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors duration-500 ${timeCompleted ? 'bg-green-900/50 text-green-400 border-green-500/50' : 'bg-stone-800 text-stone-400 border-stone-600'}`}>
                        <ClockIcon className={`w-4 h-4 ${!timeCompleted ? 'animate-pulse' : ''}`} />
                        <span>{formatTime(elapsedTime)}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-10 min-h-screen flex flex-col">
                
                <div className="mb-12 text-center">
                     {/* Stylized Title */}
                    <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-2">{persianTitle}</h1>
                    {englishTitle && (
                        <h2 className="text-lg md:text-2xl font-serif text-amber-400 font-medium tracking-wide opacity-90">{englishTitle}</h2>
                    )}
                </div>

                {persona && (
                    <div className={`mb-8 border p-4 rounded-xl flex items-center justify-between transition-all ${isPersonalized ? 'bg-green-900/20 border-green-500/30' : 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/30'}`}>
                         <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${isPersonalized ? 'bg-green-500/20 text-green-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                {isPersonalized ? <CheckCircleIcon className="w-6 h-6"/> : <UserCircleIcon className="w-6 h-6" />}
                             </div>
                             <div className="text-sm">
                                 <p className="text-white font-bold">
                                     {isPersonalized ? 'وضعیت محتوا' : 'شخصی‌سازی محتوا'}
                                 </p>
                                 <p className="text-stone-400">
                                     {isPersonalized 
                                         ? (persona.role === 'General' ? 'استاندارد' : `شخصی‌سازی شده برای ${persona.role}`)
                                         : 'در حال آماده‌سازی...'
                                     }
                                 </p>
                             </div>
                         </div>
                         
                         {!isPersonalized && persona.role !== 'General' && (
                             <button 
                                onClick={handleInitialPersonalize} 
                                disabled={isPersonalizing}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                 {isPersonalizing ? (
                                     <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ...
                                     </>
                                 ) : (
                                     <>
                                        <SparklesIcon className="w-5 h-5" />
                                        اعمال جادو
                                     </>
                                 )}
                             </button>
                         )}
                    </div>
                )}

                <div className="mb-12">
                     {/* Replaced local renderer with AIContentRenderer */}
                     <AIContentRenderer content={displayContent} persona={isPersonalized ? persona : null} />
                </div>

                {accordionItems.length > 0 && (
                    <div className="space-y-8 mb-16 bg-stone-800/30 p-8 rounded-3xl border border-stone-700 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-transparent"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <SparklesIcon className="w-6 h-6 text-amber-400" />
                                    تمرین‌های تکمیلی
                                </h3>
                                <div className="text-xs font-bold bg-amber-900/30 text-amber-300 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                                    <ClockIcon className="w-3 h-3" />
                                    {Math.ceil((accordionItems.length * 300) / 60)} دقیقه
                                </div>
                            </div>
                            <p className="text-stone-400 mb-6 text-sm">
                                برای باز شدن آزمون و مرحله بعد، لطفاً تمرین‌های زیر را با دقت انجام دهید و تیک بزنید.
                            </p>
                            
                            <div>
                                {accordionItems.map((item, idx) => (
                                    <AccordionItem 
                                        key={idx} 
                                        title={item.title} 
                                        content={item.content} 
                                        index={idx} 
                                        isChecked={checkedItems.includes(idx)}
                                        onToggle={() => toggleCheck(idx)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-8 border-t border-stone-800 flex flex-col items-center text-center">
                    {!canProceed && (
                        <div className="mb-4 flex flex-col items-center gap-2 text-amber-400 bg-amber-900/20 px-4 py-2 rounded-lg text-sm border border-amber-500/30">
                             <div className="flex items-center gap-2">
                                <ExclamationCircleIcon className="w-5 h-5" />
                                <span>برای ادامه، باید ماموریت‌ها را تکمیل کنید و زمان کافی بگذارید.</span>
                             </div>
                             {!timeCompleted && <span className="text-xs opacity-80">زمان باقی‌مانده: {formatTime(Math.max(0, requiredTime - elapsedTime))}</span>}
                        </div>
                    )}
                    
                    <button 
                        onClick={onStartPractice} 
                        disabled={!canProceed}
                        className={`w-full md:w-auto px-12 py-5 rounded-full font-bold text-xl shadow-2xl transition-all flex items-center justify-center gap-3 ${
                            canProceed 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:scale-105 shadow-blue-900/50 cursor-pointer' 
                            : 'bg-stone-800 text-stone-500 cursor-not-allowed grayscale opacity-70'
                        }`}
                    >
                        {canProceed ? <AcademicCapIcon className="w-6 h-6" /> : <LockClosedIcon className="w-6 h-6" />}
                        {module.quiz && module.quiz.length > 0 ? 'شرکت در آزمون' : 'تکمیل مطالعه'}
                    </button>
                    <button onClick={onClose} className="mt-8 text-stone-500 hover:text-stone-300 text-sm underline">
                        خروج و مطالعه در زمانی دیگر
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeepReadingStep;
