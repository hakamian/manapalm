// Fix: Created the full content for components/ProjectDiscoveryChatModal.tsx to resolve module not found errors and implement the project discovery chat feature.
import React, { useState, useEffect, useRef } from 'react';
import { WebDevProject } from '../types.ts';
import Modal from './Modal.tsx';
import { BrainCircuitIcon } from './icons.tsx';

interface ProjectDiscoveryChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (data: WebDevProject['discoveryData']) => void;
}

type Message = { role: 'user' | 'model', text: string };

const questions = [
    'برای شروع، لطفا لحن و صدای برندتان را در چند کلمه توصیف کنید. (مثلا: حرفه‌ای، دوستانه، هنری، الهام‌بخش)',
    'عالی! حالا مخاطبان اصلی یا مشتریان ایده‌آل وب‌سایت شما چه کسانی هستند؟',
    'بسیار خوب. و در آخر، ۳ ویژگی یا بخش اصلی که وب‌سایت شما حتما باید داشته باشد چیست؟'
];

const ProjectDiscoveryChatModal: React.FC<ProjectDiscoveryChatModalProps> = ({ isOpen, onClose, onComplete }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset and start chat
            setMessages([{ role: 'model', text: 'سلام! برای شروع فرآیند کشف پروژه، لطفا به چند سوال پاسخ دهید.' }]);
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'model', text: questions[0] }]);
                setCurrentQuestionIndex(0);
                setAnswers([]);
                setIsLoading(false);
                setTimeout(() => inputRef.current?.focus(), 100);
            }, 1500);
        } else {
            // Cleanup on close
            setMessages([]);
            setIsLoading(false);
        }
    }, [isOpen]);
    
    useEffect(() => {
        chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
    }, [messages, isLoading]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', text: input };
        const newAnswers = [...answers, input];
        setMessages(prev => [...prev, userMessage]);
        setAnswers(newAnswers);
        setInput('');
        setIsLoading(true);

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                const nextIndex = currentQuestionIndex + 1;
                setMessages(prev => [...prev, { role: 'model', text: questions[nextIndex] }]);
                setCurrentQuestionIndex(nextIndex);
                setIsLoading(false);
                 setTimeout(() => inputRef.current?.focus(), 100);
            } else {
                // End of chat
                setMessages(prev => [...prev, { role: 'model', text: 'متشکرم! اطلاعات شما ثبت شد. در حال انتقال به مرحله بعد هستیم...' }]);
                const finalData = {
                    brandTone: newAnswers[0] || '',
                    targetAudience: newAnswers[1] || '',
                    keyFeatures: newAnswers[2] || '',
                };
                setTimeout(() => onComplete(finalData), 2000);
            }
        }, 1500);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4 w-full max-w-lg h-[80vh] flex flex-col">
                <div className="text-center mb-4">
                    <BrainCircuitIcon className="w-10 h-10 text-amber-500 mx-auto" />
                    <h3 className="text-xl font-bold">گفتگوی کشف پروژه</h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400">به {questions.length} سوال کلیدی پاسخ دهید تا دستیار، پروژه شما را درک کند.</p>
                </div>
                <div ref={chatContainerRef} className="flex-1 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-amber-500 flex-shrink-0"></div>}
                            <div className={`max-w-[85%] p-3 rounded-xl shadow-sm ${msg.role === 'user' ? 'bg-amber-500 text-white' : 'bg-stone-200 dark:bg-stone-700'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                             <div className="w-8 h-8 rounded-full bg-amber-500 flex-shrink-0"></div>
                             <div className="p-3 rounded-xl bg-stone-200 dark:bg-stone-700">
                                <div className="flex items-center gap-1.5 p-1">
                                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
                 <div className="mt-4 flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="پاسخ خود را بنویسید..."
                        className="flex-1 bg-stone-100 dark:bg-stone-700 border rounded-lg p-2.5 text-sm"
                        disabled={isLoading}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="bg-amber-500 text-white p-2.5 rounded-lg disabled:bg-amber-300">
                        ارسال
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ProjectDiscoveryChatModal;