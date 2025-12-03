
import React from 'react';
import { CommunityProject } from '../types.ts';
import Modal from './Modal.tsx';
import { MegaphoneIcon } from './icons.tsx';

interface ProjectUpdatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: CommunityProject;
}

const ProjectUpdatesModal: React.FC<ProjectUpdatesModalProps> = ({ isOpen, onClose, project }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4 w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4 text-center">گاه‌شمار پروژه «{project.title}»</h3>
                <div className="max-h-[70vh] overflow-y-auto pr-4 -mr-4 space-y-6">
                    {project.updates && project.updates.length > 0 ? (
                        [...project.updates].reverse().map((update, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="flex flex-col items-center self-stretch">
                                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/50 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MegaphoneIcon className="w-5 h-5 text-amber-600 dark:text-amber-300"/>
                                    </div>
                                    {index < project.updates.length - 1 && <div className="w-0.5 flex-grow bg-stone-200 dark:bg-stone-700"></div>}
                                </div>
                                <div className="flex-1 pb-4">
                                    <p className="text-sm text-stone-500 dark:text-stone-400">{new Date(update.date).toLocaleDateString('fa-IR')}</p>
                                    <h4 className="font-bold text-stone-800 dark:text-stone-100">{update.title}</h4>
                                    <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">{update.description}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-stone-500 py-8">هنوز گزارشی برای این پروژه ثبت نشده است.</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};
export default ProjectUpdatesModal;