import React from 'react';
import { useAppDispatch } from '../AppContext';
import { SparklesIcon, ClockIcon } from './icons';

interface CompanionExtendModalProps {
  isOpen: boolean;
  onClose: () => void; // This is "End Session"
  onExtend: () => void;
  userManaPoints: number;
}

const EXTENSION_COST = 200; // Mana points

const CompanionExtendModal: React.FC<CompanionExtendModalProps> = ({ isOpen, onClose, onExtend, userManaPoints }) => {
  if (!isOpen) return null;

  const dispatch = useAppDispatch();
  const hasEnoughPoints = userManaPoints >= EXTENSION_COST;
  
  const handlePurchaseAndClose = () => {
    dispatch({ type: 'START_COMPANION_PURCHASE' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[70] flex items-center justify-center p-4">
      <div
        className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-md p-8 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale text-center"
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes fade-in-scale { to { transform: scale(1); opacity: 1; } }
          .animate-fade-in-scale { animation: fade-in-scale 0.3s ease-out forwards; }
        `}</style>
        
        <ClockIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />

        <h2 className="text-2xl font-bold mb-2 text-yellow-300">
          زمان شما به پایان رسید
        </h2>
        
        {hasEnoughPoints ? (
          <>
            <p className="text-gray-300 mb-6">
              آیا مایلید با استفاده از امتیاز معنای خود، جلسه را برای <strong>۵ دقیقه دیگر</strong> تمدید کنید؟
            </p>
            <div className="bg-gray-700/50 rounded-lg p-4 text-center mb-6 border border-gray-600">
                <h3 className="font-semibold text-lg">هزینه تمدید:</h3>
                <div className="mt-2 flex items-center justify-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-indigo-400" />
                    <span className="text-2xl font-bold text-indigo-300">{EXTENSION_COST.toLocaleString('fa-IR')}</span>
                    <span className="text-lg font-semibold text-indigo-300">امتیاز معنا</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">موجودی شما: {userManaPoints.toLocaleString('fa-IR')} امتیاز</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-4">
              <button onClick={onExtend} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition-colors w-full sm:w-auto">
                تمدید برای ۵ دقیقه
              </button>
              <button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-md transition-colors w-full sm:w-auto">
                پایان جلسه
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-300 mb-6">
              امتیاز معنای شما برای تمدید کافی نیست. برای ادامه گفتگو، می‌توانید با کاشت <strong>«نخل آگاهی»</strong>، این قابلیت را برای <strong>یک هفته</strong> فعال کرده و به اهداف اجتماعی ما کمک کنید.
            </p>
            <div className="bg-gray-700/50 rounded-lg p-4 text-center mb-6 border border-gray-600">
                <h3 className="font-semibold text-lg">گزینه جایگزین: فعال‌سازی هفتگی</h3>
                <p className="text-2xl font-bold text-green-300 mt-2">کاشت نخل آگاهی</p>
                <p className="text-xs text-gray-400 mt-2">
                    با این کار، شما مستقیماً در اشتغال‌زایی و آبادانی مناطق محروم سهیم می‌شوید.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-4">
              <button onClick={handlePurchaseAndClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors w-full sm:w-auto">
                فعال‌سازی هفتگی و مشارکت
              </button>
              <button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-md transition-colors w-full sm:w-auto">
                پایان جلسه
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompanionExtendModal;
