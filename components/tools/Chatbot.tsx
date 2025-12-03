
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../../types.ts';
import { PaperAirplaneIcon, DoubleCheckIcon } from '../icons.tsx'; 
import { sendChatMessage } from '../../services/geminiService';

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([{ role: 'model', text: 'سلام! من دستیار هوشمند نخلستان معنا هستم. چطور می‌توانم در مورد اهداف، محصولات، یا سفر قهرمانی به شما کمک کنم؟' }]);
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input.trim() };
        // Optimistically add user message
        const currentHistory = [...messages, userMessage];
        setMessages(currentHistory);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            // Call via proxy service
            const response = await sendChatMessage(messages, userMessage.text);
            
            setMessages(prev => [...prev, { role: 'model', text: response.text }]);
        } catch (err) {
            console.error("Error sending message:", err);
            setError('متاسفانه خطایی در ارتباط با سرور رخ داد.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="w-full h-full bg-[#17212B] rounded-2xl shadow-xl flex flex-col border border-black/20 overflow-hidden">
            <div className="p-4 border-b border-black/20 bg-[#17212B] flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">AI</div>
                 <div>
                    <h3 className="font-bold text-white text-sm">چت‌بات هوشمند</h3>
                    <p className="text-xs text-blue-300">پاسخگوی ۲۴ ساعته</p>
                 </div>
            </div>
            
            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0E1621] relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="relative z-10 space-y-3">
                    {messages.map((msg, index) => {
                        const isMe = msg.role === 'user';
                        return (
                            <div key={index} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-4 py-2 text-sm leading-relaxed shadow-sm relative break-words
                                    ${isMe 
                                        ? 'bg-[#2b5278] text-white rounded-2xl rounded-br-sm' 
                                        : 'bg-[#182533] text-white rounded-2xl rounded-bl-sm'
                                    }`}>
                                    <span className="whitespace-pre-wrap">{msg.text}</span>
                                    {isMe && (
                                        <div className="flex justify-end mt-1 -mb-1">
                                            <DoubleCheckIcon className="w-3 h-3 text-blue-300" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {isLoading && (
                         <div className="flex w-full justify-start">
                            <div className="max-w-[85%] px-4 py-2 bg-[#182533] text-white rounded-2xl rounded-bl-sm">
                                 <div className="flex items-center gap-1 h-5">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {error && <div className="p-2 text-center text-xs text-red-300 bg-red-900/20 border-t border-red-900/30">{error}</div>}
            
            <div className="p-3 bg-[#17212B] border-t border-black/20">
                <div className="flex items-end gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="پیام خود را بنویسید..."
                        rows={1}
                        className="flex-1 bg-[#0E1621] border-none rounded-2xl py-3 px-4 text-white focus:ring-1 focus:ring-[#2b5278] focus:outline-none placeholder-gray-500 resize-none text-sm max-h-24 custom-scrollbar"
                        disabled={isLoading}
                    />
                    <button 
                        onClick={sendMessage} 
                        disabled={isLoading || !input.trim()}
                        className={`p-3 rounded-full flex-shrink-0 transition-all transform ${input.trim() ? 'bg-[#2b5278] text-white scale-100' : 'text-gray-500 bg-transparent scale-90'}`}
                    >
                        <PaperAirplaneIcon className="w-5 h-5 dir-ltr" />
                    </button>
                </div>
            </div>
             <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2b2b2b; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default Chatbot;
