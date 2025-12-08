
import React, { useState, useEffect } from 'react';
import { CommunityPost } from '../../types';
import { analyzeCommunitySentimentAndTopics } from '../../services/geminiService';
import { SparklesIcon, MegaphoneIcon, PencilSquareIcon, CloudIcon, ClockIcon, CheckCircleIcon, ArrowPathIcon, CpuChipIcon, BoltIcon } from '../icons';

interface ContentFactoryDashboardProps {
    posts: CommunityPost[];
}

// Mock type for Agent Task
interface AgentTask {
    id: string;
    type: 'analyze_trends' | 'generate_article' | 'create_visuals';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    payload: any;
    result?: string;
    timestamp: string;
}

const ContentFactoryDashboard: React.FC<ContentFactoryDashboardProps> = ({ posts }) => {
    const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
    const [isLoadingTopics, setIsLoadingTopics] = useState(false);
    
    // Agent Queue State
    const [agentQueue, setAgentQueue] = useState<AgentTask[]>([]);
    const [activeAgent, setActiveAgent] = useState<string | null>(null); // 'writer', 'analyst', 'artist'

    // Simulation of polling for updates (In real app, use Supabase Realtime)
    useEffect(() => {
        const interval = setInterval(() => {
            setAgentQueue(prevQueue => {
                return prevQueue.map(task => {
                    if (task.status === 'pending') return { ...task, status: 'processing' };
                    if (task.status === 'processing') return { ...task, status: 'completed', result: 'محتوا با موفقیت تولید و در پایگاه داده ذخیره شد.' };
                    return task;
                });
            });
        }, 5000); // Simulate agent working time

        return () => clearInterval(interval);
    }, []);

    const handleFetchTopics = async () => {
        setIsLoadingTopics(true);
        setActiveAgent('analyst');
        try {
            // In full architecture, this would also be an agent task
            const result = await analyzeCommunitySentimentAndTopics(posts.slice(0, 30).map(p => p.text));
            setTrendingTopics(result.trendingTopics);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingTopics(false);
            setActiveAgent(null);
        }
    };
    
    const dispatchAgentTask = (topic: string) => {
        const newTask: AgentTask = {
            id: `task-${Date.now()}`,
            type: 'generate_article',
            status: 'pending',
            payload: { topic },
            timestamp: new Date().toLocaleTimeString('fa-IR')
        };
        setAgentQueue(prev => [newTask, ...prev]);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            {/* Left: Command Center (Trigger) */}
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
                    <div className={`p-3 rounded-full ${activeAgent === 'analyst' ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 'bg-gray-700 text-gray-400'}`}>
                        <CpuChipIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">رادار موضوعات (Trend Radar)</h3>
                        <p className="text-sm text-gray-400">تحلیل هوشمند نیازهای جامعه برای خوراک‌دهی به ایجنت‌ها</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleFetchTopics} 
                    disabled={isLoadingTopics} 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-all shadow-lg flex justify-center items-center gap-2 mb-6"
                >
                    {isLoadingTopics ? (
                         <>
                            <ArrowPathIcon className="w-5 h-5 animate-spin"/>
                            ایجنت تحلیلگر در حال اسکن...
                         </>
                    ) : 'شناسایی موضوعات داغ'}
                </button>
                
                {trendingTopics.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-gray-300 mb-2 flex items-center gap-2">
                            <SparklesIcon className="w-4 h-4 text-yellow-400"/>
                            پیشنهادات هوش مصنوعی:
                        </h4>
                        {trendingTopics.map((topic, i) => (
                            <div key={i} className="bg-gray-700/30 p-3 rounded-xl flex justify-between items-center border border-gray-600/50 hover:border-green-500/50 transition-colors group">
                                <span className="text-gray-200 font-medium text-sm">{topic}</span>
                                <button 
                                    onClick={() => dispatchAgentTask(topic)}
                                    className="text-xs bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 border border-green-500/30"
                                >
                                    <BoltIcon className="w-3 h-3" />
                                    تولید محتوا
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right: Agent Queue (Monitor) */}
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-3 bg-purple-500/20 rounded-full text-purple-400">
                        <MegaphoneIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">خط تولید محتوا (Agent Pipeline)</h3>
                        <p className="text-sm text-gray-400">وضعیت لحظه‌ای پردازش توسط Make.com</p>
                    </div>
                </div>
                
                <div className="flex-grow space-y-4 relative z-10 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                    {agentQueue.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                            <PencilSquareIcon className="w-10 h-10 mb-2 opacity-50" />
                            <p>صف پردازش خالی است.</p>
                            <p className="text-xs">یک موضوع انتخاب کنید تا ایجنت‌ها شروع کنند.</p>
                        </div>
                    ) : (
                        agentQueue.map((task) => (
                            <div key={task.id} className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 animate-slide-in-up">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-bold text-white">تولید مقاله: {task.payload.topic}</span>
                                    <span className="text-[10px] font-mono text-gray-500">{task.timestamp}</span>
                                </div>
                                
                                <div className="flex items-center gap-3 mt-3">
                                    {task.status === 'pending' && (
                                        <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded-full">
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                                            در صف انتظار...
                                        </div>
                                    )}
                                    {task.status === 'processing' && (
                                        <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded-full">
                                            <ArrowPathIcon className="w-3 h-3 animate-spin"/>
                                            ایجنت در حال نگارش...
                                        </div>
                                    )}
                                    {task.status === 'completed' && (
                                        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded-full">
                                            <CheckCircleIcon className="w-3 h-3"/>
                                            تکمیل شد
                                        </div>
                                    )}
                                </div>

                                {task.status === 'processing' && (
                                    <div className="mt-3 w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-blue-500 h-full animate-progress-indeterminate"></div>
                                    </div>
                                )}
                                
                                {task.result && (
                                    <div className="mt-3 text-xs text-gray-400 bg-gray-800 p-2 rounded border border-gray-700">
                                        > {task.result}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            <style>{`
                @keyframes progress-indeterminate {
                    0% { width: 0%; margin-left: 0%; }
                    50% { width: 50%; margin-left: 25%; }
                    100% { width: 100%; margin-left: 100%; }
                }
                .animate-progress-indeterminate {
                    animation: progress-indeterminate 1.5s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default ContentFactoryDashboard;
