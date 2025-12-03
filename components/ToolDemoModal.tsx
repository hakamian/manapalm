
import React from 'react';
import { CreationToolConfig } from '../utils/aiStudioConfig';
import Modal from './Modal';
import { SparklesIcon, LockClosedIcon, CheckCircleIcon, PhotoIcon, VideoCameraIcon, DocumentTextIcon } from './icons';

interface ToolDemoModalProps {
    isOpen: boolean;
    onClose: () => void;
    tool: CreationToolConfig;
    onAction: () => void;
    actionLabel: string;
}

const ToolDemoModal: React.FC<ToolDemoModalProps> = ({ isOpen, onClose, tool, onAction, actionLabel }) => {
    
    const renderVisualDemo = () => (
        <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="aspect-square rounded-lg bg-cover bg-center animate-pulse-slow" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1633113215882-52d93396399f?q=80&w=400&auto=format&fit=crop)' }}></div>
            <div className="aspect-square rounded-lg bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=400&auto=format&fit=crop)' }}></div>
            <div className="aspect-square rounded-lg bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1620641788427-3904ae6f90f5?q=80&w=400&auto=format&fit=crop)' }}></div>
            <div className="aspect-square rounded-lg bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&auto=format&fit=crop)' }}></div>
        </div>
    );

    const renderTextDemo = () => (
        <div className="bg-stone-800 p-4 rounded-xl mb-6 border border-stone-700">
            <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0"></div>
                <div className="bg-gray-700 rounded-lg rounded-tl-none p-3 text-xs text-gray-300 w-3/4">
                    یک داستان کوتاه درباره نخل بنویس...
                </div>
            </div>
            <div className="flex items-start gap-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-green-600 flex-shrink-0 flex items-center justify-center"><SparklesIcon className="w-4 h-4 text-white"/></div>
                <div className="bg-green-900/30 border border-green-500/30 rounded-lg rounded-tr-none p-3 text-xs text-gray-200 w-full">
                    <p className="leading-relaxed">
                        در دل کویر، جایی که خورشید بر ماسه‌ها بوسه می‌زند، نخلی ایستاده بود. او تنها نبود، زیرا ریشه‌هایش داستان هزاران مسافر تشنه را در سینه داشت...
                    </p>
                </div>
            </div>
        </div>
    );

    const renderGenericDemo = () => (
        <div className="bg-gradient-to-br from-stone-800 to-stone-900 p-8 rounded-xl mb-6 flex flex-col items-center justify-center text-center border border-stone-700">
            <div className={`p-4 rounded-full bg-${tool.color}-500/20 mb-4`}>
                {React.createElement(tool.icon, { className: `w-12 h-12 text-${tool.color}-400` })}
            </div>
            <p className="text-stone-300 text-sm">
                با استفاده از <strong>{tool.title}</strong>، قدرت هوش مصنوعی را در دستان خود بگیرید و ایده‌هایتان را به واقعیت تبدیل کنید.
            </p>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-[90vw] max-w-md bg-stone-900 text-white rounded-2xl border border-stone-700 p-6 relative overflow-hidden">
                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-${tool.color}-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none`}></div>
                
                <div className="text-center mb-6 relative z-10">
                    <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                        {tool.title}
                        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">ویژه</span>
                    </h2>
                    <p className="text-stone-400 text-sm">{tool.description}</p>
                </div>

                <div className="relative z-10">
                    {tool.category === 'visual' ? renderVisualDemo() : 
                     tool.category === 'text' ? renderTextDemo() : 
                     renderGenericDemo()}
                </div>

                <div className="space-y-3 relative z-10">
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span>دسترسی نامحدود به موتورهای AI پیشرفته</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span>ذخیره خودکار در گاهشمار شخصی</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span>سرعت پردازش بالا و بدون صف</span>
                    </div>
                </div>

                <button 
                    onClick={onAction}
                    className={`w-full mt-8 bg-${tool.color}-600 hover:bg-${tool.color}-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-${tool.color}-900/40 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2`}
                >
                    {actionLabel === 'login' ? <LockClosedIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                    {actionLabel === 'login' ? 'ورود برای استفاده' : 'فعال‌سازی ابزار'}
                </button>
                
                <button onClick={onClose} className="w-full mt-3 text-xs text-stone-500 hover:text-stone-300">
                    فقط می‌خواهم نگاه کنم
                </button>
            </div>
        </Modal>
    );
};

export default ToolDemoModal;
