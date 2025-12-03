
import React from 'react';
import { MegaphoneIcon } from '../icons';

const TextToSpeechTool: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-10 bg-stone-900/50 text-teal-200">
            <div className="bg-teal-900/20 p-6 rounded-full mb-6 border border-teal-500/30">
                <MegaphoneIcon className="w-20 h-20 animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold mb-4">آوای سخن (TTS)</h3>
            <p className="text-stone-400 max-w-md leading-relaxed">
                موتور تبدیل متن به گفتار در حال گرم شدن است. به زودی می‌توانید متن‌های خود را به صداهای طبیعی و زنده تبدیل کنید.
            </p>
            <div className="mt-8 px-4 py-2 bg-teal-500/20 text-teal-300 rounded-full text-sm font-semibold border border-teal-500/30">
                به زودی در دسترس خواهد بود
            </div>
        </div>
    );
};

export default TextToSpeechTool;
