import React, { useState, useEffect } from 'react';
import { SparklesIcon, ChartBarIcon, ArrowTrendingUpIcon, ExclamationTriangleIcon, BoltIcon } from '../../../components/icons';
import { generateStrategicAdvice, getStoreStats, sendChatMessage } from '@/services/geminiService';
import { supabase } from '@/services/supabaseClient';

interface Advice {
    id: string;
    title: string;
    type: 'inventory' | 'marketing' | 'performance';
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
    action: string;
}

interface AgentTask {
    id: string;
    type: string;
    status: string;
    payload: any;
    result?: string;
    created_at: string;
}

const AutoCEOView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'strategy' | 'command'>('strategy');

    return (
        <div className="min-h-screen bg-gray-950 text-white pt-24 pb-24">
            <div className="container mx-auto px-6">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-900/30 rounded-full mb-4 ring-1 ring-indigo-500/50">
                        <BoltIcon className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        مدیر عامل خودکار (Mana OS)
                    </h1>

                    {/* Tabs */}
                    <div className="flex justify-center gap-4 mt-8 mb-8 border-b border-gray-800 pb-4">
                        <button
                            onClick={() => setActiveTab('strategy')}
                            className={`px-6 py-2 rounded-xl transition-all ${activeTab === 'strategy' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            آمار و استراتژی
                        </button>
                        <button
                            onClick={() => setActiveTab('command')}
                            className={`px-6 py-2 rounded-xl transition-all ${activeTab === 'command' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            فرماندهی و درخواست‌ها
                        </button>
                    </div>
                </div>

                {activeTab === 'strategy' ? <StrategyView /> : <CommandView />}
            </div>
        </div>
    );
};

const StrategyView: React.FC = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [adviceList, setAdviceList] = useState<Advice[]>([]);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const stats = await getStoreStats();
            const result = await generateStrategicAdvice(stats);
            setAdviceList(result);
            setHasAnalyzed(true);
        } catch (error) {
            console.error("Error generating advice:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <>
            <div className="text-center mb-12">
                <p className="text-gray-400 max-w-2xl mx-auto">
                    تحلیل هوشمند داده‌های فروش و ارائه پیشنهادات استراتژیک برای رشد نخلستان.
                </p>
            </div>

            {!hasAnalyzed ? (
                <div className="max-w-xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
                    <ChartBarIcon className="w-16 h-16 text-gray-700 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-2">آماده تحلیل داده‌ها؟</h3>
                    <p className="text-gray-400 mb-8">
                        سیستم آماده است تا آخرین آمارهای فروش، رفتار کاربران و وضعیت انبار را بررسی کند.
                    </p>
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
                    >
                        {isAnalyzing ? (
                            <>
                                <SparklesIcon className="w-6 h-6 animate-spin" />
                                در حال تحلیل کسب‌وکار...
                            </>
                        ) : (
                            <>
                                <BoltIcon className="w-6 h-6" />
                                شروع تحلیل استراتژیک
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <SparklesIcon className="w-6 h-6 text-yellow-400" />
                            نتایج تحلیل هوشمند
                        </h2>
                        <button onClick={handleAnalyze} className="text-sm text-indigo-400 hover:text-indigo-300">
                            تحلیل مجدد
                        </button>
                    </div>

                    <div className="grid gap-6">
                        {adviceList.map((advice) => (
                            <div key={advice.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all flex items-start gap-4">
                                <div className={`p-3 rounded-lg flex-shrink-0 ${advice.priority === 'high' ? 'bg-red-900/20 text-red-400' :
                                    advice.priority === 'medium' ? 'bg-yellow-900/20 text-yellow-400' :
                                        'bg-blue-900/20 text-blue-400'
                                    }`}>
                                    {advice.priority === 'high' ? <ExclamationTriangleIcon className="w-6 h-6" /> :
                                        advice.priority === 'medium' ? <ArrowTrendingUpIcon className="w-6 h-6" /> :
                                            <ChartBarIcon className="w-6 h-6" />}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-white">{advice.title}</h3>
                                        <span className={`text-xs px-2 py-1 rounded capitalize ${advice.priority === 'high' ? 'bg-red-900/50 text-red-200' :
                                            advice.priority === 'medium' ? 'bg-yellow-900/50 text-yellow-200' :
                                                'bg-blue-900/50 text-blue-200'
                                            }`}>
                                            {advice.priority} Priority
                                        </span>
                                    </div>
                                    <p className="text-gray-400 mb-4 leading-relaxed">{advice.reasoning}</p>
                                    <button className="text-sm font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                        اجرای پیشنهاد: {advice.action} →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

const CommandView: React.FC = () => {
    const [taskDescription, setTaskDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tasks, setTasks] = useState<AgentTask[]>([]);
    const [chatQuery, setChatQuery] = useState('');
    const [chatResponse, setChatResponse] = useState('');
    const [isChatting, setIsChatting] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        if (!supabase) return;
        const { data, error } = await supabase
            .from('agent_tasks')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (data && !error) {
            setTasks(data);
        }
    };

    const handleSubmitTask = async () => {
        if (!taskDescription.trim() || !supabase) return;
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('agent_tasks')
                .insert({
                    type: 'manual_request',
                    status: 'pending',
                    payload: { request: taskDescription },
                    created_at: new Date().toISOString()
                });

            if (error) throw error;
            setTaskDescription('');
            fetchTasks();
        } catch (error) {
            console.error('Error submitting task:', error);
            alert('خطا در ثبت درخواست');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChat = async () => {
        if (!chatQuery.trim()) return;
        setIsChatting(true);
        try {
            const response = await sendChatMessage([], chatQuery, "You are Mana, the intelligent OS of this business. Answer briefly and strategically in Persian.");
            setChatResponse(response.text);
        } catch (error) {
            console.error(error);
        } finally {
            setIsChatting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Task Submission Section */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <BoltIcon className="w-6 h-6 text-purple-400" />
                    ثبت درخواست سیستم
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                    درخواست‌هایی که نیاز به تغییر در کد یا ساختار دارند را اینجا بنویسید. ایجنت در اجرای بعدی آنها را انجام می‌دهد.
                </p>

                <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="مثلاً: رنگ دکمه خرید را سبز کن، یا یک صفحه جدید برای کمپین یلدا بساز..."
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all min-h-[120px] mb-4"
                />

                <button
                    onClick={handleSubmitTask}
                    disabled={isSubmitting || !taskDescription}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
                >
                    {isSubmitting ? 'در حال ثبت...' : 'ارسال به صف اجرا'}
                </button>

                {/* Recent Tasks List */}
                <div className="mt-8">
                    <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">درخواست‌های اخیر</h4>
                    <div className="space-y-3">
                        {tasks.map(task => (
                            <div key={task.id} className="bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm flex justify-between items-center group hover:border-gray-700 transition-all">
                                <span className="text-gray-300 truncate max-w-[70%]">
                                    {task.payload?.request || 'بدون عنوان'}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs ${task.status === 'pending' ? 'bg-yellow-900/30 text-yellow-500' :
                                        task.status === 'completed' ? 'bg-green-900/30 text-green-500' : 'bg-gray-800 text-gray-500'
                                    }`}>
                                    {task.status === 'pending' ? 'در انتظار' : task.status === 'completed' ? 'انجام شد' : task.status}
                                </span>
                            </div>
                        ))}
                        {tasks.length === 0 && <p className="text-gray-600 text-center py-4">هنوز درخواستی ثبت نشده است</p>}
                    </div>
                </div>
            </div>

            {/* AI Consultation Section */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col h-full">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <SparklesIcon className="w-6 h-6 text-cyan-400" />
                    مشاوره با معنا
                </h3>

                <div className="flex-grow bg-gray-950 rounded-xl border border-gray-800 p-4 mb-4 overflow-y-auto min-h-[300px]">
                    {!chatResponse ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                            <SparklesIcon className="w-8 h-8 opacity-20" />
                            <p>هر سوالی دارید بپرسید...</p>
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-sm">
                            <p className="whitespace-pre-wrap">{chatResponse}</p>
                        </div>
                    )}
                </div>

                <div className="relative">
                    <input
                        type="text"
                        value={chatQuery}
                        onChange={(e) => setChatQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                        placeholder="با من مشورت کن..."
                        className="w-full bg-gray-950 border border-gray-700 rounded-xl p-4 pr-12 text-white placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                    <button
                        onClick={handleChat}
                        disabled={isChatting}
                        className="absolute left-2 top-2 bottom-2 px-3 bg-cyan-900/50 hover:bg-cyan-900 text-cyan-400 rounded-lg transition-all"
                    >
                        {isChatting ? <SparklesIcon className="w-5 h-5 animate-spin" /> : <BoltIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AutoCEOView;
