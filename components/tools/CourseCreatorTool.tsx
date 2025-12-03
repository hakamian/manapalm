
import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenAI } from '@google/genai';
import { useAppDispatch, useAppState } from '../../AppContext';
import { ArrowUpTrayIcon, SparklesIcon, CheckCircleIcon, DocumentTextIcon, AcademicCapIcon, BanknotesIcon, ChartBarIcon, ClockIcon, StarIcon, MicrophoneIcon, PhotoIcon, CubeTransparentIcon, GlobeIcon, BrainCircuitIcon, ArrowDownTrayIcon } from '../icons';
import { LMSModule, Course, View } from '../../types';
import { CONTENT_REFINERY_PROMPT, COURSE_ARCHITECT_PROMPT } from '../../utils/aiPrompts';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

type Step = 'upload' | 'settings' | 'processing' | 'result';

type TargetAcademy = 'business' | 'ai' | 'english' | 'coaching';
type CourseScale = 'MINI' | 'STANDARD' | 'MASTERY';
type InputType = 'pdf' | 'topic' | 'audio' | 'image';
type ContentStyle = 'STANDARD' | 'CRYSTAL';

interface AIResponse {
    modules: LMSModule[];
    suggestedPrice: number;
    targetAudience: string;
    shortDescription: string;
    estimatedDuration: string;
    courseTitle?: string;
}

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

