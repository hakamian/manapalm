
import React from 'react';
import { ArrowPathIcon, ExclamationTriangleIcon } from './icons';

interface CrashFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

const CrashFallback: React.FC<CrashFallbackProps> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center" dir="rtl">
            <div className="bg-gray-800 p-8 rounded-2xl border border-red-500/30 shadow-2xl max-w-md w-full animate-fade-in">
                <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500/50">
                    <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
                </div>
                
                <h2 className="text-2xl font-bold mb-3 text-white">متاسفانه مشکلی پیش آمد</h2>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    یک خطای غیرمنتظره رخ داده است. گزارش این خطا برای تیم فنی ارسال شد و ما به زودی آن را بررسی می‌کنیم.
                </p>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-6 p-3 bg-black/50 rounded text-left text-xs text-red-300 font-mono overflow-auto max-h-32 dir-ltr">
                        {error.message}
                    </div>
                )}

                <div className="space-y-3">
                    <button 
                        onClick={resetErrorBoundary}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        تلاش مجدد
                    </button>
                    
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-3 px-6 rounded-xl transition-all"
                    >
                        بازگشت به صفحه اصلی
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CrashFallback;
