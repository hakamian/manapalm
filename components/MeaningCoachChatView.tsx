import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppState } from '../AppContext';
import { User, ChatMessage, View } from '../types';
import { BrainCircuitIcon, PlusIcon, ArrowLeftIcon, PaperAirplaneIcon, CheckCircleIcon } from './icons';
import Modal from './Modal';
import { sendChatMessage } from '../services/geminiService';
import AIContentRenderer from './AIContentRenderer';

interface MeaningCoachPageProps {
    user: User;
    onSaveHistory: (history: ChatMessage[]) => void;
    onUpdateProfile: (updatedUser: Partial<User>) => void;
}

const systemInstruction = `
ROLE: You are 'Rahnavard' (رهنورد), a Professional Co-Active Coach at 'Nakhlestan-e-Ma'na'.
TONE: Empathetic, Deep, Curious, Minimalist, Grounded, Warm.
LANGUAGE: Persian (Farsi).
CORE DIRECTIVES:
1. NEVER GIVE ADVICE OR SOLUTIONS.
2. Ask ONE question at a time.
3. Use the client's own words (Mirroring).
4. Focus on the 'Whole Person'.
5. Maintain 'Dancing in the Moment'.

VISUALS:
You can use [VISUAL:TRUST_TRIANGLE], [VISUAL:ICEBERG], or [VISUAL:FOUR_CORNERSTONES] on a new line if relevant to explain a concept.

OPTIONS:
At the end of your response, provide 2-3 short suggestions for the user to reply with, in the format: [OPTIONS: Suggestion 1 | Suggestion 2].
`;

const conversationStarters = [
    "امروز دوست داری روی چه موضوعی تمرکز کنیم؟",
    "اگر می‌توانستی همین الان یک چیز را تغییر دهی، آن چه بود؟",
    "چه چیزی در حال حاضر مانع پیشرفت تو شده است؟",
    "تصویر ایده‌آل تو از آینده چیست؟"
];

