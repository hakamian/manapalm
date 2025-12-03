
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AcademicCapIcon, SparklesIcon, DocumentTextIcon, ArrowDownTrayIcon, GlobeIcon, MagnifyingGlassIcon, LinkIcon } from '../icons';
import { useAppDispatch } from '../../AppContext';
import HighTechLoader from '../HighTechLoader';

const LANGUAGES = [
    { id: 'فارسی', label: 'فارسی (Persian)' },
    { id: 'English', label: 'English' },
    { id: 'العربية', label: 'العربية (Arabic)' },
    { id: 'Turkish', label: 'Türkçe (Turkish)' },
];

type InputType = 'url' | 'topic';

const VideoCourseTool: React.FC = () => {
    const dispatch = useAppDispatch();
    const [inputType, setInputType] = useState<InputType>('topic');
    const [inputValue, setInputValue] = useState('');
    
    const [searchLanguage, setSearchLanguage] = useState('English'); 
    const [targetLanguage, setTargetLanguage] = useState('فارسی');

    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [groundingMetadata, setGroundingMetadata] = useState<any>(null);
    const [isFinishing, setIsFinishing] = useState(false);

    const handleGenerate = async () => {
        if (!inputValue.trim()) {
            setError('لطفاً ورودی را تکمیل کنید.');
            return;
        }

        setIsLoading(true);
        setIsFinishing(false);
        setError(null);
        setResult('');
        setGroundingMetadata(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const systemInstruction = `
# SYSTEM ROLE: THE EDUCATIONAL ALCHEMIST (V7.0 - VIDEO TO COURSE)

**CORE DIRECTIVE:**
You are a Grandmaster Instructional Designer and Knowledge Architect. Your mission is to ingest educational video content (via URL or Topic Search) and transform it into a structured, high-impact **Course Syllabus & Knowledge Base** in the **Target Language**.

**CONFIGURATION:**
1.  **SEARCH LANGUAGE (Source Truth):** ${searchLanguage}
    *   *Directive:* Search, analyze, and understand the content in this language to ensure maximum depth and accuracy.
2.  **TARGET LANGUAGE (Output):** ${targetLanguage}
    *   *Directive:* All outputs (Modules, Lessons, Explanations) MUST be in this language. Use professional, academic, yet engaging tone.

**INPUT PROCESSING:**
*   **IF INPUT IS URL:** Analyze the specific video content.
*   **IF INPUT IS TOPIC:** Search for the *most authoritative* and *comprehensive* videos/guides in [${searchLanguage}] to create a "Master Course".

---

### EXECUTION PIPELINE:

**PHASE 0: MICRO-SUMMARY (خلاصه ۹۰ ثانیه‌ای)**
*   **Goal:** A "Trailer" for the course.
*   **Format:** ~150 words. Hook + Promise of Transformation.

**PHASE 1: DEEP KNOWLEDGE REFINEMENT**
*   **Purification:** Strip away fluff. Keep Models, Frameworks, Steps, and Data.
*   **Localization:** Translate technical terms but keep original in parens: e.g., "مدل ذهنی (Mental Model)".
*   **Deliverables:**
    1.  **هسته اصلی (Core Concept):** The "Big Idea".
    2.  **چارچوب‌ها و مدل‌های کلیدی:** Top 3-5 methodologies with "How-to" steps.
    3.  **بینش‌های خلاف عرف:** Myth-busting facts.
    4.  **واژگان ضروری:** Glossary.
    5.  **Sources:** List channels/URLs used.

**PHASE 2: COURSE ARCHITECTURE (ساختار دوره)**
*   **Structure:** Break the knowledge into a logical **Module > Lesson** hierarchy.
*   **For Each Module:**
    *   **Title:** Catchy & Benefit-driven.
    *   **Learning Outcome:** "By the end of this module, students will be able to..."
*   **For Each Lesson:**
    *   **Lesson Title:** Specific topic.
    *   **Key Takeaways:** Bullet points.
    *   **Active Exercise (تمرین عملی):** A concrete task for the student to do.

**OUTPUT FORMAT (Markdown):**

---
### بخش صفر: معرفی دوره (Course Trailer)
(Content...)
---
### بخش اول: دانش عمیق و تحلیل (Knowledge Base)
**هسته اصلی:** ...
**چارچوب‌های کلیدی:** ...
**واژگان ضروری:** ...
**منابع (Sources):** ...
---
### بخش دوم: طرح درس جامع (Syllabus)
**ماژول ۱: ...**
*   **هدف یادگیری:** ...
*   **درس ۱.۱:** ...
    *   *تمرین:* ...
*   **درس ۱.۲:** ...
    *   *تمرین:* ...

**ماژول ۲: ...**
...
---
            `;

            // Always use search tool to find/ground content
            const tools = [{ googleSearch: {} }];

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [{ 
                    role: 'user', 
                    parts: [{ text: `INPUT TOPIC/URL:\n"""${inputValue}"""` }] 
                }],
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.5, // Lower temperature for more structured educational content
                    tools: tools
                }
            });
            
            setIsFinishing(true);
            
            // Add a small buffer for the "finishing" animation
            setTimeout(() => {
                setResult(response.text || 'پاسخی دریافت نشد.');
                if (response.candidates?.[0]?.groundingMetadata) {
                    setGroundingMetadata(response.candidates[0].groundingMetadata);
                }
                setIsLoading(false);
                setIsFinishing(false);
            }, 2000);

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
                    "اتصال به پایگاه دانش جهانی...",
                    `جستجوی بهترین منابع آموزشی به زبان ${searchLanguage}...`,
                    "تحلیل پداگوژیک (Pedagogical Analysis) محتوا...",
                    "استخراج مدل‌های ذهنی و چارچوب‌های عملی...",
                    "طراحی ساختار ماژولار دوره...",
                    `بومی‌سازی و ترجمه تخصصی به ${targetLanguage}...`,
                    "طراحی تمرین‌های عملی برای هر درس...",
                    "تدوین نهایی طرح درس (Syllabus)..."
                ]}
            />

            <div className="p-4 border-b border-stone-700 bg-stone-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-900/30 rounded-lg text-indigo-400">
                        <AcademicCapIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">کیمیاگر دوره (Edu-Architect)</h3>
                        <p className="text-xs text-stone-400">تبدیل ویدیو/موضوع به دوره آموزشی کامل</p>
                    </div>
                </div>
                
                {/* Language Settings */}
                <div className="flex items-center gap-3 bg-stone-900 p-2 rounded-lg border border-stone-700">
                    <div className="flex items-center gap-1">
                        <MagnifyingGlassIcon className="w-3 h-3 text-stone-500" />
                        <span className="text-[10px] text-stone-400">منبع:</span>
                        <select 
                            value={searchLanguage} 
                            onChange={(e) => setSearchLanguage(e.target.value)}
                            className="bg-stone-800 border border-stone-600 text-xs rounded px-1 py-1 focus:ring-1 focus:ring-blue-500 outline-none text-blue-300"
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.id} value={lang.id}>{lang.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-px h-4 bg-stone-600"></div>
                    <div className="flex items-center gap-1">
                        <GlobeIcon className="w-3 h-3 text-stone-500" />
                        <span className="text-[10px] text-stone-400">خروجی:</span>
                        <select 
                            value={targetLanguage} 
                            onChange={(e) => setTargetLanguage(e.target.value)}
                            className="bg-stone-800 border border-stone-600 text-xs rounded px-1 py-1 focus:ring-1 focus:ring-green-500 outline-none text-green-300"
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.id} value={lang.id}>{lang.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Input Section */}
                <div className="w-full lg:w-1/3 bg-stone-900 p-6 border-b lg:border-b-0 lg:border-l border-stone-800 overflow-y-auto custom-scrollbar flex flex-col">
                    
                    {/* Input Type Toggle */}
                    <div className="flex bg-stone-800 p-1 rounded-lg mb-6">
                        <button 
                            onClick={() => { setInputType('topic'); setInputValue(''); }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${inputType === 'topic' ? 'bg-indigo-600 text-white shadow' : 'text-stone-400 hover:text-white'}`}
                        >
                            <SparklesIcon className="w-4 h-4" /> موضوع / تایتل
                        </button>
                        <button 
                            onClick={() => { setInputType('url'); setInputValue(''); }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${inputType === 'url' ? 'bg-indigo-600 text-white shadow' : 'text-stone-400 hover:text-white'}`}
                        >
                            <LinkIcon className="w-4 h-4" /> لینک ویدیو
                        </button>
                    </div>

                    <div className="mb-4 flex-grow">
                        <label className="block text-sm font-semibold text-stone-300 mb-2">
                            {inputType === 'url' ? 'لینک ویدیوی یوتیوب:' : 'موضوع دوره یا مهارت مورد نظر:'}
                        </label>
                        
                        <div className="relative">
                            <input 
                                type="text"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                placeholder={inputType === 'url' ? "https://youtube.com/..." : "مثلاً: آموزش پیشرفته پایتون، تکنیک‌های مذاکره..."}
                                className="w-full bg-stone-800/50 border border-stone-700 rounded-xl p-4 pl-10 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">
                                {inputType === 'url' ? <LinkIcon className="w-5 h-5"/> : <MagnifyingGlassIcon className="w-5 h-5"/>}
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg text-xs text-indigo-200 leading-relaxed">
                            {inputType === 'topic' ? (
                                <p>💡 <strong>استراتژی:</strong> سیستم بهترین و معتبرترین منابع <strong>{searchLanguage}</strong> را پیدا کرده و یک دوره جامع (Master Class) به زبان <strong>{targetLanguage}</strong> طراحی می‌کند.</p>
                            ) : (
                                <p>💡 <strong>استراتژی:</strong> سیستم محتوای ویدیو را عمیقاً تحلیل کرده و ساختار آموزشی، تمرین‌ها و نکات کلیدی را به زبان <strong>{targetLanguage}</strong> استخراج می‌کند.</p>
                            )}
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-xs text-center mb-2">{error}</p>}

                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || !inputValue}
                        className="w-full mt-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>در حال معماری دوره...</span>
                            </>
                        ) : (
                            <>
                                <AcademicCapIcon className="w-5 h-5" />
                                ساخت دوره آموزشی
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
                                    طرح درس و محتوای دوره
                                </h2>
                                <button onClick={handleCopy} className="text-xs bg-stone-700 hover:bg-stone-600 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors text-white">
                                    <ArrowDownTrayIcon className="w-4 h-4" /> کپی کل متن
                                </button>
                            </div>

                            {/* Grounding Sources */}
                            {groundingMetadata?.groundingChunks && (
                                <div className="mb-6 p-4 bg-stone-800 rounded-xl border border-stone-700">
                                    <h4 className="text-xs font-bold text-stone-400 mb-2 uppercase flex items-center gap-1">
                                        <GlobeIcon className="w-3 h-3"/> منابع آموزشی استفاده شده:
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
                                        h1: ({node, ...props}) => <h1 className="text-3xl font-black text-amber-400 mt-8 mb-6 border-b border-amber-500/30 pb-2" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-indigo-300 mt-10 mb-4" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-xl font-bold text-white mt-8 mb-2 flex items-center gap-2" {...props} />,
                                        strong: ({node, ...props}) => <strong className="text-amber-200 font-bold" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc list-inside my-4 space-y-2 bg-stone-900/50 p-6 rounded-xl border border-stone-700" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-r-4 border-indigo-500 bg-indigo-900/10 p-4 rounded-r-lg italic text-stone-300 my-6" {...props} />,
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
                                <AcademicCapIcon className="w-12 h-12 text-stone-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">طراحی دوره آموزشی</h3>
                            <p className="text-sm max-w-md">
                                موضوع یا لینک ویدیو را وارد کنید تا هوش مصنوعی یک دوره کامل شامل سرفصل، درس‌نامه و تمرین برای شما طراحی کند.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoCourseTool;
