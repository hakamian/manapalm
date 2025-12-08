
import React, { useState, useEffect } from 'react';
import { CommunityPost } from '../../types';
import { analyzeCommunitySentimentAndTopics } from '../../services/geminiService';
import { supabase } from '../../services/supabaseClient';
import { SparklesIcon, MegaphoneIcon, PencilSquareIcon, CloudIcon, ClockIcon, CheckCircleIcon, ArrowPathIcon, CpuChipIcon, BoltIcon, ExclamationTriangleIcon } from '../icons';

interface ContentFactoryDashboardProps {
    posts: CommunityPost[];
}

// Definition matching your Supabase table
interface AgentTask {
    id: string;
    type: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    payload: any;
    result?: string;
    created_at: string;
}

const ContentFactoryDashboard: React.FC<ContentFactoryDashboardProps> = ({ posts }) => {
    const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
    const [isLoadingTopics, setIsLoadingTopics] = useState(false);
    
    // Agent Queue State
    const [agentQueue, setAgentQueue] = useState<AgentTask[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Load initial tasks and Setup Realtime Subscription
    useEffect(() => {
        if (!supabase) return;

        // Fetch existing tasks
        const fetchTasks = async () => {
            const { data, error } = await supabase
                .from('agent_tasks')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);
            
            if (data) {
                setAgentQueue(data as AgentTask[]);
            }
        };

        fetchTasks();

        // Listen for changes in the DB (Magic happens here!)
        const channel = supabase
            .channel('agent_tasks_updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'agent_tasks' },
                (payload) => {
                    console.log('Realtime update received:', payload);
                    if (payload.eventType === 'INSERT') {
                        setAgentQueue(prev => [payload.new as AgentTask, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setAgentQueue(prev => prev.map(task => 
                            task.id === payload.new.id ? (payload.new as AgentTask) : task
                        ));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleFetchTopics = async () => {
        setIsLoadingTopics(true);
        try {
            // Analyzing trends using Gemini directly (Client-side fast analysis)
            const result = await analyzeCommunitySentimentAndTopics(posts.slice(0, 30).map(p => p.text));
            setTrendingTopics(result.trendingTopics);
        } catch (e) {
            console.error("Trend analysis failed", e);
        } finally {
            setIsLoadingTopics(false);
        }
    };
    
    const dispatchAgentTask = async (topic: string) => {
        if (!supabase) {
            alert("اتصال به پایگاه داده برقرار نیست.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Create a row in Supabase. This will trigger any Webhooks linked to Make.com later.
            const { error } = await supabase
                .from('agent_tasks')
                .insert({
                    type: 'generate_article',
                    status: 'pending',
                    payload: { topic: topic, tone: 'professional' },
                    created_at: new Date().toISOString()
                });

            if (error) throw error;
            
            // Note: We don't need to manually update state here, 
            // the Realtime subscription above will catch the INSERT and update UI!

        } catch (e: any) {
            console.error("Error dispatching task:", e);
            alert(`خطا در ثبت سفارش: ${e.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            {/* Left: Command Center (Trigger) */}
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
                    <div className={`p-3 rounded-full bg-gray-700 text-gray-400`}>
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
                
                {trendingTopics.length > 0 ? (
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
                                    disabled={isSubmitting}
                                    className="text-xs bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 border border-green-500/30 disabled:opacity-50"
                                >
                                    <BoltIcon className="w-3 h-3" />
                                    تولید محتوا
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                        <p>هنوز موضوعی شناسایی نشده است.</p>
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
                        <h3 className="text-xl font-bold text-white">خط تولید محتوا (Live Pipeline)</h3>
                        <p className="text-sm text-gray-400">وضعیت زنده ایجنت‌ها در دیتابیس</p>
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
                            <div key={task.id} className={`p-4 rounded-xl border animate-slide-in-up transition-colors ${
                                task.status === 'completed' ? 'bg-green-900/10 border-green-500/30' :
                                task.status === 'failed' ? 'bg-red-900/10 border-red-500/30' :
                                'bg-gray-900/50 border-gray-700'
                            }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-bold text-white">تولید مقاله: {task.payload?.topic || 'موضوع نامشخص'}</span>
                                    <span className="text-[10px] font-mono text-gray-500">{new Date(task.created_at).toLocaleTimeString('fa-IR')}</span>
                                </div>
                                
                                <div className="flex items-center gap-3 mt-3">
                                    {task.status === 'pending' && (
                                        <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded-full border border-yellow-500/20">
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                                            در صف انتظار...
                                        </div>
                                    )}
                                    {task.status === 'processing' && (
                                        <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded-full border border-blue-500/20">
                                            <ArrowPathIcon className="w-3 h-3 animate-spin"/>
                                            ایجنت در حال نگارش...
                                        </div>
                                    )}
                                    {task.status === 'completed' && (
                                        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded-full border border-green-500/20">
                                            <CheckCircleIcon className="w-3 h-3"/>
                                            تکمیل شد
                                        </div>
                                    )}
                                    {task.status === 'failed' && (
                                        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded-full border border-red-500/20">
                                            <ExclamationTriangleIcon className="w-3 h-3"/>
                                            خطا در اجرا
                                        </div>
                                    )}
                                </div>

                                {task.status === 'processing' && (
                                    <div className="mt-3 w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-blue-500 h-full animate-progress-indeterminate"></div>
                                    </div>
                                )}
                                
                                {task.result && (
                                    <div className="mt-3 text-xs text-gray-300 bg-black/20 p-2 rounded border border-gray-600/50 line-clamp-2">
                                        &gt; {task.result}
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
