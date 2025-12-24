
import React, { useState, useMemo } from 'react';
import { useAppDispatch } from '../../AppContext';
import { useAdminActions } from '../../hooks/useAdminActions';
import { POINT_ALLOCATIONS, BARKAT_LEVELS } from '../../services/gamificationService';
import { generateText } from '../../services/geminiService';
import {
    ChevronDownIcon, SparklesIcon, TrophyIcon, LightBulbIcon, ChartBarIcon,
    BanknotesIcon, UsersIcon, ShieldCheckIcon, LockClosedIcon, CheckCircleIcon,
    XMarkIcon, BoltIcon, PencilIcon, CogIcon, ArrowUpRightIcon
} from '../icons';
import { User, Achievement } from '../../types';
import { ALL_ACHIEVEMENTS } from '../../utils/achievements';

const EconomyCard: React.FC<{ title: string, value: string, subValue: string, icon: any, color: string }> = ({ title, value, subValue, icon: Icon, color }) => (
    <div className="glass-panel p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${color}-500/50 to-transparent`}></div>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-stone-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
                <p className="text-3xl font-black text-white">{value}</p>
                <p className={`text-[10px] mt-2 font-black text-${color}-500 uppercase tracking-widest`}>{subValue}</p>
            </div>
            <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-400 border border-${color}-500/20 group-hover:scale-110 group-hover:rotate-12 transition-all`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

const LevelDistributionBar: React.FC<{ levelName: string, count: number, total: number, color: string }> = ({ levelName, count, total, color }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-end px-1">
                <span className="text-xs font-black text-stone-300 uppercase tracking-tight">{levelName}</span>
                <span className="text-[10px] font-black text-stone-500">{count.toLocaleString('fa-IR')} نفر ({percentage.toFixed(0)}%)</span>
            </div>
            <div className="h-2 bg-stone-900 rounded-full overflow-hidden border border-white/5">
                <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.3)]`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

interface GamificationDashboardProps {
    allUsers?: User[];
}

const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ allUsers = [] }) => {
    const { grantBonus } = useAdminActions();

    const [editableLevels, setEditableLevels] = useState(BARKAT_LEVELS);
    const [editingLevelIndex, setEditingLevelIndex] = useState<number | null>(null);
    const [tempLevelData, setTempLevelData] = useState<any>(null);

    const [editablePointAllocations, setEditablePointAllocations] = useState<any[]>(POINT_ALLOCATIONS as any[]);
    const [editingItem, setEditingItem] = useState<{ category: string; action: string; points: string | number; type?: string } | null>(null);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationResult, setSimulationResult] = useState<string | null>(null);
    const [generalScenario, setGeneralScenario] = useState('');
    const [isGeneralSimulating, setIsGeneralSimulating] = useState(false);
    const [generalSimulationResult, setGeneralSimulationResult] = useState<string | null>(null);

    const stats = useMemo(() => {
        const totalBarkat = allUsers.reduce((acc, u) => acc + u.points, 0);
        const totalMana = allUsers.reduce((acc, u) => acc + (u.manaPoints || 0), 0);
        const levelCounts: Record<string, number> = {};
        BARKAT_LEVELS.forEach(l => levelCounts[l.name] = 0);
        allUsers.forEach(u => { levelCounts[u.level] = (levelCounts[u.level] || 0) + 1; });
        const badgeCounts: Record<string, number> = {};
        allUsers.forEach(u => { u.unlockedAchievements?.forEach(achId => { badgeCounts[achId] = (badgeCounts[achId] || 0) + 1; }); });
        return { totalBarkat, totalMana, levelCounts, badgeCounts };
    }, [allUsers]);

    const handleSimulateImpact = async (actionName: string, oldPoints: number, newPoints: number) => {
        setIsSimulating(true);
        setSimulationResult(null);
        try {
            const prompt = `Analyze gamification change for "${actionName}" from ${oldPoints} to ${newPoints}. focus on behavior and inflation. persian please.`;
            const res = await generateText(prompt, false, false, false);
            setSimulationResult(res.text);
        } catch (e) { setSimulationResult("Error."); } finally { setIsSimulating(false); }
    };

    return (
        <div className="space-y-10 pb-20 animate-fade-in">
            {/* 1. Global Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <EconomyCard title="Barkat Circulation" value={stats.totalBarkat.toLocaleString('fa-IR')} subValue="Total Value Locked" icon={BanknotesIcon} color="emerald" />
                <EconomyCard title="Mana Circulation" value={stats.totalMana.toLocaleString('fa-IR')} subValue="Intellectual Capital" icon={SparklesIcon} color="indigo" />
                <EconomyCard title="Active Economy" value={allUsers.length.toLocaleString('fa-IR')} subValue="Verified Participants" icon={UsersIcon} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* 2. Population Distribution */}
                <section className="glass-panel p-8 rounded-[3rem] border border-white/5">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                        <TrophyIcon className="w-5 h-5 text-amber-500" />
                        توزیع جمعیتی سطوح (Funnel)
                    </h3>
                    <div className="space-y-6">
                        {BARKAT_LEVELS.map((level, index) => (
                            <LevelDistributionBar
                                key={level.name}
                                levelName={level.name}
                                count={stats.levelCounts[level.name] || 0}
                                total={allUsers.length}
                                color={['bg-green-500', 'bg-emerald-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-500'][index % 5]}
                            />
                        ))}
                    </div>
                </section>

                {/* 3. Badge Intel */}
                <section className="glass-panel p-8 rounded-[3rem] border border-white/5 flex flex-col">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                        <ShieldCheckIcon className="w-5 h-5 text-indigo-400" />
                        تحلیل نفوذ دستاوردها
                    </h3>
                    <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-3 max-h-[400px]">
                        {ALL_ACHIEVEMENTS.map((badge) => {
                            const unlockCount = stats.badgeCounts[badge.id] || 0;
                            const unlockRate = allUsers.length > 0 ? (unlockCount / allUsers.length) * 100 : 0;
                            return (
                                <div key={badge.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                            <TrophyIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-sm">{badge.name}</p>
                                            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">+{badge.points} PTS REWARD</p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xl font-black text-white">{unlockCount.toLocaleString('fa-IR')}</p>
                                        <p className="text-[10px] font-black text-stone-600 uppercase tracking-widest">{unlockRate.toFixed(1)}% PENETRATION</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            {/* 4. AI Economy Simulation Lab */}
            <section className="glass-panel p-10 rounded-[3rem] border border-indigo-500/30 bg-indigo-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
                    <div className="lg:w-1/3">
                        <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                            <SparklesIcon className="w-9 h-9 text-black" />
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tight uppercase mb-4">آزمایشگاه شبیه‌سازی اقتصاد معنا</h3>
                        <p className="text-stone-400 font-medium leading-relaxed">
                            قبل از تغییر قوانین امتیازدهی، سناریوی خود را در این محیط شبیه‌سازی تست کنید. هوش مصنوعی تاثیر آن را بر تورم سیستم و انگیزه کاربران پیش‌بینی می‌کند.
                        </p>
                    </div>

                    <div className="lg:w-2/3 w-full space-y-4">
                        <textarea
                            value={generalScenario}
                            onChange={(e) => setGeneralScenario(e.target.value)}
                            placeholder="مثال: اگر امتیاز تکمیل پروفایل را از ۵۰ به ۵۰۰ برسانیم، آیا باعث اسپم می‌شود؟"
                            rows={3}
                            className="w-full bg-black/40 border border-white/10 rounded-[2rem] p-6 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
                        />
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em]">Simulation Engine v3.0</span>
                            <button
                                onClick={async () => {
                                    setIsGeneralSimulating(true);
                                    try {
                                        const res = await generateText(`Analyze simulation scenario in the context of Manapalm gamification: ${generalScenario}. Persian response.`, false, false, false);
                                        setGeneralSimulationResult(res.text);
                                    } catch (e) { } finally { setIsGeneralSimulating(false); }
                                }}
                                disabled={isGeneralSimulating || !generalScenario.trim()}
                                className="px-8 h-14 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                            >
                                {isGeneralSimulating ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <BoltIcon className="w-5 h-5" />}
                                شبیه‌سازی هوشمند
                            </button>
                        </div>
                        {generalSimulationResult && (
                            <div className="mt-4 p-6 bg-white/5 border border-white/10 rounded-[2rem] animate-in text-sm text-stone-300 leading-relaxed whitespace-pre-wrap">
                                {generalSimulationResult}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 5. Rules Management */}
            <section className="glass-panel p-8 rounded-[3rem] border border-white/5">
                <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                    <CogIcon className="w-5 h-5 text-stone-500" />
                    مدیریت قوانین و جریان‌های مالی (Economy Rules)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {editablePointAllocations.map(cat => (
                        <div key={cat.category} className="glass-card p-6 rounded-[2rem] border border-white/5 group hover:bg-white/5">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-black text-white tracking-tight">{cat.category}</h4>
                                <ArrowUpRightIcon className="w-4 h-4 text-stone-600 group-hover:text-stone-300 transition-colors" />
                            </div>
                            <div className="space-y-3">
                                {cat.items.slice(0, 3).map((item: any) => (
                                    <div key={item.action} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                        <span className="text-xs font-bold text-stone-400">{item.action}</span>
                                        <span className={`text-xs font-black ${item.type === 'mana' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                                            +{item.points.toLocaleString('fa-IR')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-center">
                    <button className="px-10 h-14 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-[10px] font-black text-stone-400 uppercase tracking-widest transition-all">
                        VIEW FULL RULES ARCHITECTURE
                    </button>
                </div>
            </section>
        </div>
    );
};

export default GamificationDashboard;
