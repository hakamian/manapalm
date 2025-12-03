
import React, { useEffect, useState } from 'react';
import { CommunityProject } from '../types.ts';
import { XIcon, MegaphoneIcon, ArrowLeftIcon } from './icons.tsx';

interface ProjectUpdateNotificationProps {
    project: CommunityProject;
    show: boolean;
    onClose: () => void;
    onViewUpdateClick?: () => void;
}

const ProjectUpdateNotification: React.FC<ProjectUpdateNotificationProps> = ({ project, show, onClose, onViewUpdateClick }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!isVisible) return null;

    const lastUpdate = project.updates && project.updates.length > 0 ? project.updates[project.updates.length - 1] : null;
    if (!lastUpdate) return null;

    return (
        <div className={`fixed bottom-5 left-5 w-full max-w-sm z-70 transition-all duration-300 ease-in-out ${show ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
            <div className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl p-4 border border-blue-300 dark:border-blue-700">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                        <MegaphoneIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-blue-800 dark:text-blue-200">خبرهای خوب از پروژه شما!</h3>
                        <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">
                            پروژه «{project.title}» یک به‌روزرسانی جدید دارد: <span className="font-semibold">{lastUpdate?.title}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                {onViewUpdateClick && (
                    <div className="mt-3 text-right">
                        <button onClick={onViewUpdateClick} className="text-sm font-bold text-blue-600 dark:text-blue-300 hover:underline flex items-center gap-1">
                            مشاهده گزارش <ArrowLeftIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default ProjectUpdateNotification;
