
import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, TimelineEvent } from '../types.ts';
import { BrainCircuitIcon, PlusIcon } from './icons.tsx';
import Modal from './Modal.tsx';
import { sendChatMessage } from '../services/geminiService';

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
`;

const conversationStarters = [
    "امروز دوست داری روی چه موضوعی تمرکز کنیم؟",
    "اگر می‌توانستی همین الان یک چیز را تغییر دهی، آن چه بود؟",
    "چه چیزی در حال حاضر مانع پیشرفت تو شده است؟",
    "تصویر ایده‌آل تو از آینده چیست؟"
];

const MeaningCoachPage: React.FC<MeaningCoachPageProps> = ({ user, onSaveHistory, onUpdateProfile }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(user.meaningCoachHistory || []);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
    const [shareInsight, setShareInsight] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user.meaningCoachHistory || user.meaningCoachHistory.length === 0) {
            // Initial greeting handled locally or by a silent trigger
            setMessages([{ role: 'model', text: "سلام! من رهنورد هستم. آماده‌ام تا با هم سفری به درون داشته باشیم. الان در چه حال و هوایی هستی؟" }]);
        }
    }, [user.meaningCoachHistory]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: messageText.trim() };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await sendChatMessage(messages, userMessage.text, systemInstruction);
            
            const modelMessage = { role: 'model' as const, text: response.text };
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

        const newEvent: TimelineEvent = {
            id: `evt_reflection_${Date.now()}`,
            date: new Date().toISOString(),
            type: 'reflection',
            title: 'یک بینش جدید درونم شکل گرفت',
            description: `از گفت‌وگو با مربی معنا: "${selectedMessage.text}"`,
            details: {},
            userReflection: { notes: selectedMessage.text },
            isSharedAnonymously: shareInsight,
        };
        onUpdateProfile({ timeline: [newEvent, ...(user.timeline || [])] });
        setSelectedMessage(null);
        setShareInsight(false);
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto animate-fade-in-up">
            <aside className="md:w-1/3 lg:w-1/4 space-y-6">
                <div className="p-6 bg-stone-800/50 rounded-2xl text-center border border-stone-700/50">
                    <BrainCircuitIcon className="w-16 h-16 text-amber-500 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-white">رهنورد (مربی معنا)</h1>
                    <p className="text-sm text-stone-300 mt-2">
                        فضایی امن برای کشف پاسخ‌هایی که در درون خود دارید.
                    </p>
                </div>
                <div className="p-4 bg-stone-800/50 rounded-2xl border border-stone-700/50">
                    <h2 className="font-semibold mb-3 text-white">برای شروع انتخاب کنید:</h2>
                    <div className="space-y-2">
                        {conversationStarters.map((prompt, i) => (
                            <button key={i} onClick={() => handleSendMessage(prompt)} className="w-full text-right text-sm bg-stone-700/50 hover:bg-amber-900/20 text-stone-300 hover:text-amber-200 p-2 rounded-lg transition-colors">
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>
            <main className="flex-1 min-h-[70vh]">
                <div className="w-full h-full bg-stone-800/50 rounded-2xl shadow-lg flex flex-col border border-stone-700">
                    <div ref={chatContainerRef} className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-stone-900/50 rounded-t-2xl">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && (
                                    <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">AI</div>
                                )}
                                <div className={`group relative max-w-[85%] p-3 rounded-xl shadow-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-stone-700 text-stone-100 rounded-br-lg' 
                                        : 'bg-amber-900/20 text-stone-100 rounded-bl-lg'
                                }`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                    <button onClick={() => setSelectedMessage(msg)} className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-600 p-1 rounded-full shadow hover:bg-stone-500">
                                        <PlusIcon className="w-4 h-4 text-amber-300"/>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex items-start gap-3 justify-start">
                                <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">AI</div>
                                <div className="p-3 rounded-xl bg-amber-900/20">
                                    <div className="flex items-center gap-1.5 p-1">
                                        <span className="w-2 h-2 bg-stone-500 rounded-full animate-pulse"></span>
                                        <span className="w-2 h-2 bg-stone-500 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                                        <span className="w-2 h-2 bg-stone-500 rounded-full animate-pulse [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {error && <div className="p-2 text-center text-sm text-red-400 bg-red-500/10 border-t border-stone-700">{error}</div>}
                    <div className="p-4 border-t bg-stone-800/50 rounded-b-2xl border-stone-700">
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
                                placeholder="پاسخ خود را بنویسید..."
                                className="flex-1 bg-stone-700 border border-stone-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-400 transition-all text-white placeholder-gray-400"
                                disabled={isLoading}
                            />
                            <button onClick={() => handleSendMessage(input)} disabled={isLoading || !input.trim()} className="bg-amber-500 text-white rounded-lg p-3 h-full disabled:bg-amber-700 disabled:opacity-50 hover:bg-amber-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            
            <Modal isOpen={!!selectedMessage} onClose={() => setSelectedMessage(null)}>
                <div className="p-4 w-full max-w-sm text-right">
                    <h3 className="text-lg font-bold">ثبت بینش در گاهشمار</h3>
                    <p className="my-2 text-sm text-stone-300">
                        این پیام را به عنوان یک لحظه تامل در سفر خود ثبت کنید.
                    </p>
                    <blockquote className="p-3 bg-stone-700 rounded-lg text-sm italic text-stone-100">
                        "{selectedMessage?.text}"
                    </blockquote>
                    <div className="flex items-center mt-4">
                         <input
                            type="checkbox"
                            id="shareInsightAnonymously"
                            checked={shareInsight}
                            onChange={(e) => setShareInsight(e.target.checked)}
                            className="w-5 h-5 ml-2 rounded text-amber-500 focus:ring-amber-500 bg-stone-700 border-stone-600"
                        />
                        <label htmlFor="shareInsightAnonymously" className="text-sm text-stone-300">
                           اشتراک <span className="font-semibold">ناشناس</span> در «چاه معنای مشترک»
                        </label>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setSelectedMessage(null)} className="px-6 py-2 rounded-lg bg-stone-600 text-white hover:bg-stone-500">انصراف</button>
                        <button onClick={handleSaveInsight} className="px-6 py-2 font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-600">ثبت کن</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MeaningCoachPage;
