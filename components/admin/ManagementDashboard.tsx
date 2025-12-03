

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Order, CartItem, CommunityPost, PointLog, NavCategory, NavItem, View, AgentActionLog } from '../../types';
import { PencilIcon, TrashIcon, BoltIcon, CheckCircleIcon, SparklesIcon, BrainCircuitIcon, PlayIcon, PauseIcon, ClockIcon, SpeakerWaveIcon, SpeakerXMarkIcon, ShieldExclamationIcon, CheckIcon, XMarkIcon, ExclamationTriangleIcon } from '../icons';
import { useAppDispatch, useAppState } from '../../AppContext';
import { generateSpeech } from '../../services/geminiService';
import { dbAdapter } from '../../services/dbAdapter';

interface ManagementDashboardProps {
    users: User[];
    orders: Order[];
    coCreationOrders: {
        orderId: string;
        orderDate: string;
        user: {
            name: string | undefined;
            phone: string;
        };
        details: NonNullable<CartItem['coCreationDetails']>;
    }[];
}

const toPersianDigits = (str: string) => {
    if (!str) return '';
    return str.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
};

const HIGH_RISK_ACTIONS = ['mass_grant_points', 'create_flash_campaign', 'update_site_navigation'];

// ترجمه نام‌های فنی به فارسی روان
const ACTION_LABELS: Record<string, string> = {
    'mass_grant_points': 'اهدای جایزه همگانی (تست ریسک)',
    'create_flash_campaign': 'ایجاد کمپین فروش فوری',
    'publish_announcement': 'انتشار اطلاعیه عمومی',
    'update_site_navigation': 'تغییر منوی سایت',
};

interface PendingAction {
    id: string;
    action: string;
    params: any;
    timestamp: string;
}

