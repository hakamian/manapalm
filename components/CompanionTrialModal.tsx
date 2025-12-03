import React from 'react';
import { useAppDispatch } from '../AppContext';
import { View } from '../types';
import { SparklesIcon, ArrowLeftIcon } from './icons';

interface CompanionTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

const CompanionTrialModal: React.FC<CompanionTrialModalProps> = ({ isOpen, onClose, onStart }) => {
  if (!isOpen) return null;

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
        
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-900/50 border-2 border-yellow-500 mb-4">
            <SparklesIcon className="h-10 w-10 text-yellow-300" />
        </div>

        <h2 className="text-2xl font-bold mb-2 text-yellow-300">
            امتحان «همراه معنا»
        </h2>
        <p className="text-gray-300 mb-6">
            «همراه معنا» یک <strong>مربی صوتی بی‌درنگ</strong> برای کاوش در دنیای درون شماست. با او صحبت کنید، سوال بپرسید و به شفافیت برسید.
            <br/><br/>
            شما یک <strong>دوره آزمایشی ۹۰ ثانیه‌ای رایگان</strong> برای تجربه این قابلیت در اختیار دارید.
        </p>

        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-reverse sm:space-x-4">
             <button
              onClick={onStart}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <SparklesIcon className="w-5 h-5"/>
              <span>شروع دوره آزمایشی</span>
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

export default CompanionTrialModal;
