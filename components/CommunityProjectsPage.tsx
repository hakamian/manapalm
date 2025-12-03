

import React, { useState } from 'react';
import { User, Page, CommunityProject } from '../types.ts';
import { LeafIcon, ArrowLeftIcon, HandshakeIcon, StarIcon } from './icons.tsx';
import ContributionModal from './ContributionModal.tsx';
import ProjectUpdatesModal from './ProjectUpdatesModal.tsx';

interface CommunityProjectsPageProps {
    user: User | null;
    allCommunityProjects: CommunityProject[];
    onContribute: (projectId: string, amount: number, type: 'points' | 'purchase') => void;
    onLoginClick: () => void;
}

const ProjectCard: React.FC<{ project: CommunityProject; onContributeClick: () => void; onViewUpdatesClick: () => void; }> = ({ project, onContributeClick, onViewUpdatesClick }) => {
    const progress = Math.min(100, (project.current / project.goal) * 100);
    const hasUpdates = project.updates && project.updates.length > 0;

    return (
        <div className="bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
            <div className="relative">
                <img src={project.imageUrl} alt={project.title} className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 right-4 text-white">
                    <h3 className="text-2xl font-bold">{project.title}</h3>
                </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <p className="text-stone-600 dark:text-stone-300 text-sm flex-grow">{project.description}</p>
                <div className="mt-4">
                    <div className="flex justify-between text-sm font-semibold mb-1">
                        <span>{project.current.toLocaleString('fa-IR')} از {project.goal.toLocaleString('fa-IR')} نخل</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-stone-50 dark:bg-stone-800 border-t dark:border-stone-700 flex gap-3">
                 <button onClick={onContributeClick} className="w-full bg-amber-500 text-white font-bold py-2.5 rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
                    <HandshakeIcon className="w-5 h-5"/> مشارکت
                </button>
                {hasUpdates && (
                     <button onClick={onViewUpdatesClick} className="w-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold py-2.5 rounded-lg hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors">
                        مشاهده گزارش
                    </button>
                )}
            </div>
        </div>
    );
};


const CommunityProjectsPage: React.FC<CommunityProjectsPageProps> = ({ user, allCommunityProjects, onContribute, onLoginClick }) => {
    const [selectedProject, setSelectedProject] = useState<CommunityProject | null>(null);
    const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
    const [isUpdatesModalOpen, setIsUpdatesModalOpen] = useState(false);

    const handleContributeClick = (project: CommunityProject) => {
        if (!user) {
            onLoginClick();
        } else {
            setSelectedProject(project);
            setIsContributionModalOpen(true);
        }
    };
    
    const handleViewUpdatesClick = (project: CommunityProject) => {
        setSelectedProject(project);
        setIsUpdatesModalOpen(true);
    };

    return (
        <>
            <div className="space-y-16 animate-fade-in-up">
                <section className="text-center container mx-auto px-4">
                    <HandshakeIcon className="w-20 h-20 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-4xl md:text-5xl font-extrabold text-amber-900 dark:text-amber-200 mb-4 leading-tight">
                        پروژه‌های اجتماعی نخلستان
                    </h1>
                    <p className="text-lg md:text-xl text-stone-700 dark:text-stone-300 max-w-3xl mx-auto">
                        اینجا جایی است که قدرت جمعی ما به نمایش درمی‌آید. با مشارکت در این پروژه‌ها، تاثیر خود را چند برابر کنید و در حرکتی بزرگ‌تر سهیم شوید.
                    </p>
                </section>
                <section className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allCommunityProjects.map(project => (
                             <ProjectCard
                                key={project.id}
                                project={project}
                                onContributeClick={() => handleContributeClick(project)}
                                onViewUpdatesClick={() => handleViewUpdatesClick(project)}
                            />
                        ))}
                    </div>
                </section>
            </div>
            {selectedProject && user && (
                <ContributionModal
                    isOpen={isContributionModalOpen}
                    onClose={() => setIsContributionModalOpen(false)}
                    project={selectedProject}
                    user={user}
                    onContribute={onContribute}
                />
            )}
            {selectedProject && (
                <ProjectUpdatesModal
                    isOpen={isUpdatesModalOpen}
                    onClose={() => setIsUpdatesModalOpen(false)}
                    project={selectedProject}
                />
            )}
        </>
    );
};

export default CommunityProjectsPage;