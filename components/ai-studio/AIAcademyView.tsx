
import React, { useState, useMemo } from 'react';
import { User, View, BusinessModule, LMSModule } from '../../types';
import { SparklesIcon, PlayIcon, CheckCircleIcon, ClockIcon, MagnifyingGlassIcon } from '../icons';
import { useAppDispatch } from '../../AppContext';
import { bookJourneys } from '../../utils/coachingData';
import AcademyLandingHero from '../AcademyLandingHero';
import { ACADEMY_CONTENTS } from '../../utils/academyLandingContent';

interface AIAcademyViewProps {
    user: User | null;
}

const AIAcademyView: React.FC<AIAcademyViewProps> = ({ user }) => {
    const dispatch = useAppDispatch();
    const [searchQuery, setSearchQuery] = useState('');

    // Filter AI related courses from bookJourneys
    const aiCourses = useMemo(() => {
        return bookJourneys.filter(course => 
            course.id.includes('ai') || course.id.includes('prompt') || course.title.includes('هوش مصنوعی')
        );
    }, []);

    // Filter based on search query
    const filteredCourses = useMemo(() => {
        if (!searchQuery.trim()) return aiCourses;
        const lowerQuery = searchQuery.toLowerCase();
        return aiCourses.filter(course => 
            course.title.toLowerCase().includes(lowerQuery) || 
            course.description.toLowerCase().includes(lowerQuery)
        );
    }, [aiCourses, searchQuery]);

    const handleStartCourse = (courseId: string) => {
        if (!user) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
        } else {
             // In a real app, navigate to course detail or start learning
             // For now, let's navigate to Business Academy where these courses live structurally
             dispatch({ type: 'SET_VIEW', payload: View.BUSINESS_ACADEMY });
        }
    };

    const getModuleTimeEstimate = (module: BusinessModule | LMSModule | undefined): string => {
        if (!module) return 'نامشخص';
        if ('timeEstimate' in module) {
            return module.timeEstimate;
        }
        if ('lessons' in module) {
             const totalMinutes = module.lessons.reduce((acc, l) => {
                const duration = parseInt(l.duration) || 10;
                return acc + duration;
            }, 0);
            return `${totalMinutes} دقیقه`;
        }
        return 'نامشخص';
    };

    return (
        <div className="p-6 md:p-10 animate-fade-in">
            <div className="max-w-6xl mx-auto">
                
                {/* New Landing Hero Section */}
                <AcademyLandingHero content={ACADEMY_CONTENTS['ai_academy']} />

                {/* Search Bar */}
                <div className="mb-10 max-w-md mx-auto relative group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="w-5 h-5 text-stone-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="جستجو در دوره‌های هوش مصنوعی..." 
                        className="w-full bg-stone-800/50 border border-stone-700 text-white rounded-full py-3 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-stone-600"
                    />
                </div>

                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCourses.map((course, index) => (
                            <div 
                                key={course.id} 
                                className="bg-stone-900 rounded-2xl border border-stone-700 overflow-hidden hover:border-blue-500 transition-all duration-300 group hover:-translate-y-2"
                            >
                                <div className={`h-48 bg-gradient-to-br ${course.coverColor} relative p-6 flex flex-col justify-end`}>
                                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                                        {course.totalSessions} جلسه
                                    </div>
                                    <h3 className="text-xl font-bold text-white relative z-10">{course.title}</h3>
                                </div>
                                <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                                    <p className="text-stone-400 text-sm mb-6 line-clamp-3 flex-grow">
                                        {course.description}
                                    </p>
                                    
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2 text-xs text-stone-300">
                                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                            <span>پروژه عملی</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-stone-300">
                                            <ClockIcon className="w-4 h-4 text-blue-500" />
                                            <span>{getModuleTimeEstimate(course.modules?.[0] as any)}</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleStartCourse(course.id)}
                                        className="w-full py-3 rounded-xl bg-stone-800 hover:bg-blue-600 text-white font-bold transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-600"
                                    >
                                        <PlayIcon className="w-5 h-5" />
                                        شروع یادگیری
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-stone-500">
                        <p>دوره‌ای با این عنوان یافت نشد.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIAcademyView;