const CourseCreatorTool: React.FC = () => {
    const { user, appSettings } = useAppState();
    const dispatch = useAppDispatch();
    
    const [step, setStep] = useState<Step>('upload');
    const [inputType, setInputType] = useState<InputType>('pdf');
    const [file, setFile] = useState<File | null>(null);
    const [userPrompt, setUserPrompt] = useState('');
    
    // Content State
    const [extractedText, setExtractedText] = useState('');
    const [refinedKnowledge, setRefinedKnowledge] = useState(''); // To show produced text
    
    // Course Settings
    const [isPaid, setIsPaid] = useState(true);
    const [targetAcademy, setTargetAcademy] = useState<TargetAcademy>('business');
    const [courseScale, setCourseScale] = useState<CourseScale>('STANDARD');
    const [contentStyle, setContentStyle] = useState<ContentStyle>('STANDARD');
    const [targetLanguage, setTargetLanguage] = useState<string>('Persian');
    
    // Result States
    const [finalPrice, setFinalPrice] = useState<string>('');
    const [targetAudience, setTargetAudience] = useState<string>('');
    const [activeResultTab, setActiveResultTab] = useState<'structure' | 'knowledge'>('structure');

    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<string>('');
    const [generatedData, setGeneratedData] = useState<AIResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            
            // Validation based on type
            if (inputType === 'pdf' && selectedFile.type !== 'application/pdf') {
                setError('لطفاً فقط فایل PDF انتخاب کنید.');
                e.target.value = '';
                return;
            }
            if (inputType === 'audio' && !selectedFile.type.startsWith('audio/')) {
                 setError('لطفاً فقط فایل صوتی (MP3, WAV, ...) انتخاب کنید.');
                 e.target.value = '';
                 return;
            }
            if (inputType === 'image' && !selectedFile.type.startsWith('image/')) {
                 setError('لطفاً فقط فایل تصویری انتخاب کنید.');
                 e.target.value = '';
                 return;
            }

            // Size Limit (Example: 50MB for audio, 20MB for others)
            const limit = inputType === 'audio' ? 50 * 1024 * 1024 : 20 * 1024 * 1024;
            if (selectedFile.size > limit) {
                 setError(`حجم فایل بیش از حد مجاز است (${inputType === 'audio' ? '50MB' : '20MB'}).`);
                 e.target.value = '';
                 return;
            }

            setFile(selectedFile);
            setError(null);
            // Reset input value to allow re-selecting the same file if needed
            e.target.value = ''; 
        }
    };

    const extractTextFromPDF = async (file: File): Promise<string> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            // Increased limit to 300 pages to support voluminous documents
            const maxPages = Math.min(pdf.numPages, 300); 

            for (let i = 1; i <= maxPages; i++) {
                setStatus(`در حال خواندن صفحه ${i} از ${maxPages} (استخراج متنی)...`);
                setProgress(Math.round((i / maxPages) * 30));
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + '\n\n';
            }

            if (!fullText.trim() || fullText.length < 50) {
                throw new Error("متن قابل خواندن یافت نشد. ممکن است فایل اسکن شده (تصویر) باشد.");
            }

            return fullText;
        } catch (err: any) {
            console.error("PDF Extraction Error:", err);
            if (err.name === 'PasswordException') {
                throw new Error("فایل PDF رمزگذاری شده است.");
            }
            throw new Error("خطا در خواندن فایل PDF. لطفاً فایل دیگری امتحان کنید.");
        }
    };

    const handleGenerate = async () => {
        if (inputType !== 'topic' && !file) return;
        if (inputType === 'topic' && !userPrompt) return;

        setIsProcessing(true);
        setError(null);
        setRefinedKnowledge('');
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let parts: any[] = [];

            // 1. Prepare Content for Phase 1
            setStatus('در حال پردازش ورودی (چندرسانه‌ای/متنی)...');
            setProgress(10);

            if (inputType === 'pdf' && file) {
                const pdfText = await extractTextFromPDF(file);
                setExtractedText(pdfText);
                parts = [{ text: `${CONTENT_REFINERY_PROMPT}\n\nTARGET LANGUAGE: ${targetLanguage}\n\nSOURCE MATERIAL:\n"""${pdfText.substring(0, 800000)}"""` }];
            } else if (inputType === 'audio' && file) {
                const base64 = await fileToBase64(file);
                parts = [
                    { text: `${CONTENT_REFINERY_PROMPT}\n\nTARGET LANGUAGE: ${targetLanguage}\n\nAnalyze the attached audio file (Podcast/Speech) directly:` },
                    { inlineData: { mimeType: file.type, data: base64 } }
                ];
            } else if (inputType === 'image' && file) {
                 const base64 = await fileToBase64(file);
                 parts = [
                    { text: `${CONTENT_REFINERY_PROMPT}\n\nTARGET LANGUAGE: ${targetLanguage}\n\nAnalyze the attached image (Diagram/Infographic/Notes) directly:` },
                    { inlineData: { mimeType: file.type, data: base64 } }
                ];
            } else {
                parts = [{ text: `${CONTENT_REFINERY_PROMPT}\n\nTARGET LANGUAGE: ${targetLanguage}\n\nSOURCE MATERIAL:\n"""${userPrompt}"""` }];
            }

            // 2. Refine Content (Phase 1)
            setStatus('فاز ۱: پالایش دانش و ترجمه مفاهیم کلیدی (Refinery)...');
            setProgress(40);

            const refineryResponse = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [{ role: 'user', parts: parts }],
                config: {
                    temperature: contentStyle === 'CRYSTAL' ? 0.6 : 0.3 // Higher temp for Crystal style
                }
            });
            
            const refinedText = refineryResponse.text || '';
            setRefinedKnowledge(refinedText);

            // 3. Architect Course (Phase 2)
            setStatus('فاز ۲: معماری دوره و ساختاردهی (Architecting)...');
            setProgress(70);

            // Scale & Style Instructions
            let scaleInstruction = "";
            if (courseScale === 'MINI') {
                scaleInstruction = "Generate a Short/Crash Course. Create exactly 3-5 Modules. Keep descriptions concise.";
            } else if (courseScale === 'STANDARD') {
                scaleInstruction = "Generate a Standard Course. Create exactly 8-10 Modules. Balanced depth.";
            } else if (courseScale === 'MASTERY') {
                scaleInstruction = "Generate a Comprehensive Mastery Course. Create 15-20 Modules. Extremely detailed content, deep explanations, and multiple examples per lesson. Go deep into the topic.";
            }

            let styleInstruction = "";
            if (contentStyle === 'CRYSTAL') {
                styleInstruction = "USE 'CRYSTAL' STYLE: Connect concepts non-linearly. Use metaphors. Create visual text structures (ASCII art diagrams) in the content. Focus on 'Why' and deep wisdom.";
            }

            const specificSchemaInstruction = `
            **IMPORTANT OUTPUT SCHEMA UPDATE:**
            Instead of an array, return a JSON object with this exact structure:
            {
              "courseTitle": "A catchy, marketing-oriented, high-value title for this course in ${targetLanguage}",
              "modules": [
                 ... (modules array as per original schema) ...
              ]
            }
            `;

            const architectResponse = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [{ 
                    role: 'user', 
                    parts: [{ text: `${COURSE_ARCHITECT_PROMPT}\n\n${specificSchemaInstruction}\n\nTARGET LANGUAGE: ${targetLanguage}\n\nSCALE CONFIGURATION: ${scaleInstruction}\n\nSTYLE CONFIGURATION: ${styleInstruction}\n\nKNOWLEDGE BASE:\n"""${refinedText}"""` }] 
                }],
                config: {
                    responseMimeType: 'application/json',
                    temperature: contentStyle === 'CRYSTAL' ? 0.7 : 0.3
                }
            });

            if (!architectResponse.text) {
                throw new Error("پاسخی از هوش مصنوعی دریافت نشد.");
            }
            
            setProgress(90);
            setStatus('در حال نهایی‌سازی...');

            const jsonStr = cleanJsonString(architectResponse.text);
            let modules: LMSModule[];
            let generatedTitle = "";
            
            try {
                const parsed = JSON.parse(jsonStr);
                if (Array.isArray(parsed)) {
                    modules = parsed;
                } else {
                    modules = parsed.modules || [];
                    generatedTitle = parsed.courseTitle || "";
                }
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError);
                throw new Error("هوش مصنوعی پاسخ نامعتبر داد. لطفاً دوباره تلاش کنید.");
            }

            // Generate metadata based on the result
            // In a real scenario, we could ask AI for these too, but let's derive them for speed
            const result: AIResponse = {
                modules: modules,
                suggestedPrice: isPaid ? (courseScale === 'MASTERY' ? 4500000 : 2500000) : 0, 
                targetAudience: "علاقه‌مندان به یادگیری عمیق",
                shortDescription: `دوره‌ای جامع بر اساس محتوای "${file ? file.name : 'موضوع انتخابی'}"`,
                estimatedDuration: `${modules.length} هفته`,
                courseTitle: generatedTitle
            };

            setGeneratedData(result);
            setFinalPrice(result.suggestedPrice.toString());
            setTargetAudience(result.targetAudience);
            setStep('result');

        } catch (err: any) {
            console.error(err);
            setError(err.message || "خطایی رخ داد.");
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const handlePublishCourse = () => {
        if (!generatedData) return;

        const newCourse: Course = {
            id: `gen-course-${Date.now()}`,
            title: generatedData.courseTitle || (inputType !== 'topic' ? file?.name.split('.')[0] || 'دوره جدید' : userPrompt.substring(0, 50)),
            shortDescription: generatedData.shortDescription,
            longDescription: `این دوره بر اساس منابع معتبر و با کمک هوش مصنوعی طراحی شده است.\n\nمخاطب هدف: ${targetAudience}\n\n---\n\n${refinedKnowledge.substring(0, 500)}...`,
            instructor: user?.name || 'هوشمانا',
            duration: generatedData.estimatedDuration || `${generatedData.modules.length} هفته`,
            level: courseScale === 'MASTERY' ? 'فوق پیشرفته' : 'تخصصی',
            tags: ['AI Generated', targetAcademy, 'Premium'],
            imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2940&auto=format&fit=crop',
            price: isPaid ? parseInt(finalPrice) || 0 : 0,
            modules: generatedData.modules,
            xpReward: generatedData.modules.length * 1500,
            coverGradient: 'from-indigo-900 to-purple-900',
            targetAudience: targetAudience || generatedData.targetAudience
        };

        dispatch({ type: 'ADD_GENERATED_COURSE', payload: newCourse });
        
        // Redirect based on selected academy
        let view: View = View.BUSINESS_ACADEMY;
        if (targetAcademy === 'ai') view = View.AI_ACADEMY;
        if (targetAcademy === 'english') view = View.ENGLISH_ACADEMY;
        if (targetAcademy === 'coaching') view = View.COACHING_LAB;
        
        dispatch({ type: 'SET_VIEW', payload: view });
    };

    const handleDownloadRefinedKnowledge = () => {
        const element = document.createElement("a");
        const fileBlob = new Blob([refinedKnowledge], {type: 'text/plain'});
        element.href = URL.createObjectURL(fileBlob);
        element.download = `refined-knowledge-${Date.now()}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="w-full h-full bg-stone-900 text-white rounded-2xl shadow-lg flex flex-col border border-stone-700 overflow-hidden">
            <div className="p-4 border-b border-stone-700 bg-stone-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <DocumentTextIcon className="w-6 h-6 text-emerald-400" />
                    <h3 className="font-bold text-lg">مولد دوره آموزشی (Alchemy Multimodal)</h3>
                </div>
                {step !== 'upload' && step !== 'processing' && (
                    <button onClick={() => setStep('upload')} className="text-xs text-stone-400 hover:text-white">شروع مجدد</button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {step === 'upload' && (
                    <div className="flex flex-col items-center justify-center h-full space-y-8">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-800 p-2 rounded-xl">
                            <button 
                                onClick={() => { setInputType('pdf'); setFile(null); }}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-2 ${inputType === 'pdf' ? 'bg-emerald-600 text-white shadow' : 'text-stone-400 hover:text-white'}`}
                            >
                                <DocumentTextIcon className="w-5 h-5" /> PDF
                            </button>
                             <button 
                                onClick={() => { setInputType('audio'); setFile(null); }}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-2 ${inputType === 'audio' ? 'bg-emerald-600 text-white shadow' : 'text-stone-400 hover:text-white'}`}
                            >
                                <MicrophoneIcon className="w-5 h-5" /> صدا / پادکست
                            </button>
                             <button 
                                onClick={() => { setInputType('image'); setFile(null); }}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-2 ${inputType === 'image' ? 'bg-emerald-600 text-white shadow' : 'text-stone-400 hover:text-white'}`}
                            >
                                <PhotoIcon className="w-5 h-5" /> تصویر / اسلاید
                            </button>
                            <button 
                                onClick={() => { setInputType('topic'); setFile(null); }}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-2 ${inputType === 'topic' ? 'bg-emerald-600 text-white shadow' : 'text-stone-400 hover:text-white'}`}
                            >
                                <SparklesIcon className="w-5 h-5" /> موضوع متنی
                            </button>
                        </div>

                        {inputType !== 'topic' ? (
                            <div className="w-full max-w-md">
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-stone-600 border-dashed rounded-2xl cursor-pointer bg-stone-800/50 hover:bg-stone-800 hover:border-emerald-500 transition-all group"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <ArrowUpTrayIcon className="w-12 h-12 text-stone-500 mb-4 group-hover:text-emerald-400 transition-colors" />
                                        <p className="mb-2 text-sm text-stone-400"><span className="font-semibold text-white">کلیک کنید</span> یا فایل را اینجا رها کنید</p>
                                        <p className="text-xs text-stone-500">
                                            {inputType === 'pdf' ? 'PDF (کتاب، جزوه)' : 
                                             inputType === 'audio' ? 'MP3, WAV (تا ۵۰ مگابایت)' : 
                                             'JPG, PNG (اسلاید، نمودار)'}
                                        </p>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        accept={inputType === 'pdf' ? 'application/pdf' : inputType === 'audio' ? 'audio/*' : 'image/*'} 
                                        onChange={handleFileChange} 
                                    />
                                </div>
                                {file && (
                                    <div className="mt-4 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg flex items-center gap-3">
                                        <CheckCircleIcon className="w-6 h-6 text-emerald-400" />
                                        <span className="text-sm text-emerald-100 truncate">{file.name}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full max-w-md">
                                <textarea 
                                    value={userPrompt}
                                    onChange={e => setUserPrompt(e.target.value)}
                                    placeholder="موضوع دوره را با جزئیات بنویسید (مثلا: دوره جامع آموزش دیجیتال مارکتینگ برای املاک...)"
                                    className="w-full h-64 bg-stone-800 border border-stone-600 rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                />
                            </div>
                        )}

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button 
                            onClick={() => setStep('settings')}
                            disabled={inputType !== 'topic' ? !file : !userPrompt}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-10 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            مرحله بعد
                        </button>
                    </div>
                )}

                {step === 'settings' && (
                    <div className="max-w-lg mx-auto space-y-6">
                        <h2 className="text-xl font-bold text-center mb-6">تنظیمات ساختار دوره</h2>
                        
                        <div className="bg-stone-800 p-6 rounded-2xl border border-stone-700 space-y-6">
                            
                            {/* Style & Scale */}
                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-3 flex items-center gap-2">
                                    <ChartBarIcon className="w-4 h-4"/> سبک و عمق محتوا
                                </label>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                     <button 
                                        onClick={() => setContentStyle('STANDARD')}
                                        className={`p-3 rounded-xl border text-center flex items-center justify-center gap-2 transition-all ${contentStyle === 'STANDARD' ? 'bg-stone-700 border-stone-500 text-white' : 'border-stone-600 text-stone-400 hover:bg-stone-700'}`}
                                    >
                                        استاندارد
                                    </button>
                                    <button 
                                        onClick={() => setContentStyle('CRYSTAL')}
                                        className={`p-3 rounded-xl border text-center flex items-center justify-center gap-2 transition-all ${contentStyle === 'CRYSTAL' ? 'bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-pink-500 text-white' : 'border-stone-600 text-stone-400 hover:bg-stone-700'}`}
                                    >
                                        <CubeTransparentIcon className="w-4 h-4" />
                                        کریستالی (Crystal)
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <button 
                                        onClick={() => setCourseScale('MINI')} 
                                        className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${courseScale === 'MINI' ? 'bg-emerald-900/40 border-emerald-500 text-white' : 'border-stone-600 text-stone-400 hover:bg-stone-700'}`}
                                    >
                                        <span className="text-xs font-bold">فشرده (Crash)</span>
                                        <span className="text-[10px] opacity-70">۴ تا ۶ جلسه</span>
                                    </button>
                                    <button 
                                        onClick={() => setCourseScale('STANDARD')} 
                                        className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${courseScale === 'STANDARD' ? 'bg-emerald-900/40 border-emerald-500 text-white' : 'border-stone-600 text-stone-400 hover:bg-stone-700'}`}
                                    >
                                        <span className="text-xs font-bold">استاندارد</span>
                                        <span className="text-[10px] opacity-70">۸ تا ۱۰ جلسه</span>
                                    </button>
                                    <button 
                                        onClick={() => setCourseScale('MASTERY')} 
                                        className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${courseScale === 'MASTERY' ? 'bg-amber-900/40 border-amber-500 text-white ring-1 ring-amber-500' : 'border-stone-600 text-stone-400 hover:bg-stone-700'}`}
                                    >
                                        <div className="flex items-center gap-1">
                                             <span className="text-xs font-bold">جامع (Mastery)</span>
                                             <StarIcon className="w-3 h-3 text-amber-400" />
                                        </div>
                                        <span className="text-[10px] opacity-70">۱۵ تا ۲۰ جلسه</span>
                                    </button>
                                </div>
                                {courseScale === 'MASTERY' && (
                                    <p className="text-xs text-amber-300 mt-2 text-center bg-amber-900/20 p-2 rounded">
                                        ⚠️ حالت جامع محتوای بسیار عمیق‌تری تولید می‌کند و زمان پردازش بیشتری نیاز دارد.
                                    </p>
                                )}
                            </div>

                             {/* Language */}
                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-2 flex items-center gap-2">
                                    <GlobeIcon className="w-4 h-4"/> زبان خروجی دوره
                                </label>
                                <div className="flex gap-2">
                                    <button onClick={() => setTargetLanguage('Persian')} className={`flex-1 py-2 rounded-lg border text-sm ${targetLanguage === 'Persian' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-stone-700 border-stone-600 text-stone-300'}`}>فارسی</button>
                                    <button onClick={() => setTargetLanguage('English')} className={`flex-1 py-2 rounded-lg border text-sm ${targetLanguage === 'English' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-stone-700 border-stone-600 text-stone-300'}`}>English</button>
                                </div>
                            </div>

                            <div className="border-t border-stone-700 pt-4">
                                <label className="block text-sm font-medium text-stone-400 mb-2">انتشار در کدام آکادمی؟</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <button onClick={() => setTargetAcademy('business')} className={`p-2 rounded-lg border text-center text-xs transition-all ${targetAcademy === 'business' ? 'bg-emerald-900/40 border-emerald-500 text-white' : 'border-stone-600 text-stone-400 hover:bg-stone-700'}`}>
                                        کسب‌وکار
                                    </button>
                                    <button onClick={() => setTargetAcademy('ai')} className={`p-2 rounded-lg border text-center text-xs transition-all ${targetAcademy === 'ai' ? 'bg-purple-900/40 border-purple-500 text-white' : 'border-stone-600 text-stone-400 hover:bg-stone-700'}`}>
                                        هوش مصنوعی
                                    </button>
                                    <button onClick={() => setTargetAcademy('english')} className={`p-2 rounded-lg border text-center text-xs transition-all ${targetAcademy === 'english' ? 'bg-blue-900/40 border-blue-500 text-white' : 'border-stone-600 text-stone-400 hover:bg-stone-700'}`}>
                                        زبان
                                    </button>
                                    <button onClick={() => setTargetAcademy('coaching')} className={`p-2 rounded-lg border text-center text-xs transition-all ${targetAcademy === 'coaching' ? 'bg-amber-900/40 border-amber-500 text-white' : 'border-stone-600 text-stone-400 hover:bg-stone-700'}`}>
                                        کوچینگ
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-stone-700/50 rounded-xl border border-stone-600">
                                <span className="text-sm flex items-center gap-2"><BanknotesIcon className="w-5 h-5 text-green-400"/> آیا این دوره پولی است؟</span>
                                <div 
                                    onClick={() => setIsPaid(!isPaid)}
                                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${isPaid ? 'bg-emerald-500' : 'bg-stone-600'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isPaid ? 'left-1' : 'right-1'}`}></div>
                                </div>
                            </div>

                            <button 
                                onClick={handleGenerate}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <SparklesIcon className="w-5 h-5" />
                                شروع کیمیاگری (Generate)
                            </button>
                        </div>
                    </div>
                )}

                {isProcessing && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="relative w-32 h-32 mb-8">
                            <div className="absolute inset-0 border-4 border-stone-700 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
                            <SparklesIcon className="absolute inset-0 m-auto w-12 h-12 text-emerald-400 animate-pulse"/>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{status}</h3>
                        <p className="text-stone-400">{progress}% تکمیل شده</p>
                        <div className="w-64 h-2 bg-stone-700 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                         <p className="text-xs text-stone-500 mt-4 max-w-xs">
                             در حال استفاده از مدل قدرتمند Gemini 3 Pro برای تحلیل حجم بالای اطلاعات.
                             <br/>لطفا تا پایان عملیات، صفحه را نبندید.
                         </p>
                    </div>
                )}

                {step === 'result' && generatedData && (
                    <div className="max-w-3xl mx-auto animate-fade-in">
                        <div className="flex gap-2 mb-6 border-b border-stone-700 pb-2">
                            <button 
                                onClick={() => setActiveResultTab('structure')}
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeResultTab === 'structure' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'}`}
                            >
                                ساختار دوره
                            </button>
                            <button 
                                onClick={() => setActiveResultTab('knowledge')}
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeResultTab === 'knowledge' ? 'bg-blue-600 text-white' : 'text-stone-400 hover:text-white'}`}
                            >
                                دانش پالایش شده (متن خام)
                            </button>
                        </div>

                        {activeResultTab === 'knowledge' && (
                            <div className="bg-stone-800 p-6 rounded-2xl border border-stone-700 mb-8 overflow-y-auto max-h-96 custom-scrollbar">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <DocumentTextIcon className="w-5 h-5 text-blue-400"/> متن تولید شده توسط هوش مصنوعی
                                    </h3>
                                    <button 
                                        onClick={() => {
                                            const element = document.createElement("a");
                                            const fileBlob = new Blob([refinedKnowledge], {type: 'text/plain'});
                                            element.href = URL.createObjectURL(fileBlob);
                                            element.download = `refined-knowledge-${Date.now()}.txt`;
                                            document.body.appendChild(element);
                                            element.click();
                                            document.body.removeChild(element);
                                        }}
                                        className="text-xs flex items-center gap-1 bg-stone-700 hover:bg-stone-600 px-3 py-1.5 rounded-md transition-colors text-white"
                                    >
                                        <ArrowDownTrayIcon className="w-4 h-4" /> دانلود متن
                                    </button>
                                </div>
                                <div className="prose prose-invert prose-sm max-w-none text-stone-300 whitespace-pre-wrap">
                                    {refinedKnowledge}
                                </div>
                            </div>
                        )}

                        {activeResultTab === 'structure' && (
                            <>
                                <div className="text-center mb-8">
                                    <div className="inline-block p-3 bg-emerald-500/20 rounded-full mb-4 text-emerald-400">
                                        <CheckCircleIcon className="w-12 h-12" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white">دوره شما آماده است!</h2>
                                    <p className="text-stone-400 mt-2">ساختار دوره با موفقیت از محتوای شما استخراج شد.</p>
                                </div>

                                <div className="bg-stone-800 rounded-2xl border border-stone-700 overflow-hidden mb-8">
                                    <div className="p-6 border-b border-stone-700 bg-stone-800/80 backdrop-blur-sm">
                                        <h3 className="text-xl font-bold text-white">{generatedData.courseTitle || (inputType !== 'topic' ? file?.name.split('.')[0] : userPrompt.substring(0, 30) + '...')}</h3>
                                        <p className="text-sm text-stone-400 mt-1">{generatedData.shortDescription}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="inline-block text-xs bg-stone-700 text-stone-300 px-2 py-1 rounded border border-stone-600">{generatedData.estimatedDuration}</span>
                                            <span className="inline-block text-xs bg-blue-900/40 text-blue-300 px-2 py-1 rounded border border-blue-500/30">{generatedData.modules.length} جلسه</span>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        {generatedData.modules.map((mod, idx) => (
                                            <div key={idx} className="flex items-start gap-4 p-4 bg-stone-700/30 rounded-xl border border-stone-700">
                                                <div className="w-8 h-8 bg-emerald-900/50 text-emerald-400 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white">{mod.title}</h4>
                                                    <p className="text-sm text-stone-400 mt-1">{mod.description}</p>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {mod.lessons.map((l, i) => (
                                                            <span key={i} className="text-xs bg-stone-800 px-2 py-1 rounded text-stone-300 border border-stone-600">{l.title}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-stone-800 p-6 rounded-2xl border border-stone-700 mb-8">
                                    <h4 className="font-bold text-white mb-4">تنظیمات نهایی فروش</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs text-stone-400 mb-1">قیمت پیشنهادی هوش مصنوعی (تومان)</label>
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    value={finalPrice} 
                                                    onChange={e => setFinalPrice(e.target.value)}
                                                    className="w-full bg-stone-900 border border-stone-600 rounded-lg p-3 text-white pl-10"
                                                    disabled={!isPaid}
                                                />
                                                <span className="absolute left-3 top-3 text-stone-500 text-xs">تومان</span>
                                            </div>
                                            {!isPaid && <p className="text-xs text-amber-400 mt-1">دوره به صورت رایگان منتشر خواهد شد.</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-stone-400 mb-1">مخاطب هدف</label>
                                            <input 
                                                type="text" 
                                                value={targetAudience || generatedData.targetAudience} 
                                                onChange={e => setTargetAudience(e.target.value)}
                                                className="w-full bg-stone-900 border border-stone-600 rounded-lg p-3 text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setStep('upload')} className="flex-1 py-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold transition-colors">
                                        انصراف
                                    </button>
                                    <button onClick={handlePublishCourse} className="flex-[2] py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2">
                                        <AcademicCapIcon className="w-6 h-6" />
                                        انتشار در آکادمی
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseCreatorTool;
