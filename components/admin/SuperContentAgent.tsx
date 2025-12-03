
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
    CpuChipIcon, DocumentTextIcon, MicrophoneIcon, 
    VideoCameraIcon, ArrowUpTrayIcon, SparklesIcon, 
    CheckCircleIcon, AcademicCapIcon, SpeakerWaveIcon,
    LinkIcon, PhotoIcon, PaperAirplaneIcon, GlobeIcon,
    MegaphoneIcon, CogIcon, LightBulbIcon, PencilSquareIcon
} from '../icons';
import HighTechLoader from '../HighTechLoader';
import { useAppDispatch } from '../../AppContext';
import { Course, CommunityPost, LMSModule } from '../../types';

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
    // Remove markdown code blocks if present
    clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
    clean = clean.replace(/\s*```$/, '');
    return clean;
};

const LANGUAGES = [
    { id: 'Persian', label: 'فارسی' },
    { id: 'English', label: 'English' },
    { id: 'Arabic', label: 'العربية' },
    { id: 'Turkish', label: 'Türkçe' },
];

const TONES = [
    { id: 'Professional', label: 'رسمی و حرفه‌ای (Forbes Style)' },
    { id: 'Friendly', label: 'صمیمی و دوستانه (Blog Style)' },
    { id: 'Viral', label: 'جنجالی و وایرال (Hook-Heavy)' },
    { id: 'Academic', label: 'علمی و عمیق (Deep Dive)' },
    { id: 'Storytelling', label: 'قصه‌گو و روایی (Narrative)' },
];

interface AgentOutput {
    thinking_process: string; // Reasoning field
    summary: string;
    article: { title: string; content: string; seoTitle: string; tags: string[] };
    podcastScript: string;
    courseStructure: { title: string; description: string; modules: LMSModule[]; price: number };
}

const SuperContentAgent: React.FC = () => {
    const dispatch = useAppDispatch();
    
    // Input State
    const [inputType, setInputType] = useState<'url' | 'file' | 'text'>('url');
    const [inputValue, setInputValue] = useState('');
    const [file, setFile] = useState<File | null>(null);
    
    // Configuration State
    const [targetLanguage, setTargetLanguage] = useState('Persian');
    const [contentTone, setContentTone] = useState('Professional');

    // Process State
    const [isLoading, setIsLoading] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [isRefining, setIsRefining] = useState(false); 
    const [output, setOutput] = useState<AgentOutput | null>(null);
    const [activeTab, setActiveTab] = useState<'summary' | 'article' | 'podcast' | 'course'>('summary');
    const [publishedStates, setPublishedStates] = useState({ article: false, course: false });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleGenerate = async () => {
        if (inputType === 'text' && !inputValue) return;
        if (inputType === 'url' && !inputValue) return;
        if (inputType === 'file' && !file) return;

        setIsLoading(true);
        setIsFinishing(false);
        setOutput(null);
        setPublishedStates({ article: false, course: false });

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let parts: any[] = [];
            let tools: any[] = [];

            // Prepare Input
            if (inputType === 'url') {
                tools = [{ googleSearch: {} }];
                parts = [{ text: `Analyze this URL content deeply: ${inputValue}` }];
            } else if (inputType === 'text') {
                parts = [{ text: `Analyze this text: """${inputValue}"""` }];
            } else if (inputType === 'file' && file) {
                const base64 = await fileToBase64(file);
                parts = [
                    { inlineData: { mimeType: file.type, data: base64 } },
                    { text: "Analyze this file content." }
                ];
            }

            // Advanced System Instruction (V2.1 - Agentic Workflow & Anti-Robotic)
            const systemInstruction = `
            # ROLE: THE OMNI-AGENT (V2.1 - Content Architect)
            You are a Grandmaster Content Strategist.

            **MISSION:** 
            Transform raw input into a cohesive, high-value content ecosystem (Summary, Article, Podcast, Course).

            **CONFIGURATION:**
            - **Target Language:** ${targetLanguage}.
            - **Tone:** ${contentTone}.

            **ANTI-ROBOTIC PROTOCOL (CRITICAL):**
            - Do NOT use literal translations or "Translation-ese". 
            - Use natural, fluid ${targetLanguage} idioms.
            - Avoid repetitive sentence structures. 
            - Write like a human expert, not an AI.
            - Use sensory details and storytelling hooks.

            **THE "CHAIN OF THOUGHT" PROTOCOL:**
            Before generating the final content, you must perform a "Strategic Analysis" (thinking_process) in the JSON output.
            1.  **Deconstruct:** What is the core value proposition?
            2.  **Audience:** Who cares about this?
            3.  **Angle:** What is the most compelling hook?

            **JSON FORMATTING RULES:**
            1.  Return **ONLY** a valid JSON object.
            2.  **Escape all double quotes** inside string values (e.g., "She said \\"Hello\\"").
            3.  Do **NOT** use actual newlines inside string values. Use '\\n' instead.
            4.  Ensure the JSON is parseable by \`JSON.parse()\`.

            **OUTPUT SCHEMA:**
            {
                "thinking_process": "Strategic reasoning steps...",
                "summary": "Executive summary (2 paragraphs).",
                "article": {
                    "title": "Viral Title (Click-worthy)",
                    "seoTitle": "SEO Optimized Title",
                    "tags": ["tag1", "tag2"],
                    "content": "Full Markdown Article..."
                },
                "podcastScript": "Dialogue script (Host vs Expert). Use [Sound] cues.",
                "courseStructure": {
                    "title": "Course Title",
                    "description": "Course Description",
                    "price": 1500000,
                    "modules": [
                        {
                            "id": "mod1",
                            "title": "Module Title",
                            "description": "Desc",
                            "lessons": [
                                { "id": "l1", "title": "Lesson Title", "duration": "10 min", "type": "video", "xp": 100 }
                            ]
                        }
                    ]
                }
            }
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [{ role: 'user', parts }],
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    temperature: 0.4,
                    tools
                }
            });

            setIsFinishing(true);

            setTimeout(() => {
                try {
                    const text = response.text || '{}';
                    const cleanJson = cleanJsonString(text);
                    const data = JSON.parse(cleanJson);
                    setOutput(data);
                } catch (e) {
                    console.error("JSON Parse Error", e);
                    alert("خطا در پردازش ساختار JSON. لطفاً دوباره تلاش کنید.");
                }
                setIsLoading(false);
                setIsFinishing(false);
            }, 2000);

        } catch (e) {
            console.error(e);
            alert("خطا در ارتباط با سرور.");
            setIsLoading(false);
            setIsFinishing(false);
        }
    };

    // --- Magic Refinement Logic (Agentic Workflow) ---
    const handleRefineContent = async (type: 'article' | 'podcast') => {
        if (!output) return;
        setIsRefining(true);

        const originalContent = type === 'article' ? output.article.content : output.podcastScript;
        
        // Prompt Engineering for the "Critique & Polish" Agent
        const promptContext = type === 'article' 
            ? `
            # ROLE: Editor-in-Chief (ویراستار ارشد)
            
            **TASK:**
            Refine and polish the following article draft to make it 80% better.
            
            **CRITIQUE & POLISH GUIDELINES:**
            1.  **Human Touch:** Remove any robotic phrasing, repetitive words, or passive voice. Use strong verbs.
            2.  **Engagement:** Add rhetorical questions, analogies, and a conversational flow.
            3.  **Formatting:** Improve Markdown usage (Bold key points, better headers).
            4.  **Language:** Ensure it reads like it was written by a top-tier Persian writer (Native fluency).
            
            **INPUT TEXT:**
            """${originalContent}"""
            
            **OUTPUT:**
            Return ONLY the refined Markdown text.
            `
            : `
            # ROLE: Award-Winning Podcast Director
            
            **TASK:**
            Rewrite this script to sound like a real, dynamic conversation between two humans.
            
            **CRITIQUE & POLISH GUIDELINES:**
            1.  **Natural Flow:** Add interruptions, "Hmm"s, laughter, and natural pauses.
            2.  **Pacing:** Vary the sentence length. Short, punchy dialogue.
            3.  **Emotion:** Inject excitement, curiosity, or surprise where appropriate.
            4.  **Language:** Use colloquial Persian (محاوره‌ای) where appropriate for the hosts.
            
            **INPUT SCRIPT:**
            """${originalContent}"""
            
            **OUTPUT:**
            Return ONLY the refined script text.
            `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview', // Using the smartest model for refinement
                contents: [{ role: 'user', parts: [{ text: promptContext }] }]
            });

            const refinedText = response.text;
            if (refinedText) {
                setOutput(prev => {
                    if (!prev) return null;
                    if (type === 'article') {
                        return { ...prev, article: { ...prev.article, content: refinedText } };
                    } else {
                        return { ...prev, podcastScript: refinedText };
                    }
                });
            }
        } catch (e) {
            console.error("Refine error", e);
            alert("خطا در صیقل‌دهی محتوا.");
        } finally {
            setIsRefining(false);
        }
    };

    const handlePublishArticle = () => {
        if (!output) return;
        const newPost: CommunityPost = {
            id: `post-agent-${Date.now()}`,
            authorId: 'admin',
            authorName: 'تحریریه هوشمانا',
            authorAvatar: 'https://picsum.photos/seed/admin/100/100',
            timestamp: new Date().toISOString(),
            text: `# ${output.article.title}\n\n${output.article.content}`,
            likes: 0
        };
        dispatch({ type: 'ADD_POST', payload: newPost });
        setPublishedStates(prev => ({ ...prev, article: true }));
        alert("مقاله با موفقیت در کانون منتشر شد.");
    };

    const handlePublishCourse = () => {
        if (!output) return;
        const newCourse: Course = {
            id: `gen-course-${Date.now()}`,
            title: output.courseStructure.title,
            shortDescription: output.courseStructure.description,
            longDescription: output.summary,
            instructor: 'هوشمانا',
            duration: `${output.courseStructure.modules.length} ماژول`,
            level: 'تخصصی',
            tags: ['AI Generated', 'New'],
            imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=400',
            price: output.courseStructure.price,
            modules: output.courseStructure.modules,
            xpReward: 5000,
            targetAudience: 'علاقه‌مندان'
        };
        dispatch({ type: 'ADD_GENERATED_COURSE', payload: newCourse });
        setPublishedStates(prev => ({ ...prev, course: true }));
        alert("دوره با موفقیت در آکادمی ایجاد شد.");
    };

    return (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl min-h-[600px] flex flex-col relative">
            
            <HighTechLoader 
                isVisible={isLoading}
                isFinishing={isFinishing}
                messages={[
                    "اتصال به مغز مرکزی (Omni-Brain)...",
                    "تحلیل استراتژیک و تدوین نقشه محتوا (Reasoning)...", 
                    "تجزیه و تحلیل چندوجهی (متن، صدا، تصویر)...",
                    "استخراج دانش و مفاهیم کلیدی...",
                    "نگارش همزمان مقاله و اسکریپت پادکست...",
                    "طراحی معماری آموزشی دوره...",
                    "قالب‌بندی و بهینه‌سازی نهایی JSON..."
                ]}
            />

            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-900 to-purple-900 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                        <CpuChipIcon className="w-8 h-8 text-cyan-300" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">ابر ایجنت تولید محتوا (V2.1)</h2>
                        <p className="text-indigo-200 text-sm">تبدیل هر ورودی به: مقاله + پادکست + دوره (با استدلال)</p>
                    </div>
                </div>
                
                <div className="flex bg-gray-900/50 p-1 rounded-lg backdrop-blur-sm">
                    <button onClick={() => setInputType('url')} className={`p-2 rounded-md transition-colors ${inputType === 'url' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`} title="لینک"><LinkIcon className="w-5 h-5"/></button>
                    <button onClick={() => setInputType('file')} className={`p-2 rounded-md transition-colors ${inputType === 'file' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`} title="فایل"><ArrowUpTrayIcon className="w-5 h-5"/></button>
                    <button onClick={() => setInputType('text')} className={`p-2 rounded-md transition-colors ${inputType === 'text' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`} title="متن"><DocumentTextIcon className="w-5 h-5"/></button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Sidebar / Input Area */}
                <div className={`w-full md:w-1/3 bg-gray-900 p-6 border-l border-gray-700 flex flex-col ${output ? 'hidden md:flex' : ''}`}>
                    <div className="flex-grow space-y-6 overflow-y-auto custom-scrollbar">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-3">منبع ورودی را مشخص کنید:</label>
                            
                            {inputType === 'url' && (
                                <input 
                                    type="text" 
                                    value={inputValue} 
                                    onChange={e => setInputValue(e.target.value)}
                                    placeholder="لینک یوتیوب، مقاله یا پادکست..."
                                    className="w-full bg-gray-800 border border-gray-600 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500 outline-none dir-ltr"
                                />
                            )}
                            
                            {inputType === 'text' && (
                                <textarea 
                                    value={inputValue} 
                                    onChange={e => setInputValue(e.target.value)}
                                    placeholder="متن یا موضوع خود را اینجا بنویسید..."
                                    className="w-full h-48 bg-gray-800 border border-gray-600 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500 outline-none resize-none custom-scrollbar"
                                />
                            )}

                            {inputType === 'file' && (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-48 border-2 border-dashed border-gray-600 rounded-xl bg-gray-800/50 hover:bg-gray-800 hover:border-cyan-500 transition-all cursor-pointer flex flex-col items-center justify-center group"
                                >
                                    {file ? (
                                        <div className="text-center">
                                            <DocumentTextIcon className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                                            <p className="text-sm text-white font-medium">{file.name}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <ArrowUpTrayIcon className="w-10 h-10 text-gray-500 group-hover:text-cyan-400 mb-2 transition-colors" />
                                            <p className="text-sm text-gray-400">کلیک برای آپلود (PDF, MP3, MP4, JPG)</p>
                                        </>
                                    )}
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                                </div>
                            )}
                        </div>
                        
                        {/* Configuration Settings */}
                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <CogIcon className="w-4 h-4" /> تنظیمات خروجی
                            </h3>
                            
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">زبان خروجی</label>
                                <div className="relative">
                                    <GlobeIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                                    <select 
                                        value={targetLanguage}
                                        onChange={(e) => setTargetLanguage(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg p-2 pl-9 focus:ring-1 focus:ring-cyan-500 outline-none"
                                    >
                                        {LANGUAGES.map(lang => <option key={lang.id} value={lang.id}>{lang.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1">لحن محتوا</label>
                                <div className="relative">
                                    <MegaphoneIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                                    <select 
                                        value={contentTone}
                                        onChange={(e) => setContentTone(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg p-2 pl-9 focus:ring-1 focus:ring-cyan-500 outline-none"
                                    >
                                        {TONES.map(tone => <option key={tone.id} value={tone.id}>{tone.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 text-xs text-gray-400">
                            <p className="flex items-center gap-2 mb-2 text-cyan-300 font-bold">
                                <SparklesIcon className="w-4 h-4" /> قابلیت‌های V2.1:
                            </p>
                            <ul className="space-y-1 list-disc list-inside">
                                <li>زنجیره افکار (Chain of Thought Reasoning)</li>
                                <li>جلوگیری از لحن رباتیک (Humanizer)</li>
                                <li>تحلیل استراتژیک پیش از تولید</li>
                            </ul>
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full mt-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'در حال پردازش...' : 'شروع عملیات (Generate All)'}
                    </button>
                </div>

                {/* Output Area */}
                <div className="flex-grow bg-gray-800/30 flex flex-col overflow-hidden">
                    {output ? (
                        <>
                            {/* Reasoning Section (NEW) */}
                            {output.thinking_process && (
                                <div className="bg-blue-900/20 border-b border-blue-500/30 p-4 text-sm text-blue-100 animate-fade-in">
                                    <div className="flex items-center gap-2 mb-1 font-bold text-blue-300">
                                        <LightBulbIcon className="w-5 h-5" />
                                        <span>استراتژی هوشمند (Reasoning)</span>
                                    </div>
                                    <p className="leading-relaxed text-xs md:text-sm opacity-90 italic">
                                        "{output.thinking_process}"
                                    </p>
                                </div>
                            )}

                            {/* Result Tabs */}
                            <div className="flex border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm overflow-x-auto">
                                <button onClick={() => setActiveTab('summary')} className={`px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'summary' ? 'border-yellow-500 text-white bg-gray-800' : 'border-transparent text-gray-400 hover:text-white'}`}>
                                    <span className="flex items-center gap-2"><SparklesIcon className="w-4 h-4"/> خلاصه اجرایی</span>
                                </button>
                                <button onClick={() => setActiveTab('article')} className={`px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'article' ? 'border-green-500 text-white bg-gray-800' : 'border-transparent text-gray-400 hover:text-white'}`}>
                                    <span className="flex items-center gap-2"><DocumentTextIcon className="w-4 h-4"/> مقاله وبلاگ</span>
                                </button>
                                <button onClick={() => setActiveTab('podcast')} className={`px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'podcast' ? 'border-pink-500 text-white bg-gray-800' : 'border-transparent text-gray-400 hover:text-white'}`}>
                                    <span className="flex items-center gap-2"><SpeakerWaveIcon className="w-4 h-4"/> پادکست</span>
                                </button>
                                <button onClick={() => setActiveTab('course')} className={`px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'course' ? 'border-blue-500 text-white bg-gray-800' : 'border-transparent text-gray-400 hover:text-white'}`}>
                                    <span className="flex items-center gap-2"><AcademicCapIcon className="w-4 h-4"/> دوره آموزشی</span>
                                </button>
                            </div>

                            {/* Content Render */}
                            <div className="flex-grow overflow-y-auto custom-scrollbar p-8">
                                {activeTab === 'summary' && (
                                    <div className="prose prose-invert max-w-none">
                                        <h3 className="text-xl font-bold text-yellow-400 mb-4">خلاصه اجرایی و نکات کلیدی</h3>
                                        <p className="text-gray-300 leading-relaxed text-lg">{output.summary}</p>
                                    </div>
                                )}

                                {activeTab === 'article' && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-white">{output.article.title}</h3>
                                            <button 
                                                onClick={() => handleRefineContent('article')} 
                                                disabled={isRefining}
                                                className="text-xs flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-full transition-all shadow disabled:opacity-50"
                                            >
                                                <SparklesIcon className="w-3 h-3" />
                                                {isRefining ? 'در حال صیقل‌دهی...' : 'صیقل‌دهی جادویی (ویراستار ارشد)'}
                                            </button>
                                        </div>

                                        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600">
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {output.article.tags.map(tag => <span key={tag} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">#{tag}</span>)}
                                            </div>
                                        </div>
                                        <div className="prose prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{output.article.content}</ReactMarkdown>
                                        </div>
                                        <div className="sticky bottom-4 flex justify-center">
                                            <button onClick={handlePublishArticle} disabled={publishedStates.article} className={`px-8 py-3 rounded-full font-bold shadow-lg transition-all flex items-center gap-2 ${publishedStates.article ? 'bg-gray-600 cursor-default' : 'bg-green-600 hover:bg-green-500 text-white hover:scale-105'}`}>
                                                {publishedStates.article ? <><CheckCircleIcon className="w-5 h-5"/> منتشر شد</> : <><PaperAirplaneIcon className="w-5 h-5"/> تایید و انتشار در وبلاگ</>}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'podcast' && (
                                    <div className="space-y-6">
                                         <div className="flex justify-between items-center bg-pink-900/20 p-4 rounded-xl border border-pink-500/30">
                                            <div className="flex items-center gap-3">
                                                <SpeakerWaveIcon className="w-8 h-8 text-pink-400" />
                                                <p className="text-pink-200 font-medium">اسکریپت آماده برای تولید صوتی</p>
                                            </div>
                                            <button 
                                                onClick={() => handleRefineContent('podcast')} 
                                                disabled={isRefining}
                                                className="text-xs flex items-center gap-1 bg-pink-600 hover:bg-pink-500 text-white px-3 py-1.5 rounded-full transition-all shadow disabled:opacity-50"
                                            >
                                                <SparklesIcon className="w-3 h-3" />
                                                {isRefining ? '...' : 'دراماتیک کردن (کارگردان)'}
                                            </button>
                                        </div>
                                        <div className="prose prose-invert max-w-none bg-gray-900 p-6 rounded-xl border border-gray-700 font-mono text-sm leading-loose">
                                            <pre className="whitespace-pre-wrap">{output.podcastScript}</pre>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'course' && (
                                    <div className="space-y-6">
                                        <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-500/30">
                                            <h3 className="text-2xl font-bold text-white mb-2">{output.courseStructure.title}</h3>
                                            <p className="text-blue-200 mb-4">{output.courseStructure.description}</p>
                                            <p className="text-lg font-bold text-green-400">قیمت پیشنهادی: {output.courseStructure.price.toLocaleString('fa-IR')} تومان</p>
                                        </div>
                                        <div className="space-y-4">
                                            {output.courseStructure.modules.map((mod, i) => (
                                                <div key={i} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                                    <h4 className="font-bold text-white mb-2">{mod.title}</h4>
                                                    <p className="text-sm text-gray-400 mb-3">{mod.description}</p>
                                                    <div className="space-y-2 pl-4 border-l-2 border-gray-600">
                                                        {mod.lessons.map((lesson, j) => (
                                                            <div key={j} className="text-sm text-gray-300 flex justify-between">
                                                                <span>{lesson.title}</span>
                                                                <span className="text-gray-500 text-xs">{lesson.duration}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="sticky bottom-4 flex justify-center">
                                            <button onClick={handlePublishCourse} disabled={publishedStates.course} className={`px-8 py-3 rounded-full font-bold shadow-lg transition-all flex items-center gap-2 ${publishedStates.course ? 'bg-gray-600 cursor-default' : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105'}`}>
                                                {publishedStates.course ? <><CheckCircleIcon className="w-5 h-5"/> ایجاد شد</> : <><AcademicCapIcon className="w-5 h-5"/> ایجاد دوره در آکادمی</>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                            <SparklesIcon className="w-24 h-24 mb-4" />
                            <p className="text-lg">منتظر ورودی شما برای شروع جادو...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuperContentAgent;
