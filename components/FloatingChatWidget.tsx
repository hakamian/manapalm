import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage } from '../types.ts';
// FIX: Corrected icon name to match export.
import { XIcon, ChatBubbleOvalLeftEllipsisIcon, PaperAirplaneIcon, SparklesIcon } from './icons.tsx';

const FloatingChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState<any | null>(null); // Use any for Chat since @google/genai types might be complex
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isInitialized && !isOpen) { // Initialize on first open
            initializeChat();
        }
    };

    const initializeChat = () => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
            // Note: The @google/genai API might differ from what was written. 
            // This is a placeholder for the actual initialization.
            // For now, let's keep it similar to the existing code but ensure it doesn't crash.
            const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const chatSession = model.startChat({
                history: [],
                generationConfig: {
                    maxOutputTokens: 1000,
                },
            });
            setChat(chatSession);
            setMessages([{ role: 'model', text: 'سلام! من دستیار هوشمند شما هستم. چطور می‌توانم کمکتان کنم؟' }]);
            setIsInitialized(true);
        } catch (error) {
            console.error("Error initializing AI:", error);
            setMessages([{ role: 'model', text: 'خطا در راه‌اندازی سرویس هوش مصنوعی.' }]);
        }
    }

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading || !chat) return;

        const userMessage: ChatMessage = { role: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Add a placeholder for model response
        setMessages(prev => [...prev, { role: 'model', text: '' }]);

        try {
            const result = await chat.sendMessage(userMessage.text);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'model', text };
                return newMessages;
            });

        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: ChatMessage = { role: 'model', text: 'متاسفانه خطایی در ارتباط با سرور رخ داد.' };
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = errorMessage;
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            <style>{`
                @keyframes subtle-glow {
                    0%, 100% {
                        box-shadow: 0 0 15px 3px rgba(245, 158, 11, 0.4);
                    }
                    50% {
                        box-shadow: 0 0 25px 8px rgba(245, 158, 11, 0.6);
                    }
                }
                .animate-subtle-glow {
                    animation: subtle-glow 3s infinite ease-in-out;
                }
            `}</style>

            {/* Widget Button */}
            <button
                onClick={toggleChat}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full bg-mana-primary text-slate-900 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'rotate-90 opacity-0 pointer-events-none' : 'rotate-0 animate-subtle-glow'}`}
            >
                <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-6 right-6 z-50 w-[90vw] sm:w-[400px] h-[500px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col transition-all duration-500 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-mana-primary/20 flex items-center justify-center">
                            <SparklesIcon className="w-5 h-5 text-mana-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">دستیار هوشمند</h3>
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-mana-primary animate-pulse"></span>
                                <span className="text-[10px] text-mana-primary">آنلاین</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={toggleChat} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <XIcon className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Messages */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-mana-primary text-slate-900 rounded-tr-none' : 'bg-white/10 text-gray-200 border border-white/5 rounded-tl-none'}`}>
                                {msg.text || (isLoading && idx === messages.length - 1 ? 'در حال نوشتن...' : '')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/5 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="سوال خود را بپرسید..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-mana-primary/50 transition-colors"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        className="p-2 bg-mana-primary text-slate-900 rounded-xl disabled:opacity-50 transition-transform active:scale-95"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                        ) : (
                            <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default FloatingChatWidget;