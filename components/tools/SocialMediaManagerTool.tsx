
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import * as pdfjsLib from 'pdfjs-dist';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
    ShareIcon, SparklesIcon, LinkedInIcon, InstagramIcon, 
    YouTubeIcon, DocumentTextIcon, ArrowDownTrayIcon, 
    CheckCircleIcon, VideoCameraIcon, PhotoIcon, MegaphoneIcon,
    LinkIcon, MicrophoneIcon, ArrowUpTrayIcon, TrashIcon,
    BanknotesIcon, RocketLaunchIcon, AcademicCapIcon, SpeakerWaveIcon, XMarkIcon, StarIcon
} from '../icons';
import HighTechLoader from '../HighTechLoader';
import { useAppDispatch } from '../../AppContext';
import Modal from '../Modal';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const PLATFORMS = [
    { id: 'linkedin', label: 'لینکدین (B2B)', icon: LinkedInIcon, color: 'text-blue-400' },
    { id: 'instagram', label: 'اینستاگرام (Post/Reel)', icon: InstagramIcon, color: 'text-pink-400' },
    { id: 'youtube', label: 'یوتیوب (Video/Shorts)', icon: YouTubeIcon, color: 'text-red-400' },
    { id: 'twitter', label: 'توییتر / X (Thread)', icon: MegaphoneIcon, color: 'text-stone-200' },
    { id: 'tiktok', label: 'تیک‌تاک / شورتس', icon: VideoCameraIcon, color: 'text-teal-400' },
];

