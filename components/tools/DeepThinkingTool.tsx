
import React from 'react';
import { BrainCircuitIcon } from '../icons';

const DeepThinkingTool: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-10 bg-stone-900/50 text-amber-200">
            <div className="bg-amber-900/20 p-6 rounded-full mb-6 border border-amber-500/30">
                <BrainCircuitIcon className="w-20 h-20 animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold mb-4">حکیم دانا (Reasoning)</h3>
            <p className="text-stone-400 max-w-md leading-relaxed">
                مدل تفکر عمیق در حال مدیتیشن است. این قابلیت برای حل مسائل پیچیده، استدلال منطقی و تحلیل‌های فلسفی به زودی فعال می‌شود.
            </p>
            <div className="mt-8 px-4 py-2 bg-amber-500/20 text-amber-300 rounded-full text-sm font-semibold border border-amber-500/30">
                به زودی در دسترس خواهد بود
            </div>
        </div>
    );
};

export default DeepThinkingTool;
