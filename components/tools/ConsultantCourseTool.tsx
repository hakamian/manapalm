
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
    UsersGroupIcon, SparklesIcon, DocumentTextIcon, 
    ArrowDownTrayIcon, GlobeIcon, MagnifyingGlassIcon, 
    LinkIcon, UserCircleIcon, BriefcaseIcon, CheckCircleIcon,
    ChatBubbleBottomCenterTextIcon, ArrowLeftIcon, BrainCircuitIcon, LightBulbIcon
} from '../icons';
import { useAppDispatch } from '../../AppContext';
import HighTechLoader from '../HighTechLoader';
import { ExpertRole, KnowledgeBaseData, LMSModule, Course, View } from '../../types';

const LANGUAGES = [
    { id: 'فارسی', label: 'فارسی (Persian)' },
    { id: 'English', label: 'English' },
];

interface DeepDiveQuestion {
    id: number;
    text: string;
    options: string[];
}

const cleanJsonString = (text: string): string => {
    if (!text) return "{}";
    let clean = text.trim();
    // Remove markdown code blocks if present
    clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
    clean = clean.replace(/\s*```$/, '');
    return clean;
};

const ConsultantCourseTool: React.FC = () => {
    const dispatch = useAppDispatch();
    
    // Input State
    const [problemStatement, setProblemStatement] = useState('');
    const [userProfile, setUserProfile] = useState('');
    const [inputType, setInputType] = useState<'topic' | 'url' | 'file'>('topic');
    const [inputValue, setInputValue] = useState(''); // URL or Topic
    const [searchLanguage, setSearchLanguage] = useState('English'); 
    const [targetLanguage, setTargetLanguage] = useState('فارسی');

    // Deep Dive State
    const [deepDiveQuestions, setDeepDiveQuestions] = useState<DeepDiveQuestion[]>([]);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

    // Process State
    const [isLoading, setIsLoading] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string[] | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'input' | 'deep_dive' | 'result'>('input');

    // Output State
    const [consultantMonologue, setConsultantMonologue] = useState('');
    const [rolesRoster, setRolesRoster] = useState<ExpertRole[]>([]);
    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseData | null>(null);
    const [courseModules, setCourseModules] = useState<LMSModule[]>([]);

    // --- PHASE 1: Analyze & Generate Questions ---
    const handleInitialAnalysis = async () => {
        if (!problemStatement.trim()) {
            setError('لطفاً شرح مشکل یا چالش خود را وارد کنید.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setLoadingMessage([
            "در حال تحلیل اولیه دامنه مسئله...",
            "فراخوانی شورای متخصصان پنهان...",
            "شناسایی شکاف‌های اطلاعاتی...",
            "طراحی سوالات عمیق برای شناخت بهتر شما..."
        ]);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const analysisPrompt = `
            You are a Senior Strategic Consultant.
            User Problem: "${problemStatement}"
            User Profile/Context: "${userProfile || 'General Learner'}"
            Input Type: ${inputType} - "${inputValue}"

            **Goal:** We need to design a hyper-personalized course/solution for this user.
            
            **Task:**
            Generate 3 to 5 "Deep Dive" questions to clarify the user's situation.

            **Output Format (JSON ONLY):**
            {
                "questions": [
                    { "id": 1, "text": "Question in Persian?", "options": ["Option A", "Option B"] }
                ]
            }
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
                config: { responseMimeType: "application/json", temperature: 0.4 }
            });

            const jsonText = response.text || '{}';
            const cleanJson = cleanJsonString(jsonText);
            const parsed = JSON.parse(cleanJson);

            if (parsed.questions && Array.isArray(parsed.questions)) {
                setDeepDiveQuestions(parsed.questions);
                setStep('deep_dive');
            } else {
                throw new Error("Invalid question format received.");
            }

        } catch (err: any) {
            console.error(err);
            // Fallback: If analysis fails, go straight to generation (skip deep dive)
            handleFinalGeneration();
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (qId: number, answer: string) => {
        setUserAnswers(prev => ({ ...prev, [qId]: answer }));
    };

    // --- PHASE 2: Final Generation ---
    const handleFinalGeneration = async () => {
        setIsLoading(true);
        setIsFinishing(false);
        setError(null);
        
        // Construct Q&A Context
        const qaContext = deepDiveQuestions.map(q => `Q: ${q.text}\nA: ${userAnswers[q.id] || 'No Answer'}`).join('\n');
        const userName = userProfile || 'کاربر عزیز';

        setLoadingMessage([
            `در حال طراحی آینده‌ای روشن برای ${userName}...`,
            "بازآرایی تیم متخصصان بر اساس پاسخ‌های شما...",
            "استخراج دانش عمیق از منابع معتبر...",
            "طراحی سرفصل‌های اختصاصی و شخصی‌سازی شده...",
            "تدوین نهایی نقشه راه رشد شما..."
        ]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const megaPrompt = `
            # ROLE: THE SUPREME ARCHITECT (V2.0)
            
            **INPUTS:**
            - **Problem:** "${problemStatement}"
            - **Profile:** "${userProfile || 'General Learner'}"
            - **Deep Dive Answers:** 
            ${qaContext}
            - **Languages:** Search(${searchLanguage}), Target(${targetLanguage})

            **CHAIN OF THOUGHT PROTOCOL:**
            1.  **Re-calibration:** Review answers to understand the TRUE problem.
            2.  **Hiring:** Recruit a virtual team of experts tailored to this specific nuance.
            3.  **Architecture:** Design a "Level 10 Depth" Course.

            **JSON FORMATTING RULES:**
            1.  Return **ONLY** a valid JSON object.
            2.  Escape double quotes (\`\\"\`) inside strings.
            3.  Use \\n for newlines.

            **OUTPUT SCHEMA:**
            {
              "consultant_internal_monologue": "A brief Persian summary of your thought process and strategy (e.g., 'The user thinks the problem is X, but it is actually Y, so I am assigning expert Z...').",
              "rolesRoster": [
                {
                  "roleName": "String",
                  "priority": "String",
                  "responsibilities": "String",
                  "deliverables": "String",
                  "hiringNote": "String"
                }
              ],
              "knowledgeBase": {
                "coreConcept": "String",
                "keyFrameworks": [ { "name": "String", "explanation": "String", "action": "String" } ],
                "counterIntuitiveInsights": ["String"],
                "vocabulary": [ { "term": "String", "definition": "String" } ],
                "keyQuotes": ["String"],
                "sources": [ { "title": "String", "url": "String", "reason": "String" } ]
              },
              "courseModules": [
                {
                  "id": "mod_1",
                  "title": "String",
                  "description": "String",
                  "lessons": [
                    {
                      "id": "les_1",
                      "title": "String",
                      "duration": "15 min",
                      "type": "video",
                      "xp": 150,
                      "content": "Markdown String"
                    }
                  ],
                  "quiz": []
                }
              ]
            }
            `;

            const tools = inputType === 'topic' || inputType === 'url' ? [{ googleSearch: {} }] : [];

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [{ 
                    role: 'user', 
                    parts: [{ text: megaPrompt }] 
                }],
                config: {
                    temperature: 0.4,
                    tools: tools,
                    responseMimeType: "application/json"
                }
            });
            
            setIsFinishing(true);
            
            setTimeout(() => {
                const jsonText = response.text || '{}';
                
                try {
                    const cleanJson = cleanJsonString(jsonText);
                    const parsed = JSON.parse(cleanJson);
                    
                    setConsultantMonologue(parsed.consultant_internal_monologue || '');
                    setRolesRoster(parsed.rolesRoster || []);
                    setKnowledgeBase(parsed.knowledgeBase || null);
                    setCourseModules(parsed.courseModules || []);
                    setStep('result');
                } catch (e) {
                    console.error("JSON Parse Error:", e);
                    setError("خطا در پردازش پاسخ هوشمند. لطفاً دوباره تلاش کنید.");
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

    const handleSaveToAcademy = () => {
        if (courseModules.length === 0) return;

        const newCourse: Course = {
            id: `consultant-course-${Date.now()}`,
            title: knowledgeBase?.coreConcept ? `راهکار استراتژیک: ${knowledgeBase.coreConcept.substring(0, 30)}...` : 'برنامه رشد اختصاصی',
            shortDescription: `طراحی شده توسط اتاق فکر استراتژیک برای ${userProfile || 'شما'}.`,
            longDescription: `این دوره حاصل تحلیل عمیق چالش "${problemStatement}" توسط تیم متخصصان هوش مصنوعی است.\n\nمتخصصان: ${rolesRoster.map(r => r.roleName).join(', ')}`,
            instructor: 'هوشمانا (اتاق فکر)',
            duration: `${courseModules.length} ماژول`,
            level: 'پیشرفته (اختصاصی)',
            tags: ['Strategy', 'Consulting', 'AI Generated'],
            imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2940&auto=format&fit=crop', 
            price: 0, // Included in the tool usage cost
            modules: courseModules,
            xpReward: 5000,
            coverGradient: 'from-amber-900 to-orange-900',
            targetAudience: userProfile || 'مدیران استراتژیک'
        };

        dispatch({ type: 'ADD_GENERATED_COURSE', payload: newCourse });
        dispatch({ type: 'SET_VIEW', payload: View.BUSINESS_ACADEMY });
    };

    const renderRoles = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {rolesRoster.map((role, idx) => (
                <div key={idx} className="bg-gray-800 p-4 rounded-xl border-l-4 border-amber-500 shadow-md">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-white text-lg">{role.roleName}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${role.priority === 'Critical' ? 'bg-red-900 text-red-200' : 'bg-blue-900 text-blue-200'}`}>
                            {role.priority}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2"><strong>مسئولیت:</strong> {role.responsibilities}</p>
                    <div className="bg-gray-900/50 p-2 rounded text-xs text-gray-300">
                        <strong>خروجی:</strong> {role.deliverables}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 italic">نکته استخدام: {role.hiringNote}</p>
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full h-full bg-stone-950 text-white rounded-2xl shadow-2xl flex flex-col border border-amber-500/30 overflow-hidden relative">
            
            <HighTechLoader 
                isVisible={isLoading}
                isFinishing={isFinishing}
                messages={loadingMessage}
            />

            {/* Header */}
            <div className="p-5 border-b border-stone-800 bg-gradient-to-r from-stone-900 to-stone-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 border border-amber-500/30">
                        <UsersGroupIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-amber-100">اتاق فکر استراتژیک (V2.0)</h3>
                        <p className="text-xs text-stone-400">تحلیل عمیق و طراحی مسیر رشد اختصاصی</p>
                    </div>
                </div>
                {step !== 'input' && (
                    <button onClick={() => { setStep('input'); setDeepDiveQuestions([]); }} className="text-xs text-stone-400 hover:text-white flex items-center gap-1">
                        شروع مجدد <SparklesIcon className="w-4 h-4"/>
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                
                {/* STEP 1: INITIAL INPUT */}
                {step === 'input' && (
                    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-3">چالش فعلی شما چیست؟</h2>
                            <p className="text-stone-400">هوش مصنوعی ابتدا مشکل شما را تحلیل کرده و سپس سوالات دقیق‌تری برای طراحی راهکار نهایی می‌پرسد.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-stone-300 mb-2">شرح دقیق مشکل یا چالش (Problem Statement)</label>
                                <textarea
                                    value={problemStatement}
                                    onChange={e => setProblemStatement(e.target.value)}
                                    className="w-full h-32 bg-stone-900/50 border border-stone-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                                    placeholder="مثلاً: من یک مدیر محصول هستم و تیمم در تحویل به موقع پروژه‌ها مشکل دارد..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-stone-300 mb-2">پروفایل شما (نام و نقش)</label>
                                    <input
                                        type="text"
                                        value={userProfile}
                                        onChange={e => setUserProfile(e.target.value)}
                                        className="w-full bg-stone-900/50 border border-stone-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                                        placeholder="مثال: علی، مدیر ارشد بازاریابی"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-stone-300 mb-2">نوع منبع ورودی (اختیاری)</label>
                                    <div className="flex bg-stone-900 rounded-xl p-1 border border-stone-700">
                                        <button onClick={() => setInputType('topic')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${inputType === 'topic' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'}`}>موضوع/جستجو</button>
                                        <button onClick={() => setInputType('url')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${inputType === 'url' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'}`}>لینک</button>
                                    </div>
                                </div>
                            </div>

                            {inputType !== 'file' && (
                                <div>
                                    <label className="block text-sm font-semibold text-stone-300 mb-2">{inputType === 'url' ? 'لینک منبع' : 'موضوع تکمیلی (اختیاری)'}</label>
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        className="w-full bg-stone-900/50 border border-stone-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none dir-ltr"
                                        placeholder={inputType === 'url' ? "https://..." : "موضوع خاص برای جستجو"}
                                    />
                                </div>
                            )}
                            
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                            <button 
                                onClick={handleInitialAnalysis}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <BrainCircuitIcon className="w-6 h-6" />
                                تحلیل هوشمند و شروع
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: DEEP DIVE QUESTIONS */}
                {step === 'deep_dive' && (
                     <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
                        <div className="text-center mb-6">
                             <div className="inline-block p-3 bg-blue-900/30 rounded-full mb-4 border border-blue-500/30 animate-pulse">
                                <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">شفاف‌سازی مسیر</h2>
                            <p className="text-stone-400 text-sm">متخصصان ما برای طراحی دقیق‌ترین راهکار، نیاز به پاسخ‌های شما دارند.</p>
                        </div>

                        <div className="space-y-6">
                            {deepDiveQuestions.map((q, idx) => (
                                <div key={q.id} className="bg-stone-900 p-5 rounded-xl border border-stone-700">
                                    <p className="text-white font-semibold mb-3 flex items-start gap-2">
                                        <span className="text-amber-500 mt-1">{idx + 1}.</span> {q.text}
                                    </p>
                                    
                                    {/* Suggested Answers Chips */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {q.options.map((opt, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => handleAnswerChange(q.id, opt)}
                                                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${userAnswers[q.id] === opt ? 'bg-amber-600 border-amber-500 text-white' : 'bg-stone-800 border-stone-600 text-stone-400 hover:bg-stone-700'}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <input 
                                        type="text" 
                                        value={userAnswers[q.id] || ''}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        placeholder="یا پاسخ خود را بنویسید..."
                                        className="w-full bg-stone-800/50 border border-stone-600 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <button onClick={() => setStep('input')} className="text-stone-500 hover:text-stone-300 text-sm">بازگشت</button>
                            <button 
                                onClick={handleFinalGeneration}
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <SparklesIcon className="w-5 h-5" />
                                طراحی نهایی دوره شخصی
                            </button>
                        </div>
                     </div>
                )}

                {/* STEP 3: FINAL RESULT */}
                {step === 'result' && (
                    <div className="max-w-4xl mx-auto animate-fade-in">
                        {/* Reasoning Section (CoT) */}
                        {consultantMonologue && (
                            <div className="mb-8 bg-blue-900/20 border-l-4 border-blue-500 p-5 rounded-r-xl">
                                <div className="flex items-center gap-2 text-blue-300 mb-2 font-bold">
                                    <LightBulbIcon className="w-5 h-5" />
                                    <span>استراتژی مشاور ارشد</span>
                                </div>
                                <p className="text-blue-100/90 text-sm leading-relaxed italic">
                                    "{consultantMonologue}"
                                </p>
                            </div>
                        )}

                        {/* 1. Roles Section */}
                        <section className="mb-12">
                            <h3 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-2">
                                <UserCircleIcon className="w-8 h-8"/> تیم متخصصان اختصاصی شما
                            </h3>
                            {renderRoles()}
                        </section>

                        {/* 2. Knowledge Base Section */}
                        {knowledgeBase && (
                            <section className="mb-12 bg-stone-900/50 p-8 rounded-2xl border border-stone-700">
                                <h3 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2">
                                    <DocumentTextIcon className="w-8 h-8"/> دانش عمیق و تحلیل
                                </h3>
                                
                                <div className="mb-8">
                                    <h4 className="text-lg font-bold text-white mb-2">هسته اصلی (Core Concept)</h4>
                                    <p className="text-stone-300 leading-relaxed">{knowledgeBase.coreConcept}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-lg font-bold text-green-400 mb-4">چارچوب‌های کلیدی</h4>
                                        <div className="space-y-4">
                                            {knowledgeBase.keyFrameworks.map((fw, idx) => (
                                                <div key={idx} className="bg-stone-800 p-3 rounded-lg">
                                                    <p className="font-bold text-white">{fw.name}</p>
                                                    <p className="text-xs text-stone-400 mt-1">{fw.explanation}</p>
                                                    <p className="text-xs text-green-300 mt-2"><strong>اقدام:</strong> {fw.action}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-red-400 mb-4">بینش‌های خلاف عرف</h4>
                                        <ul className="list-disc list-inside space-y-2 text-stone-300 text-sm">
                                            {knowledgeBase.counterIntuitiveInsights.map((insight, idx) => (
                                                <li key={idx}>{insight}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* 3. Course Section */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-green-400 flex items-center gap-2">
                                    <BriefcaseIcon className="w-8 h-8"/> برنامه رشد اختصاصی {userProfile ? `(${userProfile})` : ''}
                                </h3>
                                <span className="bg-green-900/30 text-green-300 text-xs px-3 py-1 rounded-full border border-green-500/30">شخصی‌سازی شده</span>
                            </div>
                            
                            <div className="space-y-6">
                                {courseModules.map((mod, idx) => (
                                    <div key={idx} className="bg-stone-800 rounded-2xl border border-stone-700 overflow-hidden">
                                        <div className="p-5 border-b border-stone-700 bg-stone-700/30">
                                            <h4 className="text-xl font-bold text-white">{mod.title}</h4>
                                            <p className="text-sm text-stone-400 mt-1">{mod.description}</p>
                                        </div>
                                        <div className="p-5 space-y-4">
                                            {mod.lessons.map((lesson, lIdx) => (
                                                <div key={lIdx} className="border-l-2 border-stone-600 pl-4">
                                                    <h5 className="font-bold text-stone-200 text-lg">{lesson.title}</h5>
                                                    <div className="prose prose-invert prose-sm mt-2 text-stone-400">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content || ''}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="mt-12 flex justify-center">
                            <button onClick={handleSaveToAcademy} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105">
                                <CheckCircleIcon className="w-6 h-6" />
                                ذخیره در آکادمی شخصی
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsultantCourseTool;
