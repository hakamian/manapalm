
import React, { useState, useEffect } from 'react';
import { LMSLesson, TargetLanguage } from '../../types';
import { ArrowRightIcon, CheckCircleIcon, MicrophoneIcon, SparklesIcon, TrophyIcon, BookOpenIcon, ArrowLeftIcon } from '../icons';
import { LessonItem } from './AcademyShared';
import { generateLessonContent } from '../../services/geminiService';
import { useAppDispatch, useAppState } from '../../AppContext';

interface AcademyClassroomProps {
    activeLesson: LMSLesson;
    userProgress: Record<string, any>;
    onCompleteLesson: () => void;
    onBackToDashboard: () => void;
    onSetActiveLesson: (lesson: LMSLesson) => void;
    language: TargetLanguage;
    level: string;
}

const AcademyClassroom: React.FC<AcademyClassroomProps> = ({ activeLesson, userProgress, onCompleteLesson, onBackToDashboard, onSetActiveLesson, language, level }) => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

    useEffect(() => {
        const loadContent = async () => {
            setIsLoading(true);
            // If content is pre-filled (static), use it. Otherwise generate.
            if (activeLesson.content && activeLesson.content.length > 50) {
                setContent(activeLesson.content);
                setIsLoading(false);
            } else {
                const generated = await generateLessonContent(activeLesson.title, language, level);
                setContent(generated);
                setIsLoading(false);
            }
        };
        loadContent();
    }, [activeLesson.id, language, level]);

    const handleComplete = () => {
        setShowCelebration(true);
        setTimeout(() => {
            onCompleteLesson();
        }, 2000);
    };

    // Personalized Intro based on User Interest & Personality
    const interest = user?.languageConfig?.interest || 'general';
    const personality = user?.discReport?.styleName;

    const getPersonalizedIntro = () => {
        let intro = `✨ یک گام دیگر برای تسلط کامل به زبان ${language}.`;
        
        // Inject Interest
        if (interest === 'tech') intro = `💡 نکته برای علاقه‌مندان به تکنولوژی: این ساختار در مستندات فنی بسیار پرکاربرد است.`;
        else if (interest === 'business') intro = `💼 کاربرد در بیزنس: در جلسات رسمی، استفاده از این الگو نشان‌دهنده حرفه‌ای بودن شماست.`;
        else if (interest === 'art') intro = `🎨 الهام هنری: نویسندگان بزرگ از این تکنیک برای توصیف صحنه‌ها استفاده می‌کنند.`;
        else if (interest === 'travel') intro = `✈️ در سفر: این کلمات در فرودگاه و هتل نجات‌بخش خواهند بود!`;

        // Inject Personality if available
        if (personality) {
             intro += ` (مناسب برای سبک یادگیری ${personality} شما)`;
        }
        
        return intro;
    };

    const renderContent = (text: string) => {
        // Split by double newlines to identify paragraphs
        const paragraphs = text.split(/\n\n+/);
        
        return paragraphs.map((paragraph, i) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith('### ')) {
                return <h3 key={i} className="text-xl font-bold text-blue-300 mt-8 mb-4">{trimmed.replace('### ', '')}</h3>;
            }
            if (trimmed.startsWith('## ')) {
                return <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4 border-b border-gray-700 pb-2">{trimmed.replace('## ', '')}</h2>;
            }
            if (trimmed.startsWith('# ')) {
                return <h1 key={i} className="text-3xl font-black text-white mb-6">{trimmed.replace('# ', '')}</h1>;
            }
            
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                 const items = trimmed.split('\n');
                 return (
                    <ul key={i} className="list-disc list-inside mb-4 space-y-2 ml-4 marker:text-blue-500">
                        {items.map((item, idx) => (
                            <li key={idx} className="text-gray-300 pl-2">
                                {item.replace(/^[-*]\s/, '').replace(/\*\*(.*?)\*\*/g, (_, content) => `<b>${content}</b>`).split('<b>').map((part, k) => k % 2 === 1 ? <strong key={k} className="text-white font-bold">{part}</strong> : part)}
                            </li>
                        ))}
                    </ul>
                 );
            }

             // Regular Paragraph with Bold parsing
             const parts = trimmed.split(/(\*\*.*?\*\*)/g);
             return (
                <p key={i} className="mb-6 text-gray-300 leading-loose text-justify">
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="text-white font-bold mx-1">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </p>
             );
        });
    };

    return (
        <div className="bg-gray-900 text-white h-screen flex flex-col overflow-hidden fixed inset-0 z-50">
            
            {/* Minimalist Header */}
            <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 md:px-8 flex-shrink-0 shadow-md z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onBackToDashboard} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                        <ArrowRightIcon className="w-5 h-5"/>
                    </button>
                    <div>
                        <h2 className="font-bold text-sm md:text-base truncate max-w-[200px] md:max-w-md">{activeLesson.title}</h2>
                        <p className="text-xs text-gray-500 hidden md:block">{language} • {level}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                     <div className="bg-gray-700 px-3 py-1.5 rounded-full text-xs font-bold text-yellow-400 flex items-center gap-1">
                        <TrophyIcon className="w-3 h-3" />
                        <span>{activeLesson.xp} XP</span>
                    </div>
                </div>
            </header>

            {/* Main Scrollable Content */}
            <main className="flex-grow overflow-y-auto relative bg-[#0B0F17]">
                <div className="max-w-3xl mx-auto p-4 md:p-10 pb-32">
                    
                    {/* Personalized AI Insight */}
                    {!isLoading && (
                        <div className="mb-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3 animate-fade-in">
                            <div className="bg-blue-500/20 p-2 rounded-full text-blue-300">
                                <SparklesIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h5 className="text-xs font-bold text-blue-400 uppercase mb-1">بینش هوشمند</h5>
                                <p className="text-sm text-blue-100 font-medium leading-relaxed">
                                    {getPersonalizedIntro()}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Video/Media Placeholder */}
                    <div className="mb-8 aspect-video bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                        {activeLesson.type === 'quiz' ? (
                            <div className="text-center z-10">
                                <SparklesIcon className="w-16 h-16 text-purple-400 mx-auto mb-4 drop-shadow-lg"/>
                                <h3 className="text-xl font-bold text-white">کوییز هوشمند</h3>
                            </div>
                        ) : (
                            <div className="text-center z-10">
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform cursor-pointer">
                                     <MicrophoneIcon className="w-10 h-10 text-white"/>
                                </div>
                                <h3 className="text-xl font-bold text-white">{activeLesson.title}</h3>
                                <p className="text-sm text-gray-300 mt-1">بخش چندرسانه‌ای</p>
                            </div>
                        )}
                    </div>

                    {/* Lesson Content */}
                    <div className="bg-gray-800/50 p-8 rounded-3xl border border-gray-700 shadow-lg">
                        {isLoading ? (
                            <div className="py-20 text-center">
                                <div className="inline-block relative w-20 h-20 mb-4">
                                    <div className="absolute inset-0 rounded-full border-4 border-gray-600 opacity-30"></div>
                                    <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
                                    <SparklesIcon className="absolute inset-0 m-auto w-8 h-8 text-blue-400 animate-pulse"/>
                                </div>
                                <p className="text-gray-300 font-medium">هوش مصنوعی در حال تدوین درس اختصاصی برای {user?.name}...</p>
                            </div>
                        ) : (
                            <div className="prose prose-invert prose-lg max-w-none text-gray-300">
                                {renderContent(content)}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="max-w-3xl mx-auto flex justify-between items-center gap-4">
                    <button 
                        onClick={onBackToDashboard} 
                        className="px-6 py-3 rounded-xl text-gray-400 font-semibold hover:bg-gray-700 hover:text-white transition-colors"
                    >
                        بعداً ادامه می‌دهم
                    </button>
                    <button 
                        onClick={handleComplete} 
                        disabled={isLoading}
                        className="flex-grow md:flex-grow-0 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-green-900/30 transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <CheckCircleIcon className="w-5 h-5" />
                        {showCelebration ? 'عالی بود!' : 'تکمیل درس و دریافت امتیاز'}
                    </button>
                </div>
            </div>

            {/* Celebration Overlay */}
            {showCelebration && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="text-center animate-scale-in">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-4xl font-black text-white mb-2">درس تکمیل شد!</h2>
                        <p className="text-xl text-yellow-400 font-bold">+{activeLesson.xp} XP</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademyClassroom;
