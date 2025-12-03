
import React, { useState, useMemo } from 'react';
import { User, CoursePersonalization } from '../types';
import { bookJourneys } from '../utils/coachingData';
import { UserCircleIcon, HeartIcon, SparklesIcon, ArrowLeftIcon, CheckCircleIcon, PlayIcon, LockClosedIcon, TrophyIcon, ClockIcon, BrainCircuitIcon, DocumentTextIcon, StarIcon, CogIcon } from './icons';
import { useAppDispatch } from '../AppContext';
import { BookDetailView } from './coaching-lab/MasteryComponents';
import ModuleBriefingModal from './coaching-lab/ModuleBriefingModal';
import DeepReadingStep from './coaching-lab/DeepReadingStep';
import CoursePersonalizationModal from './CoursePersonalizationModal';
import Modal from './Modal';
import AcademyLandingHero from './AcademyLandingHero';
import { ACADEMY_CONTENTS } from '../utils/academyLandingContent';

interface LifeMasteryAcademyViewProps {
    user: User | null;
}

const LifeMasteryAcademyView: React.FC<LifeMasteryAcademyViewProps> = ({ user }) => {
    const dispatch = useAppDispatch();
    const [selectedCourse, setSelectedCourse] = useState<typeof bookJourneys[0] | null>(null);
    const [isBriefingOpen, setIsBriefingOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState<typeof bookJourneys[0]['modules'][0] | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'detail' | 'reading'>('list');

    // Personalization States
    const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
    const [isPersonalizationModalOpen, setIsPersonalizationModalOpen] = useState(false);
    const [pendingModule, setPendingModule] = useState<typeof bookJourneys[0]['modules'][0] | null>(null);

    // Filter courses relevant to Life Mastery (soft skills, health, mindset)
    const lifeMasteryCourses = useMemo(() => {
        return bookJourneys.filter(course => {
            const c = course as any;
            return c.id === 'new-world-skills' || 
            c.id === 'deep-work-mastery' ||
            c.tags?.includes('توسعه فردی') ||
            c.tags?.includes('روانشناسی');
        });
    }, []);

    const hasPersonalization = selectedCourse && user?.coursePersonalizations?.[selectedCourse.id];

    const handleCourseSelect = (course: typeof bookJourneys[0]) => {
        if (!user) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
            return;
        }
        setSelectedCourse(course);
        setViewMode('detail');
        window.scrollTo(0, 0);
    };

    const handleModuleSelect = (moduleTitle: string, moduleData: typeof bookJourneys[0]['modules'][0]) => {
        // Check if course is personalized
        if (hasPersonalization) {
            setSelectedModule(moduleData);
            setIsBriefingOpen(true);
        } else {
            // Trigger Personalization Flow
            setPendingModule(moduleData);
            setIsChoiceModalOpen(true);
        }
    };

    const handleChooseStandard = () => {
        if (selectedCourse) {
            const standardPersona: CoursePersonalization = { role: 'General', industry: 'General', challenge: 'None', goal: 'Standard Learning' };
            dispatch({ 
                type: 'SAVE_COURSE_PERSONALIZATION', 
                payload: { courseId: selectedCourse.id, personalization: standardPersona } 
            });
        }
        setIsChoiceModalOpen(false);
        if (pendingModule) {
            setSelectedModule(pendingModule);
            setIsBriefingOpen(true);
        }
    };

    const handleChoosePersonalized = () => {
        if (user && user.manaPoints >= 500) {
            dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: 500, action: 'شخصی‌سازی دوره توسعه فردی' } });
            setIsChoiceModalOpen(false);
            setIsPersonalizationModalOpen(true); 
        } else {
            alert("امتیاز معنا کافی نیست! (۵۰۰ امتیاز مورد نیاز است)");
        }
    };

    const handlePersonalizationComplete = (persona: CoursePersonalization) => {
        if (selectedCourse) {
            dispatch({ 
                type: 'SAVE_COURSE_PERSONALIZATION', 
                payload: { courseId: selectedCourse.id, personalization: persona } 
            });
            setIsPersonalizationModalOpen(false);
            if (pendingModule) {
                setSelectedModule(pendingModule);
                setIsBriefingOpen(true);
            }
        }
    };
    
    const handleRepersonalize = () => {
        if (user && user.manaPoints >= 500 && selectedCourse) {
             if (window.confirm("تغییر تنظیمات پرسونا ۵۰۰ امتیاز معنا هزینه دارد. آیا ادامه می‌دهید؟")) {
                  dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: 500, action: 'به‌روزرسانی پرسونای دوره' } });
                  setIsPersonalizationModalOpen(true);
             }
        } else {
             alert("امتیاز معنای کافی ندارید (۵۰۰ امتیاز نیاز است).");
        }
    };

    const handleStartReading = () => {
        setIsBriefingOpen(false);
        setViewMode('reading');
    };

    const handleBack = () => {
        if (viewMode === 'reading') {
            setViewMode('detail');
        } else if (viewMode === 'detail') {
            setViewMode('list');
            setSelectedCourse(null);
        }
    };

    if (viewMode === 'reading' && selectedModule && selectedCourse) {
        return (
            <DeepReadingStep 
                module={selectedModule}
                bookTitle={selectedCourse.title}
                courseId={selectedCourse.id}
                onStartPractice={() => {
                    alert("تبریک! این بخش را با موفقیت به پایان رساندید.");
                    setViewMode('detail');
                }} 
                onClose={() => setViewMode('detail')}
            />
        );
    }

    if (viewMode === 'detail' && selectedCourse && user) {
        return (
            <>
                <div className="bg-gray-900 text-white pt-22 pb-24 min-h-screen">
                    <div className="container mx-auto px-6 max-w-6xl animate-fade-in-up">
                        
                        {hasPersonalization && (
                            <div className="flex justify-end mb-4">
                                <button 
                                    onClick={handleRepersonalize}
                                    className="flex items-center gap-2 text-xs bg-teal-900/30 text-teal-300 border border-teal-500/30 px-3 py-1.5 rounded-full hover:bg-teal-900/50 transition-colors"
                                >
                                    <CogIcon className="w-3 h-3" />
                                    تنظیمات شخصی‌سازی
                                </button>
                            </div>
                        )}

                        <BookDetailView 
                            book={selectedCourse} 
                            user={user}
                            onBack={handleBack}
                            onStartJourney={() => {
                                const firstModule = selectedCourse.modules[0];
                                handleModuleSelect(firstModule.title, firstModule);
                            }}
                            onModuleSelect={handleModuleSelect}
                        />
                    </div>
                </div>
                {selectedModule && (
                     <ModuleBriefingModal
                        isOpen={isBriefingOpen}
                        onClose={() => setIsBriefingOpen(false)}
                        onStart={handleStartReading}
                        module={selectedModule}
                        bookTitle={selectedCourse.title}
                        isUnlocked={true} 
                    />
                )}

                <CoursePersonalizationModal
                    isOpen={isPersonalizationModalOpen}
                    onClose={() => setIsPersonalizationModalOpen(false)}
                    onComplete={handlePersonalizationComplete}
                    courseTitle={selectedCourse.title}
                />

                <Modal isOpen={isChoiceModalOpen} onClose={() => setIsChoiceModalOpen(false)}>
                    <div className="p-6 w-full max-w-lg bg-stone-900 text-white rounded-2xl border border-stone-700">
                        <div className="text-center mb-6">
                            <SparklesIcon className="w-12 h-12 text-teal-400 mx-auto mb-3" />
                            <h2 className="text-2xl font-bold text-white">انتخاب سبک یادگیری</h2>
                            <p className="text-stone-400 mt-2 text-sm">چگونه می‌خواهید این مهارت‌ها را یاد بگیرید؟</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            {/* Option A: Personalized */}
                            <button 
                                onClick={handleChoosePersonalized}
                                className="group relative p-5 rounded-xl bg-gradient-to-r from-teal-900/50 to-emerald-900/50 border-2 border-teal-500/50 hover:border-teal-400 transition-all text-right overflow-hidden shadow-lg"
                            >
                                <div className="absolute top-0 left-0 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-br-lg shadow-md z-10">پیشنهاد ما</div>
                                <div className="absolute inset-0 bg-teal-500/5 group-hover:bg-teal-500/10 transition-colors"></div>
                                <div className="relative z-10">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <BrainCircuitIcon className="w-5 h-5 text-amber-400" />
                                        تجربه شخصی‌سازی شده (AI)
                                    </h3>
                                    <p className="text-sm text-stone-300 mt-2 leading-relaxed">
                                        هوش مصنوعی محتوا را دقیقاً بر اساس نقش شما (مثلاً دانشجو، والد، مدیر) و چالش‌های واقعی‌تان بازنویسی می‌کند.
                                    </p>
                                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-teal-300">
                                        <StarIcon className="w-4 h-4 text-yellow-400" />
                                        هزینه: ۵۰۰ امتیاز معنا
                                    </div>
                                </div>
                            </button>

                            {/* Option B: Standard */}
                            <button 
                                onClick={handleChooseStandard}
                                className="p-5 rounded-xl bg-stone-800 hover:bg-stone-700 border-2 border-stone-600 hover:border-stone-500 transition-all text-right group"
                            >
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <DocumentTextIcon className="w-5 h-5 text-stone-400" />
                                    دوره استاندارد
                                </h3>
                                <p className="text-sm text-stone-400 mt-2 leading-relaxed">
                                    محتوای اصلی و عمومی دوره را بدون تغییر مشاهده کنید.
                                </p>
                                <div className="mt-3 text-xs font-bold text-green-400">
                                    رایگان
                                </div>
                            </button>
                        </div>

                        <button onClick={() => setIsChoiceModalOpen(false)} className="w-full mt-6 text-stone-500 hover:text-stone-300 text-sm">
                            انصراف
                        </button>
                    </div>
                </Modal>
            </>
        );
    }

    return (
        <div className="bg-gray-900 text-white pt-22 pb-24 min-h-screen">
            <div className="container mx-auto px-6 max-w-6xl animate-fade-in-up">
                
                {/* New Landing Hero Integration */}
                <AcademyLandingHero content={ACADEMY_CONTENTS['life_mastery_academy']} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {lifeMasteryCourses.map(course => (
                        <div 
                            key={course.id} 
                            onClick={() => handleCourseSelect(course)}
                            className="group bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-teal-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex flex-col"
                        >
                            <div className={`h-40 bg-gradient-to-br ${course.coverColor} p-6 relative`}>
                                <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white font-bold border border-white/10">
                                    {course.totalSessions} جلسه
                                </div>
                                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-gray-900 to-transparent">
                                     <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">{course.title}</h3>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">{course.description}</p>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(course as any).tags?.map((tag: string) => (
                                        <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-md border border-gray-600">#{tag}</span>
                                    ))}
                                </div>
                                
                                <div className="flex justify-between items-center border-t border-gray-700 pt-4 mt-auto">
                                    <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                                        <TrophyIcon className="w-4 h-4" />
                                        <span>{course.xpReward} XP</span>
                                    </div>
                                    <button className="text-sm font-bold text-teal-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        مشاهده دوره <ArrowLeftIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LifeMasteryAcademyView;
