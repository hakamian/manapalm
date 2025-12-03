
import React, { useState, useMemo } from 'react';
import { User, LMSLesson, View } from '../../types';
import { englishCourseData } from '../../utils/englishCourseData'; // Fallback
import { AcademicCapIcon, ChartBarIcon, CheckCircleIcon, RocketLaunchIcon, StarIcon, ArrowPathIcon, TrophyIcon, FireIcon, MapIcon, BriefcaseIcon, UsersIcon, PaperAirplaneIcon, BrainCircuitIcon, SparklesIcon, CompassIcon } from '../icons';
import { ProgressBar, LessonItem } from './AcademyShared';
import MentorshipBookingModal from '../MentorshipBookingModal';
import { useAppDispatch } from '../../AppContext';

interface AcademyDashboardProps {
    user: User;
    onStartPlacementTest: () => void;
    onLessonSelect: (lesson: LMSLesson) => void;
}

// New Component: Personality Learning Booster
const PersonalityBooster: React.FC<{ user: User }> = ({ user }) => {
    const dispatch = useAppDispatch();
    const hasTakenPersonalityTest = !!user.discReport || !!user.enneagramReport;

    const personalityType = user.discReport?.styleName || (user.enneagramReport ? `Type ${user.enneagramReport.typeNumber}` : null);

    if (hasTakenPersonalityTest) {
        return (
            <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl mb-6 flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-full text-indigo-300">
                    <BrainCircuitIcon className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-white text-sm">شتاب‌دهنده شخصیت فعال است</h4>
                    <p className="text-xs text-gray-400 mt-1">
                        متد آموزش بر اساس تیپ شخصیتی <span className="text-indigo-300 font-semibold">«{personalityType}»</span> بهینه‌سازی شد.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-amber-900/20 to-purple-900/20 border border-amber-500/30 p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-full text-amber-400">
                    <CompassIcon className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-white text-sm">یادگیری خود را ۴۰٪ سریع‌تر کنید!</h4>
                    <p className="text-xs text-gray-400 mt-1">
                        با شناخت سبک یادگیری خود، مسیر را کوتاه‌تر کنید.
                    </p>
                </div>
            </div>
            <button 
                onClick={() => dispatch({ type: 'SET_VIEW', payload: View.DISC_TEST })}
                className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
            >
                شروع تست شخصیت
            </button>
        </div>
    );
};

const AcademyDashboard: React.FC<AcademyDashboardProps> = ({ user, onStartPlacementTest, onLessonSelect }) => {
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    
    // Use dynamic syllabus if available, else fallback to static
    const activeSyllabus = user.languageConfig?.syllabus || englishCourseData;
    const activeLanguage = user.languageConfig?.targetLanguage || 'English';
    const userGoal = user.languageConfig?.goal || 'general';

    const userProgress = user.englishAcademyProgress || {};
    const completedLessonsCount = Object.values(userProgress).filter(Boolean).length;
    const totalLessonsCount = activeSyllabus.reduce((acc, mod) => acc + mod.lessons.length, 0);
    const totalProgress = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;
    
    const hasTakenPlacementTest = !!user.languageConfig?.level;

    // Personalized Motivational Copy based on Goal
    const goalMotivation = useMemo(() => {
        switch (userGoal) {
            case 'career': return { title: "شتاب‌دهنده شغلی", icon: BriefcaseIcon, text: "هر درس، یک پله به سمت جایگاه شغلی رویایی شماست." };
            case 'migration': return { title: "مسیر مهاجرت", icon: PaperAirplaneIcon, text: "زبان، کلید خانه جدید شماست. بیایید آن را بسازیم." };
            case 'academic': return { title: "دستیار آکادمیک", icon: AcademicCapIcon, text: "تسلط بر زبان علم، دروازه ورود به دانشگاه‌های برتر." };
            case 'travel': return { title: "جهانگردی بدون مرز", icon: MapIcon, text: "دنیا منتظر شماست. با اعتماد به نفس سفر کنید." };
            case 'connection': return { title: "ارتباطات جهانی", icon: UsersIcon, text: "مرزهای کلامی را بشکنید و دوستان جدید بیابید." };
            default: return { title: "توسعه فردی", icon: BrainCircuitIcon, text: "یادگیری زبان، ورزش ذهن و روح شماست." };
        }
    }, [userGoal]);

    const getLessonStatus = (lessonId: string, moduleIndex: number, lessonIndex: number): 'locked' | 'available' | 'completed' => {
        if (user.isAdmin) return 'available';
        if (userProgress[lessonId]) return 'completed';
        if (moduleIndex === 0 && lessonIndex === 0) return 'available';
        let prevLessonId = '';
        if (lessonIndex > 0) {
            prevLessonId = activeSyllabus[moduleIndex].lessons[lessonIndex - 1].id;
        } else if (moduleIndex > 0) {
            const prevModule = activeSyllabus[moduleIndex - 1];
            prevLessonId = prevModule.lessons[prevModule.lessons.length - 1].id;
        }
        if (userProgress[prevLessonId]) return 'available';
        return 'locked';
    };

    return (
        <div className="container mx-auto px-4 max-w-5xl animate-fade-in pb-20">
             
             {/* Personalized Header */}
             <header className="mb-10 mt-4">
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 border border-indigo-500/30 relative overflow-hidden shadow-2xl">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-right">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/50 flex items-center gap-1">
                                    <goalMotivation.icon className="w-3 h-3" />
                                    {goalMotivation.title}
                                </span>
                                <span className="bg-green-500/20 text-green-300 text-xs font-bold px-3 py-1 rounded-full border border-green-500/50">
                                    زبان: {activeLanguage}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                                سلام، {user.name || 'قهرمان'} 👋
                            </h1>
                            <p className="text-indigo-200 text-lg max-w-xl">
                                {goalMotivation.text}
                            </p>
                        </div>
                        
                        {/* Gamification Stats */}
                        <div className="flex gap-4">
                             <div className="bg-gray-900/60 p-4 rounded-2xl border border-gray-700 text-center min-w-[100px] backdrop-blur-sm">
                                <FireIcon className="w-6 h-6 text-orange-500 mx-auto mb-1 animate-pulse" />
                                <p className="text-2xl font-bold text-white">1</p>
                                <p className="text-xs text-gray-400">روز زنجیره</p>
                            </div>
                            <div className="bg-gray-900/60 p-4 rounded-2xl border border-gray-700 text-center min-w-[100px] backdrop-blur-sm">
                                <TrophyIcon className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                                <p className="text-2xl font-bold text-white">{user.points.toLocaleString('fa-IR')}</p>
                                <p className="text-xs text-gray-400">امتیاز کل</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Level & Progress Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="md:col-span-2 bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg flex flex-col justify-center">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-gray-400 text-sm">پیشرفت کلی دوره</p>
                            <p className="text-2xl font-bold text-white">{totalProgress}% <span className="text-sm font-normal text-gray-500">تکمیل شده</span></p>
                        </div>
                        <span className="text-green-400 font-bold">{completedLessonsCount} / {totalLessonsCount} درس</span>
                    </div>
                    <ProgressBar progress={totalProgress} />
                 </div>

                 <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
                     <p className="text-gray-400 text-sm mb-1 z-10">سطح فعلی شما</p>
                     <p className="text-3xl font-black text-blue-400 z-10 tracking-wider">{user.languageConfig?.level || 'N/A'}</p>
                     
                     {hasTakenPlacementTest ? (
                        <button 
                            onClick={onStartPlacementTest}
                            className="mt-3 text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors z-10"
                        >
                            <ArrowPathIcon className="w-3 h-3" /> تعیین سطح مجدد
                        </button>
                     ) : (
                         <button 
                            onClick={onStartPlacementTest}
                            className="mt-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors z-10 shadow-lg animate-pulse"
                        >
                            تعیین سطح هوشمند
                        </button>
                     )}
                 </div>
            </div>
            
            {/* Personality Booster Section */}
            <PersonalityBooster user={user} />

            {/* Modules List (The Journey) */}
            <div className="space-y-8 relative">
                {/* Connecting Line */}
                <div className="absolute right-8 top-8 bottom-8 w-0.5 bg-gray-700 hidden md:block"></div>

                {activeSyllabus.length > 0 ? activeSyllabus.map((module, mIndex) => (
                    <div key={module.id} className="relative md:pr-16">
                        {/* Module Node */}
                        <div className="absolute right-6 top-6 w-4 h-4 rounded-full bg-gray-900 border-4 border-blue-500 z-10 hidden md:block"></div>
                        
                        <div className="bg-gray-800 rounded-3xl border border-gray-700 overflow-hidden shadow-xl transition-all hover:border-gray-600">
                            <div className="p-6 bg-gray-700/30 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 block">ماژول {mIndex + 1}</span>
                                    <h3 className="text-xl font-bold text-white">{module.title}</h3>
                                    <p className="text-sm text-gray-400 mt-1">{module.description}</p>
                                </div>
                                <div className="bg-gray-800 px-4 py-2 rounded-xl border border-gray-700">
                                    <span className="text-sm font-bold text-gray-300">{module.lessons.length} درس</span>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-700/50">
                                {module.lessons.map((lesson, lIndex) => {
                                    const status = getLessonStatus(lesson.id, mIndex, lIndex);
                                    return (
                                        <div key={lesson.id} className="transition-colors hover:bg-gray-700/20">
                                            <LessonItem 
                                                lesson={lesson} 
                                                status={status}
                                                isActive={false}
                                                onClick={() => onLessonSelect(lesson)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20 text-gray-500 bg-gray-800/50 rounded-3xl border border-dashed border-gray-700">
                        <div className="animate-pulse">
                            <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-gray-600"/>
                            <p>هوش مصنوعی در حال ترسیم نقشه راه اختصاصی شماست...</p>
                        </div>
                    </div>
                )}
            </div>
            
            <MentorshipBookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} user={user} />
        </div>
    );
};

export default AcademyDashboard;
