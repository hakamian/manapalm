
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import * as pdfjsLib from 'pdfjs-dist';
import { 
    ArrowPathIcon, SparklesIcon, LinkIcon, MicrophoneIcon, 
    ArrowUpTrayIcon, ArrowDownTrayIcon, GlobeIcon, DocumentTextIcon, 
    VideoCameraIcon, MegaphoneIcon, PaperClipIcon, CubeTransparentIcon,
    PlusCircleIcon, MinusIcon, BanknotesIcon
} from '../icons';
import HighTechLoader from '../HighTechLoader';
import { useAppDispatch, useAppState } from '../../AppContext';
import AIContentRenderer from '../AIContentRenderer';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const LANGUAGES = [
    { id: 'فارسی', label: 'فارسی (Persian)' },
    { id: 'English', label: 'English' },
];

type InputType = 'url' | 'audio' | 'topic' | 'text' | 'file';
type OutputFormat = 'full_article' | 'summary' | 'transcript' | 'social_posts';
type ContentStyle = 'STANDARD' | 'CRYSTAL';
type DetailLevel = 'CONCISE' | 'STANDARD' | 'DEEP_DIVE'; // New Type

const LARGE_FILE_COST = 500; // Cost for processing files > standard limit

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

const OmniConverterTool: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();

    const [inputType, setInputType] = useState<InputType>('url');
    const [inputValue, setInputValue] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [outputFormat, setOutputFormat] = useState<OutputFormat>('full_article');
    const [targetLanguage, setTargetLanguage] = useState('فارسی');
    const [contentStyle, setContentStyle] = useState<ContentStyle>('STANDARD');
    const [detailLevel, setDetailLevel] = useState<DetailLevel>('STANDARD'); // New State
    
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [groundingMetadata, setGroundingMetadata] = useState<any>(null);
    const [isLargeFile, setIsLargeFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const sizeMB = selectedFile.size / (1024 * 1024);
            let large = false;
            
            if (inputType === 'audio') {
                if (sizeMB > 100) {
                    setError('حجم فایل صوتی باید کمتر از ۱۰۰ مگابایت باشد.');
                    setFile(null);
                    setIsLargeFile(false);
                    return;
                }
                if (sizeMB > 50) large = true; // Standard limit is 50MB

                if (!selectedFile.type.startsWith('audio/')) {
                    setError('لطفاً یک فایل صوتی معتبر انتخاب کنید.');
                    setFile(null);
                    setIsLargeFile(false);
                    return;
                }
            } else if (inputType === 'file') {
                 if (sizeMB > 100) {
                    setError('حجم فایل متنی باید کمتر از ۱۰۰ مگابایت باشد.');
                    setFile(null);
                    setIsLargeFile(false);
                    return;
                }
                if (sizeMB > 20) large = true; // Standard limit is 20MB

                if (selectedFile.type !== 'application/pdf' && !selectedFile.type.startsWith('text/')) {
                     setError('لطفاً فایل PDF یا متنی انتخاب کنید.');
                     setFile(null);
                     setIsLargeFile(false);
                     return;
                }
            }

            setFile(selectedFile);
            setIsLargeFile(large);
            setError(null);
        }
    };

    const extractTextFromPDF = async (file: File): Promise<string> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            // Allow more pages for large files/premium requests
            const maxPages = Math.min(pdf.numPages, 100); 

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
        if ((inputType === 'url' || inputType === 'topic' || inputType === 'text') && !inputValue.trim()) {
            setError('لطفاً ورودی را تکمیل کنید.');
            return;
        }
        if ((inputType === 'audio' || inputType === 'file') && !file) {
            setError('لطفاً فایل را انتخاب کنید.');
            return;
        }

        // Check for premium file processing
        if (isLargeFile) {
            if (!user || user.manaPoints < LARGE_FILE_COST) {
                setError(`برای پردازش این فایل حجیم (بیش از حد استاندارد) نیاز به ${LARGE_FILE_COST} امتیاز معنا دارید.`);
                return;
            }
            // Deduct points
            dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: LARGE_FILE_COST, action: 'پردازش فایل حجیم (OmniConverter)' } });
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
            
            // Determine System Instruction based on Output Format
            let instructionDetail = "";
            switch (outputFormat) {
                case 'full_article':
                    instructionDetail = "Create a comprehensive, long-form article. Include H1, H2, H3 headings, bullet points, and a detailed analysis. Focus on depth and clarity.";
                    break;
                case 'summary':
                    instructionDetail = "Create a concise executive summary. Highlight the top 5 key takeaways, main arguments, and conclusion. Keep it brief.";
                    break;
                case 'transcript':
                    instructionDetail = "Provide a clean, formatted transcript/text representation of the content. Fix grammar errors but keep the original meaning intact.";
                    break;
                case 'social_posts':
                    instructionDetail = "Extract key insights and turn them into a series of engaging social media posts (LinkedIn, Twitter/X, Instagram). Include emojis and hashtags.";
                    break;
            }

            // Depth Logic
            let depthInstruction = "";
            if (detailLevel === 'DEEP_DIVE') {
                depthInstruction = `
                **CRITICAL: DEEP EXTRACTION MODE ACTIVATED**
                - Do NOT summarize or condense the information.
                - Extract EVERY key point, example, statistic, story, and nuance from the source.
                - If the source mentions a list, include ALL items in that list.
                - Expand on brief points using general knowledge to provide context, but stay true to the source.
                - The output must be extensive, thorough, and detailed. Cover 100% of the source material's value.
                `;
            } else if (detailLevel === 'CONCISE') {
                depthInstruction = "Focus only on the high-level core message. Be brief and direct.";
            } else {
                depthInstruction = "Balance detail with readability. Cover main points clearly.";
            }

            const systemInstruction = `
            SYSTEM ROLE: OMNI-CONTENT CONVERTER (V2.5 - Deep Extract)
            
            CORE DIRECTIVE:
            You are an advanced AI capable of converting any input (Audio, Video URL, Text, Topic, Document) into high-quality written content in the Target Language.
            
            TARGET LANGUAGE: ${targetLanguage}
            OUTPUT FORMAT: ${outputFormat}
            PROCESSING STYLE: ${contentStyle}
            
            EXTRACTION DEPTH: ${detailLevel}
            ${depthInstruction}
            
            STYLE GUIDELINES:
            ${contentStyle === 'CRYSTAL' 
                ? '- **Crystal Method**: Use Visual Tags to illustrate concepts. Use [VISUAL:TRUST_TRIANGLE], [VISUAL:ICEBERG], [VISUAL:VALUE_LADDER], [VISUAL:SALES_FUNNEL], or [VISUAL:LEAN_CANVAS] on a new line where relevant. Focus on "Why" and "Connections". Tone should be deep, inspiring, and connecting dots.' 
                : '- **Standard Method**: Be clear, concise, and professional. Use standard headings and bullet points. Focus on "What" and "How".'}
            
            INSTRUCTIONS:
            1. **Analyze**: Deeply understand the source material. If it's a URL, search for its content/transcript. If it's audio, listen carefully. If it's a file, read it thoroughly.
            2. **Synthesize**: Extract the core message, facts, and nuances based on the selected STYLE and DEPTH. If CRYSTAL style, look for opportunities to insert visual tags.
            3. **Convert**: Rewrite the content into the requested FORMAT.
            4. **Localize**: Ensure the output is culturally and linguistically natural in ${targetLanguage}.
            
            SPECIFIC FORMAT RULES:
            ${instructionDetail}
            
            Output must be in Markdown.
            `;

            if (inputType === 'url') {
                tools = [{ googleSearch: {} }];
                parts = [{ text: `Analyze this URL and convert it with MAXIMUM detail: ${inputValue}` }];
            } else if (inputType === 'topic') {
                tools = [{ googleSearch: {} }];
                parts = [{ text: `Research this topic deeply and create comprehensive content: ${inputValue}` }];
            } else if (inputType === 'text') {
                parts = [{ text: `Convert this text:\n"""${inputValue}"""` }];
            } else if (inputType === 'audio' && file) {
                const base64 = await fileToBase64(file);
                parts = [
                    { inlineData: { mimeType: file.type, data: base64 } },
                    { text: "Listen to this audio and convert it with high detail." }
                ];
            } else if (inputType === 'file' && file) {
                let textContent = "";
                if (file.type === 'application/pdf') {
                    textContent = await extractTextFromPDF(file);
                } else {
                    textContent = await file.text();
                }
                parts = [{ text: `Analyze this document content and convert it:\n"""${textContent}"""` }];
            }

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview', // Using Pro model for better reasoning & multimodal
                contents: [{ role: 'user', parts }],
                config: {
                    systemInstruction,
                    temperature: contentStyle === 'CRYSTAL' ? 0.7 : 0.3,
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
            setError(err.message || "خطایی رخ داد. لطفاً دوباره تلاش کنید.");
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
                    "در حال اتصال به موتور تبدیل چندرسانه‌ای...",
                    "بارگذاری و آنالیز منبع ورودی...",
                    detailLevel === 'DEEP_DIVE' ? "استخراج عمیق تمام جزئیات و نکات ریز..." : "استخراج مفاهیم کلیدی...",
                    contentStyle === 'CRYSTAL' ? "فعال‌سازی موتور کریستالی (اتصال مفاهیم عمیق و تصویرسازی)..." : "فعال‌سازی موتور استاندارد...",
                    `ترجمه و بومی‌سازی به ${targetLanguage}...`,
                    `فرمت‌دهی نهایی به صورت ${outputFormat === 'full_article' ? 'مقاله کامل' : outputFormat}...`,
                    "تکمیل فرآیند تبدیل..."
                ]}
            />

            <div className="p-4 border-b border-stone-700 bg-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-900/30 rounded-lg text-orange-500">
                        <ArrowPathIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">مبدل جامع محتوا</h3>
                        <p className="text-xs text-stone-400">صدا، ویدیو و متن به محتوای متنی</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                     {/* Style Toggle */}
                     <div className="flex items-center gap-1 bg-stone-900 rounded-md p-1 border border-stone-700">
                        <button 
                            onClick={() => setContentStyle('STANDARD')}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${contentStyle === 'STANDARD' ? 'bg-stone-600 text-white shadow' : 'text-stone-400 hover:text-white'}`}
                        >
                             استاندارد
                        </button>
                        <button 
                            onClick={() => setContentStyle('CRYSTAL')}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${contentStyle === 'CRYSTAL' ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow' : 'text-stone-400 hover:text-white'}`}
                        >
                            <CubeTransparentIcon className="w-3 h-3" /> کریستالی
                        </button>
                    </div>

                    <div className="flex items-center gap-3 bg-stone-900 p-2 rounded-lg border border-stone-700">
                        <span className="text-xs text-stone-400">زبان خروجی:</span>
                        <select 
                            value={targetLanguage} 
                            onChange={(e) => setTargetLanguage(e.target.value)}
                            className="bg-stone-800 border border-stone-600 text-xs rounded px-2 py-1 focus:ring-1 focus:ring-orange-500 outline-none text-orange-300"
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.id} value={lang.id}>{lang.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Input Side */}
                <div className="w-full lg:w-1/3 bg-stone-900 p-6 border-b lg:border-b-0 lg:border-l border-stone-800 overflow-y-auto custom-scrollbar flex flex-col">
                    
                    {/* Input Type Tabs */}
                    <div className="grid grid-cols-5 gap-1 bg-stone-800 p-1 rounded-lg mb-6">
                        <button onClick={() => { setInputType('url'); setFile(null); setInputValue(''); setIsLargeFile(false); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'url' ? 'bg-orange-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="لینک">
                            <LinkIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => { setInputType('audio'); setFile(null); setInputValue(''); setIsLargeFile(false); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'audio' ? 'bg-orange-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="صدا/پادکست">
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                         <button onClick={() => { setInputType('file'); setFile(null); setInputValue(''); setIsLargeFile(false); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'file' ? 'bg-orange-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="فایل متنی/PDF">
                            <PaperClipIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => { setInputType('topic'); setFile(null); setInputValue(''); setIsLargeFile(false); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'topic' ? 'bg-orange-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="موضوع">
                            <SparklesIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => { setInputType('text'); setFile(null); setInputValue(''); setIsLargeFile(false); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'text' ? 'bg-orange-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="متن">
                            <DocumentTextIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mb-6 flex-grow">
                        <label className="block text-sm font-semibold text-stone-300 mb-3">
                            {inputType === 'url' ? 'لینک (یوتیوب/وب):' : 
                             inputType === 'audio' ? 'فایل صوتی (MP3/WAV):' : 
                             inputType === 'file' ? 'فایل سند (PDF/TXT):' :
                             inputType === 'topic' ? 'موضوع یا عنوان:' : 'متن خام:'}
                        </label>

                        {inputType === 'audio' ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all group ${isLargeFile ? 'border-amber-500 bg-amber-900/10' : 'border-stone-600 bg-stone-800/50 hover:bg-stone-800 hover:border-orange-500'}`}
                            >
                                <ArrowUpTrayIcon className={`w-10 h-10 mb-2 ${isLargeFile ? 'text-amber-500' : 'text-stone-500 group-hover:text-orange-400'}`} />
                                <p className="text-xs text-stone-400 text-center px-2">
                                    {file ? file.name : 'آپلود فایل صوتی (تا ۱۰۰ مگابایت)'}
                                </p>
                                {isLargeFile && <p className="text-[10px] text-amber-400 mt-1 font-bold">فایل حجیم (پریمیوم)</p>}
                                <input type="file" className="hidden" accept="audio/*" ref={fileInputRef} onChange={handleFileChange} />
                            </div>
                        ) : inputType === 'file' ? (
                             <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all group ${isLargeFile ? 'border-amber-500 bg-amber-900/10' : 'border-stone-600 bg-stone-800/50 hover:bg-stone-800 hover:border-orange-500'}`}
                            >
                                <DocumentTextIcon className={`w-10 h-10 mb-2 ${isLargeFile ? 'text-amber-500' : 'text-stone-500 group-hover:text-orange-400'}`} />
                                <p className="text-xs text-stone-400 text-center px-2">
                                    {file ? file.name : 'آپلود فایل PDF یا متنی (تا ۱۰۰ مگابایت)'}
                                </p>
                                {isLargeFile && <p className="text-[10px] text-amber-400 mt-1 font-bold">فایل حجیم (پریمیوم)</p>}
                                <input type="file" className="hidden" accept=".pdf,.txt,.md" ref={fileInputRef} onChange={handleFileChange} />
                            </div>
                        ) : inputType === 'text' ? (
                             <textarea 
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                placeholder="متن خود را اینجا وارد کنید..."
                                className="w-full h-40 bg-stone-800/50 border border-stone-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none custom-scrollbar"
                            />
                        ) : (
                            <input 
                                type="text"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                placeholder={inputType === 'url' ? "https://youtube.com/..." : "مثلاً: آینده هوش مصنوعی..."}
                                className="w-full bg-stone-800/50 border border-stone-700 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none dir-ltr"
                            />
                        )}
                    </div>

                    {/* Output & Detail Settings */}
                    <div className="space-y-4 mb-6">
                         <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-700">
                            <label className="block text-xs font-semibold text-stone-400 mb-2">فرمت خروجی:</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setOutputFormat('full_article')} className={`p-2 text-xs rounded-lg border transition-all ${outputFormat === 'full_article' ? 'bg-orange-900/40 border-orange-500 text-white' : 'border-stone-700 text-stone-400 hover:bg-stone-800'}`}>مقاله کامل</button>
                                <button onClick={() => setOutputFormat('summary')} className={`p-2 text-xs rounded-lg border transition-all ${outputFormat === 'summary' ? 'bg-orange-900/40 border-orange-500 text-white' : 'border-stone-700 text-stone-400 hover:bg-stone-800'}`}>خلاصه مدیریتی</button>
                                <button onClick={() => setOutputFormat('transcript')} className={`p-2 text-xs rounded-lg border transition-all ${outputFormat === 'transcript' ? 'bg-orange-900/40 border-orange-500 text-white' : 'border-stone-700 text-stone-400 hover:bg-stone-800'}`}>متن دقیق (Transcript)</button>
                                <button onClick={() => setOutputFormat('social_posts')} className={`p-2 text-xs rounded-lg border transition-all ${outputFormat === 'social_posts' ? 'bg-orange-900/40 border-orange-500 text-white' : 'border-stone-700 text-stone-400 hover:bg-stone-800'}`}>پست شبکه اجتماعی</button>
                            </div>
                        </div>

                        <div className="bg-stone-800/50 p-4 rounded-xl border border-stone-700">
                            <label className="block text-xs font-semibold text-stone-400 mb-2">میزان جزئیات (Detail Level):</label>
                            <div className="flex gap-2">
                                 <button 
                                    onClick={() => setDetailLevel('CONCISE')}
                                    className={`flex-1 py-1.5 text-xs rounded border transition-all ${detailLevel === 'CONCISE' ? 'bg-stone-600 text-white border-stone-500' : 'text-stone-500 border-stone-700 hover:bg-stone-800'}`}
                                >
                                    <MinusIcon className="w-3 h-3 inline mb-0.5"/> فشرده
                                </button>
                                <button 
                                    onClick={() => setDetailLevel('STANDARD')}
                                    className={`flex-1 py-1.5 text-xs rounded border transition-all ${detailLevel === 'STANDARD' ? 'bg-orange-700/50 text-white border-orange-500' : 'text-stone-500 border-stone-700 hover:bg-stone-800'}`}
                                >
                                    استاندارد
                                </button>
                                <button 
                                    onClick={() => setDetailLevel('DEEP_DIVE')}
                                    className={`flex-1 py-1.5 text-xs rounded border transition-all ${detailLevel === 'DEEP_DIVE' ? 'bg-orange-600 text-white border-orange-400 font-bold shadow' : 'text-stone-500 border-stone-700 hover:bg-stone-800'}`}
                                >
                                    <PlusCircleIcon className="w-3 h-3 inline mb-0.5"/> عمیق و جامع
                                </button>
                            </div>
                            {detailLevel === 'DEEP_DIVE' && (
                                <p className="text-[10px] text-orange-300 mt-2">💡 حالت عمیق: تمام جزئیات، مثال‌ها و نکات را بدون خلاصه‌سازی استخراج می‌کند.</p>
                            )}
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-xs text-center mb-2">{error}</p>}

                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className={`w-full mt-auto font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isLargeFile ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500' : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500'} text-white`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>در حال پردازش...</span>
                            </>
                        ) : isLargeFile ? (
                            <>
                                <BanknotesIcon className="w-5 h-5" />
                                <span>پردازش ویژه ({LARGE_FILE_COST} امتیاز)</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                <span>شروع تبدیل</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Output Side */}
                <div className="w-full lg:w-2/3 bg-stone-800/30 p-6 overflow-y-auto custom-scrollbar relative">
                    {result ? (
                        <div className="max-w-3xl mx-auto animate-fade-in">
                            <div className="flex justify-between items-center mb-6 sticky top-0 bg-stone-900/90 backdrop-blur-md p-3 rounded-lg border border-stone-700 z-10">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <DocumentTextIcon className="w-5 h-5 text-green-400"/>
                                    خروجی نهایی
                                </h2>
                                <button onClick={handleCopy} className="text-xs bg-stone-700 hover:bg-stone-600 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors text-white">
                                    <ArrowDownTrayIcon className="w-4 h-4" /> کپی متن
                                </button>
                            </div>

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
                                <AIContentRenderer content={result} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-stone-500 opacity-60 text-center p-8">
                            <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center mb-4">
                                <ArrowPathIcon className="w-12 h-12 text-stone-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">منتظر ورودی شما</h3>
                            <p className="text-sm max-w-md">
                                فایل، لینک یا متن خود را وارد کنید تا به محتوای جدید تبدیل شود.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OmniConverterTool;
