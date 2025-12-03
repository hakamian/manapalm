
import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppState } from '../../AppContext';
import { CpuChipIcon, SparklesIcon, CheckIcon, ArrowLeftIcon, GlobeIcon } from '../icons';
import { generateWebPrototype, getFallbackMessage } from '../../services/geminiService';
import { User, View } from '../../types';

const GENERATION_COST = 50;

// Inline Icons for Full Screen toggle to avoid dependency issues
const ArrowsPointingOutIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
);

const ArrowsPointingInIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
    </svg>
);

const CodeArchitectTool: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [prompt, setPrompt] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
    const [copySuccess, setCopySuccess] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const hasEnoughPoints = user ? user.manaPoints >= GENERATION_COST : false;

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsFullScreen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const handleGenerate = async () => {
        if (!user) return;
        if (!prompt.trim()) {
            setError('لطفاً توضیحی برای طرح خود بنویسید.');
            return;
        }
        if (!hasEnoughPoints) {
            setError(`برای استفاده از این ابزار به ${GENERATION_COST} امتیاز معنا نیاز دارید.`);
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            // Deduct points first (optimistic UI)
            dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: GENERATION_COST, action: 'استفاده از معمار کد' } });

            const code = await generateWebPrototype(prompt);
            setGeneratedCode(code);
            setActiveTab('preview'); // Switch to preview on success
        } catch (err) {
            console.error(err);
            setError("خطا در تولید کد. لطفاً دوباره تلاش کنید.");
            // Ideally refund points here if it failed, but for simplicity keeping it linear
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleOrderProfessional = () => {
        // Navigate to the professional service page
        dispatch({ type: 'SET_VIEW', payload: View['digital-heritage-architect'] });
    };

    return (
        <div className={`w-full h-full flex flex-col bg-[#0F172A] text-gray-200 rounded-2xl overflow-hidden border border-stone-800 shadow-2xl ${isFullScreen ? 'fixed inset-0 z-[100] rounded-none' : ''}`}>
            {/* Header */}
            <div className="bg-[#1E293B] p-4 border-b border-stone-700 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-stone-800 rounded-lg border border-stone-600">
                        <CpuChipIcon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">معمار کد (Code Architect)</h3>
                        <p className="text-xs text-gray-400">تبدیل ایده به پروتوتایپ وب (HTML/Tailwind)</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                     {isFullScreen && (
                        <button 
                            onClick={() => setIsFullScreen(false)}
                            className="text-xs bg-stone-700 hover:bg-stone-600 text-white px-3 py-1.5 rounded-md border border-stone-500 transition-colors"
                        >
                            بستن (Esc)
                        </button>
                    )}
                    {user && !isFullScreen && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-800 rounded-full border border-stone-700">
                            <span className="text-xs text-gray-400">موجودی:</span>
                            <span className={`text-sm font-bold ${hasEnoughPoints ? 'text-indigo-300' : 'text-red-400'}`}>
                                {user.manaPoints.toLocaleString('fa-IR')}
                            </span>
                            <span className="text-[10px] text-gray-500">معنا</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                {/* Sidebar: Input (Hidden in Full Screen Mode unless needed, but keeping it for now or making it collapsible could be better. For simplicity, we keep it but layout changes) */}
                <div className={`${isFullScreen ? 'hidden lg:flex lg:w-80' : 'w-full lg:w-1/3'} p-6 bg-[#0F172A] border-b lg:border-b-0 lg:border-l border-stone-800 flex flex-col gap-4 overflow-y-auto custom-scrollbar`}>
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">توصیف پروژه</label>
                        <p className="text-xs text-gray-500 mb-3">هرچه دقیق‌تر بنویسید، نتیجه بهتر خواهد بود. (مثلاً: یک کارت محصول با تصویر، عنوان، قیمت و دکمه خرید سبز رنگ)</p>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="اینجا بنویسید: یک صفحه فرود برای فروش قهوه با تم تیره..."
                            className="w-full h-48 bg-[#1E293B] border border-stone-700 rounded-xl p-4 text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim() || !hasEnoughPoints}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                            isLoading 
                            ? 'bg-stone-700 cursor-wait' 
                            : !hasEnoughPoints 
                                ? 'bg-red-900/50 text-red-300 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transform hover:scale-[1.02]'
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>در حال معماری...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                <span>تولید کد ({GENERATION_COST} امتیاز)</span>
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-xs text-center">
                            {error}
                        </div>
                    )}
                    
                    <div className="mt-auto text-[10px] text-gray-600 text-center">
                        قدرت گرفته از مدل Gemini 2.5 Pro
                    </div>
                </div>

                {/* Main Area: Output */}
                <div className="flex-grow flex flex-col bg-[#1E293B] relative overflow-hidden">
                    {/* Toolbar */}
                    <div className="h-12 border-b border-stone-700 flex items-center justify-between px-4 bg-[#0F172A] flex-shrink-0">
                        <div className="flex bg-stone-800 rounded-lg p-1 gap-1">
                            <button 
                                onClick={() => setActiveTab('preview')}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'preview' ? 'bg-stone-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                پیش‌نمایش زنده
                            </button>
                            <button 
                                onClick={() => setActiveTab('code')}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'code' ? 'bg-stone-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                مشاهده کد
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {generatedCode && (
                                <button
                                    onClick={() => setIsFullScreen(!isFullScreen)}
                                    className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${isFullScreen ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                    title={isFullScreen ? "خروج (Esc)" : "تمام صفحه"}
                                >
                                    {isFullScreen ? <ArrowsPointingInIcon className="w-4 h-4"/> : <ArrowsPointingOutIcon className="w-4 h-4"/>}
                                    <span className="hidden sm:inline">{isFullScreen ? 'کوچک‌نمایی' : 'تمام صفحه'}</span>
                                </button>
                            )}
                            
                            {generatedCode && activeTab === 'code' && (
                                <button 
                                    onClick={handleCopyCode} 
                                    className="text-xs flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-900/20 px-3 py-1.5 rounded-md border border-emerald-500/30"
                                >
                                    {copySuccess ? <CheckIcon className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-current rounded-sm"></div>}
                                    {copySuccess ? 'کپی شد' : 'کپی کد'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow relative overflow-hidden">
                        {generatedCode ? (
                            activeTab === 'preview' ? (
                                <div className="w-full h-full flex flex-col">
                                    <iframe
                                        title="Generated Preview"
                                        srcDoc={generatedCode}
                                        className="w-full flex-grow border-none bg-white"
                                        sandbox="allow-scripts"
                                    />
                                    {/* Upsell Banner - Hide in FullScreen if desired, or keep minimal */}
                                    {!isFullScreen && (
                                        <div className="bg-stone-900 border-t border-amber-500/30 p-3 flex items-center justify-between animate-fade-in-up flex-shrink-0">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-amber-500/20 p-2 rounded-full">
                                                    <GlobeIcon className="w-5 h-5 text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">از این طرح خوشتان آمد؟</p>
                                                    <p className="text-xs text-stone-400">آن را به یک وب‌سایت واقعی، امن و با دامنه اختصاصی تبدیل کنید.</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={handleOrderProfessional}
                                                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                سفارش ساخت حرفه‌ای
                                                <ArrowLeftIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <pre className="w-full h-full p-4 overflow-auto text-xs font-mono text-emerald-300 bg-[#0B0F17] custom-scrollbar text-left" dir="ltr">
                                    {generatedCode}
                                </pre>
                            )
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-600">
                                <CpuChipIcon className="w-20 h-20 opacity-20 mb-4" />
                                <p className="text-sm">هنوز کدی تولید نشده است.</p>
                                <p className="text-xs mt-2 opacity-60">ایده خود را در پنل سمت راست وارد کنید.</p>
                            </div>
                        )}
                        
                        {isLoading && (
                             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                <div className="font-mono text-emerald-500 text-lg animate-pulse">
                                    &gt; Generating_UI_Components...
                                </div>
                                <div className="mt-2 w-64 h-1 bg-stone-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 animate-loading-bar"></div>
                                </div>
                             </div>
                        )}
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes loading-bar {
                    0% { width: 0%; margin-left: 0; }
                    50% { width: 100%; margin-left: 0; }
                    100% { width: 0%; margin-left: 100%; }
                }
                .animate-loading-bar {
                    animation: loading-bar 1.5s infinite ease-in-out;
                }
                 @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default CodeArchitectTool;