const MeaningCoachChatView: React.FC<MeaningCoachPageProps> = ({ user, onSaveHistory, onUpdateProfile }) => {
    const dispatch = useAppDispatch();
    const [messages, setMessages] = useState<ChatMessage[]>(user.meaningCoachHistory || []);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
    const [shareInsight, setShareInsight] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user.meaningCoachHistory || user.meaningCoachHistory.length === 0) {
            setMessages([{ role: 'model', text: "سلام! من رهنورد هستم. آماده‌ام تا با هم سفری به درون داشته باشیم. الان در چه حال و هوایی هستی؟" }]);
            setSuggestions(conversationStarters);
        }
    }, [user.meaningCoachHistory]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, suggestions, isLoading]);
    
    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: messageText.trim() };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setSuggestions([]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await sendChatMessage(messages, userMessage.text, systemInstruction);
            
            let cleanText = response.text || '';
            const optionsMatch = cleanText.match(/\[OPTIONS:(.*?)\]/);
            if (optionsMatch) {
                const opts = optionsMatch[1].split('|').map(s => s.trim());
                setSuggestions(opts);
                cleanText = cleanText.replace(/\[OPTIONS:.*?\]/, '').trim();
            } else {
                setSuggestions([]);
            }

            const modelMessage: ChatMessage = { role: 'model' as const, text: cleanText };
            const finalMessages = [...newMessages, modelMessage];
            setMessages(finalMessages);
            onSaveHistory(finalMessages);
        } catch (err) {
            console.error("Error sending message:", err);
            setError('متاسفانه خطایی در ارتباط با مربی رخ داد. لطفا دوباره تلاش کنید.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveInsight = () => {
        if (!selectedMessage) return;

        const newEvent = {
            id: `evt_reflection_${Date.now()}`,
            date: new Date().toISOString(),
            type: 'reflection',
            title: 'یک بینش جدید درونم شکل گرفت',
            description: `از گفت‌وگو با مربی معنا: "${selectedMessage.text.substring(0, 50)}..."`,
            details: {},
            userReflection: { notes: selectedMessage.text },
            isSharedAnonymously: shareInsight,
        };
        onUpdateProfile({ timeline: [newEvent, ...(user.timeline || [])] });
        setSelectedMessage(null);
        setShareInsight(false);
        dispatch({ type: 'SHOW_POINTS_TOAST', payload: { points: 50, action: 'ثبت بینش جدید' } });
    };

    return (
        <div className="flex flex-col h-screen bg-[#0f172a] text-white overflow-hidden relative font-sans items-center justify-center md:p-6">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2b2b2b; border-radius: 10px; }
                 @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
            `}</style>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            {/* Frame Container */}
            <div className="w-full md:max-w-4xl h-full md:h-[90vh] bg-[#1e293b]/80 md:backdrop-blur-xl rounded-none md:rounded-3xl shadow-2xl border-0 md:border border-gray-700/50 flex flex-col overflow-hidden relative">

                {/* Header */}
                <header className="flex-shrink-0 bg-[#1e293b]/90 backdrop-blur-md border-b border-gray-700/50 z-20 shadow-lg">
                    <div className="px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center border border-gray-600 shadow-inner">
                                    <BrainCircuitIcon className="w-6 h-6 text-white" />
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1e293b] rounded-full animate-pulse"></span>
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-white">رهنورد (مربی معنا)</h1>
                                <p className="text-xs text-indigo-300 opacity-90">همسفر درون</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => dispatch({ type: 'SET_VIEW', payload: View.UserProfile })} 
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6"/>
                        </button>
                    </div>
                </header>

                {/* Chat Area */}
                <main className="flex-grow overflow-y-auto p-2 md:p-4 custom-scrollbar z-10">
                    <div className="space-y-3 pb-4">
                        {messages.map((msg, i) => {
                            const isUser = msg.role === 'user';
                            return (
                                <div key={i} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} group`}>
                                    {!isUser && (
                                        <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex-shrink-0 ml-2 self-end mb-1 hidden sm:flex items-center justify-center border border-gray-700">
                                             <BrainCircuitIcon className="w-5 h-5 text-indigo-400" />
                                        </div>
                                    )}
                                    
                                    <div 
                                        className={`relative max-w-[85%] md:max-w-[75%] p-3 md:p-4 rounded-2xl shadow-sm text-sm 
                                        ${isUser 
                                            ? 'bg-[#3b82f6] text-white rounded-br-sm' 
                                            : 'bg-[#1e293b] text-gray-100 rounded-bl-sm border border-gray-700/50'
                                        }`}
                                    >
                                        {/* Content */}
                                        {msg.role === 'model' ? (
                                            <AIContentRenderer content={msg.text} />
                                        ) : (
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                        )}
                                        
                                        {/* Add Insight Button */}
                                        {!isUser && (
                                            <button 
                                                onClick={() => setSelectedMessage(msg)} 
                                                className="absolute -bottom-3 left-4 bg-gray-700 hover:bg-indigo-600 text-gray-300 hover:text-white p-1 rounded-full shadow-md border border-gray-600 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0" 
                                                title="ثبت به عنوان بینش"
                                            >
                                                <PlusIcon className="w-4 h-4"/>
                                            </button>
                                        )}

                                        {/* Time */}
                                        <div className={`flex items-center justify-end gap-1 mt-1 select-none ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                                            <span className="text-[10px] opacity-70">
                                                {new Date().toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                            {isUser && <CheckCircleIcon className="w-3 h-3 opacity-80" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {isLoading && (
                             <div className="flex justify-start w-full">
                                 <div className="bg-[#1e293b] border border-gray-700/50 p-3 rounded-2xl rounded-bl-sm flex items-center gap-2 shadow-sm ml-0 sm:ml-10">
                                    <div className="flex space-x-1 space-x-reverse">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                    </div>
                                    <span className="text-xs text-gray-400 animate-pulse">رهنورد در حال تفکر...</span>
                                </div>
                            </div>
                        )}
                         
                        {error && (
                            <div className="flex justify-center">
                                 <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-xs">
                                    {error}
                                 </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} style={{height: 1}} />
                    </div>
                </main>

                {/* Input Footer */}
                <footer className="flex-shrink-0 p-2 md:p-4 bg-[#1e293b] border-t border-gray-700/50 z-20">
                    <div className="">
                        {/* Vertical Suggestions */}
                        {suggestions.length > 0 && !isLoading && (
                            <div className="flex flex-col gap-2 px-1 mb-3 animate-fade-in">
                                {suggestions.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSendMessage(suggestion)}
                                        className="w-full text-right px-4 py-3 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-200 text-sm rounded-xl transition-all active:scale-[0.98] shadow-sm"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex items-end gap-2 bg-[#0f172a] rounded-2xl border border-gray-700 p-2 focus-within:border-indigo-500/50 transition-colors shadow-inner">
                            <textarea 
                                className="flex-grow bg-transparent text-white max-h-32 min-h-[44px] py-3 px-2 focus:outline-none resize-none text-sm custom-scrollbar placeholder-gray-500"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(input)}
                                placeholder="پیام خود را بنویسید..."
                                rows={1}
                                disabled={isLoading}
                            />
                            
                            <button 
                                onClick={() => handleSendMessage(input)} 
                                disabled={!input.trim() || isLoading}
                                className={`p-2.5 rounded-full transition-all shadow-lg mb-0.5 ${input.trim() ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105' : 'text-gray-500 hover:bg-white/5'}`}
                            >
                                <PaperAirplaneIcon className="w-5 h-5 dir-ltr" />
                            </button>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Insight Modal */}
            <Modal isOpen={!!selectedMessage} onClose={() => setSelectedMessage(null)}>
                <div className="p-4 w-full max-w-sm text-right">
                    <h3 className="text-lg font-bold mb-1 text-white">ثبت بینش در گاهشمار</h3>
                    <p className="mb-4 text-sm text-gray-400">
                        این پیام را به عنوان یک لحظه تامل مهم ذخیره کنید.
                    </p>
                    <blockquote className="p-4 bg-gray-800 rounded-xl text-sm italic text-gray-300 border-r-4 border-indigo-500 mb-4 leading-relaxed">
                        "{selectedMessage?.text}"
                    </blockquote>
                    <div className="flex items-center mb-6 bg-gray-800 p-3 rounded-lg cursor-pointer" onClick={() => setShareInsight(!shareInsight)}>
                         <div className={`w-5 h-5 rounded border flex items-center justify-center ml-3 transition-colors ${shareInsight ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                             {shareInsight && <CheckCircleIcon className="w-3.5 h-3.5 text-white" />}
                         </div>
                        <span className="text-sm text-gray-300">
                           اشتراک <span className="font-bold text-green-400">ناشناس</span> در چاه معنا
                        </span>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setSelectedMessage(null)} className="px-6 py-2.5 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors font-medium">انصراف</button>
                        <button onClick={handleSaveInsight} className="px-6 py-2.5 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-900/50 transition-transform hover:scale-105">ثبت کن</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MeaningCoachChatView;