
import React from 'react';
import { CpuChipIcon } from '../icons';

const CodeArchitectTool: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-10 bg-stone-900/50 text-emerald-200 rounded-2xl border border-stone-800">
            <div className="bg-emerald-900/20 p-6 rounded-full mb-6 border border-emerald-500/30">
                <CpuChipIcon className="w-20 h-20 animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold mb-4">معمار کد</h3>
            <p className="text-stone-400 max-w-md leading-relaxed">
                به زودی می‌توانید ایده‌های خود را به کد واقعی تبدیل کنید. این ابزار قدرتمند، برنامه‌نویس شخصی شما خواهد بود.
            </p>
            <div className="mt-8 px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-semibold border border-emerald-500/30">
                به زودی در دسترس خواهد بود
            </div>
        </div>
    );
};

export default CodeArchitectTool;
