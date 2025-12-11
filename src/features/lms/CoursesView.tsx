import React, { useState } from 'react';
import { ChevronDownIcon, ClockIcon, ChartBarIcon, UsersIcon, PlayIcon, SparklesIcon } from '../../../components/icons';
import { LMSCourse } from '../../../types/lms';
import AutoCourseGenerator from './AutoCourseGenerator';
import CoursePlayer from './CoursePlayer';
import AcademyMentor from './AcademyMentor';

// --- Mock Data (Adapted to LMSCourse) ---
const initialCourses: LMSCourse[] = [
    {
        id: 'c1',
        title: 'کوچینگ معنا: سفر قهرمانی خود را آغاز کنید',
        description: 'در این دوره، شما با استفاده از ابزارهای کوچینگ و هوش مصنوعی، نقشه راه شخصی خود را برای رسیدن به اهداف معنادار ترسیم خواهید کرد.',
        level: 'beginner',
        durationMinutes: 120,
        pointsReward: 100,
        isPublished: true,
        instructorName: 'دکتر علی حسینی',
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
        modules: [] // Populated in real app
    },
    {
        id: 'c2',
        title: 'راه اندازی کسب و کار با هوش مصنوعی',
        description: 'از ایده تا اجرا؛ کسب‌وکار خود را با قدرت ابزارهای هوش مصنوعی نسل جدید بسازید.',
        level: 'intermediate',
        durationMinutes: 180,
        pointsReward: 150,
        isPublished: true,
        instructorName: 'مهندس سارا محمدی',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400&q=80',
        modules: []
    }
];

const CoursesView: React.FC = () => {
    const [courses, setCourses] = useState<LMSCourse[]>(initialCourses);
    const [activeCourse, setActiveCourse] = useState<LMSCourse | null>(null);
    const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
    const [showMentor, setShowMentor] = useState(false);

    const handleCourseGenerated = (newCourse: LMSCourse) => {
        setCourses(prev => [newCourse, ...prev]);
        setExpandedCourseId(newCourse.id); // Auto expand
    };

    const handleStartCourse = (course: LMSCourse) => {
        setActiveCourse(course);
        window.scrollTo(0, 0);
    };

    const handleToggleCourse = (courseId: string) => {
        setExpandedCourseId(prevId => (prevId === courseId ? null : courseId));
    };

    // If player is active, render it
    if (activeCourse) {
        return <CoursePlayer course={activeCourse} onExit={() => setActiveCourse(null)} />;
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white pt-24 pb-24">
            <div className="container mx-auto px-6">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-500">
                        آکادمی هوشمانا
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        یادگیری که نخل شما را رشد می‌دهد. مهارت‌های جدید بیاموزید و تاثیر واقعی بگذارید.
                    </p>
                </div>

                {/* AI Generator Section */}
                <div className="mb-12 max-w-4xl mx-auto">
                    <AutoCourseGenerator onCourseGenerated={handleCourseGenerated} />
                </div>

                {/* Course List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {courses.map(course => (
                        <div key={course.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all hover:shadow-2xl flex flex-col">
                            {/* Course Image */}
                            <div className="h-48 bg-gray-800 relative overflow-hidden group">
                                {course.imageUrl ? (
                                    <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                        <PlayIcon className="w-12 h-12 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs text-white">
                                    {course.level === 'beginner' ? 'مبتدی' : course.level === 'intermediate' ? 'متوسط' : 'پیشرفته'}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-100 mb-2 line-clamp-2">{course.title}</h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">{course.description}</p>

                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                    <div className="flex items-center gap-1">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>{course.durationMinutes} دقیقه</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-emerald-400">
                                        <ChartBarIcon className="w-4 h-4" />
                                        <span>{course.pointsReward} امتیاز رشد</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-xs text-gray-500">{course.instructorName}</span>
                                    <button
                                        onClick={() => handleStartCourse(course)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                                    >
                                        <PlayIcon className="w-4 h-4" />
                                        شروع یادگیری
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* AI Mentor Floating Widget */}
            <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-4">
                {showMentor && (
                    <div className="w-80 h-96 mb-2 animate-fade-in-up">
                        <AcademyMentor
                            courseTitle={activeCourse?.title}
                            onClose={() => setShowMentor(false)}
                        />
                    </div>
                )}

                <button
                    onClick={() => setShowMentor(!showMentor)}
                    className={`p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 flex items-center justify-center ${showMentor
                        ? 'bg-red-500 hover:bg-red-600 rotate-90'
                        : 'bg-indigo-600 hover:bg-indigo-500'
                        }`}
                >
                    {showMentor ? (
                        <span className="text-white font-bold text-xl">×</span>
                    ) : (
                        <SparklesIcon className="w-8 h-8 text-white animate-pulse" />
                    )}
                </button>
            </div>
        </div>
    );
};


export default CoursesView;