import React from 'react';
import { KeyTheme, TimelineEvent } from '../types.ts';
import Modal from './Modal.tsx';
import { CheckIcon, XIcon } from './icons.tsx';

interface ThemeInsightsModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: KeyTheme;
    allInsights: TimelineEvent[];
    onUpdateInsightStatus: (insightId: string, status: 'approved' | 'rejected') => void;
}

const ThemeInsightsModal: React.FC<ThemeInsightsModalProps> = ({ isOpen, onClose, theme, allInsights, onUpdateInsightStatus }) => {
    
    const relevantInsights = (theme.insightIds || []).map(id => allInsights.find(insight => insight.id === id)).filter(Boolean) as TimelineEvent[];

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4 w-full max-w-2xl">
                <h3 className="text-xl font-bold mb-1">تاملات مرتبط با «{theme.theme}»</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">{theme.summary}</p>
                <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2 space-y-3">
                    {relevantInsights.length > 0 ? relevantInsights.map(insight => (
                        <div key={insight.id} className="bg-stone-50 dark:bg-stone-700/50 p-3 rounded-lg">
                            <p className="italic text-stone-700 dark:text-stone-200">"{insight.userReflection?.notes || insight.description}"</p>
                            <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    insight.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                    insight.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>{insight.status}</span>
                                {insight.status === 'pending' && (
                                    <div className="flex gap-1">
                                        <button onClick={() => onUpdateInsightStatus(insight.id, 'approved')} className="p-1 bg-green-100 rounded-full hover:bg-green-200"><CheckIcon className="w-4 h-4 text-green-700"/></button>
                                        <button onClick={() => onUpdateInsightStatus(insight.id, 'rejected')} className="p-1 bg-red-100 rounded-full hover:bg-red-200"><XIcon className="w-4 h-4 text-red-700"/></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : <p className="text-center text-stone-500 py-4">تاملی برای نمایش وجود ندارد.</p>}
                </div>
            </div>
        </Modal>
    );
};

export default ThemeInsightsModal;