import React from 'react';
import Modal from './Modal.tsx';
import { SparklesIcon } from './icons.tsx';
import { STORAGE_UPGRADE_COST_POINTS, STORAGE_UPGRADE_AMOUNT } from '../types.ts';

interface PurchaseStorageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userPoints: number;
}

const PurchaseStorageModal: React.FC<PurchaseStorageModalProps> = ({ isOpen, onClose, onConfirm, userPoints }) => {
    const hasEnoughPoints = userPoints >= STORAGE_UPGRADE_COST_POINTS;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 text-center max-w-sm">
                <SparklesIcon className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">افزایش ظرفیت گالری</h2>
                <p className="my-4 text-stone-600 dark:text-stone-300">
                    با <span className="font-bold text-amber-500">{STORAGE_UPGRADE_COST_POINTS.toLocaleString('fa-IR')} امتیاز</span>، ظرفیت گالری خلاقیت خود را <span className="font-bold text-amber-500">{STORAGE_UPGRADE_AMOUNT.toLocaleString('fa-IR')}</span> اثر دیگر افزایش دهید.
                </p>
                <div className="p-3 bg-stone-100 dark:bg-stone-700/50 rounded-lg">
                    <p className="text-sm">موجودی امتیاز شما:</p>
                    <p className="font-bold text-lg">{userPoints.toLocaleString('fa-IR')}</p>
                </div>
                {!hasEnoughPoints && (
                    <p className="text-red-500 text-sm mt-3 font-semibold">امتیاز شما برای این خرید کافی نیست.</p>
                )}
                <div className="flex justify-center gap-4 mt-6">
                    <button onClick={onClose} className="px-6 py-2 font-semibold text-stone-700 bg-stone-100 dark:bg-stone-600 rounded-lg hover:bg-stone-200">انصراف</button>
                    <button onClick={onConfirm} disabled={!hasEnoughPoints} className="px-6 py-2 font-bold text-white bg-green-600 rounded-lg disabled:bg-green-300 hover:bg-green-700">تایید و خرید</button>
                </div>
            </div>
        </Modal>
    );
};

export default PurchaseStorageModal;