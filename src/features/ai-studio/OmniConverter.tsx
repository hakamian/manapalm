
import React, { useState } from 'react';
import { SparklesIcon, ArrowPathIcon, DocumentTextIcon, ClipboardIcon } from '../../../components/icons';
import { convertContent } from '../../services/geminiService';

const OmniConverter: React.FC = () => {
    const [sourceText, setSourceText] = useState('');
    const [format, setFormat] = useState('linkedin');
    const [result, setResult] = useState('');
    const [isConverting, setIsConverting] = useState(false);

    const handleConvert = async () => {
        if (!sourceText.trim()) return;
        setIsConverting(true);
        try {
            const converted = await convertContent(sourceText, format);
            setResult(converted);
        } catch (error) {
            console.error(error);
        } finally {
            setIsConverting(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        alert('Copied to clipboard!');
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-purple-400" />
                تبدیل‌گر محتوا (Omni-Converter)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="block text-sm text-gray-400">متن یا ایده خود را وارد کنید</label>
                    <textarea
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                        className="w-full h-48 bg-gray-900 border border-gray-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                        placeholder="امروز در مورد اهمیت درختکاری فکر می‌کردم..."
                    />

                    <div className="flex items-center gap-4">
                        <select
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                            className="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none"
                        >
                            <option value="linkedin">پست لینکدین</option>
                            <option value="instagram">کپشن اینستاگرام</option>
                            <option value="twitter">رشته توییت</option>
                            <option value="blog">پست بلاگ</option>
                        </select>

                        <button
                            onClick={handleConvert}
                            disabled={isConverting || !sourceText.trim()}
                            className="flex-grow bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            {isConverting ? (
                                <>
                                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                    <span>در حال تبدیل...</span>
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5" />
                                    <span>جادوی هوش مصنوعی</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-sm text-gray-400">نتیجه</label>
                    <div className="w-full h-48 bg-gray-900 border border-gray-600 rounded-lg p-4 relative group">
                        {result ? (
                            <>
                                <pre className="whitespace-pre-wrap text-white font-sans text-sm h-full overflow-y-auto">{result}</pre>
                                <button
                                    onClick={copyToClipboard}
                                    className="absolute top-2 right-2 p-2 bg-gray-800 rounded-md text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="کپی"
                                >
                                    <ClipboardIcon className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                <DocumentTextIcon className="w-12 h-12 mb-2 opacity-20" />
                                <span className="text-sm">منتظر ورودی...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OmniConverter;
