
import React, { useState, useEffect } from 'react';
import { ActionableDraft, CommunityProject } from '../types.ts';
import { MegaphoneIcon } from './icons.tsx';

interface ActionableDraftCardProps {
    draft: ActionableDraft;
    allProjects: CommunityProject[];
    onPublish: (projectId: string, title: string, description: string) => void;
    onCancel: () => void;
}

const ActionableDraftCard: React.FC<ActionableDraftCardProps> = ({ draft, allProjects, onPublish, onCancel }) => {
    const [title, setTitle] = useState(draft.title);
    const [description, setDescription] = useState(draft.description);
    const [selectedProjectId, setSelectedProjectId] = useState<string>(allProjects[0]?.id || '');

    useEffect(() => {
        setTitle(draft.title);
        setDescription(draft.description);
    }, [draft]);

    const handlePublishClick = () => {
        if (title.trim() && description.trim() && selectedProjectId) {
            onPublish(selectedProjectId, title, description);
        }
    };

    return (
        <div className="mt-4 p-5 bg-gray-800 border border-gray-700 rounded-xl space-y-4 shadow-md" aria-label="Actionable Draft Card">
            <div className="flex items-center gap-2 text-amber-400 mb-2 border-b border-gray-700 pb-2">
                 <MegaphoneIcon className="w-5 h-5" />
                 <span className="font-bold text-sm">پیش‌نویس هوشمند</span>
            </div>
            <div>
                <label className="font-semibold block mb-1.5 text-xs text-gray-400">عنوان</label>
                <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className="w-full p-2.5 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                />
            </div>
            <div>
                <label className="font-semibold block mb-1.5 text-xs text-gray-400">متن اطلاعیه</label>
                <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    rows={5}
                    className="w-full p-2.5 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
            </div>
            <div>
                <label className="font-semibold block mb-1.5 text-xs text-gray-400">انتشار برای پروژه</label>
                <select 
                    value={selectedProjectId} 
                    onChange={e => setSelectedProjectId(e.target.value)} 
                    className="w-full p-2.5 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                    {allProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">لغو</button>
                <button 
                    onClick={handlePublishClick} 
                    className="px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors flex items-center gap-1 shadow"
                >
                    انتشار نهایی
                </button>
            </div>
        </div>
    );
};

export default ActionableDraftCard;