const cleanJsonString = (text: string): string => {
    if (!text) return "{}";
    let clean = text.trim();
    clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
    clean = clean.replace(/\s*```$/, '');
    return clean;
};

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

type InputType = 'topic' | 'url' | 'image' | 'audio' | 'file';

const SocialMediaManagerTool: React.FC = () => {
    const dispatch = useAppDispatch();
    
    // Input State
    const [inputType, setInputType] = useState<InputType>('topic');
    const [inputValue, setInputValue] = useState(''); // For Text/Topic/URL
    const [file, setFile] = useState<File | null>(null);

    // Config State
    const [selectedPlatform, setSelectedPlatform] = useState('instagram');
    const [contentType, setContentType] = useState('educational');
    
    // Output State
    const [result, setResult] = useState('');
    const [imagePrompt, setImagePrompt] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Upsell State
    const [isUpsellModalOpen, setIsUpsellModalOpen] = useState(false);
    const [upsellType, setUpsellType] = useState<'course' | 'podcast' | 'article' | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            // Validation
            if (inputType === 'audio' && !selectedFile.type.startsWith('audio/')) {
                setError('لطفاً فایل صوتی معتبر انتخاب کنید.');
                return;
            }
            if (inputType === 'image' && !selectedFile.type.startsWith('image/')) {
                setError('لطفاً فایل تصویری معتبر انتخاب کنید.');
                return;
            }
            if (inputType === 'file' && selectedFile.type !== 'application/pdf') {
                 setError('لطفاً فایل PDF انتخاب کنید.');
                 return;
            }
            if (selectedFile.size > 20 * 1024 * 1024) { // 20MB limit
                 setError('حجم فایل باید کمتر از ۲۰ مگابایت باشد.');
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
            const maxPages = Math.min(pdf.numPages, 20); // Limit pages for speed

            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = (textContent.items as any[]).map((item: any) => item.str || '').join(' ');
                fullText += pageText + '\n\n';
            }
            return fullText;
        } catch (err: any) {
            throw new Error(`خطا در خواندن PDF: ${err.message}`);
        }
    };

    const handleGenerate = async () => {
        if ((inputType === 'topic' || inputType === 'url') && !inputValue.trim()) {
            setError('لطفاً ورودی را تکمیل کنید.');
            return;
        }
        if ((inputType === 'file' || inputType === 'image' || inputType === 'audio') && !file) {
            setError('لطفاً فایل مورد نظر را آپلود کنید.');
            return;
        }

        setIsLoading(true);
        setIsFinishing(false);
        setError(null);
        setResult('');
        setImagePrompt(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let parts: any[] = [];
            let tools: any[] = [];
            let inputDescription = "";

            // 1. Prepare Input Data
            if (inputType === 'topic') {
                parts = [{ text: `TOPIC/IDEA:\n"""${inputValue}"""` }];
                inputDescription = "Based on the provided topic.";
            } 
            else if (inputType === 'url') {
                tools = [{ googleSearch: {} }];
                parts = [{ text: `Analyze this link and create content based on it: ${inputValue}` }];
                inputDescription = "Based on the analysis of the provided URL.";
            } 
            else if (inputType === 'file' && file) {
                const text = await extractTextFromPDF(file);
                parts = [{ text: `SOURCE DOCUMENT CONTENT:\n"""${text}"""` }];
                inputDescription = "Based on the content of the uploaded PDF document.";
            }
            else if (inputType === 'image' && file) {
                const base64 = await fileToBase64(file);
                parts = [
                    { inlineData: { mimeType: file.type, data: base64 } },
                    { text: "Analyze this image visually and create social media content based on it." }
                ];
                inputDescription = "Based on the visual analysis of the uploaded image.";
            }
            else if (inputType === 'audio' && file) {
                const base64 = await fileToBase64(file);
                parts = [
                    { inlineData: { mimeType: file.type, data: base64 } },
                    { text: "Listen to this audio file and create social media content based on its transcription/content." }
                ];
                inputDescription = "Based on the audio content provided.";
            }

            // 2. Platform Instructions
            let platformInstruction = "";
            if (selectedPlatform === 'linkedin') {
                platformInstruction = `Platform: LinkedIn. Format: Professional Post. Focus on insights, lessons learned, and B2B value. Structure: Hook -> Insight -> Actionable Advice -> Engagement Question.`;
            } else if (selectedPlatform === 'instagram') {
                platformInstruction = `Platform: Instagram. Format: Caption for Post/Reel. Focus on visual storytelling, emotion, and aesthetics. Include a hook in the first line and relevant hashtags.`;
            } else if (selectedPlatform === 'youtube') {
                platformInstruction = `Platform: YouTube. Format: Video Title & Description or Shorts Script. Focus on SEO, click-through rate, and retention.`;
            } else if (selectedPlatform === 'tiktok') {
                platformInstruction = `Platform: TikTok. Format: Viral Video Script (under 60s). Focus on fast pacing, visual hooks, and trends.`;
            } else if (selectedPlatform === 'twitter') {
                 platformInstruction = `Platform: Twitter/X. Format: Thread or Long-form Tweet. Focus on punchy sentences, controversy, or high-value insights.`;
            }

            const systemInstruction = `
            # SYSTEM ROLE: ELITE SOCIAL MEDIA STRATEGIST (NANO/FLASH POWERED)

            **MISSION:**
            Create high-quality, platform-native social media content based on the provided input. This is the "Master Content".
            
            **CONTEXT:**
            ${inputDescription}
            **CONTENT STYLE:** ${contentType}
            ${platformInstruction}

            **DIRECTIVES:**
            1.  **Analyze** the source material deeply (Image visuals, Audio speech, Text meaning, or Link content).
            2.  **Adapt** the content to fit the specific Platform and Style chosen.
            3.  **Output** in Fluent, Engaging **Persian (Farsi)**.
            4.  **Add** emojis where appropriate.
            5.  **Suggest** an AI Image Prompt (in English) if the post needs a visual.

            **OUTPUT FORMAT (JSON):**
            {
                "content": "Full content in Markdown (Headers, Bold text, Lists)...",
                "image_prompt": "Detailed English prompt for generating a matching image (optional)"
            }
            `;

            const model = inputType === 'url' ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';

            const response = await ai.models.generateContent({
                model: model,
                contents: [{ role: 'user', parts }],
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    temperature: 0.7,
                    tools: tools
                }
            });

            setIsFinishing(true);

            setTimeout(() => {
                try {
                    const text = response.text || '{}';
                    const data = JSON.parse(cleanJsonString(text));
                    setResult(data.content);
                    if (data.image_prompt) setImagePrompt(data.image_prompt);
                } catch (e) {
                    console.error(e);
                    setResult(response.text || 'Error parsing response.');
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

    const openUpsellModal = (type: 'course' | 'podcast' | 'article') => {
        setUpsellType(type);
        setIsUpsellModalOpen(true);
    };

    const handlePurchase = () => {
        // In a real app, this would integrate with payment
        // For now, simulate success and close
        dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: 1000, action: `تبدیل محتوا به ${upsellType}` } });
        setIsUpsellModalOpen(false);
        alert(`درخواست تبدیل به ${upsellType === 'course' ? 'دوره' : upsellType === 'podcast' ? 'پادکست' : 'مقاله'} با موفقیت ثبت شد! هوش مصنوعی در حال پردازش است.`);
    };

    return (
        <div className="w-full h-full bg-stone-900 text-white rounded-2xl shadow-lg flex flex-col border border-stone-700 overflow-hidden relative">
            
            <HighTechLoader 
                isVisible={isLoading}
                isFinishing={isFinishing}
                messages={[
                    "در حال اسکن منبع ورودی...",
                    "استخراج نکات کلیدی و وایرال...",
                    "تطبیق با الگوریتم پلتفرم مقصد...",
                    "نگارش محتوای مادر (Master Content)...",
                    "بهینه‌سازی هشتگ‌ها و کال‌تو‌اکشن..."
                ]}
            />

            <div className="p-4 border-b border-stone-700 bg-stone-800 flex items-center gap-3">
                <div className="p-2 bg-indigo-900/30 rounded-lg text-indigo-400">
                    <ShareIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">معمار شبکه‌های اجتماعی (Social Architect)</h3>
                    <p className="text-xs text-stone-400">تولید محتوا از هر منبعی (لینک، صدا، تصویر)</p>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Sidebar */}
                <div className="w-full lg:w-1/3 bg-stone-900 p-6 border-b lg:border-b-0 lg:border-l border-stone-800 overflow-y-auto custom-scrollbar flex flex-col">
                    
                    {/* Input Types */}
                    <div className="grid grid-cols-5 gap-1 bg-stone-800 p-1 rounded-lg mb-6">
                         <button onClick={() => { setInputType('topic'); setFile(null); setInputValue(''); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'topic' ? 'bg-indigo-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="موضوع">
                            <SparklesIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => { setInputType('url'); setFile(null); setInputValue(''); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'url' ? 'bg-indigo-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="لینک">
                            <LinkIcon className="w-5 h-5" />
                        </button>
                         <button onClick={() => { setInputType('image'); setFile(null); setInputValue(''); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'image' ? 'bg-indigo-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="تصویر">
                            <PhotoIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => { setInputType('audio'); setFile(null); setInputValue(''); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'audio' ? 'bg-indigo-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="صدا">
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                         <button onClick={() => { setInputType('file'); setFile(null); setInputValue(''); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'file' ? 'bg-indigo-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="PDF">
                            <DocumentTextIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mb-6 flex-grow">
                        {(inputType === 'topic' || inputType === 'url') ? (
                            <>
                                <label className="block text-sm font-semibold text-stone-300 mb-2">
                                    {inputType === 'url' ? 'لینک منبع (YouTube/Web):' : 'موضوع یا ایده:'}
                                </label>
                                <textarea 
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    placeholder={inputType === 'url' ? "https://..." : "مثلاً: 5 اشتباه رایج در..."}
                                    className={`w-full bg-stone-800/50 border border-stone-700 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none custom-scrollbar ${inputType === 'url' ? 'h-24 dir-ltr' : 'h-40'}`}
                                />
                            </>
                        ) : (
                             <div className="w-full">
                                <label className="block text-sm font-semibold text-stone-300 mb-2">
                                    {inputType === 'file' ? 'آپلود PDF:' : inputType === 'image' ? 'آپلود تصویر:' : 'آپلود پادکست/صدا:'}
                                </label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-stone-600 border-dashed rounded-xl cursor-pointer bg-stone-800/50 hover:bg-stone-800 hover:border-indigo-500 transition-all group"
                                >
                                    {file ? (
                                        <div className="text-center px-4">
                                            <div className="bg-indigo-900/50 p-2 rounded-full w-fit mx-auto mb-2">
                                                <CheckCircleIcon className="w-6 h-6 text-indigo-400" />
                                            </div>
                                            <p className="text-sm text-white font-medium truncate max-w-[200px]">{file.name}</p>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setFile(null); }} 
                                                className="text-xs text-red-400 hover:text-red-300 mt-2 flex items-center justify-center gap-1"
                                            >
                                                <TrashIcon className="w-3 h-3"/> حذف
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <ArrowUpTrayIcon className="w-10 h-10 text-stone-500 mb-3 group-hover:text-indigo-400 transition-colors" />
                                            <p className="mb-1 text-sm text-stone-400"><span className="font-semibold text-white">کلیک کنید</span> یا فایل را اینجا رها کنید</p>
                                            <p className="text-xs text-stone-500">
                                                {inputType === 'image' ? 'JPG, PNG' : inputType === 'audio' ? 'MP3, WAV' : 'PDF'}
                                            </p>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        accept={inputType === 'image' ? 'image/*' : inputType === 'audio' ? 'audio/*' : 'application/pdf'}
                                        onChange={handleFileChange} 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-xs font-semibold text-stone-400 mb-2">پلتفرم مقصد:</label>
                            <select 
                                value={selectedPlatform}
                                onChange={(e) => setSelectedPlatform(e.target.value)}
                                className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                            >
                                {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-400 mb-2">سبک محتوا:</label>
                            <select 
                                value={contentType} 
                                onChange={(e) => setContentType(e.target.value)}
                                className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                            >
                                <option value="educational">آموزشی (Value First)</option>
                                <option value="promotional">تبلیغاتی / فروش</option>
                                <option value="storytelling">داستانی و شخصی</option>
                                <option value="viral">وایرال / جنجالی</option>
                                <option value="news">خبری / ترند</option>
                            </select>
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-xs text-center mb-2">{error}</p>}

                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || ((inputType === 'topic' || inputType === 'url') ? !inputValue : !file)}
                        className="w-full mt-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>در حال پردازش...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                تولید محتوا (Master Content)
                            </>
                        )}
                    </button>
                </div>

                {/* Result Area */}
                <div className="w-full lg:w-2/3 bg-stone-800/30 flex flex-col relative">
                    {result ? (
                        <div className="flex flex-col h-full">
                             <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
                                <div className="max-w-2xl mx-auto animate-fade-in">
                                     <div className="flex justify-between items-center mb-6 sticky top-0 bg-stone-900/90 backdrop-blur-md p-3 rounded-lg border border-stone-700 z-10">
                                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                            <DocumentTextIcon className="w-5 h-5 text-green-400"/>
                                            خروجی نهایی
                                        </h2>
                                        <button onClick={handleCopy} className="text-xs bg-stone-700 hover:bg-stone-600 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors text-white">
                                            <ArrowDownTrayIcon className="w-4 h-4" /> کپی
                                        </button>
                                    </div>

                                    {imagePrompt && (
                                        <div className="mb-6 p-4 bg-stone-800 rounded-xl border border-stone-700 border-dashed">
                                            <h4 className="text-xs font-bold text-stone-400 mb-2 uppercase flex items-center gap-1">
                                                <PhotoIcon className="w-3 h-3"/> ایده بصری (Image Prompt):
                                            </h4>
                                            <p className="text-xs text-stone-300 italic dir-ltr select-all bg-black/20 p-2 rounded">
                                                {imagePrompt}
                                            </p>
                                        </div>
                                    )}

                                    <div className="prose prose-invert prose-lg max-w-none text-stone-200 leading-relaxed dir-auto bg-stone-900 p-6 rounded-xl border border-stone-700 shadow-inner">
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                h1: ({node, ...props}) => <h1 className="text-2xl font-black text-indigo-400 mb-4" {...props} />,
                                                h2: ({node, ...props}) => <h2 className="text-xl font-bold text-white mt-6 mb-3" {...props} />,
                                                strong: ({node, ...props}) => <strong className="text-amber-200 font-bold" {...props} />,
                                                ul: ({node, ...props}) => <ul className="list-disc list-inside my-4 space-y-2" {...props} />,
                                            }}
                                        >
                                            {result}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                             </div>

                             {/* Content Alchemy Upsell Section */}
                             <div className="p-6 bg-gradient-to-t from-amber-900/90 via-stone-900/95 to-transparent border-t border-amber-500/30 flex flex-col items-center text-center relative z-20 backdrop-blur-md">
                                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                                 <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2 mb-2 animate-pulse">
                                     <RocketLaunchIcon className="w-6 h-6" />
                                     کیمیاگری محتوا: تبدیل به ثروت
                                 </h3>
                                 <p className="text-sm text-stone-300 mb-6 max-w-lg">
                                     این محتوا حیف است که فقط یک پست باشد! ما "محتوای مادر" را داریم. با یک کلیک، آن را به یک محصول پولساز تبدیل کنید.
                                 </p>
                                 
                                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl relative z-10">
                                     <button onClick={() => openUpsellModal('course')} className="bg-stone-800 hover:bg-stone-700 border border-amber-500/30 p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:-translate-y-1 group">
                                         <div className="p-2 bg-amber-500/20 rounded-full text-amber-400 group-hover:text-white transition-colors">
                                             <AcademicCapIcon className="w-6 h-6" />
                                         </div>
                                         <span className="font-bold text-sm text-white">تبدیل به دوره آموزشی</span>
                                         <span className="text-[10px] text-green-400 font-mono bg-green-900/30 px-2 py-0.5 rounded">۱,۵۰۰,۰۰۰ تومان ارزش</span>
                                     </button>

                                     <button onClick={() => openUpsellModal('podcast')} className="bg-stone-800 hover:bg-stone-700 border border-pink-500/30 p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:-translate-y-1 group">
                                         <div className="p-2 bg-pink-500/20 rounded-full text-pink-400 group-hover:text-white transition-colors">
                                             <SpeakerWaveIcon className="w-6 h-6" />
                                         </div>
                                         <span className="font-bold text-sm text-white">تبدیل به پادکست</span>
                                         <span className="text-[10px] text-green-400 font-mono bg-green-900/30 px-2 py-0.5 rounded">محتوای وایرال</span>
                                     </button>

                                     <button onClick={() => openUpsellModal('article')} className="bg-stone-800 hover:bg-stone-700 border border-blue-500/30 p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:-translate-y-1 group">
                                         <div className="p-2 bg-blue-500/20 rounded-full text-blue-400 group-hover:text-white transition-colors">
                                             <DocumentTextIcon className="w-6 h-6" />
                                         </div>
                                         <span className="font-bold text-sm text-white">تبدیل به مقاله مرجع</span>
                                         <span className="text-[10px] text-green-400 font-mono bg-green-900/30 px-2 py-0.5 rounded">SEO + ترافیک</span>
                                     </button>
                                 </div>
                             </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-stone-500 opacity-60 text-center p-8">
                            <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center mb-4">
                                <ShareIcon className="w-12 h-12 text-stone-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">استودیو آماده است</h3>
                            <p className="text-sm max-w-md">
                                منبع (لینک، فایل، متن) را وارد کنید، پلتفرم را انتخاب کنید و دکمه تولید را بزنید. <br/>
                                هوش مصنوعی بقیه کار را انجام می‌دهد.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Upsell Modal */}
            <Modal isOpen={isUpsellModalOpen} onClose={() => setIsUpsellModalOpen(false)}>
                <div className="p-6 max-w-md w-full text-center bg-stone-900 rounded-2xl border-2 border-amber-500/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>
                    
                    <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                        <SparklesIcon className="w-8 h-8 text-amber-400" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">
                        تبدیل به {upsellType === 'course' ? 'دوره آموزشی' : upsellType === 'podcast' ? 'پادکست حرفه‌ای' : 'مقاله مرجع'}
                    </h3>
                    
                    <p className="text-stone-300 text-sm mb-6 leading-relaxed">
                        هوش مصنوعی کل محتوای مادر را آنالیز کرده و می‌تواند در عرض چند دقیقه، آن را به یک {upsellType === 'course' ? 'دوره کامل با سرفصل و تمرین' : upsellType === 'podcast' ? 'اسکریپت جذاب صوتی' : 'مقاله سئو شده'} تبدیل کند.
                    </p>

                    <div className="bg-stone-800 p-4 rounded-xl border border-stone-700 mb-6 flex justify-between items-center">
                        <span className="text-sm text-gray-400">هزینه تبدیل:</span>
                        <div className="flex items-center gap-2">
                             <span className="text-lg font-bold text-white">1,000</span>
                             <StarIcon className="w-4 h-4 text-yellow-400" />
                        </div>
                    </div>

                    <button 
                        onClick={handlePurchase}
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105"
                    >
                        <BanknotesIcon className="w-5 h-5" />
                        پرداخت و شروع تولید
                    </button>
                    
                    <button onClick={() => setIsUpsellModalOpen(false)} className="mt-4 text-xs text-stone-500 hover:text-stone-300">
                        فعلاً نه، شاید بعداً
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default SocialMediaManagerTool;
