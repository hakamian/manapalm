import React from 'react';
import Modal from './Modal.tsx';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'positive' | 'destructive';
    icon?: React.FC<any>;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message,
    confirmText = "تایید",
    cancelText = "انصراف",
    variant = 'destructive',
    icon: Icon 
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const confirmButtonClasses = {
        positive: 'bg-amber-500 hover:bg-amber-600',
        destructive: 'bg-red-500 hover:bg-red-600',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4 text-center max-w-sm">
                {Icon && <Icon className="w-14 h-14 text-amber-500 mx-auto mb-4" />}
                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">{title}</h3>
                <p className="my-4 text-sm text-stone-600 dark:text-stone-300">{message}</p>
                <div className="flex justify-center gap-4 mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600 rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`px-6 py-2 font-bold text-white rounded-lg transition-colors ${confirmButtonClasses[variant]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
