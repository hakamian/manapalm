
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { VideoCameraIcon, SparklesIcon, DocumentTextIcon, ArrowDownTrayIcon, GlobeIcon, MagnifyingGlassIcon, LinkIcon } from '../icons';
import { useAppDispatch } from '../../AppContext';
import HighTechLoader from '../HighTechLoader';

const LANGUAGES = [
    { id: 'فارسی', label: 'فارسی (Persian)' },
    { id: 'English', label: 'English' },
    { id: 'العربية', label: 'العربية (Arabic)' },
    { id: 'Turkish', label: 'Türkçe (Turkish)' },
];

type InputType = 'transcript' | 'search';

const YouTubeContentTool: React.FC = () => {
    const dispatch = useAppDispatch();
    const [inputType, setInputType] = useState<InputType>('search');
    const [inputValue, setInputValue] = useState('');
    
    const [searchLanguage, setSearchLanguage] = useState('English'); 
    const [targetLanguage, setTargetLanguage] = useState('فارسی');

    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [groundingMetadata, setGroundingMetadata] = useState<any>(null);

    const handleGenerate = async () => {
        if (!inputValue.trim()) {
            setError('لطفاً ورودی را تکمیل کنید.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult('');
        setGroundingMetadata(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const systemInstruction = `
# SYSTEM ROLE: THE ULTIMATE CONTENT ENGINE (V9.0 - CROSS-LANGUAGE MASTER)

**CORE DIRECTIVE:**
You are an elite Content Architect, Translator, and SEO Strategist. Your mission is to ingest input (URL, Topic, or Text), analyze it using the **Search Language**, and produce a high-value Blog Post in the **Target Language**.

**CONFIGURATION:**
1.  **SEARCH LANGUAGE (Source Truth):** ${searchLanguage}
    *   *Directives:* Use this language to search for trends, analyze the video transcript, and understand the core concepts.
2.  **TARGET LANGUAGE (Output):** ${targetLanguage}
    *   *Directives:* All final outputs (Summary, Analysis, Article) MUST be written in this language. Adopt the cultural tone and SEO norms of this language.

**INPUT PROCESSING LOGIC:**

1.  **IF INPUT IS A URL (e.g., youtube.com/...):**
    *   **Action:** Use \`googleSearch\` to find the video title, transcript, summary, and comments.
    *   **Source:** the video itself is the primary source.

2.  **IF INPUT IS A TOPIC (e.g., "Future of AI"):**
    *   **Action:** Use \`googleSearch\` to find the *most recent, trending, and authoritative* videos/articles in the **[${searchLanguage}]** language.
    *   **Synthesis:** Aggregate insights from top results to create a "Master Guide".

3.  **IF INPUT IS RAW TEXT:**
    *   **Action:** Analyze the text as the absolute source.

---

### EXECUTION PIPELINE:

**PHASE 0: MICRO-SUMMARY (خلاصه ۹۰ ثانیه‌ای)**
*   **Goal:** A hook to grab attention.
*   **Format:** Concise paragraph (~150 words). Hook + Problem + Solution + Key Insight.
*   **Language:** ${targetLanguage}

**PHASE 1: DEEP ANALYSIS & SOURCING**
*   **Extraction:** Pull out Frameworks, Steps, Statistics.
*   **Localization:** Translate concepts culturally, not just literally.
*   **Sources:** Explicitly list the Channels/URLs used (if search was performed).

**Deliverables (Markdown):**
1.  **Core Concept / هسته اصلی**
2.  **Key Actionable Points / خلاصه اجرایی**
3.  **Target Keywords / کلیدواژه‌های اصلی**
4.  **Audience Persona / پرسونای مخاطب**
5.  **Source URLs & Channels / منابع و کانال‌ها** (List specific URLs found via search)

**PHASE 2: SEO BLOG POST CREATION**
*   **Language:** ${targetLanguage}
*   **Structure:**
    *   **H1:** Viral & Keyword-rich Title.
    *   **Intro:** The Hook.
    *   **Body:** H2/H3 hierarchy. Short paragraphs. Use formatting (Bold, Bullet points).
    *   **Golden Tips (نکات طلایی):** Add expert commentary or "Pro Tips".
    *   **FAQ:** 3 Schema-optimized questions & answers.
    *   **Conclusion:** Strong CTA.

**SEO Rules:**
*   Primary keyword in H1, First Paragraph, and one H2.
*   Meta Description: < 160 chars.

**OUTPUT FORMAT (Markdown):**

---
### بخش صفر: خلاصه مدیریتی (Micro-Summary)
(Content in ${targetLanguage}...)
---
### بخش اول: آنالیز استراتژیک
**هسته اصلی:** ...
**کلمات کلیدی:** ...
**پرسونای مخاطب:** ...
**منابع و کانال‌ها (Sources):**
*   [Title](URL) - Channel Name
---
### بخش دوم: مقاله وبلاگ (Blog Post)
**Meta Description:** ...

# [H1 Title]
(Full SEO article in ${targetLanguage}...)
---
            `;

            // Enable search tool for URL/Title mode
            const tools = inputType === 'search' ? [{ googleSearch: {} }] : [];

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [{ 
                    role: 'user', 
                    parts: [{ text: `INPUT DATA:\n"""${inputValue}"""` }] 
                }],
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.7,
                    tools: tools
                }
            });
            
            // Add a small buffer to show off the loader even if API is fast
            setTimeout(() => {
                setResult(response.text || 'پاسخی دریافت نشد.');
                if (response.candidates?.[0]?.groundingMetadata) {
                    setGroundingMetadata(response.candidates[0].groundingMetadata);
                }
                setIsLoading(false);
            }, 1500);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "خطایی رخ داد. لطفاً ورودی را بررسی کرده و دوباره تلاش کنید.");
            setIsLoading(false);
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
                messages={[
                    "اتصال به موتور جستجوی معنایی گوگل...",
                    `اسکن منابع معتبر به زبان ${searchLanguage}...`,
                    "استخراج ترندها و نکات کلیدی...",
                    "تولید ساختار سئو شده (SEO Architecture)...",
                    `ترجمه فرهنگی و بومی‌سازی به ${targetLanguage}...`,
                    "اعمال الگوریتم‌های E-E-A-T گوگل...",
                    "نگارش نهایی مقاله..."
                ]}
            />

            <div className="p-4 border-b border-stone-700 bg-stone-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-red-900/30 rounded-lg text-red-500">
                        <VideoCameraIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">موتور محتوای جهانی (V9.0)</h3>
                        <p className="text-xs text-stone-400">جستجوی بین‌زبانی و تولید مقاله SEO</p>
                    </div>
                </div>
                
                {/* Language Settings */}
                <div className="flex items-center gap-3 bg-stone-900 p-2 rounded-lg border border-stone-700">
                    <div className="flex items-center gap-1">
                        <MagnifyingGlassIcon className="w-3 h-3 text-stone-500" />
                        <span className="text-[10px] text-stone-400">جستجو در:</span>
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
                        <span className="text-[10px] text-stone-400">خروجی به:</span>
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
                            onClick={() => { setInputType('search'); setInputValue(''); }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${inputType === 'search' ? 'bg-red-600 text-white shadow' : 'text-stone-400 hover:text-white'}`}
                        >
                            <LinkIcon className="w-4 h-4" /> لینک / موضوع
                        </button>
                        <button 
                            onClick={() => { setInputType('transcript'); setInputValue(''); }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${inputType === 'transcript' ? 'bg-stone-600 text-white shadow' : 'text-stone-400 hover:text-white'}`}
                        >
                            <DocumentTextIcon className="w-4 h-4" /> متن خام
                        </button>
                    </div>

                    <div className="mb-4 flex-grow">
                        <label className="block text-sm font-semibold text-stone-300 mb-2">
                            {inputType === 'transcript' ? 'متن زیرنویس (Transcript):' : 'لینک یوتیوب یا موضوع ترند:'}
                        </label>
                        
                        {inputType === 'transcript' ? (
                            <>
                                <p className="text-xs text-stone-500 mb-2">
                                    متن کامل را اینجا پیست کنید. سیستم آن را تمیز و تبدیل می‌کند.
                                </p>
                                <textarea 
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    placeholder="متن خام ویدیو را اینجا قرار دهید..."
                                    className="w-full h-64 bg-stone-800/50 border border-stone-700 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                />
                            </>
                        ) : (
                            <>
                                <p className="text-xs text-stone-500 mb-2">
                                    لینک ویدیو یا موضوعی که می‌خواهید در <strong>{searchLanguage}</strong> جستجو شود را وارد کنید.
                                </p>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        placeholder={`مثلاً: "AI Trends 2025" یا لینک یوتیوب...`}
                                        className="w-full bg-stone-800/50 border border-stone-700 rounded-xl p-4 pl-10 text-sm text-white focus:ring-2 focus:ring-red-500 outline-none dir-ltr"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">
                                        {inputValue.includes('http') ? <LinkIcon className="w-5 h-5"/> : <MagnifyingGlassIcon className="w-5 h-5"/>}
                                    </div>
                                </div>
                                {inputValue && !inputValue.includes('http') && (
                                    <div className="mt-3 p-2 bg-amber-900/20 border border-amber-500/30 rounded text-xs text-amber-300">
                                        💡 نکته: سیستم بهترین ویدیوهای {searchLanguage} را درباره «{inputValue}» پیدا کرده و مقاله را به {targetLanguage} می‌نویسد.
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {error && <p className="text-red-400 text-xs text-center mb-2">{error}</p>}

                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || !inputValue}
                        className="w-full mt-auto bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>در حال پردازش...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                {inputType === 'search' ? 'تحلیل و نگارش مقاله' : 'پردازش متن'}
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

                            {/* Grounding Sources */}
                            {groundingMetadata?.groundingChunks && (
                                <div className="mb-6 p-4 bg-stone-800 rounded-xl border border-stone-700">
                                    <h4 className="text-xs font-bold text-stone-400 mb-2 uppercase flex items-center gap-1">
                                        <GlobeIcon className="w-3 h-3"/> منابع بررسی شده (Grounding):
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
                                        h1: ({node, ...props}) => <h1 className="text-3xl font-black text-amber-400 mt-8 mb-4 border-b border-amber-500/30 pb-2" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-blue-300 mt-8 mb-3" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-xl font-bold text-white mt-6 mb-2" {...props} />,
                                        strong: ({node, ...props}) => <strong className="text-amber-200 font-bold" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc list-inside my-4 space-y-1 bg-stone-900/50 p-4 rounded-lg border border-stone-700" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-r-4 border-red-500 bg-red-900/10 p-4 rounded-r-lg italic text-stone-300 my-6" {...props} />,
                                        table: ({node, ...props}) => <div className="overflow-x-auto my-6 rounded-lg border border-stone-600"><table className="min-w-full divide-y divide-stone-700" {...props} /></div>,
                                        th: ({node, ...props}) => <th className="px-6 py-3 bg-stone-800 text-right text-xs font-medium text-stone-300 uppercase tracking-wider" {...props} />,
                                        td: ({node, ...props}) => <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-300 border-t border-stone-700" {...props} />,
                                        hr: ({node, ...props}) => <hr className="border-stone-600 my-8" {...props} />,
                                    }}
                                >
                                    {result}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-stone-500 opacity-60 text-center p-8">
                            <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center mb-4">
                                <VideoCameraIcon className="w-12 h-12 text-stone-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">منتظر ورودی شما</h3>
                            <p className="text-sm max-w-md">
                                لینک یوتیوب، موضوع یا متن را وارد کنید. <br/>
                                ما می‌توانیم منابع {searchLanguage} را تحلیل کرده و به {targetLanguage} بنویسیم.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default YouTubeContentTool;
