
import React from 'react';
import { ShieldKeyholeIcon } from './icons.tsx';
import Modal from './Modal.tsx';

interface GuardianInvitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    title: string;
    message: string;
}

const GuardianInvitationModal: React.FC<GuardianInvitationModalProps> = ({ isOpen, onClose, onAccept, title, message }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 text-center max-w-md">
                <ShieldKeyholeIcon className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">{title}</h2>
                <p className="my-4 text-stone-600 dark:text-stone-300 whitespace-pre-line">
                   {message}
                </p>
                <div className="flex justify-center gap-4 mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600 rounded-lg transition-colors"
                    >
                        بعداً فکر می‌کنم
                    </button>
                    <button
                        onClick={onAccept}
                        className="px-6 py-2 font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
                    >
                        بله، می‌پذیرم
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default GuardianInvitationModal;