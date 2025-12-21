import React, { useState, useMemo } from 'react';
import { useAppDispatch } from '../../AppContext';
import { POINT_ALLOCATIONS, BARKAT_LEVELS } from '../../services/gamificationService';
import { generateText } from '../../services/geminiService';
import {
    ChevronDownIcon, SparklesIcon, TrophyIcon, LightBulbIcon, ChartBarIcon,
    BanknotesIcon, UsersIcon, ShieldCheckIcon, CheckCircleIcon, XMarkIcon,
    BoltIcon, PencilIcon, CogIcon, ArrowDownTrayIcon
} from '../icons';
import { User } from '../../types';
import { ALL_ACHIEVEMENTS } from '../../utils/achievements';
import '../../styles/admin-dashboard.css';

// Modern Economy Card
const ModernEconomyCard: React.FC<{
    title: string,
    value: string,
    subValue: string,
    icon: React.FC<any>,
    gradient: string
}> = ({ title, value, subValue, icon: Icon, gradient }) => (
    <div
        className="admin-stat-card"
        style={{ '--gradient': gradient } as React.CSSProperties}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p className="admin-label" style={{ marginBottom: '0.5rem' }}>
                    {title}
                </p>
                <h2 className="admin-heading-2" style={{ marginBottom: '0.75rem', fontSize: '2rem' }}>
                    {value}
                </h2>
                <p className="admin-caption" style={{ color: 'var(--admin-text-secondary)' }}>
                    {subValue}
                </p>
            </div>
            <div
                style={{
                    background: gradient,
                    padding: '0.75rem',
                    borderRadius: 'var(--admin-radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Icon className="w-6 h-6" style={{ color: 'white' }} />
            </div>
        </div>
    </div>
);

// Modern Level Distribution Bar
const ModernLevelBar: React.FC<{
    levelName: string,
    count: number,
    total: number,
    gradient: string
}> = ({ levelName, count, total, gradient }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
        <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="admin-body" style={{ fontWeight: 600 }}>
                    {levelName}
                </span>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className="admin-caption">{count.toLocaleString('fa-IR')} کاربر</span>
                    <span className="admin-caption" style={{ color: 'var(--admin-text-muted)' }}>
                        {percentage.toFixed(1)}%
                    </span>
                </div>
            </div>
            <div style={{
                width: '100%',
                height: '12px',
                background: 'var(--admin-bg-tertiary)',
                borderRadius: '9999px',
                overflow: 'hidden'
            }}>
                <div
                    style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: gradient,
                        transition: 'width 1s ease',
                        borderRadius: '9999px'
                    }}
                />
            </div>
        </div>
    );
};

interface GamificationDashboardProps {
    allUsers?: User[];
}

