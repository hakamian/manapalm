// Fix: Created a placeholder component for GrantPointsModal.tsx to resolve module errors.
import React, { useState } from 'react';
import { User } from '../types';
import Modal from './Modal';

interface GrantPointsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onGrant: (userId: string, points: number, reason: string) => void;
}

const GrantPointsModal: React.FC<GrantPointsModalProps> = ({ isOpen, onClose, user, onGrant }) => {
    const [points, setPoints] = useState(100);
    const [reason, setReason] = useState('');

    if (!user) return null;

    const handleGrant = () => {
        if (points > 0 && reason.trim()) {
            onGrant(user.id, points, reason);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4 w-full max-w-md">
                <h3 className="text-lg font-bold">اعطای امتیاز به {user.name}</h3>
                <div className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium">مقدار امتیاز</label>
                        <input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} className="w-full p-2 border rounded-md bg-transparent dark:border-stone-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">دلیل</label>
                        <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="w-full p-2 border rounded-md bg-transparent dark:border-stone-600" placeholder="مثلا: مشارکت فعال در جامعه" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-stone-200 dark:bg-stone-600">انصراف</button>
                    <button onClick={handleGrant} className="px-4 py-2 rounded-lg bg-amber-500 text-white">اعطا کن</button>
                </div>
            </div>
        </Modal>
    );
};

export default GrantPointsModal;