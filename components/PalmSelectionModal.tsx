import React from 'react';
import { PalmType, User } from '../types';
import { XMarkIcon, LockClosedIcon } from './icons';
import InstallmentInfo from './InstallmentInfo';
import { canPurchaseMeaningPalm } from '../services/gamificationService';
import { useAppDispatch } from '../AppContext';

interface PalmSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  palmTypes: PalmType[];
  onSelectPalm: (palm: PalmType) => void;
  user: User | null;
}

const PalmSelectionModal: React.FC<PalmSelectionModalProps> = ({ isOpen, onClose, palmTypes, onSelectPalm, user }) => {
  const dispatch = useAppDispatch();
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-4xl p-6 relative flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-white" aria-label="Close">
          <XMarkIcon />
        </button>
        <div className="text-center mb-6 flex-shrink-0">
            <h2 className="text-2xl font-bold">انتخاب نیت و کاشت نخل</h2>
            <p className="text-gray-400 mt-2">نیت خود را انتخاب کنید تا یک نخل به نام شما و با معنای دلخواهتان کاشته شود.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2">
            {palmTypes.map(palm => {
                if (palm.id === 'p_heritage_meaning' && !canPurchaseMeaningPalm(user)) {
                    return (
                        <div key={palm.id} className="bg-gray-700 p-5 rounded-lg flex flex-col justify-between border border-gray-600">
                            <div className="opacity-60">
                                <div className="flex items-center justify-center gap-2">
                                   <LockClosedIcon className="w-8 h-8 text-yellow-400"/>
                                   <h3 className="text-xl font-semibold text-gray-400">{palm.name}</h3>
                                </div>
                                <p className="text-gray-500 text-sm my-2 h-12">{palm.description}</p>
                            </div>
                            <div className="mt-4">
                                <div className="text-center space-y-1 my-4 opacity-50">
                                    <div>
                                        <p className="text-xs font-semibold text-green-300">مبلغ سرمایه‌گذاری اجتماعی شما</p>
                                        <span className="text-2xl font-bold text-green-300">{(palm.price * 0.9).toLocaleString('fa-IR')}</span>
                                        <span className="text-lg font-semibold text-green-300"> تومان</span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        (از هزینه کل: {palm.price.toLocaleString('fa-IR')} تومان)
                                    </p>
                                </div>
                                <p className="text-sm text-yellow-400/50 mt-2 text-center">+{palm.points.toLocaleString('fa-IR')} امتیاز</p>
                                <p className="text-sm text-amber-300/70 my-2 text-center">یک دستاورد ارزشمند در انتظار شماست.</p>
                                <button onClick={() => { onClose(); dispatch({ type: 'TOGGLE_MEANING_PALM_ACTIVATION_MODAL', payload: true }); }} className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-md transition-colors">
                                    مشاهده مسیر فعال‌سازی
                                </button>
                            </div>
                        </div>
                    );
                }
                return (
                    <div key={palm.id} className="bg-gray-700 p-5 rounded-lg flex flex-col justify-between border border-gray-600 hover:border-green-500 transition-colors">
                        <div>
                            <h3 className="text-xl font-semibold text-white">{palm.name}</h3>
                            <p className="text-gray-300 text-sm my-2 h-12">{palm.description}</p>
                        </div>
                        <div className="mt-4">
                            <div className="text-center space-y-1 my-4">
                                <div>
                                    <p className="text-xs font-semibold text-green-300">مبلغ سرمایه‌گذاری اجتماعی شما</p>
                                    <span className="text-2xl font-bold text-green-300">{(palm.price * 0.9).toLocaleString('fa-IR')}</span>
                                    <span className="text-lg font-semibold text-green-300"> تومان</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    (از هزینه کل: {palm.price.toLocaleString('fa-IR')} تومان)
                                </p>
                            </div>
                            <p className="text-sm text-yellow-400 mt-2 text-center">+{palm.points.toLocaleString('fa-IR')} امتیاز</p>
                            <InstallmentInfo user={user} price={palm.price} />
                            <button onClick={() => onSelectPalm(palm)} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-md transition-colors">
                                انتخاب
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default PalmSelectionModal;