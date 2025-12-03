
import React, { useEffect, useState } from 'react';
import { BrainCircuitIcon, ArrowLeftIcon } from '../icons';

interface FocusModeStepProps {
    onStartReading: () => void;
}

const FocusModeStep: React.FC<FocusModeStepProps> = ({ onStartReading }) => {
    const [isFocusAnimating, setIsFocusAnimating] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        const timer = setTimeout(() => setIsFocusAnimating(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center text-white animate-fade-in">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            
            <div className={`relative z-10 text-center px-6 max-w-xl transition-all duration-1000 ${isFocusAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-amber-500/10 border-2 border-amber-500/50 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 animate-ping" style={{ animationDuration: '3s' }}></div>
                    <BrainCircuitIcon className="w-12 h-12 text-amber-400" />
                </div>
                
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                    ذهن خود را متمرکز کنید
                </h2>
                
                <p className="text-lg text-stone-300 leading-relaxed mb-12">
                    برای درک عمیق این مفاهیم، نیاز به حضور کامل دارید.
                    <br/>
                    عوامل مزاحم را دور کنید. نفس عمیقی بکشید.
                    <br/>
                    <span className="text-amber-400 font-bold mt-2 block">آیا برای ورود به دنیای معنا آماده‌اید؟</span>
                </p>

                <button 
                    onClick={onStartReading}
                    className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-amber-600 font-lg rounded-full hover:bg-amber-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 focus:ring-offset-gray-900"
                >
                    <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-900"></span>
                    <span className="relative flex items-center gap-3">
                        آماده‌ام، شروع کن
                        <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </span>
                </button>
            </div>
        </div>
    );
};

export default FocusModeStep;
