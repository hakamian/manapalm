import React from 'react';
import { Page } from '../types';
import { ArrowLeftIcon } from './icons';

interface ManaGuideCardProps {
    icon: React.FC<any>;
    title: string;
    description: string;
    cta: {
        text: string;
        page: Page;
    };
    color: string;
    setPage: (page: Page) => void;
}

const ManaGuideCard: React.FC<ManaGuideCardProps> = ({ icon: Icon, title, description, cta, color, setPage }) => {
    return (
        <div className={`p-8 rounded-2xl shadow-lg flex flex-col text-right transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 border-${color}-300/50 dark:border-${color}-700/50 bg-gradient-to-br from-white to-${color}-50 dark:from-stone-800/50 dark:to-stone-900/10`}>
            <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/30 self-start mb-4`}>
                <Icon className={`w-10 h-10 text-${color}-500 dark:text-${color}-400`} />
            </div>
            <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{title}</h3>
            <p className="text-stone-600 dark:text-stone-300 mt-2 flex-grow">{description}</p>
            <button
                onClick={() => setPage(cta.page)}
                className={`mt-6 self-start text-${color}-600 dark:text-${color}-300 font-bold py-2 rounded-lg transition-colors hover:text-${color}-800 dark:hover:text-${color}-100 flex items-center gap-2`}
            >
                <span>{cta.text}</span>
                <ArrowLeftIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default ManaGuideCard;
