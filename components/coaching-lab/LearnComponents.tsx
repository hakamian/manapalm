
import React, { useState } from 'react';
import { ChevronDownIcon, PlusIcon } from '../icons';

export const SkillAccordion: React.FC<{ title: string, description: string, examples?: string[] }> = ({ title, description, examples }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-gray-800 rounded-md overflow-hidden border border-gray-700 mb-2">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-right hover:bg-gray-700/50 transition-colors">
                <span className="font-semibold text-sm md:text-base text-white">{title}</span>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="px-4 pb-4 border-t border-gray-700/50 pt-3 bg-gray-700/20">
                        <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
                        {examples && examples.length > 0 && (
                            <div className="mt-3 bg-gray-900/30 p-3 rounded border-r-2 border-yellow-500">
                                <h4 className="font-semibold text-xs text-yellow-400 mb-1">مثال کاربردی:</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-400 text-xs">
                                    {examples.map((ex, i) => <li key={i}>{ex}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CategoryAccordion: React.FC<{ category: string, icon: React.FC<any>, description: string, skills: { title: string, description: string, examples?: string[] }[], startOpen?: boolean }> = ({ category, icon: Icon, description, skills, startOpen = false }) => {
    const [isOpen, setIsOpen] = useState(startOpen);
    return (
        <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 shadow-sm mb-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-5 flex justify-between items-center text-right hover:bg-gray-700/30 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-700 rounded-full text-amber-400">
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white">{category}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                    </div>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-700 bg-gray-900/20">
                    {skills.map((skill, idx) => <SkillAccordion key={idx} {...skill} />)}
                </div>
            )}
        </div>
    );
};

export const QuestionsAccordion: React.FC<{ category: string, questions: string[] }> = ({ category, questions }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-blue-900/10 border border-blue-500/30 rounded-lg overflow-hidden mb-3">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-3 flex justify-between items-center text-right hover:bg-blue-900/20 transition-colors">
                <span className="font-bold text-blue-300 text-sm">{category}</span>
                <PlusIcon className={`w-4 h-4 text-blue-400 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-3 pt-0">
                    <ul className="space-y-2">
                        {questions.map((q, i) => (
                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                {q}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
