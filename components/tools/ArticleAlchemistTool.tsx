
import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
    DocumentTextIcon, SparklesIcon, LinkIcon, PhotoIcon, 
    MicrophoneIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, 
    PencilSquareIcon, GlobeIcon, CheckCircleIcon 
} from '../icons';
import HighTechLoader from '../HighTechLoader';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

type InputType = 'text' | 'url' | 'file' | 'image' | 'audio';
type Tone = 'professional' | 'casual' | 'academic' | 'storytelling';

const TONES = [
    { id: 'professional', label: 'رسمی و حرفه‌ای' },
    { id: 'casual', label: 'صمیمی و وبلاگی' },
    { id: 'academic', label: 'علمی و تحلیلی' },
    { id: 'storytelling', label: 'داستانی و روایی' },
];

const LANGUAGES = [
    { id: 'Persian', label: 'فارسی' },
    { id: 'English', label: 'English' },
    { id: 'Arabic', label: 'العربية' },
    { id: 'Turkish', label: 'Türkçe' },
];

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
};

const ArticleAlchemistTool: React.FC = () => {
    const [inputType, setInputType] = useState<InputType>('text');
    const [inputValue, setInputValue] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [selectedTone, setSelectedTone] = useState<Tone>('professional');
    const [targetLanguage, setTargetLanguage] = useState('Persian');
    
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [groundingMetadata, setGroundingMetadata] = useState<any>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            // 20MB limit check
            if (selectedFile.size > 20 * 1024 * 1024) {
                setError('حجم فایل باید کمتر از ۲۰ مگابایت باشد.');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const extractTextFromPDF = async (file: File): Promise<string> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            const maxPages = Math.min(pdf.numPages, 30); 

            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = (textContent.items as any[]).map((item: any) => item.str || '').join(' ');
                fullText += pageText + '\n\n';
            }
            return fullText;
        } catch (err: any) {
            throw new Error(`خطا در خواندن فایل PDF: ${err.message}`);
        }
    };

    const handleGenerate = async () => {
        if ((inputType === 'text' || inputType === 'url') && !inputValue.trim()) {
            setError('لطفاً ورودی را تکمیل کنید.');
            return;
        }
        if ((inputType === 'file' || inputType === 'image' || inputType === 'audio') && !file) {
            setError('لطفاً یک فایل انتخاب کنید.');
            return;
        }

        setIsLoading(true);
        setIsFinishing(false);
        setError(null);
        setResult('');
        setGroundingMetadata(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let parts: any[] = [];
            let tools: any[] = [];
            let modelName = 'gemini-2.5-flash'; // Default to flash for speed/cost
            let contextNote = '';

            // 1. Prepare Input Data
            if (inputType === 'url') {
                // Use Search Grounding for URLs to get content
                modelName = 'gemini-3-pro-preview'; // Pro required for search tool
                tools = [{ googleSearch: {} }];
                parts = [{ text: `Analyze the content of this URL and write a comprehensive article about it: ${inputValue}` }];
                contextNote = "Source: URL Analysis via Google Search.";
            } 
            else if (inputType === 'text') {
                parts = [{ text: `SOURCE TEXT:\n"""${inputValue}"""` }];
            } 
            else if (inputType === 'file' && file?.type === 'application/pdf') {
                const pdfText = await extractTextFromPDF(file);
                parts = [{ text: `SOURCE PDF CONTENT:\n"""${pdfText}"""` }];
                contextNote = `Source: Uploaded PDF (${file.name}).`;
            }
            else if (inputType === 'image' && file) {
                const base64 = await fileToBase64(file);
                parts = [
                    { inlineData: { mimeType: file.type, data: base64 } },
                    { text: "Write a detailed article based on the visual information, text, and context found in this image." }
                ];
                contextNote = "Source: Visual Analysis of Uploaded Image.";
            }
            else if (inputType === 'audio' && file) {
                const base64 = await fileToBase64(file);
                parts = [
                    { inlineData: { mimeType: file.type, data: base64 } },
                    { text: "Listen to this audio file and write a comprehensive article summarizing and expanding on the key points discussed." }
                ];
                contextNote = "Source: Audio Transcription and Analysis.";
            }

            // 2. Define System Instruction
            const systemInstruction = `
            # SYSTEM ROLE: SENIOR EDITOR & CONTENT STRATEGIST
            
            **OBJECTIVE:** 
            Transform the provided input (Text/Audio/Visual/URL) into a high-quality, engaging, and SEO-optimized **Blog Article** in ${targetLanguage}.

            **TONE SETTING:** ${TONES.find(t => t.id === selectedTone)?.label || 'Professional'}
            **OUTPUT LANGUAGE:** ${targetLanguage}
            **CONTEXT:** ${contextNote}

            **ARTICLE STRUCTURE:**
            1.  **Catchy Title (H1):** Engaging, clear, and relevant.
            2.  **Introduction:** Hook the reader, state the problem/topic, and what they will learn.
            3.  **Key Takeaways (Bulleted List):** A quick summary box at the top.
            4.  **Deep Dive Sections (H2/H3):** Break down the main concepts logically.
                - Use bolding for emphasis.
                - Use analogies where appropriate.
            5.  **Actionable Conclusion:** Summary and a thought-provoking ending.
            6.  **FAQ Section:** 3 common questions related to the topic.

            **RULES:**
            - Output MUST be in fluent, natural ${targetLanguage}.
            - Do NOT just translate; adapt and rewrite for flow and engagement.
            - If the input is thin, expand on it using general knowledge but stay true to the source's core message.
            - Use Markdown formatting effectively.
            `;

            const response = await ai.models.generateContent({
                model: modelName,
                contents: [{ role: 'user', parts }],
                config: {
                    systemInstruction,
                    temperature: 0.7,
                    tools: tools
                }
            });

            setIsFinishing(true);
            
            setTimeout(() => {
                setResult(response.text || 'پاسخی دریافت نشد.');
                if (response.candidates?.[0]?.groundingMetadata) {
                    setGroundingMetadata(response.candidates[0].groundingMetadata);
                }
                setIsLoading(false);
                setIsFinishing(false);
            }, 1500);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "خطایی رخ داد.");
            setIsLoading(false);
            setIsFinishing(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        alert('متن کپی شد!');
    };

    return (
        <div className="w-full h-full bg-stone-900 text-white rounded-2xl shadow-lg flex flex-col border border-stone-700 overflow-hidden relative">
            
            <HighTechLoader 
                isVisible={isLoading}
                isFinishing={isFinishing}
                messages={[
                    "در حال پردازش ورودی چندرسانه‌ای...",
                    "استخراج مفاهیم کلیدی و نکات مهم...",
                    "طراحی ساختار مقاله و سرفصل‌ها...",
                    `تنظیم لحن محتوا: ${TONES.find(t => t.id === selectedTone)?.label}...`,
                    `نگارش نهایی و بهینه‌سازی سئو به زبان ${targetLanguage}...`,
                ]}
            />

            <div className="p-4 border-b border-stone-700 bg-stone-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-900/30 rounded-lg text-emerald-400">
                        <DocumentTextIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">کیمیاگر مقاله (Article Alchemist)</h3>
                        <p className="text-xs text-stone-400">تبدیل هر منبعی به مقاله حرفه‌ای</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Language Selector */}
                    <div className="flex items-center gap-2 bg-stone-900 p-2 rounded-lg border border-stone-700">
                        <span className="text-[10px] text-stone-400">زبان خروجی:</span>
                        <select 
                            value={targetLanguage} 
                            onChange={(e) => setTargetLanguage(e.target.value)}
                            className="bg-stone-800 border border-stone-600 text-xs rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 outline-none text-emerald-300"
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.id} value={lang.id}>{lang.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tone Selector */}
                    <div className="flex items-center gap-2 bg-stone-900 p-2 rounded-lg border border-stone-700">
                        <span className="text-[10px] text-stone-400">لحن:</span>
                        <select 
                            value={selectedTone} 
                            onChange={(e) => setSelectedTone(e.target.value as Tone)}
                            className="bg-stone-800 border border-stone-600 text-xs rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 outline-none text-emerald-300"
                        >
                            {TONES.map(t => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Input Section */}
                <div className="w-full lg:w-1/3 bg-stone-900 p-6 border-b lg:border-b-0 lg:border-l border-stone-800 overflow-y-auto custom-scrollbar flex flex-col">
                    
                    {/* Input Type Selector */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <button onClick={() => { setInputType('text'); setFile(null); setInputValue(''); }} className={`p-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-all ${inputType === 'text' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>
                            <PencilSquareIcon className="w-4 h-4" /> متن
                        </button>
                        <button onClick={() => { setInputType('url'); setFile(null); setInputValue(''); }} className={`p-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-all ${inputType === 'url' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>
                            <LinkIcon className="w-4 h-4" /> لینک
                        </button>
                        <button onClick={() => { setInputType('file'); setFile(null); setInputValue(''); }} className={`p-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-all ${inputType === 'file' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>
                            <DocumentTextIcon className="w-4 h-4" /> PDF
                        </button>
                        <button onClick={() => { setInputType('image'); setFile(null); setInputValue(''); }} className={`p-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-all ${inputType === 'image' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>
                            <PhotoIcon className="w-4 h-4" /> تصویر
                        </button>
                        <button onClick={() => { setInputType('audio'); setFile(null); setInputValue(''); }} className={`p-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-all ${inputType === 'audio' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>
                            <MicrophoneIcon className="w-4 h-4" /> صدا
                        </button>
                    </div>

                    <div className="mb-4 flex-grow">
                        {(inputType === 'text' || inputType === 'url') ? (
                            <>
                                <label className="block text-sm font-semibold text-stone-300 mb-2">
                                    {inputType === 'url' ? 'لینک منبع (وب‌سایت/یوتیوب):' : 'متن یا موضوع:'}
                                </label>
                                <textarea 
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    placeholder={inputType === 'url' ? "https://..." : "متن خام یا موضوع خود را اینجا بنویسید..."}
                                    className={`w-full bg-stone-800/50 border border-stone-700 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none ${inputType === 'url' ? 'h-24 dir-ltr' : 'h-64'}`}
                                />
                            </>
                        ) : (
                            <div className="w-full">
                                <label className="block text-sm font-semibold text-stone-300 mb-2">
                                    {inputType === 'file' ? 'آپلود PDF:' : inputType === 'image' ? 'آپلود تصویر:' : 'آپلود فایل صوتی:'}
                                </label>
                                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-stone-600 border-dashed rounded-2xl cursor-pointer bg-stone-800/50 hover:bg-stone-800 hover:border-emerald-500 transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <ArrowUpTrayIcon className="w-12 h-12 text-stone-500 mb-4 group-hover:text-emerald-400 transition-colors" />
                                        <p className="mb-2 text-sm text-stone-400"><span className="font-semibold text-white">کلیک کنید</span> یا فایل را اینجا رها کنید</p>
                                        <p className="text-xs text-stone-500">
                                            {inputType === 'file' ? 'PDF (Max 20MB)' : inputType === 'image' ? 'JPG, PNG (Max 20MB)' : 'MP3, WAV (Max 20MB)'}
                                        </p>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        accept={inputType === 'file' ? '.pdf' : inputType === 'image' ? 'image/*' : 'audio/*'}
                                        onChange={handleFileChange} 
                                    />
                                </label>
                                {file && (
                                    <div className="mt-4 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg flex items-center gap-3">
                                        <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                                        <span className="text-sm text-emerald-100 truncate">{file.name}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {error && <p className="text-red-400 text-xs text-center mb-2">{error}</p>}

                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || ((inputType === 'text' || inputType === 'url') ? !inputValue : !file)}
                        className="w-full mt-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>در حال کیمیاگری...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                تولید مقاله
                            </>
                        )}
                    </button>
                </div>

                {/* Output Section */}
                <div className="w-full lg:w-2/3 bg-stone-800/30 p-6 overflow-y-auto custom-scrollbar relative">
                    {result ? (
                        <div className="max-w-3xl mx-auto animate-fade-in">
                            <div className="flex justify-between items-center mb-6 sticky top-0 bg-stone-900/90 backdrop-blur-md p-3 rounded-lg border border-stone-700 z-10">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <DocumentTextIcon className="w-5 h-5 text-green-400"/>
                                    خروجی نهایی
                                </h2>
                                <button onClick={handleCopy} className="text-xs bg-stone-700 hover:bg-stone-600 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors text-white">
                                    <ArrowDownTrayIcon className="w-4 h-4" /> کپی کل متن
                                </button>
                            </div>

                            {/* Grounding Sources (Only for URL input) */}
                            {groundingMetadata?.groundingChunks && (
                                <div className="mb-6 p-4 bg-stone-800 rounded-xl border border-stone-700">
                                    <h4 className="text-xs font-bold text-stone-400 mb-2 uppercase flex items-center gap-1">
                                        <GlobeIcon className="w-3 h-3"/> منابع بررسی شده:
                                    </h4>
                                    <ul className="space-y-1">
                                        {groundingMetadata.groundingChunks.map((chunk: any, idx: number) => (
                                            chunk.web?.uri && (
                                                <li key={idx} className="text-xs truncate">
                                                    <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> {chunk.web.title || chunk.web.uri}
                                                    </a>
                                                </li>
                                            )
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="prose prose-invert prose-lg max-w-none text-stone-200 leading-relaxed dir-auto">
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h1: ({node, ...props}) => <h1 className="text-3xl font-black text-emerald-400 mt-8 mb-6 border-b border-emerald-500/30 pb-2" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-blue-300 mt-10 mb-4" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-xl font-bold text-white mt-8 mb-2" {...props} />,
                                        strong: ({node, ...props}) => <strong className="text-amber-200 font-bold" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc list-inside my-4 space-y-2 bg-stone-900/50 p-6 rounded-xl border border-stone-700" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-r-4 border-emerald-500 bg-emerald-900/10 p-4 rounded-r-lg italic text-stone-300 my-6" {...props} />,
                                        table: ({node, ...props}) => <div className="overflow-x-auto my-6 rounded-lg border border-stone-600"><table className="min-w-full divide-y divide-stone-700" {...props} /></div>,
                                        th: ({node, ...props}) => <th className="px-6 py-3 bg-stone-800 text-right text-xs font-medium text-stone-300 uppercase tracking-wider" {...props} />,
                                        td: ({node, ...props}) => <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-300 border-t border-stone-700" {...props} />,
                                        hr: ({node, ...props}) => <hr className="border-stone-600 my-10" {...props} />,
                                    }}
                                >
                                    {result}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-stone-500 opacity-60 text-center p-8">
                            <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center mb-4">
                                <PencilSquareIcon className="w-12 h-12 text-stone-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">منتظر مواد اولیه</h3>
                            <p className="text-sm max-w-md">
                                متن، لینک، فایل صوتی یا تصویر خود را وارد کنید. <br/>
                                کیمیاگر آن را به یک مقاله ارزشمند تبدیل می‌کند.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArticleAlchemistTool;
