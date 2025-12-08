
import React, { useState } from 'react';
import { CommunityPost, ArticleDraft } from '../../types';
import { analyzeCommunitySentimentAndTopics } from '../../services/geminiService';
import { SparklesIcon, MegaphoneIcon, PencilSquareIcon, PhotoIcon, CloudIcon, ClockIcon, CheckCircleIcon } from '../icons';
import SmartImage from '../ui/SmartImage';

interface ContentFactoryDashboardProps {
    posts: CommunityPost[];
}

const ContentFactoryDashboard: React.FC<ContentFactoryDashboardProps> = ({ posts }) => {
    const [trendingTopics, setTrendingTopics] = useState<string[] | null>(null);
    const [isLoadingTopics, setIsLoadingTopics] = useState(false);
    
    // Agent Request State
    const [requestStatus, setRequestStatus] = useState<'idle' | 'submitting' | 'queued'>('idle');
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFetchTopics = async () => {
        setIsLoadingTopics(true);
        setError(null);
        try {
            const result = await analyzeCommunitySentimentAndTopics(posts.slice(0, 30).map(p => p.text));
            setTrendingTopics(result.trendingTopics);
        } catch (e) {
            console.error(e);
            setError("خطا در استخراج موضوعات داغ.");
        } finally {
            setIsLoadingTopics(false);
        }
    };
    
    const handleRequestAgentJob = async (topic: string) => {
        setSelectedTopic(topic);
        setRequestStatus('submitting');
        setError(null);
        
        try {
            // In a real implementation connected to Supabase/Make:
            // await supabase.from('agent_tasks').insert({ task: 'generate_article', topic: topic, status: 'pending' });
            
            // For Demo, simulate API call to Agent Orchestrator
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setRequestStatus('queued');
            // Reset after 3 seconds
            setTimeout(() => {
                setRequestStatus('idle');
                setSelectedTopic(null);
            }, 4000);
            
        } catch (e) {
            console.error(e);
            setError(`خطا در ارسال دستور به ایجنت.`);
            setRequestStatus('idle');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            {/* Left: Trend Analysis */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-blue-400"/>
                    ۱. رادار موضوعات (Trend Radar)
                </h3>
                <p className="text-sm text-gray-400 mb-4">هوش مصنوعی گفتگوهای کانون را اسکن کرده و موضوعات داغ برای تولید محتوا را پیشنهاد می‌دهد.</p>
                
                <button onClick={handleFetchTopics} disabled={isLoadingTopics} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md disabled:bg-gray-600 transition-colors flex justify-center items-center gap-2">
                    {isLoadingTopics ? (
                         <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            در حال اسکن جامعه...
                         </>
                    ) : 'شناسایی موضوعات داغ'}
                </button>
                
                {error && !selectedTopic && <p className="text-red-400 text-sm mt-2">{error}</p>}
                
                {trendingTopics && (
                    <div className="mt-4 space-y-2">
                        <h4 className="font-semibold text-sm text-gray-300 mb-2">پیشنهادات هوش مصنوعی:</h4>
                        {trendingTopics.map((topic, i) => (
                            <div key={i} className="bg-gray-700/50 p-3 rounded-md flex justify-between items-center border border-gray-600 group hover:border-green-500 transition-colors">
                                <span className="text-gray-200 font-medium">{topic}</span>
                                <button 
                                    onClick={() => handleRequestAgentJob(topic)} 
                                    disabled={requestStatus !== 'idle'} 
                                    className="text-xs bg-stone-600 hover:bg-green-600 text-white py-1.5 px-3 rounded-md disabled:opacity-50 transition-colors flex items-center gap-1"
                                >
                                    <SparklesIcon className="w-3 h-3" />
                                    سپردن به ایجنت
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right: Agent Status */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 z-10">
                    <MegaphoneIcon className="w-6 h-6 text-yellow-400"/>
                    ۲. وضعیت خط تولید (Agent Pipeline)
                </h3>
                
                <div className="flex-grow flex flex-col justify-center items-center text-center p-8 relative z-10">
                    {requestStatus === 'idle' && (
                        <div className="opacity-60">
                            <div className="relative w-20 h-20 mx-auto mb-4">
                                <div className="absolute inset-0 border-2 border-gray-600 rounded-full"></div>
                                <div className="absolute inset-2 border-2 border-gray-700 rounded-full border-dashed animate-spin-slow"></div>
                                <PencilSquareIcon className="absolute inset-0 m-auto w-8 h-8 text-gray-500" />
                            </div>
                            <p className="text-gray-400">ایجنت‌ها در حالت آماده‌باش هستند.</p>
                            <p className="text-xs text-gray-500 mt-2">یک موضوع انتخاب کنید تا فرآیند تولید خودکار (متن + تصویر) آغاز شود.</p>
                        </div>
                    )}

                    {requestStatus === 'submitting' && (
                        <div>
                             <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/50">
                                <span className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
                             </div>
                             <p className="font-bold text-white mb-1">ارسال دستور به Make.com...</p>
                             <p className="text-xs text-blue-300">موضوع: {selectedTopic}</p>
                        </div>
                    )}

                    {requestStatus === 'queued' && (
                        <div className="animate-fade-in-up">
                             <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                                <CheckCircleIcon className="w-10 h-10 text-green-400" />
                             </div>
                             <h4 className="text-xl font-bold text-green-400 mb-2">ماموریت ثبت شد!</h4>
                             <p className="text-sm text-gray-300 mb-4">
                                ایجنت نویسنده و ایجنت گرافیست کار را شروع کردند.
                             </p>
                             <div className="bg-gray-900/80 p-3 rounded-lg text-left text-xs font-mono text-green-300 border border-green-900">
                                 > Order ID: #AG-{Date.now().toString().slice(-4)}<br/>
                                 > Status: PROCESSING<br/>
                                 > ETA: ~2 Minutes
                             </div>
                        </div>
                    )}
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <ClockIcon className="w-3 h-3" />
                        <span>تاریخچه عملیات اخیر:</span>
                    </div>
                    <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs bg-gray-700/30 p-2 rounded text-gray-400">
                            <span>مقاله «آینده کشاورزی»</span>
                            <span className="text-green-500">تکمیل شده</span>
                        </div>
                        <div className="flex justify-between text-xs bg-gray-700/30 p-2 rounded text-gray-400">
                            <span>پست اینستاگرام «نخل ایران»</span>
                            <span className="text-green-500">تکمیل شده</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentFactoryDashboard;
