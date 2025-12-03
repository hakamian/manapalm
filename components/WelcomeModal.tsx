import React from 'react';
import { SparklesIcon } from './icons';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToProfile: () => void;
  userName?: string;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onGoToProfile, userName }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div
        className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-md p-8 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale text-center"
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes fade-in-scale {
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-fade-in-scale {
            animation: fade-in-scale 0.3s ease-out forwards;
          }
        `}</style>
        
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-700 mb-4">
            <SparklesIcon className="h-10 w-10 text-green-300" />
        </div>

        <h2 id="welcome-modal-title" className="text-2xl font-bold mb-2 text-green-300">
            {userName ? `سلام ${userName} عزیز،` : ''} به خانواده نخلستان معنا خوش آمدید!
        </h2>
        <p className="text-gray-300 mb-6">
            سفر شما برای ایجاد معنای پایدار از همین حالا شروع شد.
        </p>

        <div className="bg-gray-700/50 rounded-lg p-4 text-center mb-6 border border-gray-600">
            <h3 className="font-semibold text-lg">پروفایل خود را کامل کنید!</h3>
            <p className="text-gray-400 mt-2">
                با کامل کردن اطلاعات پروفایل خود، امتیاز هدیه بگیرید و سفر خود را شخصی‌سازی کنید.
            </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-4">
             <button
              onClick={onGoToProfile}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition-colors w-full sm:w-auto"
            >
              کامل کردن پروفایل
            </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;