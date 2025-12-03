
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { generateText } from '../services/geminiService';
import { PaperAirplaneIcon, XMarkIcon, PalmChatIcon, SparklesIcon, ArrowUpIcon } from './icons';
import { useAppState } from '../AppContext';
import AIContentRenderer from './AIContentRenderer';

const AIChatWidget: React.FC = () => {
    const { isBottomNavVisible } = useAppState();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([
        "چطور نخل بکارم؟",
        "محصولات فروشگاه چیست؟",
        "درباره دوره‌های آموزشی بگو",
        "سفر قهرمانی چیست؟"
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [hasStarted, setHasStarted] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && !hasStarted) {
            setHasStarted(true);
            setIsLoading(true);
            setTimeout(() => {
                 setMessages([
                    {
                        role: 'model',
                        text: 'سلام! من دستیار هوشمانا نخلستان معنا هستم. چطور می‌توانم در مسیر رشد و اثرگذاری به شما کمک کنم؟'
                    }
                ]);
                setIsLoading(false);
            }, 600);
        }
    }, [isOpen, hasStarted]);

    useEffect(scrollToBottom, [messages, isLoading, suggestions]);

    const handleSendMessage = async (prompt?: string) => {
        const messageText = prompt || userInput;
        if (!messageText.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setSuggestions([]); 
        setIsLoading(true);

        try {
            const systemInstruction = `You are a friendly and wise AI support agent for "Nakhlestan Ma'na". 
            Your goal is to guide users through the platform (Heritage, Shop, Academy, Community).
            Output format: Use Markdown. Use bold for key terms. Keep answers concise (under 3 paragraphs).
            If listing items, use bullet points.
            Tone: Helpful, warm, spiritual yet professional.
            Language: Persian.
            
            [VISUAL:SYSTEM] You can use visual tags like [VISUAL:TRUST_TRIANGLE] if explaining concepts like trust.

            OPTIONS: At the end, suggest 2-3 follow-up options in format: [OPTIONS: A | B].
            `;
            
            const response = await generateText(messageText, false, false, false, systemInstruction);
            
            let text = response.text;
            const optionsMatch = text.match(/\[OPTIONS:(.*?)\]/);
            if (optionsMatch) {
                const opts = optionsMatch[1].split('|').map(s => s.trim());
                setSuggestions(opts);
                text = text.replace(/\[OPTIONS:.*?\]/, '').trim();
            } else {
                 // Fallback suggestions logic
                 const lowerText = text.toLowerCase();
                 if (lowerText.includes('نخل') || lowerText.includes('کاشت')) {
                    setSuggestions(["انواع نخل‌ها", "هزینه کاشت"]);
                } else if (lowerText.includes('دوره')) {
                    setSuggestions(["لیست دوره‌ها", "کوچینگ چیست؟"]);
                } else {
                    setSuggestions(["بیشتر توضیح بده", "بازگشت به منوی اصلی"]);
                }
            }

            const modelMessage: ChatMessage = { role: 'model', text: text };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error("AI chat widget error:", error);
            const errorMessage: ChatMessage = { 
                role: 'model', 
                text: "متاسفانه در حال حاضر ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید." 
            };
            setMessages(prev => [...prev, errorMessage]);
            setSuggestions(["تلاش مجدد"]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
             <style>{`
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
                    70% { box-shadow: 0 0 0 15px rgba(74, 222, 128, 0); }
                }
                .pulse-glow-animation {
                    animation: pulse-glow 2.5s infinite;
                }
                .chat-bubble { animation: pop-in 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; transform-origin: var(--origin); }
                @keyframes pop-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 2px; }
            `}</style>
            
            <div className={`fixed ${isBottomNavVisible ? 'bottom-24' : 'bottom-5'} md:bottom-5 right-5 z-[100] transition-all duration-300 transform ${isOpen ? 'translate-y-10 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-full p-3.5 shadow-xl focus:outline-none pulse-glow-animation transition-transform hover:scale-110"
                    aria-label="Open AI support chat"
                >
                    <PalmChatIcon className="w-7 h-7" />
                </button>
            </div>

            <div
                className={`fixed ${isBottomNavVisible ? 'bottom-24' : 'bottom-5'} md:bottom-5 right-5 z-[100] w-[calc(100%-40px)] max-w-[360px] h-[75vh] max-h-[650px] bg-[#17212B] rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out border border-gray-700/50 overflow-hidden ${isOpen ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-20 pointer-events-none'}`}
            >
                {/* Header */}
                <header 
                    className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-r from-[#17212B] to-[#1f2c3a] border-b border-white/5 cursor-pointer" 
                    onClick={() => setIsOpen(false)}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-emerald-300 p-[2px]">
                                <img src="https://picsum.photos/seed/ai-avatar-palm/100/100" alt="AI" className="w-full h-full rounded-full bg-black object-cover" />
                            </div>
                            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-[#17212B] animate-pulse"></span>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">دستیار هوشمانا</h3>
                            <p className="text-[10px] text-green-400 font-medium">پاسخگوی هوشمند</p>
                        </div>
                    </div>
                    <button className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>

                {/* Messages */}
                <div className="relative z-10 flex-grow overflow-y-auto p-3 space-y-4 bg-[#0E1621] custom-scrollbar">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    
                    {messages.map((msg, index) => {
                         const isMe = msg.role === 'user';
                         return (
                            <div key={index} style={{'--origin': isMe ? 'bottom right' : 'bottom left'} as React.CSSProperties} className={`chat-bubble flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[88%] p-3 text-sm leading-relaxed shadow-md relative break-words
                                    ${isMe 
                                        ? 'bg-[#2b5278] text-white rounded-2xl rounded-br-sm' 
                                        : 'bg-[#182533] text-gray-100 rounded-2xl rounded-bl-sm border border-gray-800'
                                    }`}>
                                    {isMe ? (
                                        <p>{msg.text}</p>
                                    ) : (
                                        <AIContentRenderer content={msg.text} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    
                    {isLoading && (
                        <div className="chat-bubble flex justify-start" style={{'--origin': 'bottom left'} as React.CSSProperties}>
                            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-[#182533] border border-gray-800">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions & Input */}
                <footer className="relative z-20 bg-[#17212B] border-t border-white/5 pb-2">
                    
                    {/* Suggestion Chips - Vertical */}
                    {suggestions.length > 0 && !isLoading && (
                        <div className="flex flex-col gap-2 px-3 py-2">
                            {suggestions.map((s, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleSendMessage(s)}
                                    className="w-full text-right text-xs font-medium text-blue-200 bg-[#242f3d] hover:bg-[#2b5278] px-3 py-2.5 rounded-xl border border-blue-500/20 transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="px-3 pb-3 pt-1 flex items-end gap-2">
                        <textarea
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="پیام خود را بنویسید..."
                            rows={1}
                            className="flex-grow bg-[#0E1621] text-white rounded-2xl py-3 px-4 focus:outline-none placeholder-gray-500 resize-none text-sm custom-scrollbar max-h-24 border border-transparent focus:border-[#2b5278] transition-colors"
                            style={{ minHeight: '46px' }}
                        />
                        <button 
                            onClick={() => handleSendMessage()} 
                            disabled={isLoading || !userInput.trim()} 
                            className={`p-3 rounded-full flex-shrink-0 transition-all transform ${userInput.trim() ? 'bg-[#2b5278] text-white hover:bg-[#346391] scale-100 shadow-lg' : 'text-gray-500 bg-[#242f3d] scale-95'}`}
                        >
                            {userInput.trim() ? <PaperAirplaneIcon className="w-5 h-5 dir-ltr" /> : <SparklesIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default AIChatWidget;
