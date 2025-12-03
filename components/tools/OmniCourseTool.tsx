
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as pdfjsLib from 'pdfjs-dist';
import { 
    ArrowPathIcon, SparklesIcon, LinkIcon, MicrophoneIcon, 
    ArrowUpTrayIcon, ArrowDownTrayIcon, GlobeIcon, DocumentTextIcon, 
    VideoCameraIcon, MegaphoneIcon, PaperClipIcon, CubeTransparentIcon,
    PlusCircleIcon, MinusIcon
} from '../icons';
import HighTechLoader from '../HighTechLoader';

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

const cleanJsonString = (text: string): string => {
    if (!text) return "{}";
    let clean = text.trim();
    clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
    clean = clean.replace(/\s*```$/, '');
    return clean;
};

const OmniConverterTool: React.FC = () => {
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            
            if (inputType === 'audio') {
                if (selectedFile.size > 50 * 1024 * 1024) {
                    setError('حجم فایل صوتی باید کمتر از ۵۰ مگابایت باشد.');
                    setFile(null);
                    return;
                }
                if (!selectedFile.type.startsWith('audio/')) {
                    setError('لطفاً یک فایل صوتی معتبر انتخاب کنید.');
                    setFile(null);
                    return;
                }
            } else if (inputType === 'file') {
                 if (selectedFile.size > 20 * 1024 * 1024) {
                    setError('حجم فایل متنی باید کمتر از ۲۰ مگابایت باشد.');
                    setFile(null);
                    return;
                }
                if (selectedFile.type !== 'application/pdf' && !selectedFile.type.startsWith('text/')) {
                     setError('لطفاً فایل PDF یا متنی انتخاب کنید.');
                     setFile(null);
                     return;
                }
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
            const maxPages = Math.min(pdf.numPages, 50); 

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

            // SUPER PROMPT V13.0 (VISUAL CRYSTAL EDITION)
            const systemInstruction = `
            # SYSTEM ROLE: OMNI-CONTENT ARCHITECT (V13.0 – CRYSTAL VISUAL EDITION)

            **CORE MANDATE:**
            You are an elite Content Architect engine. You receive raw input (Audio, Video URL, Text, Topic, Document) and must transmute it into high-value content in the Target Language.

            **CONFIGURATION:**
            - **Target Language:** ${targetLanguage}
            - **Output Format:** ${outputFormat}
            - **Processing Style:** ${contentStyle}
            - **Extraction Depth:** ${detailLevel}

            ${depthInstruction}

            **CRYSTAL ENGINE RULES (If Style = CRYSTAL):**
            1.  **The Puzzle Metaphor:** Knowledge is not linear. Treat concepts as "pieces" that snap together.
            2.  **The Villain:** Identify the danger of "Scattered Information" or "Misunderstanding" before giving the solution.
            3.  **Nucleus:** Organize content around "Meaning Clusters" rather than just chapters.
            
            **VISUAL THINKING PROTOCOL (MANDATORY FOR CRYSTAL STYLE):**
            - **Markdown Tables:** You MUST use tables to compare concepts (e.g., "Old Way" vs "New Way", "Amateur" vs "Pro").
            - **Geometric Schematics:** Use ASCII/Text art in Code Blocks to visualize relationships.
              
              *Example 1 (Triangle):*
              \`\`\`text
                    [Trust]
                     /   \\
              [Empathy]--[Logic]
              \`\`\`
              
              *Example 2 (Process):*
              \`\`\`text
              [Input] -> [Black Box] -> [Magic] -> [Output]
              \`\`\`
              
              *Example 3 (Cornerstones/Square):*
              \`\`\`text
              [A] ------- [B]
               |           |
               |   Core    |
               |           |
              [C] ------- [D]
              \`\`\`

            4.  **Actionization:** Ensure the content leads to specific, small actions.

            **HALLUCINATION CONTROL (GROUNDED EXPANSION):**
            - **Primary Source:** Rely heavily on the provided input/search results.
            - **Gaps:** If the source lacks data, use your internal knowledge to fill gaps logically, but DO NOT invent facts, stats, or quotes.
            - **Ambiguity:** If a part is unclear, state "The source does not specify..." rather than guessing.

            **SPECIFIC FORMAT RULES:**
            ${instructionDetail}
            
            **OUTPUT REQUIREMENT:**
            - Output must be in **Markdown**.
            - Use **Bold** for key concepts.
            - Use > Blockquotes for key insights.
            - **Use Tables** for comparisons.
            - **Use Text-based Geometry** for structural concepts.
            - Ensure cultural adaptation for ${targetLanguage}.
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
                    temperature: contentStyle === 'CRYSTAL' ? 0.6 : 0.3, // Balanced temperature
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
                    "در حال اتصال به موتور تبدیل چندرسانه‌ای (V13.0)...",
                    "بارگذاری و آنالیز منبع ورودی...",
                    detailLevel === 'DEEP_DIVE' ? "استخراج عمیق تمام جزئیات و نکات ریز..." : "استخراج مفاهیم کلیدی...",
                    contentStyle === 'CRYSTAL' ? "فعال‌سازی موتور کریستالی (ترسیم جداول و اشکال هندسی)..." : "فعال‌سازی موتور استاندارد...",
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
                        <button onClick={() => { setInputType('url'); setFile(null); setInputValue(''); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'url' ? 'bg-orange-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="لینک">
                            <LinkIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => { setInputType('audio'); setFile(null); setInputValue(''); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'audio' ? 'bg-orange-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="صدا/پادکست">
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                         <button onClick={() => { setInputType('file'); setFile(null); setInputValue(''); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'file' ? 'bg-orange-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="فایل متنی/PDF">
                            <PaperClipIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => { setInputType('topic'); setFile(null); setInputValue(''); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'topic' ? 'bg-orange-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="موضوع">
                            <SparklesIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => { setInputType('text'); setFile(null); setInputValue(''); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'text' ? 'bg-orange-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="متن">
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
                                className="flex flex-col items-center justify-center w-full h-40 border-2 border-stone-600 border-dashed rounded-xl cursor-pointer bg-stone-800/50 hover:bg-stone-800 hover:border-orange-500 transition-all group"
                            >
                                <ArrowUpTrayIcon className="w-10 h-10 text-stone-500 mb-2 group-hover:text-orange-400" />
                                <p className="text-xs text-stone-400">
                                    {file ? file.name : 'آپلود فایل صوتی (max 50MB)'}
                                </p>
                                <input type="file" className="hidden" accept="audio/*" ref={fileInputRef} onChange={handleFileChange} />
                            </div>
                        ) : inputType === 'file' ? (
                             <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center w-full h-40 border-2 border-stone-600 border-dashed rounded-xl cursor-pointer bg-stone-800/50 hover:bg-stone-800 hover:border-orange-500 transition-all group"
                            >
                                <DocumentTextIcon className="w-10 h-10 text-stone-500 mb-2 group-hover:text-orange-400" />
                                <p className="text-xs text-stone-400">{file ? file.name : 'آپلود فایل PDF یا متنی (max 20MB)'}</p>
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
                        className="w-full mt-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        شروع تبدیل
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
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h1: ({node, ...props}) => <h1 className="text-3xl font-black text-orange-400 mt-8 mb-6 border-b border-orange-500/30 pb-2" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white mt-8 mb-3" {...props} />,
                                        strong: ({node, ...props}) => <strong className="text-orange-200 font-bold" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-r-4 border-orange-500 bg-orange-900/10 p-4 rounded-r-lg italic text-stone-300 my-6" {...props} />,
                                        table: ({node, ...props}) => <div className="overflow-x-auto my-6 rounded-lg border border-stone-600"><table className="min-w-full divide-y divide-stone-700" {...props} /></div>,
                                        th: ({node, ...props}) => <th className="px-6 py-3 bg-stone-800 text-right text-xs font-medium text-stone-300 uppercase tracking-wider" {...props} />,
                                        td: ({node, ...props}) => <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-300 border-t border-stone-700" {...props} />,
                                    }}
                                >
                                    {result}
                                </ReactMarkdown>
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
