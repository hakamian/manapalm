import React, { useState } from 'react';
import { SparklesIcon, CloudIcon, PhotoIcon, ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon } from '../icons';

interface AIImageUploaderProps {
    onImageReady: (url: string, publicId: string) => void;
    defaultProductName?: string;
}

const AIImageUploader: React.FC<AIImageUploaderProps> = ({ onImageReady, defaultProductName = '' }) => {
    const [mode, setMode] = useState<'upload' | 'generate'>('generate');
    const [productName, setProductName] = useState(defaultProductName);
    const [description, setDescription] = useState('');
    const [style, setStyle] = useState<'realistic' | 'artistic' | 'minimalist' | 'professional'>('professional');
    const [provider, setProvider] = useState<'free-pollinations' | 'openai'>('free-pollinations');
    const [existingUrl, setExistingUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ url: string; source: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleProcess = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const payload = {
                mode: 'single',
                productName: productName || 'Unnamed Product',
                description,
                style,
                provider, // Send provider choice
                existingImageUrl: mode === 'upload' ? existingUrl : undefined,
                folder: 'products'
            };

            const response = await fetch('/api/ai-image-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                setResult({
                    url: data.data.cloudinaryUrl,
                    source: data.data.source
                });
                onImageReady(data.data.cloudinaryUrl, data.data.publicId);
            } else {
                throw new Error(data.message || data.error || 'خطا در پردازش تصویر');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'خطای ناشناخته رخ داد');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-purple-400" />
                    ایجنت تصویربردار هوشمند
                </h3>
                <div className="flex bg-gray-700 rounded-lg p-1">
                    <button
                        onClick={() => setMode('generate')}
                        className={`px-3 py-1 text-xs rounded-md transition-all ${mode === 'generate' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        تولید با AI
                    </button>
                    <button
                        onClick={() => setMode('upload')}
                        className={`px-3 py-1 text-xs rounded-md transition-all ${mode === 'upload' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        آپلود از لینک
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">نام محصول</label>
                    <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="مثلا: خرمای پیارم اعلا"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                </div>

                {mode === 'generate' ? (
                    <>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">توضیحات تکمیلی (دلخواه)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="مثلا: در بسته‌بندی طلایی، با نورپردازی گرم، روی میز چوبی"
                                rows={2}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">سبک تصویر</label>
                            <select
                                value={style}
                                onChange={(e: any) => setStyle(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                            >
                                <option value="professional">عکاسی صنعتی (Professional)</option>
                                <option value="realistic">رئال و طبیعی (Realistic)</option>
                                <option value="minimalist">مینیمال (Minimalist)</option>
                                <option value="artistic">هنری و خلاقانه (Artistic)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">موتور هوش مصنوعی</label>
                            <select
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm focus:border-green-500 focus:outline-none"
                                value={provider}
                                onChange={(e) => setProvider(e.target.value as any)}
                            >
                                <option value="free-pollinations">مدل رایگان و سریع (Pollinations) - Free</option>
                                <option value="openai">مدل پیشرفته (DALL-E 3) - High Quality (Cost)</option>
                            </select>
                            <p className="text-[10px] text-gray-500 mt-1">
                                حالت رایگان برای تست عالی است. حالت پیشرفته نیاز به کلید OpenAI دارد.
                            </p>
                        </div>
                    </>
                ) : (
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">لینک تصویر موجود</label>
                        <input
                            type="text"
                            value={existingUrl}
                            onChange={(e) => setExistingUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                )}

                <button
                    onClick={handleProcess}
                    disabled={isLoading || !productName}
                    className={`w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${isLoading
                        ? 'bg-gray-600 cursor-not-allowed'
                        : mode === 'generate'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/20'
                            : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20'
                        }`}
                >
                    {isLoading ? (
                        <>
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            {mode === 'generate' ? 'ایجنت در حال نقاشی...' : 'در حال بهینه‌سازی...'}
                        </>
                    ) : (
                        <>
                            {mode === 'generate' ? <SparklesIcon className="w-5 h-5" /> : <CloudIcon className="w-5 h-5" />}
                            {mode === 'generate' ? 'تولید تصویر با هوش مصنوعی' : 'آپلود در Cloudinary'}
                        </>
                    )}
                </button>

                {error && (
                    <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-3 rounded-lg text-xs flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {result && (
                    <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl animate-fade-in">
                        <div className="flex items-center gap-2 text-green-400 mb-3 text-sm font-bold">
                            <CheckCircleIcon className="w-5 h-5" />
                            عملیات موفقیت‌آمیز بود!
                        </div>
                        <div className="relative aspect-square w-full bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                            <img src={result.url} alt="Result" className="w-full h-full object-cover" />
                            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full border border-white/10">
                                {result.source === 'ai-generated' ? 'Generated by AI' : 'Optimized via Cloudinary'}
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 font-mono truncate dir-ltr select-all cursor-pointer hover:text-white" onClick={() => navigator.clipboard.writeText(result.url)}>
                            {result.url}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIImageUploader;
