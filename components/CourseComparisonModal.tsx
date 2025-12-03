
import React from 'react';
import Modal from './Modal';
import { ChartBarIcon } from './icons';
import { Course } from '../types';

const CourseComparisonModal: React.FC<{ isOpen: boolean, onClose: () => void, courses: Course[] }> = ({ isOpen, onClose, courses }) => {
    if (!isOpen) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-[95vw] max-w-5xl bg-stone-900 text-white rounded-2xl border border-stone-700 p-6 overflow-x-auto">
                <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                    <ChartBarIcon className="w-8 h-8 text-amber-400" />
                    مقایسه دوره‌ها
                </h3>
                
                <div className="min-w-[600px]">
                    <div className="grid grid-cols-[150px_repeat(auto-fit,minmax(200px,1fr))] gap-4">
                        {/* Labels Column */}
                        <div className="space-y-4 pt-20 font-bold text-stone-400 text-sm">
                            <div className="h-12 flex items-center">عنوان</div>
                            <div className="h-10 flex items-center">قیمت</div>
                            <div className="h-10 flex items-center">مدت</div>
                            <div className="h-10 flex items-center">سطح</div>
                            <div className="h-10 flex items-center">پاداش</div>
                            <div className="h-20 flex items-center">مخاطب</div>
                        </div>

                        {/* Course Columns */}
                        {courses.map(course => (
                            <div key={course.id} className="bg-stone-800 rounded-xl p-4 border border-stone-700 flex flex-col gap-4">
                                <div className="h-16 flex flex-col justify-center text-center">
                                    <div className="mx-auto p-2 bg-stone-700 rounded-full mb-2">
                                        {course.icon && <course.icon className="w-6 h-6 text-white" />}
                                    </div>
                                    <h4 className="font-bold text-sm truncate" title={course.title}>{course.title}</h4>
                                </div>
                                <div className="h-10 flex items-center justify-center font-bold text-green-400">
                                    {course.price === 0 ? 'رایگان' : course.price.toLocaleString('fa-IR')}
                                </div>
                                <div className="h-10 flex items-center justify-center text-sm text-stone-300">{course.duration}</div>
                                <div className="h-10 flex items-center justify-center text-sm text-stone-300">{course.level}</div>
                                <div className="h-10 flex items-center justify-center text-sm text-yellow-400">{course.xpReward} XP</div>
                                <div className="h-20 flex items-center justify-center text-xs text-stone-400 text-center">
                                    {course.targetAudience}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-stone-700 hover:bg-stone-600 py-2 rounded-lg text-white font-bold">بستن</button>
            </div>
        </Modal>
    );
};

export default CourseComparisonModal;
