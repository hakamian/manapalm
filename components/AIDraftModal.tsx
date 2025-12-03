import React, { useState, useEffect } from 'react';
import { KeyTheme, CommunityProject, ProjectUpdate } from '../types.ts';
import { generateDraftUpdate } from '../utils/ai_analysis.ts';
import Modal from './Modal.tsx';
import { MegaphoneIcon, SparklesIcon } from './icons.tsx';

interface AIDraftModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: KeyTheme;
    allProjects: CommunityProject[];
    onAddProjectUpdate: (projectId: string, update: Omit<ProjectUpdate, 'date'>) => void;
}

const AIDraftModal: React.FC<AIDraftModalProps> = ({ isOpen, onClose, theme, allProjects, onAddProjectUpdate }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState<string>(allProjects[0]?.id || '');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            const fetchDraft = async () => {
                setIsLoading(true);
                setError(null);
                const draft = await generateDraftUpdate(theme);
                if (draft) {
                    setTitle(draft.title);
                    setDescription(draft.description);
                } else {
                    setError('خطا در تولید پیش‌نویس. لطفا دستی بنویسید یا دوباره تلاش کنید.');
                }
                setIsLoading(false);
            };
            fetchDraft();
        }
    }, [isOpen, theme]);

    const handlePublish = () => {
        if (!title.trim() || !description.trim() || !selectedProjectId) {
            alert('لطفا عنوان، توضیحات و پروژه را مشخص کنید.');
            return;
        }
        onAddProjectUpdate(selectedProjectId, { title, description });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4 w-full max-w-2xl">
                <h3 className="text-xl font-bold mb-1">نگارش اطلاعیه با هوش مصنوعی</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">بر اساس موضوع «{theme.theme}»</p>

                {isLoading ? (
                    <div className="text-center p-12">
                         <div className="animate-pulse flex flex-col items-center">
                            <SparklesIcon className="w-10 h-10 text-amber-400" />
                            <p className="mt-2 font-semibold">دستیار هوشمند در حال نگارش است...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center p-12 text-red-500">{error}</div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="font-semibold block mb-1 text-sm">عنوان اطلاعیه</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-md bg-transparent dark:border-stone-600" />
                        </div>
                        <div>
                            <label className="font-semibold block mb-1 text-sm">متن اطلاعیه</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} className="w-full p-2 border rounded-md bg-transparent dark:border-stone-600"></textarea>
                        </div>
                         <div>
                            <label className="font-semibold block mb-1 text-sm">انتشار برای پروژه</label>
                            <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="w-full p-2 border rounded-md bg-transparent dark:border-stone-600 dark:bg-stone-800">
                                {allProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                            </select>
                        </div>
                    </div>
                )}
                
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-stone-100 dark:bg-stone-600">انصراف</button>
                    <button onClick={handlePublish} disabled={isLoading || !!error} className="px-6 py-2 font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:bg-amber-300 flex items-center gap-1">
                        <MegaphoneIcon className="w-5 h-5" />
                        انتشار
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AIDraftModal;
