
import React, { useState } from 'react';
import { TimelineEvent, TimelineEventType } from '../types';
import Modal from './Modal';
import { BrainCircuitIcon, StarIcon, HeartIcon, QuoteIcon } from './icons';

interface AddMomentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddMoment: (newEvent: TimelineEvent) => void;
}

type MomentType = 'reflection' | 'decision' | 'success' | 'memory';

const momentTypes: { id: MomentType; title: string; icon: React.FC<any> }[] = [
    { id: 'reflection', title: 'تامل', icon: QuoteIcon },
    { id: 'decision', title: 'تصمیم', icon: BrainCircuitIcon },
    { id: 'success', title: 'موفقیت', icon: StarIcon },
    { id: 'memory', title: 'خاطره', icon: HeartIcon },
];

const AddMomentModal: React.FC<AddMomentModalProps> = ({ isOpen, onClose, onAddMoment }) => {
    const [type, setType] = useState<MomentType>('reflection');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        if (!title || !description) return;

        const newEvent: TimelineEvent = {
            id: `evt_manual_${Date.now()}`,
            date: new Date().toISOString(),
            // FIX: The 'type' property was not assignable to 'TimelineEventType'.
            type: type as TimelineEventType,
            title,
            description,
            details: {},
        };

        onAddMoment(newEvent);
        // Reset form
        setTitle('');
        setDescription('');
        setType('reflection');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4 w-full max-w-lg text-right">
                <h3 className="text-xl font-bold mb-4">ثبت لحظه جدید</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">نوع لحظه</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {momentTypes.map(moment => {
                                const Icon = moment.icon;
                                return (
                                    <button
                                        key={moment.id}
                                        onClick={() => setType(moment.id)}
                                        className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors ${
                                            type === moment.id
                                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30'
                                                : 'border-stone-200 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700'
                                        }`}
                                    >
                                        <Icon className="w-6 h-6" />
                                        <span className="text-sm font-semibold">{moment.title}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="momentTitle" className="block text-sm font-medium mb-1">عنوان</label>
                        <input
                            id="momentTitle"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="یک عنوان کوتاه برای این لحظه..."
                            className="w-full p-2 border rounded-md bg-transparent dark:border-stone-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="momentDescription" className="block text-sm font-medium mb-1">شرح</label>
                        <textarea
                            id="momentDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="جزئیات این لحظه را بنویسید..."
                            className="w-full p-2 border rounded-md bg-transparent dark:border-stone-600"
                        ></textarea>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-stone-100 dark:bg-stone-600">انصراف</button>
                    <button onClick={handleSubmit} disabled={!title || !description} className="px-6 py-2 font-bold text-white bg-amber-500 rounded-lg disabled:bg-amber-300">ثبت لحظه</button>
                </div>
            </div>
        </Modal>
    );
};

export default AddMomentModal;
