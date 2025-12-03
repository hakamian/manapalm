
import React from 'react';
import { WandSparklesIcon } from '../icons';

const ImageEditTool: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-10 bg-stone-900/50 text-indigo-200">
            <div className="bg-indigo-900/20 p-6 rounded-full mb-6 border border-indigo-500/30">
                <WandSparklesIcon className="w-20 h-20 animate-pulse" />
            </div>
            <h3 className="text-3xl font-bold mb-4">ویرایشگر جادویی</h3>
            <p className="text-stone-400 max-w-md leading-relaxed">
                این ابزار در حال آماده‌سازی است. به زودی می‌توانید با استفاده از دستورات متنی ساده، تصاویر خود را ویرایش کنید، اشیاء را حذف کنید یا تغییر دهید.
            </p>
            <div className="mt-8 px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-semibold border border-indigo-500/30">
                به زودی در دسترس خواهد بود
            </div>
        </div>
    );
};

export default ImageEditTool;
