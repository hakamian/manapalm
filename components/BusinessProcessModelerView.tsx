import React, { useState } from 'react';
import { useAppDispatch } from '../AppContext';
import { View, ProcessStep } from '../types';
import { ArrowLeftIcon, SparklesIcon, CpuChipIcon, ArrowDownTrayIcon } from './icons';
import { generateBusinessProcess } from '../services/geminiService';

const BusinessProcessModelerView: React.FC = () => {
    const dispatch = useAppDispatch();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ steps: ProcessStep[] } | null>(null);

    const templates = [
        { name: 'استخدام', prompt: 'فرآیند استخدام یک نیروی جدید از زمان انتشار آگهی تا عقد قرارداد' },
        { name: 'پشتیبانی مشتری', prompt: 'فرآیند رسیدگی به تیکت پشتیبانی مشتری از زمان ثبت تا حل مشکل و دریافت بازخورد' },
        { name: 'تولید محتوا', prompt: 'فرآیند تولید و انتشار یک مقاله وبلاگ از ایده تا انتشار در شبکه‌های اجتماعی' },
    ];
    
    const handleUseTemplate = (prompt: string) => {
        setPrompt(prompt);
    };

    const exportToMarkdown = () => {
        if (!result || !result.steps) return;
        
        let markdownContent = `# رویه عملیاتی استاندارد برای: ${prompt}\n\n`;
        
        result.steps.forEach((step, index) => {
            markdownContent += `## مرحله ${index + 1}: ${step.title}\n`;
            markdownContent += `**مسئول:** ${step.responsible}\n\n`;
            markdownContent += `${step.description}\n\n`;
            markdownContent += `---\n\n`;
        });

        const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sop.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await generateBusinessProcess(prompt);
            setResult(response);
        } catch (e) {
            console.error(e);
            setError("متاسفانه در تولید فرآیند خطایی رخ داد. لطفاً دوباره تلاش کنید.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 text-white pt-22 pb-24 min-h-screen">
            <div className="container mx-auto px-6 py-12 max-w-4xl">
                <button onClick={() => dispatch({ type: 'SET_VIEW', payload: View.BUSINESS_ACADEMY })} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>بازگشت به آکادمی</span>
                </button>
                <div className="text-center">
                    <CpuChipIcon className="w-16 h-16 mx-auto text-blue-300 mb-4" />
                    <h1 className="text-4xl font-bold">معمار فرآیندهای کسب‌وکار</h1>
                    <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">
                        فرآیند کسب‌وکار خود را به زبان ساده توصیف کنید تا هوشمانا آن را به یک رویه عملیاتی استاندارد (SOP) دقیق تبدیل کند.
                    </p>
                </div>

                <div className="mt-10 bg-gray-800 p-8 rounded-lg border border-gray-700">
                    <div className="mb-6">
                        <h3 className="font-semibold mb-3">از این الگوها الهام بگیرید:</h3>
                        <div className="flex flex-wrap gap-3">
                            {templates.map(t => (
                                <button key={t.name} onClick={() => handleUseTemplate(t.prompt)} className="text-sm bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-full transition-colors">
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="process-prompt" className="block font-semibold mb-2">توضیح فرآیند:</label>
                        <textarea
                            id="process-prompt"
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            rows={5}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="مثال: فرآیند استخدام یک نیروی جدید از زمان انتشار آگهی تا عقد قرارداد..."
                        />
                    </div>
                    
                    <div className="text-center mt-6">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 disabled:bg-gray-600 flex items-center gap-2 mx-auto"
                        >
                            <SparklesIcon className="w-6 h-6" />
                            {isLoading ? 'در حال معماری...' : 'معماری فرآیند'}
                        </button>
                    </div>
                </div>

                {error && <div className="mt-6 bg-red-900/50 text-red-300 p-4 rounded-lg text-center">{error}</div>}

                {result && (
                    <div className="mt-10 bg-gray-800 p-8 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">نتیجه: رویه عملیاتی استاندارد (SOP)</h2>
                            <button onClick={exportToMarkdown} className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-md">
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                <span>خروجی Markdown</span>
                            </button>
                        </div>
                        <div className="space-y-6">
                            {result.steps.map((step, index) => (
                                <div key={index} className="p-4 bg-gray-700/50 rounded-lg border-l-4 border-blue-500">
                                    <h3 className="font-bold text-lg text-blue-300">مرحله {index + 1}: {step.title}</h3>
                                    <p className="text-sm text-gray-400 my-2"><strong>مسئول:</strong> {step.responsible}</p>
                                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusinessProcessModelerView;
