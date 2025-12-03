
import React from 'react';
import { useAppDispatch } from '../../AppContext';
import { View } from '../../types';
import { MicrophoneIcon, ArrowLeftIcon } from '../icons';

const LiveChat: React.FC = () => {
    const dispatch = useAppDispatch();

    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-10 bg-stone-900/50 text-white rounded-2xl border border-stone-800">
            <div className="bg-red-900/20 p-6 rounded-full mb-6 border border-red-500/30">
                <MicrophoneIcon className="w-16 h-16 text-red-400 animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold mb-4">هم‌کلام (Live API)</h3>
            <p className="text-stone-400 max-w-md mb-8 leading-relaxed">
                برای تجربه کامل گفتگوی صوتی بی‌درنگ با هوش مصنوعی، لطفاً به بخش اختصاصی «همراه معنا» مراجعه کنید که برای این منظور بهینه‌سازی شده است.
            </p>
            <button 
                onClick={() => dispatch({ type: 'SET_VIEW', payload: View.MeaningCompanion })}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg flex items-center gap-2 transition-transform transform hover:scale-105"
            >
                <span>ورود به اتاق گفتگو</span>
                <ArrowLeftIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default LiveChat;
