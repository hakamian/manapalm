import React from 'react';
import { Coupon } from '../types.ts';
import Modal from './Modal';
import { SparklesIcon, ArrowLeftIcon } from './icons';

interface CooperationCouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    coupon: Coupon;
    onNavigate: () => void;
}

const CooperationCouponModal: React.FC<CooperationCouponModalProps> = ({ isOpen, onClose, coupon, onNavigate }) => {
    
    const handleNavigateAndClose = () => {
        onNavigate();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 text-center max-w-md">
                <div className="relative w-24 h-24 mx-auto mb-4">
                     <SparklesIcon className="w-24 h-24 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200">یک پاداش برای همراهی شما!</h2>
                <p className="my-3 text-stone-600 dark:text-stone-300">
                    از سرمایه‌گذاری سخاوتمندانه شما در جنبش سپاسگزاریم. به پاس این همراهی، یک 
                    <span className="font-bold"> «کوپن همیاری» </span>
                    به شما تعلق گرفت.
                </p>
                <div className="my-4 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-dashed border-amber-300 dark:border-amber-700">
                    <p className="font-bold text-lg">{coupon.title}</p>
                    <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-300 my-2">{coupon.value.toLocaleString('fa-IR')} تومان</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">برای استفاده در سرویس «معمار میراث دیجیتال»</p>
                </div>
                <button
                    onClick={handleNavigateAndClose}
                    className="w-full mt-4 bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                    <span>اطلاعات بیشتر و استفاده از کوپن</span>
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                 <button onClick={onClose} className="text-sm text-stone-500 hover:underline mt-4">بعداً بررسی می‌کنم</button>
            </div>
        </Modal>
    );
};

export default CooperationCouponModal;