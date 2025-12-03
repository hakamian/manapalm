
import React, { useState, useRef, useEffect } from 'react';
import { AdvisorType, ChatMessage } from '../types';
import { getAdvisorChatResponse } from '../services/geminiService';
import { SunIcon, ChartBarIcon, PaperAirplaneIcon, TargetIcon, HeartIcon, LightBulbIcon, CogIcon, PencilSquareIcon, RadarIcon, CpuChipIcon, BanknotesIcon, SproutIcon, UsersIcon, MagnifyingGlassIcon, AcademicCapIcon, ShareIcon, BrainCircuitIcon, ArrowLeftIcon } from './icons';
import { advisorConfig } from '../utils/adminAdvisorConfig';
import AIContentRenderer from './AIContentRenderer';

// NOTE: BoardMeetingView and other complex components are imported in the main dashboard, this is the simplified component for the 'personal_journey' tab.

const AdminAICoach: React.FC = () => {
    const [personalJourneyAdvisor, setPersonalJourneyAdvisor] = useState<AdvisorType>('spiritual_guide');
    const [personalJourneyHistory, setPersonalJourneyHistory] = useState<ChatMessage[]>([]);
    const [personalJourneyQuery, setPersonalJourneyQuery] = useState('');
    const [isPersonalJourneyLoading, setIsPersonalJourneyLoading] = useState(false);
    const personalJourneyMessagesEndRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        personalJourneyMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [personalJourneyHistory, isPersonalJourneyLoading, suggestions]);

    const handleSendPersonalJourneyMessage = async (textOverride?: string) => {
        const text = textOverride || personalJourneyQuery;
        if (!text.trim()) return;

        const userMessage: ChatMessage = { role: 'user', text: text };
        const newHistory = [...personalJourneyHistory, userMessage];
        setPersonalJourneyHistory(newHistory);
        setPersonalJourneyQuery('');
        setSuggestions([]);
        setIsPersonalJourneyLoading(true);
        setError(null);

        try {
            const response = await getAdvisorChatResponse(text, personalJourneyAdvisor, newHistory);
            
            let cleanText = response.text || '';
            const optionsMatch = cleanText.match(/\[OPTIONS:(.*?)\]/);
            if (optionsMatch) {
                const opts = optionsMatch[1].split('|').map(s => s.trim());
                setSuggestions(opts);
                cleanText = cleanText.replace(/\[OPTIONS:.*?\]/, '').trim();
            }

            const modelMessage: ChatMessage = { role: 'model', text: cleanText };
            setPersonalJourneyHistory(prev => [...prev, modelMessage]);
        } catch (e) {
            setError('خطا در ارتباط با مشاور. لطفاً دوباره تلاش کنید.');
            const errorMessage: ChatMessage = { role: 'model', text: 'متاسفانه پاسخی دریافت نشد.' };
            setPersonalJourneyHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsPersonalJourneyLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-xl font-bold text-white">سفر شخصی و مشاوره معنوی</h3>
                <p className="text-sm text-gray-400 mt-1">
                    در این خلوت، با مشاوران ویژه خود برای رشد فردی و معنوی گفتگو کنید.
                </p>
            </div>

            <div className="flex flex-col flex-grow bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
                {/* Advisor Selector */}
                <div className="p-2 border-b border-gray-700 flex items-center gap-2 overflow-x-auto bg-gray-800/80 custom-scrollbar">
                     {Object.entries(advisorConfig).slice(0, 4).map(([key, config]) => (
                        <button 
                            key={key}
                            onClick={() => setPersonalJourneyAdvisor(key as AdvisorType)} 
                            className={`flex items-center gap-2 py-1.5 px-3 text-xs rounded-md whitespace-nowrap transition-colors ${personalJourneyAdvisor === key ? 'bg-green-600 font-semibold text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            {React.createElement(config.icon, { className: "w-4 h-4" })}
                            {config.name}
                        </button>
                    ))}
                </div>

                {/* Chat Area */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {personalJourneyHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-xl max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-green-700 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none border border-gray-600'}`}>
                                {msg.role === 'model' ? <AIContentRenderer content={msg.text} /> : <p className="whitespace-pre-wrap">{msg.text}</p>}
                            </div>
                        </div>
                    ))}
                    {isPersonalJourneyLoading && (
                        <div className="flex justify-start">
                             <div className="p-3 rounded-xl bg-gray-700 rounded-bl-none">
                                 <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                 </div>
                             </div>
                        </div>
                    )}
                    {error && <p className="text-red-400 text-center text-xs p-2 bg-red-900/20 rounded">{error}</p>}
                    <div ref={personalJourneyMessagesEndRef} />
                </div>

                {/* Suggestions - Vertical */}
                {suggestions.length > 0 && !isPersonalJourneyLoading && (
                    <div className="px-4 pb-2 flex flex-col gap-2">
                        {suggestions.map((s, i) => (
                            <button 
                                key={i}
                                onClick={() => handleSendPersonalJourneyMessage(s)}
                                className="w-full text-right text-xs bg-gray-700 hover:bg-gray-600 text-blue-300 border border-blue-900/50 px-3 py-2 rounded-lg transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="p-3 border-t border-gray-700 bg-gray-800">
                    <div className="flex items-center bg-gray-700 rounded-lg pr-2">
                        <input
                            type="text"
                            value={personalJourneyQuery}
                            onChange={e => setPersonalJourneyQuery(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSendPersonalJourneyMessage()}
                            placeholder={`پیام به ${advisorConfig[personalJourneyAdvisor].name}...`}
                            className="flex-grow bg-transparent p-3 border-none focus:ring-0 text-white placeholder-gray-400 text-sm"
                        />
                        <button onClick={() => handleSendPersonalJourneyMessage()} disabled={isPersonalJourneyLoading || !personalJourneyQuery.trim()} className="p-3 text-white disabled:text-gray-500 hover:text-green-400 transition-colors">
                            <PaperAirplaneIcon className="w-5 h-5 dir-ltr"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAICoach;
