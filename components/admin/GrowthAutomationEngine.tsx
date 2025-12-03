
import React, { useState } from 'react';
import { BoltIcon, PlayIcon, PauseIcon, SparklesIcon, PlusIcon, TrashIcon } from '../icons';
import { generateText } from '../../services/geminiService';

interface AutomationRule {
    id: string;
    name: string;
    trigger: string; // e.g., "User inactive > 30 days"
    action: string; // e.g., "Send 'We miss you' email with 10% discount"
    isActive: boolean;
    impactEstimate: number; // Number of users affected
}

const GrowthAutomationEngine: React.FC = () => {
    const [rules, setRules] = useState<AutomationRule[]>([
        { id: '1', name: 'خوش‌آمدگویی VIP', trigger: 'کاربر جدید با خرید > ۱ میلیون تومان', action: 'ارسال ایمیل خوش‌آمدگویی از طرف مدیرعامل + نشان حامی', isActive: true, impactEstimate: 12 },
        { id: '2', name: 'بازگرداندن خفته‌ها', trigger: 'عدم فعالیت > ۶۰ روز', action: 'ارسال پوش نوتیفیکیشن با پیشنهاد "نخل همیاری"', isActive: false, impactEstimate: 450 },
    ]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [simulationResult, setSimulationResult] = useState<string | null>(null);

    const handleToggleRule = (id: string) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
    };

    const handleDeleteRule = (id: string) => {
        setRules(prev => prev.filter(r => r.id !== id));
    };

    const handleGenerateRule = async () => {
        setIsGenerating(true);
        try {
            const prompt = `
            Suggest a growth automation rule for a social enterprise platform.
            Focus on user retention or increasing lifetime value.
            Format: "Rule Name|Trigger Condition|Action to Take" in Persian.
            `;
            const response = await generateText(prompt, false, false, false);
            const parts = response.text.split('|');
            if (parts.length === 3) {
                const newRule: AutomationRule = {
                    id: Date.now().toString(),
                    name: parts[0].trim(),
                    trigger: parts[1].trim(),
                    action: parts[2].trim(),
                    isActive: false,
                    impactEstimate: Math.floor(Math.random() * 100) + 10
                };
                setRules(prev => [...prev, newRule]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSimulate = (rule: AutomationRule) => {
        setSimulationResult(`شبیه‌سازی برای قانون «${rule.name}» اجرا شد. ${rule.impactEstimate} کاربر تحت تاثیر قرار خواهند گرفت. (اقدام واقعی انجام نشد)`);
        setTimeout(() => setSimulationResult(null), 5000);
    };

    return (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <BoltIcon className="w-6 h-6 text-yellow-400" />
                    موتور خودکارسازی رشد
                </h3>
                <button 
                    onClick={handleGenerateRule} 
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-gray-600"
                >
                    {isGenerating ? <div className="animate-spin w-4 h-4 border-2 border-white rounded-full border-t-transparent"></div> : <SparklesIcon className="w-4 h-4" />}
                    پیشنهاد قانون هوشمند
                </button>
            </div>

            {simulationResult && (
                <div className="mb-4 p-3 bg-green-900/50 border border-green-500/30 text-green-200 rounded-lg text-sm animate-fade-in">
                    {simulationResult}
                </div>
            )}

            <div className="space-y-4">
                {rules.map(rule => (
                    <div key={rule.id} className={`p-4 rounded-xl border-2 transition-colors flex flex-col md:flex-row items-start md:items-center gap-4 ${rule.isActive ? 'bg-gray-700/50 border-green-500/30' : 'bg-gray-800 border-gray-600'}`}>
                        <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-white">{rule.name}</h4>
                                <span className="text-xs bg-gray-900 text-gray-400 px-2 py-0.5 rounded">تخمین تاثیر: {rule.impactEstimate} کاربر</span>
                            </div>
                            <div className="text-sm text-gray-300 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                <p><span className="text-gray-500">شرط:</span> {rule.trigger}</p>
                                <p><span className="text-gray-500">اقدام:</span> {rule.action}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-gray-700 pt-3 md:pt-0">
                            <button 
                                onClick={() => handleSimulate(rule)}
                                className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded-md transition-colors"
                            >
                                اجرای آزمایشی
                            </button>
                            <button 
                                onClick={() => handleToggleRule(rule.id)}
                                className={`p-2 rounded-full transition-colors ${rule.isActive ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                                title={rule.isActive ? 'توقف' : 'فعال‌سازی'}
                            >
                                {rule.isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                            </button>
                            <button 
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-2 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                                title="حذف"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}

                {rules.length === 0 && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                        قانون فعالی وجود ندارد. با هوش مصنوعی بسازید!
                    </div>
                )}
            </div>
        </div>
    );
};

export default GrowthAutomationEngine;
