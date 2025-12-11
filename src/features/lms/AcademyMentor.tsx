
import React, { useState, useRef, useEffect } from 'react';
import { SparklesIcon, XMarkIcon, PaperAirplaneIcon, UserCircleIcon, ChatBubbleLeftRightIcon } from '../../components/icons';
import { sendChatMessage } from '../../services/geminiService';
import { ChatMessage } from '../../types';

interface AcademyMentorProps {
    courseTitle?: string;
    onClose?: () => void;
}

const AcademyMentor: React.FC<AcademyMentorProps> = ({ courseTitle, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: `سلام! من دستیار هوشمند آکادمی هستم. درباره درس "${courseTitle || 'جاری'}" سوالی دارید؟` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const systemInstruction = `
            You are a wise and encouraging mentor in the "Nakhlestan Ma'na" Academy.
            Current Context: The student is asking about the course "${courseTitle || 'General'}".
            
            Style Guide:
            - Tone: Warm, academic yet accessible, encouraging (like a supportive professor).
            - Language: Persian (Farsi).
            - Length: Keep answers concise (max 3-4 sentences) unless asked for details.
            - Philosophy: Emphasize "Meaning" (Ma'na) and practical application.
            - If you don't know the specific answer about the course content, give general wisdom related to the topic or ask a clarifying question.
            `;

            // Transform chat history for API (excluding the first greeting if it was local-only, but here it's fine)
            // We pass the last few messages for context
            const historyForApi = messages.slice(-5);

            const response = await sendChatMessage(historyForApi, userMsg.text, systemInstruction);

            setMessages(prev => [...prev, { role: 'model', text: response.text }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: 'متاسفانه ارتباط با پایگاه دانش قطع شد. لطفاً دوباره تلاش کنید.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-500/20 p-2 rounded-full">
                        <SparklesIcon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-100">راهنمای هوشمند</h3>
                        <p className="text-xs text-gray-400">پاسخگوی سوالات درسی شما</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-900/95">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'
                                }`}
                        >
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700 flex items-center gap-2">
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-gray-800 border-t border-gray-700 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="سوال خود را اینجا بنویسید..."
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10 shadow-lg"
                >
                    <PaperAirplaneIcon className="w-5 h-5 -ml-0.5 transform rotate-90" />
                </button>
            </form>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 2px; }
            `}</style>
        </div>
    );
};

export default AcademyMentor;