const ModernGamificationDashboard: React.FC<GamificationDashboardProps> = ({ allUsers = [] }) => {
    const dispatch = useAppDispatch();

    // State for Levels
    const [editableLevels, setEditableLevels] = useState(BARKAT_LEVELS);
    const [editingLevelIndex, setEditingLevelIndex] = useState<number | null>(null);
    const [tempLevelData, setTempLevelData] = useState<any>(null);

    // State for Points
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

    // Derived Metrics
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

    // Level Handlers
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
    };

    // Points Handlers
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

    const handleExportData = () => {
        const data = {
            stats,
            levels: editableLevels,
            pointAllocations: editablePointAllocations,
            generatedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `gamification-config-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const levelGradients = [
        'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    ];

    return (
        <div className="admin-container" style={{ padding: '2rem' }}>
            {/* Header */}
            <div className="admin-animate-fade-in" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="admin-heading-1" style={{ marginBottom: '0.5rem' }}>
                            کنترل گیمیفیکیشن
                        </h1>
                        <p className="admin-body" style={{ color: 'var(--admin-text-tertiary)' }}>
                            مدیریت اقتصاد، سطوح، امتیازات و دستاوردها
                        </p>
                    </div>
                    <button
                        onClick={handleExportData}
                        className="admin-btn admin-btn-ghost"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        خروجی تنظیمات
                    </button>
                </div>
            </div>

            {/* Economy Health Monitor */}
            <div
                className="admin-animate-fade-in"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}
            >
                <ModernEconomyCard
                    title="کل امتیاز برکت در گردش"
                    value={stats.totalBarkat.toLocaleString('fa-IR')}
                    subValue="شاخص فعالیت بیرونی"
                    icon={BanknotesIcon}
                    gradient="linear-gradient(135deg, #10b981 0%, #14b8a6 100%)"
                />
                <ModernEconomyCard
                    title="کل امتیاز معنا در گردش"
                    value={stats.totalMana.toLocaleString('fa-IR')}
                    subValue="شاخص عمق و آگاهی"
                    icon={SparklesIcon}
                    gradient="linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
                />
                <ModernEconomyCard
                    title="تعداد کاربران فعال"
                    value={allUsers.length.toLocaleString('fa-IR')}
                    subValue="جامعه آماری"
                    icon={UsersIcon}
                    gradient="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Level Distribution */}
                <div className="admin-card admin-animate-slide-in" style={{ padding: '1.5rem' }}>
                    <h3 className="admin-heading-3" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
                        <TrophyIcon className="w-5 h-5" style={{ display: 'inline', marginLeft: '0.5rem', color: 'var(--admin-amber)' }} />
                        توزیع سطوح کاربران
                    </h3>
                    <div>
                        {BARKAT_LEVELS.map((level, index) => (
                            <ModernLevelBar
                                key={level.name}
                                levelName={level.name}
                                count={stats.levelCounts[level.name] || 0}
                                total={allUsers.length}
                                gradient={levelGradients[index % levelGradients.length]}
                            />
                        ))}
                    </div>
                </div>

                {/* Badge Management */}
                <div className="admin-card admin-animate-slide-in" style={{ padding: '1.5rem', animationDelay: '100ms' }}>
                    <h3 className="admin-heading-3" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
                        <ShieldCheckIcon className="w-5 h-5" style={{ display: 'inline', marginLeft: '0.5rem', color: 'var(--admin-purple)' }} />
                        نشان‌ها و دستاوردها
                    </h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {ALL_ACHIEVEMENTS.map((badge) => {
                            const unlockCount = stats.badgeCounts[badge.id] || 0;
                            const unlockRate = allUsers.length > 0 ? (unlockCount / allUsers.length) * 100 : 0;

                            return (
                                <div
                                    key={badge.id}
                                    className="admin-card"
                                    style={{
                                        padding: '1rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'var(--admin-bg-tertiary)',
                                        border: '1px solid var(--admin-border)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ color: 'var(--admin-amber)' }}>
                                            {React.cloneElement(badge.icon as React.ReactElement<{ className?: string }>, { className: "w-8 h-8" })}
                                        </div>
                                        <div>
                                            <p className="admin-body" style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                                {badge.name}
                                            </p>
                                            <p className="admin-caption">{badge.points} امتیاز</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--admin-text-primary)' }}>
                                            {unlockCount.toLocaleString('fa-IR')}
                                        </p>
                                        <p className="admin-caption">{unlockRate.toFixed(1)}% دریافت</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Level Configuration */}
            <div className="admin-card admin-animate-fade-in" style={{ padding: '1.5rem', marginBottom: '2rem', animationDelay: '200ms' }}>
                <h3 className="admin-heading-3" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
                    <CogIcon className="w-5 h-5" style={{ display: 'inline', marginLeft: '0.5rem', color: 'var(--admin-text-secondary)' }} />
                    پیکربندی سطوح و آستانه‌ها
                </h3>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>نام سطح</th>
                                <th>حدنصاب برکت</th>
                                <th>حدنصاب معنا</th>
                                <th style={{ textAlign: 'center' }}>عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {editableLevels.map((level, index) => (
                                <tr key={index}>
                                    <td>
                                        {editingLevelIndex === index ? (
                                            <input
                                                type="text"
                                                value={tempLevelData.name}
                                                onChange={e => setTempLevelData({ ...tempLevelData, name: e.target.value })}
                                                className="admin-input"
                                                style={{ padding: '0.5rem' }}
                                            />
                                        ) : (
                                            <span style={{ fontWeight: 600 }}>{level.name}</span>
                                        )}
                                    </td>
                                    <td>
                                        {editingLevelIndex === index ? (
                                            <input
                                                type="number"
                                                value={tempLevelData.points}
                                                onChange={e => setTempLevelData({ ...tempLevelData, points: Number(e.target.value) })}
                                                className="admin-input"
                                                style={{ padding: '0.5rem', width: '120px' }}
                                            />
                                        ) : (
                                            level.points.toLocaleString('fa-IR')
                                        )}
                                    </td>
                                    <td>
                                        {editingLevelIndex === index ? (
                                            <input
                                                type="number"
                                                value={tempLevelData.manaThreshold}
                                                onChange={e => setTempLevelData({ ...tempLevelData, manaThreshold: Number(e.target.value) })}
                                                className="admin-input"
                                                style={{ padding: '0.5rem', width: '120px' }}
                                            />
                                        ) : (
                                            level.manaThreshold.toLocaleString('fa-IR')
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {editingLevelIndex === index ? (
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button onClick={saveLevelChanges} className="admin-btn-icon">
                                                    <CheckCircleIcon className="w-5 h-5" style={{ color: '#10b981' }} />
                                                </button>
                                                <button onClick={() => setEditingLevelIndex(null)} className="admin-btn-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                                    <XMarkIcon className="w-5 h-5" style={{ color: '#ef4444' }} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => startEditingLevel(index)} className="admin-btn-icon">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Smart Gamification Lab */}
            <div
                className="admin-card admin-animate-fade-in"
                style={{
                    padding: '2rem',
                    marginBottom: '2rem',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                    border: '2px solid rgba(139, 92, 246, 0.3)',
                    animationDelay: '300ms'
                }}
            >
                <h3 className="admin-heading-2" style={{ marginBottom: '1rem' }}>
                    <BoltIcon className="w-6 h-6" style={{ display: 'inline', marginLeft: '0.5rem', color: 'var(--admin-amber)' }} />
                    آزمایشگاه هوشمند گیمیفیکیشن
                </h3>
                <p className="admin-body" style={{ marginBottom: '1.5rem', color: 'var(--admin-text-secondary)' }}>
                    قبل از اعمال هرگونه تغییر بزرگ در قوانین، سناریوی خود را اینجا بنویسید تا هوش مصنوعی تاثیرات آن بر اقتصاد و رفتار کاربران را پیش‌بینی کند.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <textarea
                        value={generalScenario}
                        onChange={(e) => setGeneralScenario(e.target.value)}
                        placeholder="مثال: اگر برای هر دعوت موفق به جای ۵۰۰ امتیاز، ۵۰۰۰ امتیاز بدهیم و شرط خرید را برداریم چه می‌شود؟"
                        rows={3}
                        className="admin-input"
                        style={{ resize: 'vertical' }}
                    />
                    <button
                        onClick={handleGeneralSimulation}
                        disabled={isGeneralSimulating || !generalScenario.trim()}
                        className="admin-btn admin-btn-primary"
                        style={{ alignSelf: 'flex-end' }}
                    >
                        {isGeneralSimulating ? (
                            <>
                                <span className="admin-animate-pulse">در حال تحلیل...</span>
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
                    <div
                        className="admin-card admin-animate-fade-in"
                        style={{
                            marginTop: '1.5rem',
                            padding: '1.5rem',
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.3)'
                        }}
                    >
                        <h4 className="admin-heading-3" style={{ marginBottom: '1rem', color: 'var(--admin-purple)' }}>
                            <SparklesIcon className="w-5 h-5" style={{ display: 'inline', marginLeft: '0.5rem' }} />
                            گزارش پیش‌بینی:
                        </h4>
                        <p className="admin-body" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                            {generalSimulationResult}
                        </p>
                    </div>
                )}
            </div>

            {/* Global Actions */}
            <div className="admin-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                    <span className="admin-label">عملیات اضطراری (Global):</span>
                    <select
                        value={grantType}
                        onChange={e => setGrantType(e.target.value)}
                        className="admin-select"
                        style={{ width: 'auto' }}
                    >
                        <option value="barkat">امتیاز برکت</option>
                        <option value="mana">امتیاز معنا</option>
                    </select>
                    <input
                        type="number"
                        value={pointsToGrant}
                        onChange={e => setPointsToGrant(Number(e.target.value))}
                        className="admin-input"
                        style={{ width: '100px' }}
                    />
                    <button
                        onClick={handleGrantGlobalPoints}
                        className="admin-btn admin-btn-danger"
                    >
                        اهدای سراسری
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModernGamificationDashboard;
