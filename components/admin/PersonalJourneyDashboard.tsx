
import React, { useState, useRef, useEffect } from 'react';
import { AdvisorType, ChatMessage } from '../../types';
import { getAdvisorChatResponse } from '../../services/geminiService';
import { SunIcon, ChartBarIcon, PaperAirplaneIcon, TargetIcon, HeartIcon, LightBulbIcon, CogIcon, PencilSquareIcon, RadarIcon, CpuChipIcon, BanknotesIcon, SproutIcon, UsersIcon, MagnifyingGlassIcon, AcademicCapIcon, ShareIcon, BrainCircuitIcon } from '../icons';

const advisorConfig: Record<AdvisorType, { name: string; icon: React.FC<any> }> = {
    spiritual_guide: { name: "مشاور معنا (رهنورد عرفان)", icon: SunIcon },
    data: { name: "تحلیلگر داده (My Mana)", icon: ChartBarIcon },
    strategy: { name: "استراتژیست ارشد", icon: TargetIcon },
    growth: { name: "متخصص رشد", icon: LightBulbIcon },
    coaching: { name: "مربی ارشد", icon: BrainCircuitIcon },
    ux: { name: "متخصص UX", icon: CpuChipIcon },
    systems_architect: { name: "مشاور سیستم", icon: CogIcon },
    financial: { name: "مشاور مالی", icon: BanknotesIcon },
    agricultural: { name: "مشاور کشاورزی", icon: SproutIcon },
    legal: { name: "مشاور حقوقی", icon: UsersIcon },
    content: { name: "مشاور محتوا", icon: PencilSquareIcon },
    foresight: { name: "آینده‌پژوه", icon: RadarIcon },
    ai: { name: "مشاور هوش مصنوعی", icon: CpuChipIcon },
    community: { name: "مشاور جامعه", icon: HeartIcon },
    seo: { name: "کارشناس ارشد SEO", icon: MagnifyingGlassIcon },
    education: { name: "کارشناس ارشد آموزش", icon: AcademicCapIcon },
    social_media_expert: { name: "کارشناس شبکه‌های اجتماعی", icon: ShareIcon },
};

const PersonalJourneyDashboard: React.FC = () => {
    const [personalJourneyAdvisor, setPersonalJourneyAdvisor] = useState<AdvisorType>('spiritual_guide');
    const [personalJourneyHistory, setPersonalJourneyHistory] = useState<ChatMessage[]>([]);
    const [personalJourneyQuery, setPersonalJourneyQuery] = useState('');
    const [isPersonalJourneyLoading, setIsPersonalJourneyLoading] = useState(false);
    const personalJourneyMessagesEndRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        personalJourneyMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [personalJourneyHistory, isPersonalJourneyLoading]);

    const handleSendPersonalJourneyMessage = async () => {
        if (!personalJourneyQuery.trim()) return;

        const userMessage: ChatMessage = { role: 'user', text: personalJourneyQuery };
        const newHistory = [...personalJourneyHistory, userMessage];
        setPersonalJourneyHistory(newHistory);
        const currentQuery = personalJourneyQuery;
        setPersonalJourneyQuery('');
        setIsPersonalJourneyLoading(true);
        setError(null);

        try {
            const response = await getAdvisorChatResponse(currentQuery, personalJourneyAdvisor, newHistory);
            const modelMessage: ChatMessage = { role: 'model', text: response.text };
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
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-4">سفر شخصی و مشاوره معنوی</h3>
            <p className="text-sm text-gray-400 mb-4">
                در این خلوت، با مشاوران ویژه خود برای رشد فردی و معنوی گفتگو کنید.
            </p>
            <div className="flex flex-col h-[70vh] bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="p-2 border-b border-gray-700 flex items-center justify-center gap-2 overflow-x-auto">
                     {Object.entries(advisorConfig).slice(0, 4).map(([key, config]) => (
                        <button 
                            key={key}
                            onClick={() => setPersonalJourneyAdvisor(key as AdvisorType)} 
                            className={`flex items-center gap-2 py-1 px-4 text-sm rounded-md whitespace-nowrap transition-colors ${personalJourneyAdvisor === key ? 'bg-green-600 font-semibold text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            {/* Now config.icon is a component, so createElement works */}
                            {React.createElement(config.icon, { className: "w-4 h-4" })}
                            {config.name}
                        </button>
                    ))}
                </div>
                <div ref={personalJourneyMessagesEndRef} className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {personalJourneyHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-lg text-sm leading-relaxed ${msg.role === 'user' ? 'bg-green-800 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isPersonalJourneyLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-gray-700"><div className="flex items-center space-x-1 space-x-reverse"><span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span></div></div></div>}
                    {error && <p className="text-red-400 text-center text-sm p-2">{error}</p>}
                </div>
                <div className="p-2 border-t border-gray-700">
                    <div className="flex items-center bg-gray-700 rounded-lg pr-2">
                        <input
                            type="text"
                            value={personalJourneyQuery}
                            onChange={e => setPersonalJourneyQuery(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSendPersonalJourneyMessage()}
                            placeholder={`پیام به ${advisorConfig[personalJourneyAdvisor]?.name || 'مشاور'}...`}
                            className="flex-grow bg-transparent p-3 border-none focus:ring-0 text-white placeholder-gray-400"
                        />
                        <button onClick={handleSendPersonalJourneyMessage} disabled={isPersonalJourneyLoading || !personalJourneyQuery.trim()} className="p-3 text-white disabled:text-gray-500 hover:text-green-400 transition-colors">
                            <PaperAirplaneIcon className="w-6 h-6 dir-ltr"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalJourneyDashboard;
