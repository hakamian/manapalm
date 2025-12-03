import React from 'react';
import { useAppDispatch } from '../AppContext';
import { SparklesIcon } from './icons';

interface ReflectionAnalysisUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

const ReflectionAnalysisUnlockModal: React.FC<ReflectionAnalysisUnlockModalProps> = ({ isOpen, onClose, onUnlock }) => {
  if (!isOpen) return null;

  const handleUnlockClick = () => {
    onUnlock();
  };
  
  const socialInvestment = 90000;
  const totalCost = 100000;
  const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-md p-8 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale text-center"
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes fade-in-scale { to { transform: scale(1); opacity: 1; } }
          .animate-fade-in-scale { animation: fade-in-scale 0.3s ease-out forwards; }
        `}</style>
        
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-900/50 border-2 border-blue-500 mb-4">
            <SparklesIcon className="h-10 w-10 text-blue-300" />
        </div>

        <h2 className="text-2xl font-bold mb-2 text-blue-300">
            فعال‌سازی «آینه هوشمانا تاملات»
        </h2>
        <p className="text-gray-300 mb-6">
            با این قابلیت ویژه، هوشمانا تمام یادداشت‌های اخیر شما را تحلیل کرده و یک گزارش عمیق از الگوهای فکری، احساسی و ارتباط آن‌ها با هدف اصلی‌تان ارائه می‌دهد.
        </p>

        <div className="bg-gray-700/50 rounded-lg p-4 text-center mb-6 border border-gray-600">
            <h3 className="font-semibold text-lg">با کاشت «نخل تامل» این قابلیت را فعال کنید</h3>
            <div className="mt-2 space-y-1">
                 <div>
                    <p className="text-sm font-semibold text-green-300">سرمایه‌گذاری اجتماعی شما</p>
                    <span className="text-2xl font-bold text-green-300">{formatPrice(socialInvestment)}</span>
                    <span className="text-lg font-semibold text-green-300"> تومان</span>
                </div>
                <p className="text-xs text-gray-500">
                    (از هزینه کل: {formatPrice(totalCost)} تومان)
                </p>
            </div>
             <p className="text-xs text-gray-400 mt-2">(هر خرید برای یک بار تحلیل می‌باشد)</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-4">
            <button
              onClick={handleUnlockClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors w-full sm:w-auto"
            >
              کاشت نخل و فعال‌سازی
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-md transition-colors w-full sm:w-auto"
            >
              فعلا نه
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReflectionAnalysisUnlockModal;