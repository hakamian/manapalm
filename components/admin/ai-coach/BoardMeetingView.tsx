
import React, { useState, useRef, useEffect } from 'react';
import { advisorConfig, getRelevantAdvisors } from '../../../utils/adminAdvisorConfig';
import { 
    ArrowRightIcon, XMarkIcon, UsersGroupIcon, 
    LightBulbIcon, ArrowLeftIcon, 
    CheckCircleIcon, UserCircleIcon, TargetIcon, SparklesIcon, 
    DocumentTextIcon, PlayIcon, PlusIcon, MapIcon, ChatBubbleBottomCenterTextIcon,
    PinIcon, BoltIcon, ArrowPathIcon, ShieldExclamationIcon
} from '../../icons';
// Removed generateStrategicDecree import as we are implementing streaming directly
import { GoogleGenAI } from '@google/genai';
import AIContentRenderer from '../../AIContentRenderer';
import { useAppDispatch } from '../../../AppContext';
import { SmartAction, StrategicDecree } from '../../../types';

interface BoardMeetingViewProps {
    onClose: () => void;
    contextData?: string;
}

type BoardStep = 'discovery' | 'assembly' | 'brainstorm' | 'critique' | 'execution';

interface Proposal {
    advisorId: string;
    solutions: string[];
    rawOutput: string; // For streaming visuals
    isProcessing: boolean;
    error?: boolean;
}

interface MeetingLog {
    advisorId: string;
    text: string;
    type?: 'critique' | 'consensus';
}

const BoardMeetingView: React.FC<BoardMeetingViewProps> = ({ onClose, contextData = "" }) => {
    const dispatch = useAppDispatch();
    const [step, setStep] = useState<BoardStep>('discovery');
    
    // State: Context
    const [topic, setTopic] = useState('');
    
    // State: Team
    const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]);
    
    // State: Solutions
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [pinnedSolutions, setPinnedSolutions] = useState<{advisorId: string, text: string}[]>([]);
    
    // State: Deliberation (Critique)
    const [meetingTranscript, setMeetingTranscript] = useState<MeetingLog[]>([]);
    
    // State: Execution
    const [decreeData, setDecreeData] = useState<StrategicDecree | null>(null);
    const [executedActionIds, setExecutedActionIds] = useState<string[]>([]);
    
    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    // --- HELPERS ---
    const toggleAdvisor = (id: string) => {
        if (selectedAdvisors.includes(id)) {
            setSelectedAdvisors(prev => prev.filter(a => a !== id));
        } else {
            if (selectedAdvisors.length >= 6) {
                alert("برای حفظ تمرکز جلسه، حداکثر ۶ مشاور انتخاب کنید.");
                return;
            }
            setSelectedAdvisors(prev => [...prev, id]);
        }
    };

    const togglePinSolution = (advisorId: string, text: string) => {
        const exists = pinnedSolutions.find(p => p.text === text);
        if (exists) {
            setPinnedSolutions(prev => prev.filter(p => p.text !== text));
        } else {
            if (pinnedSolutions.length >= 3) {
                alert("برای فاز نقد و بررسی، لطفاً حداکثر ۳ راهکار برتر را انتخاب کنید.");
                return;
            }
            setPinnedSolutions(prev => [...prev, { advisorId, text }]);
        }
    };

    const handleSuggestionSelect = (suggestion: string) => {
        setTopic(suggestion);
        const autoSelected = getRelevantAdvisors(suggestion);
        if (autoSelected.length === 0) autoSelected.push('strategy', 'financial');
        setSelectedAdvisors(autoSelected);
        setStep('assembly');
    };

    const handleCustomTopicSubmit = () => {
        if (!topic.trim()) return;
        const autoSelected = getRelevantAdvisors(topic);
        if (autoSelected.length === 0) autoSelected.push('strategy', 'growth');
        setSelectedAdvisors(autoSelected);
        setStep('assembly');
    };

    // --- CORE AI LOGIC (STREAMING OPTIMIZED WITH FALLBACK) ---
    const fetchAdvisorProposal = async (advisorId: string) => {
        const config = advisorConfig[advisorId];
        if (!config) return;

        // 1. Initialize Entry with loading state
        setProposals(prev => {
            const existing = prev.find(p => p.advisorId === advisorId);
            if (existing) {
                return prev.map(p => p.advisorId === advisorId ? { ...p, isProcessing: true, error: false, rawOutput: '', solutions: [] } : p);
            }
            return [...prev, { advisorId, solutions: [], rawOutput: '', isProcessing: true, error: false }];
        });

        const prompt = `
        You are ${config.name} (${config.description}) participating in a strategic board meeting.
        The user has a strategic problem/topic: "${topic}".
        CONTEXT DATA: ${contextData}
        
        **YOUR TASK:**
        Provide exactly 2 distinct, concrete, and actionable strategic solutions from your specific expertise perspective.
        
        **CRITICAL RULES:**
        1. Be extremely direct. No "Hello" or "As an advisor...".
        2. Do NOT use bullet points (*) or numbers (1.) at the start of lines.
        3. Separate the two solutions with a blank line (double newline).
        4. Focus on "HOW" to solve it, not just "WHAT".
        
        Language: Persian (Farsi).
        `;
        
        const generateStream = async (modelName: string) => {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            return await ai.models.generateContentStream({
                model: modelName,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: { temperature: 0.7 }
            });
        };

        try {
            let streamResult;
            try {
                // First attempt with Pro model
                streamResult = await generateStream('gemini-3-pro-preview');
            } catch (proError) {
                console.warn(`Advisor ${advisorId} Pro model failed, falling back to Flash...`, proError);
                // Fallback to Flash model
                streamResult = await generateStream('gemini-2.5-flash');
            }

            let fullText = '';

            for await (const chunk of streamResult) {
                const chunkText = chunk.text || '';
                fullText += chunkText;
                
                // Update UI in real-time
                setProposals(prev => prev.map(p => 
                    p.advisorId === advisorId 
                    ? { ...p, rawOutput: fullText } 
                    : p
                ));
            }
            
            // Final Parsing
            let solutions = fullText.split(/\n\s*\n/) // Split by double newlines
                .map(s => s.trim())
                .filter(s => s.length > 10);
            
            // Cleanup formatting artifacts
            solutions = solutions.map(s => s.replace(/^[\d\-\•\*\)]+\.?\s*/g, '').trim());

            // Fallback if parsing fails
            if (solutions.length === 0 && fullText.length > 10) {
                 solutions = [fullText];
            }

            setProposals(prev => prev.map(p => 
                p.advisorId === advisorId 
                ? { ...p, solutions: solutions.slice(0, 2), isProcessing: false, rawOutput: fullText } 
                : p
            ));

        } catch (e: any) {
            console.error(`Advisor ${advisorId} failed:`, e);
            setProposals(prev => prev.map(p => 
                p.advisorId === advisorId 
                ? { ...p, solutions: [], isProcessing: false, error: true, rawOutput: `خطا: ${e.message || 'Timeout'}` } 
                : p
            ));
        }
    };

    const startBrainstorming = async () => {
        setStep('brainstorm');
        // Trigger all requests in parallel
        selectedAdvisors.forEach(advisorId => {
            fetchAdvisorProposal(advisorId);
        });
    };

    const retryAdvisor = (advisorId: string) => {
        fetchAdvisorProposal(advisorId);
    };

    // This function runs the "War Room" critique session
    const startCritiqueSession = async () => {
        setStep('critique');
        setIsLoading(true);
        setMeetingTranscript([]);

        const pinnedContext = pinnedSolutions.map(p => `[Option from ${advisorConfig[p.advisorId].name}]: "${p.text}"`).join('\n');
        const participants = selectedAdvisors.map(id => advisorConfig[id].name).join(', ');

        const prompt = `
        SYSTEM: You are simulating a high-stakes Board Meeting "War Room" Debate.
        TOPIC: ${topic}
        
        PROPOSALS ON THE TABLE:
        ${pinnedContext}

        PARTICIPANTS: ${participants}.
        
        GOAL: 
        1. The participants must CRITIQUE these proposals. Be the "Devil's Advocate".
        2. Point out risks, blind spots, financial costs, or operational challenges.
        3. DO NOT just agree. Find the flaws to make the final plan stronger.
        4. Finally, the Chairman synthesizes the best path forward.

        INSTRUCTIONS:
        - Generate a dialogue script.
        - Format: "AdvisorName: Message"
        - Keep dialogue professional but sharp and direct (Harvard Case Method style).
        - Language: Persian.
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const streamResult = await ai.models.generateContentStream({ 
                model: 'gemini-3-pro-preview', 
                contents: [{ role: 'user', parts: [{ text: prompt }] }] 
            });

            let accumulatedText = '';
            
            for await (const chunk of streamResult) {
                const chunkText = chunk.text || '';
                accumulatedText += chunkText;
                
                // Process lines as they come to update transcript in real-time-ish
                const lines = accumulatedText.split('\n');
                const logs: MeetingLog[] = [];
                
                lines.forEach(line => { 
                    const parts = line.split(':'); 
                    if (parts.length > 1) { 
                        const name = parts[0].trim();
                        const content = parts.slice(1).join(':').trim();
                        if (content) {
                             const type = (content.includes('اما') || content.includes('ریسک') || content.includes('خطر')) ? 'critique' : 'consensus';
                             logs.push({ advisorId: name, text: content, type }); 
                        }
                    } 
                });
                
                // Update only if we have complete lines
                if (logs.length > 0) {
                     setMeetingTranscript(logs);
                     // Auto scroll
                     if (transcriptEndRef.current) {
                        transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
                     }
                }
            }
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    // --- EXECUTION PHASE (Streaming Implementation with Fallback) ---
    const handleGenerateDecree = async () => {
        setStep('execution');
        setIsLoading(true);
        setDecreeData({ decreeText: '', actions: [] });
        
        const solutionsText = pinnedSolutions.map(s => s.text).join('\n');
        
        const prompt = `
        You are the Chief of Staff (Executive OS) for "Nakhlestan Ma'na".
        
        **Context:**
        A board meeting was held regarding: "${topic}".
        The advisors agreed on these key solutions:
        ${solutionsText}
        
        **Goal:**
        1. Create a formal "Executive Decree" (مصوبه اجرایی) in Persian Markdown. It should be inspiring, directive, and clear.
        2. Identify 3 specific "Smart Actions" that the system can execute AUTOMATICALLY.
        
        **Action Types:**
        - 'create_campaign': If the decision involves sales.
        - 'publish_announcement': If about informing users.
        - 'grant_bonus': If about rewarding users.

        **FORMAT RULES:**
        - First, write the Decree text in Markdown.
        - Then, at the very end of the response, include a code block with the JSON array of actions.
        
        Example End Format:
        \`\`\`json
        [
            {
                "type": "create_campaign",
                "label": "...",
                "description": "...",
                "payload": { ... }
            }
        ]
        \`\`\`
        `;
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let streamResult;
            try {
                streamResult = await ai.models.generateContentStream({
                    model: 'gemini-3-pro-preview',
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config: { temperature: 0.4 }
                });
            } catch (proError) {
                console.warn("Decree generation Pro model failed, switching to Flash...", proError);
                streamResult = await ai.models.generateContentStream({
                    model: 'gemini-2.5-flash',
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config: { temperature: 0.4 }
                });
            }

            let fullText = '';
            
            for await (const chunk of streamResult) {
                const chunkText = chunk.text || '';
                fullText += chunkText;
                
                const displayText = fullText.split('```json')[0];
                
                setDecreeData(prev => ({
                    decreeText: displayText,
                    actions: prev?.actions || []
                }));
            }
            
            // Final Parsing for Actions
            const jsonMatch = fullText.match(/```json([\s\S]*?)```/);
            let actions: SmartAction[] = [];
            
            if (jsonMatch && jsonMatch[1]) {
                try {
                    actions = JSON.parse(jsonMatch[1]);
                } catch (e) {
                    console.error("Failed to parse actions JSON", e);
                }
            }
            
            setDecreeData({
                decreeText: fullText.split('```json')[0], // Clean display text
                actions: actions
            });

        } catch (e) {
            console.error(e);
            setDecreeData({
                decreeText: "خطا در تولید مصوبه هوشمند. لطفاً دوباره تلاش کنید.",
                actions: []
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExecuteAction = (action: SmartAction) => {
        dispatch({ type: 'EXECUTE_SMART_ACTION', payload: action });
        setExecutedActionIds(prev => [...prev, action.id || action.type + Math.random()]); 
    };

    return (
        <div className="flex flex-col h-full bg-stone-950 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
            
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-stone-800 bg-stone-900/90 backdrop-blur z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-900/30 border border-amber-500/30 rounded-lg">
                        <UsersGroupIcon className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-stone-100">اتاق فکر استراتژیک (War Room)</h2>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                            <span>مرحله:</span>
                            <span className="text-amber-400 font-bold">
                                {step === 'discovery' && '۱. رصدخانه (انتخاب موضوع)'}
                                {step === 'assembly' && '۲. آرایش تیم (انتخاب مشاوران)'}
                                {step === 'brainstorm' && '۳. طوفان فکری (راهکارها)'}
                                {step === 'critique' && '۴. چالش و نقد (War Room)'}
                                {step === 'execution' && '۵. سیستم عامل اجرایی (Executive OS)'}
                            </span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-stone-800 rounded-full transition-colors text-stone-400 hover:text-white">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Body */}
            <div className="flex-grow overflow-y-auto custom-scrollbar relative">
                
                {/* STEP 1: DISCOVERY */}
                {step === 'discovery' && (
                    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-black mb-4 text-white">امروز چه چالشی را حل کنیم؟</h1>
                            <div className="max-w-xl mx-auto relative">
                                <input 
                                    type="text" 
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="موضوع خود را بنویسید (مثلاً: کاهش هزینه‌ها، ورود به بازار جدید...)"
                                    className="w-full bg-stone-900 border-2 border-stone-700 rounded-2xl p-4 pl-12 text-white focus:border-amber-500 focus:ring-0 text-lg transition-all"
                                    onKeyPress={(e) => e.key === 'Enter' && handleCustomTopicSubmit()}
                                />
                                <button onClick={handleCustomTopicSubmit} className="absolute left-2 top-2 bottom-2 bg-amber-600 hover:bg-amber-500 text-white px-4 rounded-xl transition-colors">
                                    <ArrowLeftIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {Object.entries(advisorConfig).map(([id, config]) => (
                                <div key={id} className="bg-stone-900 border border-stone-800 rounded-xl p-4 hover:border-amber-500/50 transition-all group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-stone-800 rounded-lg text-amber-500 group-hover:text-white group-hover:bg-amber-600 transition-colors">
                                            {React.createElement(config.icon, { className: "w-6 h-6" })}
                                        </div>
                                        <h3 className="font-bold text-stone-200">{config.name}</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {config.suggestions.slice(0, 3).map((s, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => handleSuggestionSelect(s)}
                                                className="w-full text-right text-xs bg-stone-800/50 hover:bg-stone-800 text-stone-400 hover:text-amber-200 p-2 rounded-lg transition-colors truncate"
                                            >
                                                • {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 2: ASSEMBLY */}
                {step === 'assembly' && (
                    <div className="p-8 max-w-6xl mx-auto animate-fade-in flex flex-col h-full">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-amber-400 mb-2">آرایش تیم استراتژیک</h2>
                            <p className="text-stone-400">هوش مصنوعی بر اساس موضوع «{topic}»، این مشاوران را پیشنهاد کرده است. تیم را نهایی کنید.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                             {Object.entries(advisorConfig).map(([id, config]) => {
                                const isSelected = selectedAdvisors.includes(id);
                                return (
                                    <div 
                                        key={id}
                                        onClick={() => toggleAdvisor(id)}
                                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-2 ${isSelected ? 'bg-amber-900/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-stone-900 border-stone-800 hover:border-stone-600'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-amber-500 text-white' : 'bg-stone-800 text-stone-500'}`}>
                                             {React.createElement(config.icon, { className: "w-6 h-6" })}
                                        </div>
                                        <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-stone-500'}`}>{config.name}</span>
                                        {isSelected && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></div>}
                                    </div>
                                )
                             })}
                        </div>
                        
                        <div className="flex justify-center mt-auto">
                            <button onClick={startBrainstorming} className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-12 rounded-2xl shadow-lg transition-transform hover:scale-105 flex items-center gap-3 text-lg">
                                <SparklesIcon className="w-6 h-6 text-yellow-200"/>
                                شروع طوفان فکری
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: BRAINSTORM (STREAMING MODE) */}
                {step === 'brainstorm' && (
                    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-32">
                         <div className="flex justify-between items-center mb-6 sticky top-0 bg-stone-950/80 backdrop-blur-md p-4 rounded-xl z-10 border border-stone-800">
                            <div>
                                <h2 className="text-xl font-bold text-white">پیشنهادات عملیاتی مشاوران</h2>
                                <p className="text-xs text-stone-400">بهترین ایده‌ها را برای بحث در میز گرد پین کنید ({pinnedSolutions.length}/3).</p>
                            </div>
                            <button onClick={startCritiqueSession} disabled={pinnedSolutions.length === 0} className="bg-red-600 hover:bg-red-500 disabled:bg-stone-700 disabled:text-stone-500 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-900/20">
                                <ShieldExclamationIcon className="w-5 h-5"/>
                                ورود به اتاق جنگ (نقد و بررسی)
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {proposals.map((prop) => {
                                const config = advisorConfig[prop.advisorId];
                                return (
                                    <div key={prop.advisorId} className="bg-stone-900 border border-stone-700 rounded-2xl p-5 flex flex-col shadow-md">
                                        <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-stone-800 rounded-full text-amber-500">
                                                    {React.createElement(config.icon, { className: "w-6 h-6" })}
                                                </div>
                                                <h3 className="font-bold">{config.name}</h3>
                                            </div>
                                            {(prop.error) && (
                                                <button onClick={() => retryAdvisor(prop.advisorId)} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                                                    <ArrowPathIcon className="w-4 h-4"/> تلاش مجدد
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-4 flex-grow">
                                            {prop.isProcessing && prop.solutions.length === 0 ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-stone-400 text-xs animate-pulse mb-2">
                                                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                        در حال تفکر و نگارش...
                                                    </div>
                                                    <div className="p-3 bg-stone-800/30 rounded-xl border border-stone-800 text-sm text-stone-400 font-mono leading-relaxed opacity-80">
                                                        {prop.rawOutput}
                                                        <span className="inline-block w-2 h-4 bg-amber-500 ml-1 animate-pulse align-middle"></span>
                                                    </div>
                                                </div>
                                            ) : prop.error ? (
                                                <div className="text-center text-red-400 py-8 bg-red-900/10 rounded-lg border border-red-900/30">
                                                    <p className="text-sm mb-2">خطا در دریافت پاسخ</p>
                                                    <p className="text-xs opacity-70">{prop.rawOutput}</p>
                                                </div>
                                            ) : (
                                                prop.solutions.map((sol, idx) => {
                                                    const isPinned = pinnedSolutions.some(p => p.text === sol);
                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            onClick={() => togglePinSolution(prop.advisorId, sol)}
                                                            className={`p-3 rounded-xl border cursor-pointer transition-all relative group ${isPinned ? 'bg-green-900/20 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-stone-800/50 border-stone-700 hover:border-stone-500'}`}
                                                        >
                                                            <p className="text-sm text-stone-300 leading-relaxed">{sol}</p>
                                                            <div className={`absolute top-2 left-2 transition-opacity ${isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                                <PinIcon className={`w-4 h-4 ${isPinned ? 'text-green-500 fill-green-500' : 'text-stone-500'}`} />
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* STEP 4: CRITIQUE (THE WAR ROOM) */}
                {step === 'critique' && (
                    <div className="flex flex-col h-full animate-fade-in">
                        <div className="h-32 bg-gradient-to-b from-stone-900 to-stone-950 border-b border-stone-800 flex flex-col items-center justify-center relative overflow-hidden">
                             <div className="text-center z-10">
                                 <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center justify-center gap-2">
                                     <ShieldExclamationIcon className="w-6 h-6"/>
                                     اتاق جنگ: نقد و بررسی
                                 </h3>
                                 <p className="text-sm text-stone-400">مشاوران در حال چکش‌کاری ایده‌های منتخب هستند.</p>
                             </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-stone-950 custom-scrollbar pb-32">
                             {meetingTranscript.map((log, idx) => {
                                 const isCritique = log.type === 'critique';
                                 const isChairman = log.advisorId.includes('Chairman') || log.advisorId.includes('Chair');
                                 
                                 return (
                                     <div key={idx} className={`flex gap-4 animate-slide-up ${isChairman ? 'flex-row-reverse' : ''}`}>
                                         <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg border-2 ${
                                             isChairman ? 'bg-stone-700 border-stone-500' : 
                                             isCritique ? 'bg-red-900/20 border-red-500 text-red-400' : 
                                             'bg-stone-800 border-stone-600 text-amber-500'
                                         }`}>
                                             {isChairman ? <UserCircleIcon className="w-6 h-6 text-white"/> : <span className="font-bold text-xs">{log.advisorId.substring(0,2)}</span>}
                                         </div>
                                         <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed border ${
                                             isChairman ? 'bg-stone-800 text-stone-200 border-stone-700 rounded-tr-none' : 
                                             isCritique ? 'bg-red-950/20 text-red-100 border-red-500/30 rounded-tl-none' : 
                                             'bg-stone-900 text-stone-300 border-stone-800 rounded-tl-none'
                                         }`}>
                                             <div className="flex justify-between items-center mb-1 opacity-60 text-xs font-bold uppercase">
                                                 <span>{log.advisorId}</span>
                                                 {isCritique && <span className="text-red-400 flex items-center gap-1"><BoltIcon className="w-3 h-3"/> نقد</span>}
                                             </div>
                                             <AIContentRenderer content={log.text} />
                                         </div>
                                     </div>
                                 )
                             })}
                             {isLoading && (
                                 <div className="flex justify-center py-8">
                                     <div className="flex items-center gap-2 px-4 py-2 bg-stone-900 rounded-full border border-stone-700">
                                         <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                                         <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                                         <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                         <span className="text-xs text-stone-400 ml-2">در حال مذاکره...</span>
                                     </div>
                                 </div>
                             )}
                             <div ref={transcriptEndRef} />
                        </div>

                        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-stone-950 via-stone-950 to-transparent z-20 flex justify-center">
                             {!isLoading && (
                                 <button onClick={handleGenerateDecree} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-10 rounded-2xl shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all transform hover:scale-105 flex items-center gap-3 border border-green-400">
                                     <DocumentTextIcon className="w-6 h-6" />
                                     ختم جلسه و صدور مصوبه نهایی
                                 </button>
                             )}
                        </div>
                    </div>
                )}

                {/* STEP 5: EXECUTION (The OS) */}
                {step === 'execution' && (
                    <div className="p-8 max-w-6xl mx-auto animate-fade-in pb-20">
                        <div className="flex flex-col lg:flex-row gap-8">
                            
                            {/* Left: Decree */}
                            <div className="lg:w-2/3 bg-white text-stone-900 rounded-xl shadow-2xl overflow-hidden relative min-h-[600px] max-w-2xl">
                                <div className="absolute inset-0 opacity-50 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
                                <div className="relative z-10 p-10">
                                    <div className="text-center border-b-2 border-stone-900 pb-6 mb-8">
                                        <div className="inline-block p-3 rounded-full border-2 border-stone-900 mb-4">
                                            <TargetIcon className="w-8 h-8 text-stone-900" />
                                        </div>
                                        <h1 className="text-2xl font-black tracking-tight mb-2 font-serif">مصوبه اجرایی هیات مدیره</h1>
                                        <p className="text-sm text-stone-500 mt-2">موضوع: {topic}</p>
                                    </div>

                                    <div className="prose prose-stone max-w-none font-serif leading-loose text-justify text-sm">
                                        {isLoading ? (
                                            <div className="space-y-4 animate-pulse">
                                                <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                                                <div className="h-4 bg-stone-200 rounded w-full"></div>
                                                <div className="h-4 bg-stone-200 rounded w-5/6"></div>
                                            </div>
                                        ) : (
                                            <AIContentRenderer content={decreeData?.decreeText || ''} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Smart Actions (Executive OS) */}
                            <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                                <div className="bg-stone-900 p-4 rounded-xl border border-amber-500/30">
                                    <h3 className="text-amber-400 font-bold flex items-center gap-2 mb-2">
                                        <BoltIcon className="w-5 h-5" />
                                        اتاق فرمان (Smart Actions)
                                    </h3>
                                    <p className="text-xs text-stone-400">اقدامات پیشنهادی هوش مصنوعی برای اجرای فوری مصوبه.</p>
                                </div>

                                {decreeData?.actions && decreeData.actions.length > 0 ? (
                                    decreeData.actions.map((action, idx) => {
                                        const isExecuted = executedActionIds.includes(action.id || action.type + Math.random());
                                        return (
                                            <div key={idx} className={`p-4 rounded-xl border transition-all ${isExecuted ? 'bg-green-900/20 border-green-500/50' : 'bg-stone-800 border-stone-700 hover:border-amber-500'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${isExecuted ? 'bg-green-900 text-green-300' : 'bg-stone-900 text-amber-300'}`}>
                                                        {action.type === 'create_campaign' ? 'کمپین' : action.type === 'publish_announcement' ? 'اطلاعیه' : 'پاداش'}
                                                    </span>
                                                    {isExecuted && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                                                </div>
                                                <h4 className="font-bold text-white text-sm mb-1">{action.label}</h4>
                                                <p className="text-xs text-stone-400 mb-3">{action.description}</p>
                                                
                                                <button 
                                                    onClick={() => !isExecuted && handleExecuteAction(action)}
                                                    disabled={isExecuted}
                                                    className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${isExecuted ? 'bg-stone-700 text-stone-500 cursor-default' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg'}`}
                                                >
                                                    {isExecuted ? 'اجرا شد' : 'اجرای خودکار'}
                                                    {!isExecuted && <PlayIcon className="w-3 h-3" />}
                                                </button>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="text-center p-6 bg-stone-900 rounded-xl border border-stone-800 border-dashed text-stone-500 text-xs">
                                        {isLoading ? 'در حال استخراج اقدامات...' : 'هیچ اقدام خودکاری شناسایی نشد.'}
                                    </div>
                                )}
                                
                                <button onClick={() => { setStep('discovery'); setTopic(''); setMeetingTranscript([]); setSelectedAdvisors([]); setProposals([]); setPinnedSolutions([]); setDecreeData(null); }} className="mt-auto w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-sm font-bold transition-colors">
                                    پایان جلسه و شروع مجدد
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default BoardMeetingView;
