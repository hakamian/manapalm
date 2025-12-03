
import React, { useState, useMemo } from 'react';
import { useAppState, useAppDispatch } from '../../AppContext';
import { AIProvider, AIModel } from '../../types';
import { CpuChipIcon, BanknotesIcon, SparklesIcon, CogIcon, ChartBarIcon, ArrowPathIcon, ArrowUpIcon, ArrowDownIcon, XMarkIcon, ShieldCheckIcon, BoltIcon, LockClosedIcon, VideoCameraIcon, MicrophoneIcon, PhotoIcon, ChatBubbleBottomCenterTextIcon, PencilSquareIcon } from '../icons';
import { timeAgo } from '../../utils/time';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; trend?: string; trendDirection?: 'up' | 'down'; colorClass: string }> = ({ icon, title, value, trend, trendDirection, colorClass }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className={`text-3xl font-bold mt-1 ${colorClass}`}>{value}</p>
            </div>
            <div className={`p-3 rounded-full bg-gray-700`}>
                {icon}
            </div>
        </div>
        {trend && (
            <div className={`flex items-center text-xs mt-3 ${trendDirection === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {trendDirection === 'up' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                <span className="mr-1">{trend}</span>
                <span className="text-gray-500 mr-1">نسبت به دوره قبل</span>
            </div>
        )}
    </div>
);

const SettingsHistoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    history: any[];
    onRestore: (settings: any) => void;
}> = ({ isOpen, onClose, history, onRestore }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 w-full max-w-2xl rounded-lg border border-gray-700 flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">تاریخچه تنظیمات API</h2>
                    <button onClick={onClose}><XMarkIcon /></button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto space-y-3">
                    {history.length > 0 ? history.map((entry, index) => (
                        <div key={index} className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-semibold">{timeAgo(entry.timestamp)}</p>
                                <p className="text-xs text-gray-400">
                                    حالت: {entry.settings.mode} | بودجه: ${entry.settings.budget}
                                </p>
                            </div>
                            <button onClick={() => onRestore(entry.settings)} className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-md">
                                بازیابی
                            </button>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 py-8">تاریخچه‌ای برای نمایش وجود ندارد.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const ApiManagementDashboard: React.FC = () => {
    const { apiSettings, aiConfig, apiSettingsHistory } = useAppState();
    const dispatch = useAppDispatch();
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);

    const mockApiData = useMemo(() => {
        const baseCost = 50;
        const totalRequestsBase = 12450;
        const costMultiplier = apiSettings.mode === 'performance' ? 2.5 : 1;
        const budgetMultiplier = apiSettings.budget / 100;

        const totalRequests = Math.floor(totalRequestsBase * budgetMultiplier);
        const estimatedCost = Math.min(apiSettings.budget, baseCost * costMultiplier * budgetMultiplier);

        return {
            totalRequests,
            estimatedCost,
            providers: [
                { name: 'Google (Gemini)', status: 'active', latency: '800ms', successRate: '99.8%' },
                { name: 'OpenAI (GPT-4)', status: 'standby', latency: '-', successRate: '-' },
                { name: 'Anthropic (Claude)', status: 'standby', latency: '-', successRate: '-' },
            ]
        };
    }, [apiSettings.mode, apiSettings.budget]);

    // Mock Usage Data for Models
    const modelUsageData = [
        { name: 'gemini-2.5-flash', reqs: 8092, percent: 85, color: 'bg-blue-500' },
        { name: 'gemini-3-pro-preview', reqs: 3112, percent: 30, color: 'bg-blue-400' },
        { name: 'imagen-4.0-generate-001', reqs: 996, percent: 10, color: 'bg-blue-300' },
        { name: 'veo-3.1-fast-generate-preview', reqs: 249, percent: 3, color: 'bg-blue-200' },
    ];

    // Mock Usage Data for Features
    const featureUsageData = [
        { title: 'چت‌بات', count: 4482, icon: <ChatBubbleBottomCenterTextIcon/> },
        { title: 'دستیار نویسنده', count: 3486, icon: <PencilSquareIcon/> },
        { title: 'تحلیل‌ها', count: 2241, icon: <ChartBarIcon/> },
        { title: 'تولید تصویر', count: 996, icon: <PhotoIcon/> },
        { title: 'مکالمه زنده', count: 996, icon: <MicrophoneIcon/> },
        { title: 'تولید ویدیو', count: 249, icon: <VideoCameraIcon/> },
    ];

    const toggleMaintenanceMode = () => {
        const newStatus = aiConfig.systemStatus === 'online' ? 'maintenance' : 'online';
        dispatch({ type: 'UPDATE_AI_CONFIG', payload: { systemStatus: newStatus } });
    };

    const handleProviderChange = (provider: AIProvider) => {
        dispatch({ type: 'UPDATE_AI_CONFIG', payload: { activeProvider: provider } });
    };

    const handleModelChange = (model: AIModel) => {
        dispatch({ type: 'UPDATE_AI_CONFIG', payload: { activeTextModel: model } });
    };

    const handleModeChange = (mode: 'optimal' | 'performance') => {
        dispatch({ type: 'UPDATE_API_SETTINGS', payload: { mode } });
    };

    const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'UPDATE_API_SETTINGS', payload: { budget: Number(e.target.value) } });
    };

    return (
        <div className="space-y-8">
            {/* Security & System Status Banner */}
            <div className={`rounded-xl p-4 flex flex-col md:flex-row justify-between items-center border ${aiConfig.systemStatus === 'maintenance' ? 'bg-red-900/20 border-red-500/50' : 'bg-green-900/20 border-green-500/50'}`}>
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                    <div className={`p-2 rounded-full ${aiConfig.systemStatus === 'maintenance' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                        {aiConfig.systemStatus === 'maintenance' ? <LockClosedIcon className="w-6 h-6" /> : <ShieldCheckIcon className="w-6 h-6" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{aiConfig.systemStatus === 'online' ? 'سیستم هوشمند فعال است' : 'حالت تعمیر و نگهداری'}</h3>
                        <p className="text-sm opacity-80">{aiConfig.systemStatus === 'online' ? 'تمام سرویس‌های AI در دسترس هستند.' : 'دسترسی کاربران به ابزارهای هوشمند قطع شده است.'}</p>
                    </div>
                </div>
                <button 
                    onClick={toggleMaintenanceMode}
                    className={`px-6 py-2 rounded-lg font-bold transition-colors ${aiConfig.systemStatus === 'maintenance' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                    {aiConfig.systemStatus === 'maintenance' ? 'فعال‌سازی مجدد' : 'توقف اضطراری (Kill Switch)'}
                </button>
            </div>

            {/* New Stats: Model Usage & Performance Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Model Usage */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5 text-gray-400"/> مصرف مدل‌ها
                    </h3>
                    <div className="space-y-6">
                        {modelUsageData.map((model) => (
                            <div key={model.name}>
                                <div className="flex justify-between text-sm text-gray-400 mb-1">
                                    <span>{model.name}</span>
                                    <span className="text-gray-500 font-mono text-xs">req {model.reqs.toLocaleString('fa-IR')}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div className={`${model.color} h-2 rounded-full`} style={{ width: `${model.percent}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Settings */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                         <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <CogIcon className="w-5 h-5 text-gray-400"/> تنظیمات عملکرد
                        </h3>
                         <button onClick={() => setIsHistoryModalOpen(true)} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs">
                            <ArrowPathIcon className="w-3 h-3" /> تاریخچه تغییرات
                        </button>
                    </div>
                    
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between mb-2 text-sm">
                                <span className="text-gray-300">حالت بهینه‌سازی</span>
                            </div>
                            <div className="flex bg-gray-700 rounded-lg p-1">
                                <button 
                                    onClick={() => handleModeChange('performance')}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${apiSettings.mode === 'performance' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                                >
                                    عملکرد بالا (Performance)
                                </button>
                                <button 
                                    onClick={() => handleModeChange('optimal')}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${apiSettings.mode === 'optimal' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                                >
                                    بهینه (Optimal)
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                {apiSettings.mode === 'optimal' 
                                    ? 'تعادل بین هزینه و سرعت. استفاده بیشتر از مدل‌های Flash.' 
                                    : 'اولویت با کیفیت و سرعت. استفاده بیشتر از مدل‌های Pro.'}
                            </p>
                        </div>

                        <div>
                             <div className="flex justify-between mb-2 text-sm">
                                <span className="text-gray-300">سقف بودجه ماهانه</span>
                                <span className="text-green-400 font-bold">${apiSettings.budget}</span>
                            </div>
                            <input 
                                type="range" 
                                min="10" 
                                max="500" 
                                step="10" 
                                value={apiSettings.budget} 
                                onChange={handleBudgetChange}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Usage Grid */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    مصرف بر اساس قابلیت
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featureUsageData.map((feature) => (
                        <div key={feature.title} className="bg-gray-800 border border-gray-700 p-4 rounded-xl flex items-center justify-between hover:border-gray-600 transition-colors">
                            <div>
                                <p className="text-gray-400 text-sm">{feature.title}</p>
                                <p className="text-2xl font-bold text-amber-500 mt-1">{feature.count.toLocaleString('fa-IR')}</p>
                                <p className="text-xs text-gray-600">درخواست</p>
                            </div>
                            <div className="p-3 bg-gray-700/50 rounded-full text-gray-400">
                                {React.cloneElement(feature.icon as React.ReactElement<{ className?: string }>, { className: 'w-6 h-6' })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Brain Control Center */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                            <BoltIcon className="w-6 h-6 text-yellow-400"/> مرکز فرماندهی مدل‌ها
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">حالت پیشرفته</span>
                            <button 
                                onClick={() => setIsAdvancedMode(!isAdvancedMode)} 
                                className={`w-10 h-5 rounded-full relative transition-colors ${isAdvancedMode ? 'bg-blue-600' : 'bg-gray-600'}`}
                            >
                                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${isAdvancedMode ? 'left-1' : 'right-1'}`}></div>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">تامین‌کننده اصلی (Provider)</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['google', 'openai', 'anthropic'] as AIProvider[]).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => handleProviderChange(p)}
                                        className={`py-3 px-2 rounded-lg text-sm font-semibold border transition-all ${aiConfig.activeProvider === p ? 'bg-blue-600 border-blue-500 text-white shadow-lg scale-105' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
                                    >
                                        {p === 'google' ? 'Google' : p === 'openai' ? 'OpenAI' : 'Anthropic'}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">تغییر تامین‌کننده تمامی درخواست‌های جدید را به سرویس انتخاب شده هدایت می‌کند (پروکسی).</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">مدل زبانی فعال</label>
                            <select 
                                value={aiConfig.activeTextModel} 
                                onChange={(e) => handleModelChange(e.target.value as AIModel)}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <optgroup label="Google Gemini">
                                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (سریع و بهینه)</option>
                                    <option value="gemini-3-pro-preview">Gemini 3 Pro (هوشمندترین)</option>
                                </optgroup>
                                <optgroup label="OpenAI GPT">
                                    <option value="gpt-4o-mini">GPT-4o Mini (اقتصادی)</option>
                                    <option value="gpt-4o">GPT-4o (قدرتمند)</option>
                                </optgroup>
                                <optgroup label="Anthropic Claude">
                                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (خلاق)</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>

                    {isAdvancedMode && (
                        <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">کلید API (رمزنگاری شده)</label>
                                <div className="flex gap-2">
                                    <input type="password" value="****************************" disabled className="flex-grow bg-gray-900/50 border border-gray-600 rounded-lg p-2 text-gray-500 cursor-not-allowed" />
                                    <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm text-white transition-colors">تغییر</button>
                                </div>
                                <p className="text-xs text-yellow-500 mt-1">توجه: کلیدها فقط روی سرور ذخیره می‌شوند.</p>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Fallback خودکار</label>
                                <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded-lg border border-gray-600">
                                    <span className="text-sm text-gray-300 ml-2">سوییچ به مدل جایگزین در صورت خطا</span>
                                    <button 
                                        onClick={() => dispatch({ type: 'UPDATE_AI_CONFIG', payload: { fallbackEnabled: !aiConfig.fallbackEnabled } })}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${aiConfig.fallbackEnabled ? 'bg-green-500' : 'bg-gray-500'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${aiConfig.fallbackEnabled ? 'left-1' : 'right-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Usage Stats Mini */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="font-bold text-white mb-4">وضعیت سرویس‌ها</h3>
                    <div className="space-y-4">
                        {mockApiData.providers.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${p.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                                    <span className={`text-sm ${p.status === 'active' ? 'text-white font-bold' : 'text-gray-400'}`}>{p.name}</span>
                                </div>
                                {p.status === 'active' && (
                                    <span className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded">{p.latency}</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-700">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">بودجه مصرفی</span>
                            <span className="text-white font-bold">${mockApiData.estimatedCost.toFixed(2)} / ${apiSettings.budget}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(mockApiData.estimatedCost / apiSettings.budget) * 100}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings History Modal */}
            <SettingsHistoryModal 
                isOpen={isHistoryModalOpen} 
                onClose={() => setIsHistoryModalOpen(false)} 
                history={apiSettingsHistory} 
                onRestore={(settings) => dispatch({ type: 'UPDATE_API_SETTINGS', payload: settings })} 
            />
        </div>
    );
};

export default ApiManagementDashboard;
