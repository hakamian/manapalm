
import React, { useState, useEffect } from 'react';
import { LMSCourse, CourseModule, Lesson } from '../../types/lms';
import { PlayIcon, CheckCircleIcon, LockClosedIcon, LeafIcon } from '../../components/icons';
import { useAppState, useAppDispatch } from '../../AppContext';
import SEOHead from '../../components/seo/SEOHead';

interface CoursePlayerProps {
    course: LMSCourse;
    onExit: () => void;
}

const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, onExit }) => {
    // Mock data if modules not populated
    const modules: CourseModule[] = course.modules || [
        {
            id: 'm1', courseId: course.id, title: 'Introduction', orderIndex: 0, lessons: [
                { id: 'l1', moduleId: 'm1', title: 'Start Here', contentType: 'video', durationMinutes: 5, orderIndex: 0, isCompleted: true },
                { id: 'l2', moduleId: 'm1', title: 'Why Meaning?', contentType: 'video', durationMinutes: 10, orderIndex: 1, isCompleted: false },
            ]
        },
        {
            id: 'm2', courseId: course.id, title: 'Core Concepts', orderIndex: 1, lessons: [
                { id: 'l3', moduleId: 'm2', title: 'The Impact Model', contentType: 'video', durationMinutes: 15, orderIndex: 0, isCompleted: false },
            ]
        }
    ];

    const [currentLesson, setCurrentLesson] = useState<Lesson>(modules[0].lessons![0]);
    const [progress, setProgress] = useState(33); // Mock progress

    const handleLessonSelect = (lesson: Lesson) => {
        setCurrentLesson(lesson);
    };

    const handleCompleteLesson = () => {
        // Mock logic: Mark as complete, update progress
        setProgress(prev => Math.min(prev + 10, 100));
        // Dispatch action to update DB
    };

    return (
        <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col">
            <SEOHead title={`دوره: ${course.title}`} description={course.description} />
            {/* Header */}
            <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="text-gray-400 hover:text-white transition-colors">
                        ← بازگشت
                    </button>
                    <h1 className="text-white font-bold">{course.title}</h1>
                </div>

                {/* Gamification Bar */}
                <div className="flex items-center gap-3">
                    <div className="text-xs text-green-400 font-bold flex items-center gap-1">
                        <LeafIcon className="w-4 h-4" />
                        رشد نخل شما
                    </div>
                    <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                        <div
                            className="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <span className="text-xs text-gray-400">{progress}%</span>
                </div>
            </div>

            <div className="flex flex-grow overflow-hidden">
                {/* Sidebar (Modules) */}
                <div className="w-80 bg-gray-900 border-l border-gray-800 overflow-y-auto hidden md:block">
                    <div className="p-4">
                        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">Content</h3>
                        <div className="space-y-4">
                            {modules.map(module => (
                                <div key={module.id}>
                                    <h4 className="text-gray-300 font-bold mb-2 px-2 text-sm">{module.title}</h4>
                                    <div className="space-y-1">
                                        {module.lessons?.map(lesson => (
                                            <button
                                                key={lesson.id}
                                                onClick={() => handleLessonSelect(lesson)}
                                                className={`w-full text-right px-3 py-2 rounded-lg flex items-center justify-between text-sm transition-colors ${currentLesson.id === lesson.id
                                                    ? 'bg-green-900/30 text-green-300 border border-green-800/50'
                                                    : 'hover:bg-gray-800 text-gray-400'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {lesson.isCompleted ? (
                                                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full border border-gray-600"></div>
                                                    )}
                                                    <span>{lesson.title}</span>
                                                </div>
                                                <span className="text-xs opacity-50">{lesson.durationMinutes}m</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-grow bg-black flex flex-col">
                    <div className="flex-grow flex items-center justify-center relative bg-gradient-to-br from-gray-900 to-black">
                        {/* Video Placehoder */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-[0_0_30px_rgba(22,163,74,0.3)]">
                                <PlayIcon className="w-8 h-8 text-white ml-1" />
                            </div>
                            <h2 className="text-2xl text-white font-bold mb-2">{currentLesson.title}</h2>
                            <p className="text-gray-500">Video Player Placeholder</p>
                            <p className="text-xs text-gray-600 mt-2">Source: {currentLesson.videoUrl || 'Local Asset'}</p>
                        </div>
                    </div>

                    {/* Lesson Footer */}
                    <div className="h-16 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-6">
                        <button className="text-gray-400 hover:text-white disabled:opacity-50">
                            درس قبلی
                        </button>
                        <button
                            onClick={handleCompleteLesson}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-green-900/20 transition-all transform hover:scale-105 active:scale-95"
                        >
                            تکمیل و ادامه
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;
