
import React from 'react';
import { LMSLesson } from '../../types';
import { CheckCircleIcon, LockClosedIcon, PlayIcon, SparklesIcon } from '../icons';

export const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-gray-700 rounded-full h-2">
        <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
    </div>
);

interface LessonItemProps {
    lesson: LMSLesson;
    status: 'locked' | 'available' | 'completed';
    isActive: boolean;
    onClick: () => void;
}

export const LessonItem: React.FC<LessonItemProps> = ({ lesson, status, isActive, onClick }) => {
    let icon = <LockClosedIcon className="w-5 h-5 text-gray-500" />;
    let textColor = "text-gray-500";
    let bgColor = "bg-transparent";

    if (status === 'completed') {
        icon = <CheckCircleIcon className="w-5 h-5 text-green-500" />;
        textColor = "text-gray-300";
    } else if (status === 'available') {
        icon = lesson.type === 'video' ? <PlayIcon className="w-5 h-5 text-amber-500" /> : <SparklesIcon className="w-5 h-5 text-blue-500" />;
        textColor = "text-white";
    }

    if (isActive) {
        bgColor = "bg-gray-700 border-l-4 border-amber-500";
    }

    return (
        <button 
            onClick={onClick} 
            disabled={status === 'locked'}
            className={`w-full flex items-center justify-between p-3 hover:bg-gray-700/50 transition-colors text-right ${bgColor} ${status === 'locked' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex-shrink-0">{icon}</div>
                <div className="flex-grow truncate">
                    <p className={`text-sm font-medium truncate ${textColor}`}>{lesson.title}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        {lesson.type === 'video' && <span className="bg-gray-800 px-1 rounded">ویدیو</span>}
                        {lesson.duration}
                    </p>
                </div>
            </div>
            {status === 'completed' && <span className="text-xs text-green-500 mr-2">انجام شد</span>}
        </button>
    );
};
