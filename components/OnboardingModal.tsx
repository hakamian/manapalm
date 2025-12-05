
import React from 'react';
import Modal from './Modal.tsx';
import { LeafIcon, CompassIcon, UsersIcon, ArrowLeftIcon } from './icons.tsx';
import { useAppDispatch } from '../AppContext.tsx';
import { View } from '../types.ts';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();

    const handleNavigate = (view: View) => {
        dispatch({ type: 'SET_VIEW', payload: view });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 max-w-2xl w-full text-center">
                <h2 className="text-2xl font-bold mb-2 text-stone-800 dark:text-white">از کجا می‌خواهید شروع کنید؟</h2>
                <p className="text-stone-500 dark:text-stone-400 mb-8">مسیر خود را در نخلستان معنا انتخاب کنید.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button 
                        onClick={() => handleNavigate(View.HallOfHeritage)}
                        className="group bg-stone-100 dark:bg-stone-800/50 p-6 rounded-2xl border border-stone-200 dark:border-stone-700 hover:border-green-500 transition-all flex flex-col items-center"
                    >
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <LeafIcon className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-1">کاشت میراث</h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400">ثبت نیت و کاشت نخل</p>
                    </button>

                    <button 
                        onClick={() => handleNavigate(View.HerosJourney)}
                        className="group bg-stone-100 dark:bg-stone-800/50 p-6 rounded-2xl border border-stone-200 dark:border-stone-700 hover:border-amber-500 transition-all flex flex-col items-center"
                    >
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <CompassIcon className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-1">سفر قهرمانی</h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400">کشف خود و رشد</p>
                    </button>

                    <button 
                        onClick={() => handleNavigate(View.CommunityHub)}
                        className="group bg-stone-100 dark:bg-stone-800/50 p-6 rounded-2xl border border-stone-200 dark:border-stone-700 hover:border-blue-500 transition-all flex flex-col items-center"
                    >
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <UsersIcon className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-1">کانون جامعه</h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400">همدلی و مشارکت</p>
                    </button>
                </div>

                <button onClick={onClose} className="mt-8 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 flex items-center justify-center gap-2 mx-auto text-sm">
                    <ArrowLeftIcon className="w-4 h-4" />
                    بعداً تصمیم می‌گیرم
                </button>
            </div>
        </Modal>
    );
};

export default OnboardingModal;