const ManagementDashboard: React.FC<ManagementDashboardProps> = ({ users, orders, coCreationOrders }) => {
    const { siteConfig } = useAppState(); // Access current nav config
    const dispatch = useAppDispatch();
    const [activeSubTab, setActiveSubTab] = useState('agent');
    const [userSearch, setUserSearch] = useState('');
    const [orderSearch, setOrderSearch] = useState('');
    
    // Agent States
    const [agentAnalysis, setAgentAnalysis] = useState<string>('');
    const [executedActions, setExecutedActions] = useState<AgentActionLog[]>([]);
    const [isAgentRunning, setIsAgentRunning] = useState(false);
    const [isAutoPilot, setIsAutoPilot] = useState(false);
    const [lastRunTime, setLastRunTime] = useState<string | null>(null);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    
    // 2FA / Approval Queue
    const [pendingApprovals, setPendingApprovals] = useState<PendingAction[]>([]);
    
    // Refs
    const autoPilotIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const executedActionsRef = useRef<AgentActionLog[]>([]); 
    const audioContextRef = useRef<AudioContext | null>(null);

    const filteredUsers = useMemo(() =>
        users.filter(u => u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) || u.phone.includes(userSearch)),
        [users, userSearch]
    );
    const filteredOrders = useMemo(() =>
        orders.filter(o => o.id.includes(orderSearch) || o.userId.includes(orderSearch)),
        [orders, orderSearch]
    );

    // Load Agent Memory on Mount
    useEffect(() => {
        const loadHistory = async () => {
            const history = await dbAdapter.getAgentLogs();
            setExecutedActions(history);
            executedActionsRef.current = history;
        };
        loadHistory();
    }, []);

    // --- Voice Logic ---
    useEffect(() => {
        if (agentAnalysis && isVoiceEnabled && !isAgentRunning) {
            handleSpeakAnalysis(agentAnalysis);
        }
    }, [agentAnalysis, isVoiceEnabled, isAgentRunning]);

    const handleSpeakAnalysis = async (text: string) => {
        try {
            setIsPlayingAudio(true);
            const base64Audio = await generateSpeech(text);
            
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            
            const binaryString = atob(base64Audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
            
            const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => setIsPlayingAudio(false);
            source.start(0);
        } catch (e) {
            console.error("TTS failed", e);
            setIsPlayingAudio(false);
        }
    };

    // --- The Execution Engine (Updated for Persistent Memory) ---
    const logAndPersistAction = (actionName: string, detail: string) => {
        const newLog: AgentActionLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            action: actionName,
            details: detail,
            timestamp: new Date().toISOString()
        };
        
        // Update Local State
        const newHistory = [newLog, ...executedActions];
        setExecutedActions(newHistory);
        executedActionsRef.current = newHistory;

        // Persist to DB
        dbAdapter.saveAgentLog(newLog);

        return detail; // Return detail string for UI feedback if needed immediately
    };

    const processAction = (command: any, isApproved = false) => {
        const friendlyName = ACTION_LABELS[command.action] || command.action;

        // Check for High Risk
        if (HIGH_RISK_ACTIONS.includes(command.action) && !isApproved) {
            const newPending: PendingAction = {
                id: `pending-${Date.now()}-${Math.random()}`,
                action: command.action,
                params: command.params,
                timestamp: new Date().toISOString()
            };
            setPendingApprovals(prev => [newPending, ...prev]);
            return null; // Pending actions are not logged as executed yet
        }

        // Execute Approved or Safe Actions
        switch (command.action) {
            case 'publish_announcement':
                const newPost: CommunityPost = {
                    id: `post-agent-${Date.now()}`,
                    authorId: 'agent-ceo',
                    authorName: 'دفتر مدیریت (هوشمانا)',
                    authorAvatar: 'https://picsum.photos/seed/ai-ceo/100/100',
                    timestamp: new Date().toISOString(),
                    text: `📢 **${command.params.title}**\n\n${command.params.content}`,
                    likes: 0
                };
                dispatch({ type: 'ADD_POST', payload: newPost });
                return logAndPersistAction('publish_announcement', `✅ اطلاعیه «${command.params.title}» منتشر شد.`);

            case 'mass_grant_points':
                const target = command.params.target_segment;
                let count = 0;
                users.forEach(u => {
                    if (target === 'all' || (target === 'active' && u.points > 100)) {
                        const newLog: PointLog = { action: command.params.reason, points: command.params.amount, type: 'barkat', date: new Date().toISOString() };
                        dispatch({ 
                            type: 'UPDATE_USER', 
                            payload: { ...u, points: u.points + command.params.amount, pointsHistory: [newLog, ...(u.pointsHistory || [])] } 
                        });
                        count++;
                    }
                });
                return logAndPersistAction('mass_grant_points', `✅ ${command.params.amount} امتیاز به ${count} کاربر اهدا شد.`);

            case 'create_flash_campaign':
                dispatch({ 
                    type: 'UPDATE_CAMPAIGN', 
                    payload: { 
                        id: `camp-${Date.now()}`, 
                        title: command.params.name, 
                        description: 'کمپین ویژه ایجاد شده توسط مدیر هوشمند',
                        goal: command.params.goal_amount, 
                        current: 0, 
                        unit: 'نخل',
                        ctaText: 'همین حالا مشارکت کنید', // Default value
                        rewardPoints: 100 // Default value
                    } 
                });
                return logAndPersistAction('create_flash_campaign', `✅ کمپین «${command.params.name}» فعال شد.`);

            case 'update_site_navigation':
                const { category, title, description, view_name, icon_name } = command.params;
                
                const newNavItem: NavItem = {
                    title: title,
                    description: description,
                    icon: icon_name || 'SparklesIcon',
                    // Map simple string to View enum if possible, else default to Home
                    view: (Object.values(View).includes(view_name as View) ? view_name as View : View.Home)
                };

                const updatedNavigation = siteConfig.navigation.map(navCat => {
                    if (navCat.category === category) {
                        return {
                            ...navCat,
                            children: [...navCat.children, newNavItem]
                        };
                    }
                    return navCat;
                });

                dispatch({ type: 'UPDATE_NAVIGATION', payload: updatedNavigation });
                return logAndPersistAction('update_site_navigation', `✅ آیتم «${title}» به منوی «${category}» اضافه شد.`);
            
            default:
                return logAndPersistAction('unknown', `⚠️ دستور ناشناخته: ${command.action}`);
        }
    };

    const executeAgentCommands = (plan: any[]) => {
        plan.forEach(command => {
            processAction(command);
        });
    };
    
    const handleApproveAction = (id: string) => {
        const action = pendingApprovals.find(a => a.id === id);
        if (action) {
            processAction({ action: action.action, params: action.params }, true);
            setPendingApprovals(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleRejectAction = (id: string) => {
        const action = pendingApprovals.find(a => a.id === id);
        setPendingApprovals(prev => prev.filter(a => a.id !== id));
        if (action) {
             const friendlyName = ACTION_LABELS[action.action] || action.action;
             logAndPersistAction('rejected_action', `⛔ اقدام «${friendlyName}» توسط شما لغو شد.`);
        }
    };

    // Function to Simulate Risk for Demo
    const triggerHighRiskTest = () => {
        const riskCommands = [
            {
                action: 'mass_grant_points',
                params: { amount: 5000, reason: 'پاداش تست ریسک', target_segment: 'all' }
            },
             {
                action: 'update_site_navigation',
                params: { 
                    category: 'آکادمی', 
                    title: '🔥 جشنواره فروش', 
                    description: 'تخفیف ویژه برای دوره‌ها', 
                    view_name: 'shop',
                    icon_name: 'FireIcon'
                }
            }
        ];
        const randomCmd = riskCommands[Math.floor(Math.random() * riskCommands.length)];
        processAction(randomCmd);
    };

    // --- Agent Logic ---
    const runAutonomousAgent = async () => {
        if (isAgentRunning) return;
        setIsAgentRunning(true);
        
        const context = {
            totalUsers: users.length,
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
            recentActivityLevel: Math.random() > 0.5 ? 'Low' : 'High',
            lastOrderTime: orders.length > 0 ? orders[orders.length - 1].date : 'N/A',
            // Pass ONLY action names and timestamps to save token space and focus on "what was done"
            actionHistory: executedActionsRef.current.slice(0, 5).map(log => `${log.action} at ${log.timestamp}`)
        };

        try {
            await new Promise(r => setTimeout(r, 2000)); // Simulating network delay

            // In a real implementation, we would call the API here with 'context'.
            // For the demo, we simulate a response that is aware of the "history" implicitly.
            
            const mockPlans = [
                { action: 'publish_announcement', params: { title: 'خبر مهم', content: 'به دلیل استقبال شما، ظرفیت سرورها افزایش یافت.', priority: 'normal' } },
                { action: 'mass_grant_points', params: { amount: 500, reason: 'پاداش وفاداری فصلی', target_segment: 'active' } }, // High Risk
                 { 
                    action: 'update_site_navigation', 
                    params: { 
                        category: 'سفر', 
                        title: '✨ ماموریت جدید', 
                        description: 'چالش هفتگی فعال شد', 
                        view_name: 'path',
                        icon_name: 'StarIcon'
                    } 
                },
                null
            ];
            
            // Simple logic to avoid repeating the last action if it was recent
            const lastAction = executedActionsRef.current[0]?.action;
            let randomPlan = mockPlans[Math.floor(Math.random() * mockPlans.length)];
            
            if (randomPlan && randomPlan.action === lastAction) {
                 randomPlan = null; // Skip to avoid repetition
            }
            
            const analysisText = `تحلیل وضعیت: تعداد کاربران فعال ${context.totalUsers} نفر است. گردش مالی ${context.totalRevenue} تومان. وضعیت فعلی ${context.recentActivityLevel === 'Low' ? 'نیازمند تحریک تقاضا' : 'مطلوب'} ارزیابی می‌شود. پیشنهاد من ${randomPlan ? 'اجرای یک اقدام استراتژیک' : 'نظارت غیرفعال'} است.`;
            
            setAgentAnalysis(analysisText);
            
            if (randomPlan) executeAgentCommands([randomPlan]);

        } catch (e) {
            console.error("Agent failed", e);
        } finally {
            setIsAgentRunning(false);
            setLastRunTime(new Date().toLocaleTimeString('fa-IR'));
        }
    };

    useEffect(() => {
        if (isAutoPilot) {
            runAutonomousAgent();
            autoPilotIntervalRef.current = setInterval(runAutonomousAgent, 15000);
        } else {
            if (autoPilotIntervalRef.current) clearInterval(autoPilotIntervalRef.current);
        }
        return () => { if (autoPilotIntervalRef.current) clearInterval(autoPilotIntervalRef.current); };
    }, [isAutoPilot]);

    return (
        <div>
            <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
                 <button onClick={() => setActiveSubTab('agent')} className={`py-2 px-4 whitespace-nowrap ${activeSubTab === 'agent' ? 'border-b-2 border-amber-500 text-white' : 'text-gray-400'} flex items-center gap-2`}><BoltIcon className="w-4 h-4"/> مدیر خودکار (Auto-CEO)</button>
                <button onClick={() => setActiveSubTab('users')} className={`py-2 px-4 whitespace-nowrap ${activeSubTab === 'users' ? 'border-b-2 border-green-500 text-white' : 'text-gray-400'}`}>کاربران</button>
                <button onClick={() => setActiveSubTab('orders')} className={`py-2 px-4 whitespace-nowrap ${activeSubTab === 'orders' ? 'border-b-2 border-green-500 text-white' : 'text-gray-400'}`}>سفارشات</button>
                <button onClick={() => setActiveSubTab('coCreation')} className={`py-2 px-4 whitespace-nowrap ${activeSubTab === 'coCreation' ? 'border-b-2 border-green-500 text-white' : 'text-gray-400'}`}>سفارشات هم‌آفرینی</button>
            </div>
            
            {activeSubTab === 'agent' && (
                <div className="space-y-6">
                    <div className={`bg-gradient-to-r transition-all duration-500 p-8 rounded-2xl border relative overflow-hidden shadow-xl ${isAutoPilot ? 'from-green-900/40 to-gray-900 border-green-500/50' : 'from-gray-800 to-gray-900 border-gray-700'}`}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <SparklesIcon className={`w-8 h-8 ${isAutoPilot ? 'text-green-400 animate-pulse' : 'text-amber-400'}`} />
                                        {isAutoPilot ? 'سیستم خودران فعال است' : 'اتاق فرماندهی هوشمند'}
                                    </h3>
                                    <p className="text-gray-400 mt-2">
                                        {isAutoPilot 
                                            ? 'مدیر هوشمند به صورت خودکار وضعیت را پایش و مداخله می‌کند.' 
                                            : 'هوش مصنوعی وضعیت سازمان را تحلیل کرده و منتظر دستور شماست.'}
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-3 flex-wrap justify-end">
                                    {/* Voice Toggle */}
                                    <button 
                                        onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                                        className={`p-3 rounded-full transition-colors border ${isVoiceEnabled ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-400'}`}
                                        title={isVoiceEnabled ? 'خاموش کردن صدای مدیر' : 'روشن کردن صدای مدیر'}
                                    >
                                        {isVoiceEnabled ? <SpeakerWaveIcon className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`} /> : <SpeakerXMarkIcon className="w-5 h-5" />}
                                    </button>

                                    {/* Test Risk Trigger (Debug) */}
                                    <button 
                                        onClick={triggerHighRiskTest}
                                        className="bg-red-900/50 border border-red-600/50 hover:bg-red-800 text-red-200 font-semibold py-3 px-4 rounded-xl flex items-center gap-2 text-xs"
                                        title="شبیه‌سازی یک اقدام پرخطر برای تست صف تایید"
                                    >
                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                        تست ریسک
                                    </button>

                                    {/* Manual Trigger */}
                                    {!isAutoPilot && (
                                        <button 
                                            onClick={runAutonomousAgent} 
                                            disabled={isAgentRunning}
                                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-xl disabled:opacity-50 flex items-center gap-2 shadow-lg"
                                        >
                                            {isAgentRunning ? <span className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></span> : <BoltIcon className="w-5 h-5" />}
                                            اجرای دستی
                                        </button>
                                    )}

                                    {/* Auto-Pilot Toggle */}
                                    <button 
                                        onClick={() => setIsAutoPilot(!isAutoPilot)}
                                        className={`py-3 px-6 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all border ${isAutoPilot ? 'bg-green-600 border-green-400 hover:bg-green-700 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300'}`}
                                    >
                                        {isAutoPilot ? (
                                            <>
                                                <PauseIcon className="w-5 h-5" />
                                                توقف اتو پایلوت
                                            </>
                                        ) : (
                                            <>
                                                <PlayIcon className="w-5 h-5" />
                                                روشن کردن اتو پایلوت
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Pending Approvals Queue (2FA) */}
                            {pendingApprovals.length > 0 && (
                                <div className="mb-6 bg-red-900/20 border border-red-500/40 rounded-xl p-4 animate-fade-in">
                                    <div className="flex items-center gap-2 text-red-400 font-bold mb-3">
                                        <ShieldExclamationIcon className="w-6 h-6" />
                                        <span>صف انتظار تایید (اقدامات حساس)</span>
                                    </div>
                                    <div className="space-y-3">
                                        {pendingApprovals.map(action => (
                                            <div key={action.id} className="bg-red-950/40 p-3 rounded-lg flex justify-between items-center border border-red-500/20">
                                                <div>
                                                    <p className="text-white font-bold text-sm mb-1">{ACTION_LABELS[action.action] || action.action}</p>
                                                    <p className="text-xs text-gray-400 font-mono">جزئیات: {JSON.stringify(action.params)}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleApproveAction(action.id)} className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition-colors" title="تایید">
                                                        <CheckIcon className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleRejectAction(action.id)} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors" title="رد">
                                                        <XMarkIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Analysis Box */}
                                <div className="bg-black/30 p-6 rounded-xl border border-white/10 min-h-[150px]">
                                    <h4 className="text-amber-300 font-bold mb-3 flex items-center gap-2"><BrainCircuitIcon className="w-5 h-5"/> تحلیل وضعیت (زنده)</h4>
                                    {agentAnalysis ? (
                                        <p className="text-gray-200 leading-relaxed animate-fade-in">{agentAnalysis}</p>
                                    ) : (
                                        <p className="text-gray-500 italic text-sm">سیستم در حالت آماده‌باش است...</p>
                                    )}
                                </div>

                                {/* Actions Log */}
                                <div className="bg-black/30 p-6 rounded-xl border border-white/10 min-h-[150px] max-h-[200px] overflow-y-auto custom-scrollbar">
                                    <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> گزارش عملیات (حافظه دائم)</h4>
                                    {executedActions.length > 0 ? (
                                        <ul className="space-y-2">
                                            {executedActions.slice(0, 20).map((log) => (
                                                <li key={log.id} className="flex items-start gap-2 text-sm text-gray-200 animate-fade-in-up">
                                                    <span className="text-xs mt-1">⚡</span> 
                                                    <span title={new Date(log.timestamp).toLocaleString('fa-IR')}>{log.details}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 italic text-sm">هنوز اقدامی ثبت نشده است.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-70">
                        <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
                            <p className="text-gray-400 text-xs">کاربران فعال</p>
                            <p className="text-xl font-bold text-white">{users.length.toLocaleString('fa-IR')}</p>
                        </div>
                         <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
                            <p className="text-gray-400 text-xs">کل سفارشات</p>
                            <p className="text-xl font-bold text-white">{orders.length.toLocaleString('fa-IR')}</p>
                        </div>
                         <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
                            <p className="text-gray-400 text-xs">گردش مالی</p>
                            <p className="text-xl font-bold text-green-400">{orders.reduce((s,o)=>s+o.total,0).toLocaleString('fa-IR')}</p>
                        </div>
                    </div>
                </div>
            )}

            {activeSubTab === 'users' && (
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold mb-4">مدیریت کاربران ({filteredUsers.length.toLocaleString('fa-IR')})</h3>
                    <input type="text" placeholder="جستجو بر اساس نام یا شماره تلفن..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md mb-4" />
                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {filteredUsers.map(user => (
                            <div key={user.id} className="bg-gray-700/50 p-3 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{user.fullName} <span className="text-gray-400 text-sm mx-1">({toPersianDigits(user.phone)})</span></p>
                                    <p className="text-xs text-gray-400">امتیاز: {user.points.toLocaleString('fa-IR')}</p>
                                </div>
                                <div className="flex gap-2"><button className="text-blue-400"><PencilIcon className="w-5 h-5" /></button><button className="text-red-500"><TrashIcon className="w-5 h-5" /></button></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {activeSubTab === 'orders' && (
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold mb-4">مدیریت سفارشات ({filteredOrders.length.toLocaleString('fa-IR')})</h3>
                    <input type="text" placeholder="جستجو بر اساس شناسه سفارش یا کاربر..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md mb-4" />
                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {filteredOrders.map(order => (
                            <div key={order.id} className="bg-gray-700/50 p-3 rounded-md">
                                <div className="flex justify-between items-center">
                                    <div><p>سفارش #{order.id.slice(-6)}</p><p className="text-xs text-gray-400">کاربر: {order.userId}</p></div>
                                    <select defaultValue={order.status} className="bg-gray-600 text-xs p-1 rounded"><option>ثبت شده</option><option>در حال پردازش</option><option>ارسال شده</option><option>تحویل داده شده</option></select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {activeSubTab === 'coCreation' && (
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold mb-4">سفارشات هم‌آفرینی ({coCreationOrders.length.toLocaleString('fa-IR')})</h3>
                    <div className="max-h-[60vh] overflow-y-auto space-y-4">
                        {coCreationOrders.map(order => (
                            <div key={order.orderId} className="bg-gray-700/50 p-4 rounded-lg">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold">سفارش #{order.orderId.slice(-6)} - <span className="text-green-300">{order.details.packageName}</span></p>
                                        <p className="text-sm text-gray-400">{order.user.name} ({toPersianDigits(order.user.phone)})</p>
                                    </div>
                                    <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString('fa-IR')}</p>
                                </div>
                                <div className="text-sm space-y-1 bg-gray-900/40 p-3 rounded-md">
                                    <p><strong>نام سایت:</strong> {order.details.siteName}</p>
                                    <p><strong>شعار:</strong> {order.details.tagline}</p>
                                    <p><strong>سبک:</strong> {order.details.style}</p>
                                    <p><strong>رنگ‌ها:</strong> {order.details.colors}</p>
                                    <p><strong>ویژگی‌ها:</strong> {order.details.features.join(', ')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagementDashboard;
