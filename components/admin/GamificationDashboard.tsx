
import React, { useState, useMemo } from 'react';
import { useAppDispatch } from '../../AppContext';
import { POINT_ALLOCATIONS, BARKAT_LEVELS } from '../../services/gamificationService';
import { generateText } from '../../services/geminiService';
import { ChevronDownIcon, SparklesIcon, TrophyIcon, LightBulbIcon, ChartBarIcon, BanknotesIcon, UsersIcon, ShieldCheckIcon, LockClosedIcon, CheckCircleIcon, XMarkIcon, BoltIcon, PencilIcon, CogIcon } from '../icons';
import { User, Achievement } from '../../types';
import { ALL_ACHIEVEMENTS } from '../../utils/achievements';

// --- Helper Components ---

const EconomyCard: React.FC<{ title: string, value: string, subValue: string, icon: React.FC<any>, color: string }> = ({ title, value, subValue, icon: Icon, color }) => (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full bg-${color}-500`}></div>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-400 text-sm font-semibold mb-1">{title}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className={`text-xs mt-2 text-${color}-400`}>{subValue}</p>
            </div>
            <div className={`p-3 rounded-full bg-${color}-500/10 text-${color}-400`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

const LevelDistributionBar: React.FC<{ levelName: string, count: number, total: number, color: string }> = ({ levelName, count, total, color }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex items-center gap-4 text-sm">
            <div className="w-24 font-semibold text-gray-300 text-right">{levelName}</div>
            <div className="flex-grow h-4 bg-gray-700 rounded-full overflow-hidden relative">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
            </div>
            <div className="w-12 text-left font-mono text-gray-400">{count}</div>
            <div className="w-12 text-left text-xs text-gray-500">{percentage.toFixed(0)}%</div>
        </div>
    );
};

interface GamificationDashboardProps {
    allUsers?: User[];
}

const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ allUsers = [] }) => {
    const dispatch = useAppDispatch();

    // --- State for Levels ---
    const [editableLevels, setEditableLevels] = useState(BARKAT_LEVELS);
    const [editingLevelIndex, setEditingLevelIndex] = useState<number | null>(null);
    const [tempLevelData, setTempLevelData] = useState<any>(null);

    // --- State for Points ---
    const [editablePointAllocations, setEditablePointAllocations] = useState<any[]>(POINT_ALLOCATIONS as unknown as any[]);
    const [editingItem, setEditingItem] = useState<{ category: string; action: string; points: string | number; type?: string } | null>(null);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    
    // Simulation States
    const [simulationResult, setSimulationResult] = useState<string | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [generalScenario, setGeneralScenario] = useState('');
    const [generalSimulationResult, setGeneralSimulationResult] = useState<string | null>(null);
    const [isGeneralSimulating, setIsGeneralSimulating] = useState(false);

    const [pointsToGrant, setPointsToGrant] = useState(100);
    const [grantType, setGrantType] = useState('barkat');

    // --- Derived Metrics ---
    const stats = useMemo(() => {
        const totalBarkat = allUsers.reduce((acc, u) => acc + u.points, 0);
        const totalMana = allUsers.reduce((acc, u) => acc + (u.manaPoints || 0), 0);
        
        const levelCounts: Record<string, number> = {};
        BARKAT_LEVELS.forEach(l => levelCounts[l.name] = 0);
        
        allUsers.forEach(u => {
            if (levelCounts[u.level] !== undefined) {
                levelCounts[u.level]++;
            } else {
                levelCounts[u.level] = (levelCounts[u.level] || 0) + 1;
            }
        });

        const badgeCounts: Record<string, number> = {};
        allUsers.forEach(u => {
            u.achievements?.forEach(achId => {
                badgeCounts[achId] = (badgeCounts[achId] || 0) + 1;
            });
        });

        return { totalBarkat, totalMana, levelCounts, badgeCounts };
    }, [allUsers]);

    // --- Level Handlers ---
    const startEditingLevel = (index: number) => {
        setEditingLevelIndex(index);
        setTempLevelData({ ...editableLevels[index] });
    };

    const saveLevelChanges = () => {
        if (editingLevelIndex === null || !tempLevelData) return;
        const newLevels = [...editableLevels];
        newLevels[editingLevelIndex] = tempLevelData;
        setEditableLevels(newLevels);
        setEditingLevelIndex(null);
        setTempLevelData(null);
        // In a real app, dispatch an action here to update global state/backend
    };

    // --- Points Handlers ---

    const handleSaveItemPoints = () => {
        if (!editingItem) return;
        setEditablePointAllocations(prev => prev.map(cat => {
            if (cat.category === editingItem.category) {
                return {
                    ...cat,
                    items: cat.items.map((item: any) => 
                        item.action === editingItem.action 
                        ? { ...item, points: isNaN(Number(editingItem.points)) ? editingItem.points : Number(editingItem.points) } 
                        : item
                    )
                };
            }
            return cat;
        }));
        setEditingItem(null);
        setSimulationResult(null);
    };

    const handleSimulateImpact = async (actionName: string, oldPoints: number, newPoints: number) => {
        setIsSimulating(true);
        setSimulationResult(null);
        try {
            const prompt = `
            You are a Gamification Economist. The admin wants to change the points for action "${actionName}" from ${oldPoints} to ${newPoints}.
            Analyze the potential impact on:
            1. User Motivation (Will they do it more?)
            2. Economy Inflation (Will points become worthless?)
            3. Potential for Abuse (Can users farm this?)
            
            Provide a concise risk assessment and a verdict in Persian.
            `;
            const res = await generateText(prompt, false, false, false);
            setSimulationResult(res.text);
        } catch (e) {
            setSimulationResult("خطا در شبیه‌سازی.");
        } finally {
            setIsSimulating(false);
        }
    };

    const handleGeneralSimulation = async () => {
        if (!generalScenario.trim()) return;
        setIsGeneralSimulating(true);
        setGeneralSimulationResult(null);
        try {
            const prompt = `
            You are a Senior Gamification Strategist for "Nakhlestan Ma'na".
            Analyze this proposed scenario/change: "${generalScenario}".
            
            Current Context:
            - Total Barkat Points in circulation: ${stats.totalBarkat}
            - Total Users: ${allUsers.length}
            
            Provide a detailed analysis in Persian covering:
            1. Impact on User Behavior (Engagement vs. Burnout)
            2. Economic Risks (Inflation, Devaluation of points)
            3. Strategic Alignment (Does it help the mission of planting palms?)
            4. Final Recommendation (Do it / Don't do it / Modify it)
            `;
            const res = await generateText(prompt, false, false, false);
            setGeneralSimulationResult(res.text);
        } catch (e) {
            setGeneralSimulationResult("خطا در تحلیل سناریو.");
        } finally {
            setIsGeneralSimulating(false);
        }
    };
    
    const handleGrantGlobalPoints = () => {
        alert(`شبیه‌سازی: ${pointsToGrant} امتیاز ${grantType === 'barkat' ? 'برکت' : 'معنا'} به همه کاربران اهدا شد.`);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            
            {/* 1. Economy Health Monitor */}
            <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                    <ChartBarIcon className="w-6 h-6 text-blue-400" />
                    مانیتور سلامت اقتصاد
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <EconomyCard 
                        title="کل امتیاز برکت در گردش" 
                        value={stats.totalBarkat.toLocaleString('fa-IR')} 
                        subValue="شاخص فعالیت بیرونی" 
                        icon={BanknotesIcon} 
                        color="green" 
                    />
                    <EconomyCard 
                        title="کل امتیاز معنا در گردش" 
                        value={stats.totalMana.toLocaleString('fa-IR')} 
                        subValue="شاخص عمق و آگاهی" 
                        icon={SparklesIcon} 
                        color="indigo" 
                    />
                    <EconomyCard 
                        title="تعداد کاربران فعال" 
                        value={allUsers.length.toLocaleString('fa-IR')} 
                        subValue="جامعه آماری" 
                        icon={UsersIcon} 
                        color="amber" 
                    />
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 2. Level Distribution Funnel */}
                <section className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                        <TrophyIcon className="w-5 h-5 text-yellow-400" />
                        توزیع سطوح کاربران (Funnel)
                    </h3>
                    <div className="space-y-4">
                        {BARKAT_LEVELS.map((level, index) => (
                            <LevelDistributionBar 
                                key={level.name}
                                levelName={level.name}
                                count={stats.levelCounts[level.name] || 0}
                                total={allUsers.length}
                                color={['bg-green-600', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'][index % 5]}
                            />
                        ))}
                    </div>
                </section>

                {/* 3. Badge Management */}
                <section className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                        <ShieldCheckIcon className="w-5 h-5 text-purple-400" />
                        مدیریت نشان‌ها و دستاوردها
                    </h3>
                    <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-3 max-h-80">
                        {ALL_ACHIEVEMENTS.map((badge) => {
                            const unlockCount = stats.badgeCounts[badge.id] || 0;
                            const unlockRate = allUsers.length > 0 ? (unlockCount / allUsers.length) * 100 : 0;
                            
                            return (
                                <div key={badge.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="text-yellow-400">
                                            {React.cloneElement(badge.icon as React.ReactElement<{ className?: string }>, { className: "w-8 h-8" })}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-200 text-sm">{badge.name}</p>
                                            <p className="text-xs text-gray-500">{badge.points} امتیاز</p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-lg font-bold text-white">{unlockCount}</p>
                                        <p className="text-[10px] text-gray-400">{unlockRate.toFixed(1)}% دریافت</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            {/* 4. Level Configuration (New Section) */}
            <section className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                    <CogIcon className="w-5 h-5 text-stone-400" />
                    پیکربندی سطوح و آستانه‌ها
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-400">
                        <thead className="text-xs uppercase bg-gray-700 text-gray-300">
                            <tr>
                                <th className="px-4 py-3 rounded-r-lg">نام سطح</th>
                                <th className="px-4 py-3">حدنصاب برکت</th>
                                <th className="px-4 py-3">حدنصاب معنا</th>
                                <th className="px-4 py-3 text-center rounded-l-lg">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {editableLevels.map((level, index) => (
                                <tr key={index} className="bg-gray-800 hover:bg-gray-700/50 border-b border-gray-700 last:border-0">
                                    <td className="px-4 py-3 font-medium text-white">
                                        {editingLevelIndex === index ? (
                                            <input 
                                                type="text" 
                                                value={tempLevelData.name}
                                                onChange={e => setTempLevelData({...tempLevelData, name: e.target.value})}
                                                className="bg-gray-900 border border-gray-600 rounded px-2 py-1 w-full"
                                            />
                                        ) : level.name}
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingLevelIndex === index ? (
                                            <input 
                                                type="number" 
                                                value={tempLevelData.points}
                                                onChange={e => setTempLevelData({...tempLevelData, points: Number(e.target.value)})}
                                                className="bg-gray-900 border border-gray-600 rounded px-2 py-1 w-24"
                                            />
                                        ) : level.points.toLocaleString('fa-IR')}
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingLevelIndex === index ? (
                                            <input 
                                                type="number" 
                                                value={tempLevelData.manaThreshold}
                                                onChange={e => setTempLevelData({...tempLevelData, manaThreshold: Number(e.target.value)})}
                                                className="bg-gray-900 border border-gray-600 rounded px-2 py-1 w-24"
                                            />
                                        ) : level.manaThreshold.toLocaleString('fa-IR')}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {editingLevelIndex === index ? (
                                            <div className="flex justify-center gap-2">
                                                <button onClick={saveLevelChanges} className="text-green-400 hover:text-green-300"><CheckCircleIcon className="w-5 h-5"/></button>
                                                <button onClick={() => setEditingLevelIndex(null)} className="text-red-400 hover:text-red-300"><XMarkIcon className="w-5 h-5"/></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => startEditingLevel(index)} className="text-blue-400 hover:text-blue-300">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 5. Rules Editor (Existing) */}
            <section className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                    <LightBulbIcon className="w-5 h-5 text-amber-400" />
                    مدیریت امتیازها (قوانین)
                </h3>
                
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {editablePointAllocations.map(cat => (
                        <div key={cat.category} className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden">
                            <button 
                                onClick={() => setOpenAccordion(openAccordion === cat.category ? null : cat.category)} 
                                className="w-full p-4 flex justify-between items-center text-right font-semibold hover:bg-gray-700/50 transition-colors"
                            >
                                <span className="text-gray-200">{cat.category}</span>
                                <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${openAccordion === cat.category ? 'rotate-180' : ''}`}/>
                            </button>
                            
                            {openAccordion === cat.category && (
                                <div className="p-4 border-t border-gray-700 bg-gray-800/50 space-y-3">
                                    {cat.items.map((item: any) => {
                                        const isEditing = editingItem?.action === item.action;
                                        return (
                                            <div key={item.action} className="flex flex-col md:flex-row justify-between items-center bg-gray-700/30 p-3 rounded-lg border border-gray-700 gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${item.type === 'mana' ? 'bg-indigo-500' : 'bg-green-500'}`}></div>
                                                    <div>
                                                        <span className="text-sm text-gray-300 block">{item.action}</span>
                                                        <span className="text-[10px] text-gray-500">{item.type === 'mana' ? 'معنا' : 'برکت'}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                                    {isEditing ? (
                                                        <>
                                                            <input 
                                                                type="number" 
                                                                value={editingItem.points} 
                                                                onChange={(e) => setEditingItem(prev => prev ? {...prev, points: e.target.value} : null)}
                                                                className="w-20 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-center text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                            />
                                                            <button 
                                                                onClick={() => handleSimulateImpact(item.action, item.points, Number(editingItem.points))} 
                                                                disabled={isSimulating}
                                                                className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded flex items-center gap-1"
                                                                title="پیش‌بینی تاثیر تغییر با هوش مصنوعی"
                                                            >
                                                                {isSimulating ? '...' : <SparklesIcon className="w-3 h-3" />}
                                                                تست
                                                            </button>
                                                            <button onClick={handleSaveItemPoints} className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded">
                                                                <CheckCircleIcon className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => { setEditingItem(null); setSimulationResult(null); }} className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded">
                                                                <XMarkIcon className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className={`font-mono font-bold ${item.type === 'mana' ? 'text-indigo-300' : 'text-green-300'}`}>
                                                                {typeof item.points === 'number' ? item.points.toLocaleString('fa-IR') : item.points}
                                                            </span>
                                                            <button onClick={() => setEditingItem({ ...item, category: cat.category })} className="text-xs text-blue-400 hover:text-blue-300 underline">
                                                                ویرایش
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                                
                                                {isEditing && simulationResult && (
                                                    <div className="w-full basis-full mt-2 p-3 bg-purple-900/30 border border-purple-500/30 rounded text-xs text-purple-200 leading-relaxed animate-fade-in">
                                                        <span className="font-bold block mb-1">💡 تحلیل تغییر:</span>
                                                        {simulationResult}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. Smart Gamification Lab */}
            <section className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-6 rounded-2xl border border-indigo-500/30 shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                    <BoltIcon className="w-6 h-6 text-yellow-400" />
                    آزمایشگاه هوشمند گیمیفیکیشن (Sandbox)
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                    قبل از اعمال هرگونه تغییر بزرگ در قوانین، سناریوی خود را اینجا بنویسید تا هوش مصنوعی تاثیرات آن بر اقتصاد و رفتار کاربران را پیش‌بینی کند.
                </p>
                
                <div className="flex flex-col gap-4">
                    <textarea
                        value={generalScenario}
                        onChange={(e) => setGeneralScenario(e.target.value)}
                        placeholder="مثال: اگر برای هر دعوت موفق به جای ۵۰۰ امتیاز، ۵۰۰۰ امتیاز بدهیم و شرط خرید را برداریم چه می‌شود؟"
                        rows={3}
                        className="w-full bg-gray-800/80 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button 
                        onClick={handleGeneralSimulation}
                        disabled={isGeneralSimulating || !generalScenario.trim()}
                        className="self-end bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        {isGeneralSimulating ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></span>
                                در حال تحلیل...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                تحلیل و پیش‌بینی سناریو
                            </>
                        )}
                    </button>
                </div>

                {generalSimulationResult && (
                    <div className="mt-6 p-5 bg-gray-800/90 border border-indigo-500/50 rounded-xl animate-fade-in">
                        <h4 className="font-bold text-indigo-300 mb-2 flex items-center gap-2">
                            <SparklesIcon className="w-4 h-4" /> گزارش پیش‌بینی:
                        </h4>
                        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                            {generalSimulationResult}
                        </p>
                    </div>
                )}
            </section>
            
            {/* Global Actions */}
            <div className="flex justify-end pt-4 border-t border-gray-700">
                 <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col sm:flex-row items-center gap-4">
                    <span className="text-sm font-bold text-gray-400">عملیات اضطراری (Global):</span>
                    <select value={grantType} onChange={e => setGrantType(e.target.value)} className="bg-gray-700 text-white text-sm p-2 rounded border border-gray-600">
                        <option value="barkat">امتیاز برکت</option>
                        <option value="mana">امتیاز معنا</option>
                    </select>
                    <input type="number" value={pointsToGrant} onChange={e => setPointsToGrant(Number(e.target.value))} className="w-20 bg-gray-700 text-white text-sm p-2 rounded border border-gray-600 text-center" />
                    <button onClick={handleGrantGlobalPoints} className="bg-red-700 hover:bg-red-600 text-white text-sm font-bold px-4 py-2 rounded transition-colors">
                        اهدای سراسری
                    </button>
                 </div>
            </div>

        </div>
    );
};

export default GamificationDashboard;
