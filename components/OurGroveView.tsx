
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Deed, User, View } from '../types';
import { useAppState, useAppDispatch } from '../AppContext';
import { askTheGrove } from '../services/geminiService';
import { SproutIcon, BriefcaseIcon, CloudIcon, UserGroupIcon, SparklesIcon, PaperAirplaneIcon, XMarkIcon, UserCircleIcon, TrophyIcon, MapIcon, GlobeIcon } from './icons';
import DeedDisplay from './DeedDisplay';
import ThreeDGarden from './ThreeDGarden';

const useAnimatedCounter = (endValue: number, duration = 2000) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let startTime: number | null = null;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            setCount(Math.floor(percentage * endValue));
            if (progress < duration) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [endValue, duration]);
    return count;
};

interface InteractiveStatCardProps {
    label: string; communityValue: string; personalValue?: string; isLoggedIn: boolean; hasPlanted: boolean; onLoginClick: () => void; onNavigateToProfileTab: (tab: string) => void; onStartPlantingFlow: () => void; icon: React.ReactNode;
}

const InteractiveStatCard: React.FC<InteractiveStatCardProps> = ({ label, communityValue, personalValue, isLoggedIn, hasPlanted, onLoginClick, onNavigateToProfileTab, onStartPlantingFlow, icon }) => {
    const [isHovered, setIsHovered] = useState(false);
    const numericCommunityValue = useMemo(() => parseInt(communityValue.replace(/[^0-9]/g, ''), 10) || 0, [communityValue]);
    const animatedValue = useAnimatedCounter(numericCommunityValue);

    const renderHoverContent = () => {
        if (!isLoggedIn) return (<><UserCircleIcon className="w-10 h-10 text-gray-500 mb-2" /><p className="font-semibold text-white">تاثیر خود را ببینید</p><button onClick={(e) => { e.stopPropagation(); onLoginClick(); }} className="mt-2 text-sm text-green-400 hover:underline">وارد شوید یا ثبت‌نام کنید</button></>);
        if (hasPlanted) return (<><TrophyIcon className="w-10 h-10 text-yellow-300 mb-2" /><p className="font-bold text-lg text-yellow-300">تبریک قهرمان معنا!</p>{personalValue && <p className="text-white mt-1">تاثیر شما: <span className="font-bold text-white">{personalValue}</span></p>}<button onClick={(e) => { e.stopPropagation(); onNavigateToProfileTab('timeline'); }} className="mt-3 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-3 rounded-md">ثبت خاطره برای نخل خود</button></>);
        return (<><SproutIcon className="w-10 h-10 text-green-300 mb-2" /><p className="font-semibold text-white">سفر شما از اینجا آغاز می‌شود</p><button onClick={(e) => { e.stopPropagation(); onStartPlantingFlow(); }} className="mt-2 text-sm text-green-400 hover:underline">اولین قدم را بردارید</button></>);
    };

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg relative overflow-hidden cursor-pointer transform transition-transform duration-300 hover:-translate-y-1 border border-gray-700 backdrop-blur-sm min-h-[120px]" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div className={`transition-all duration-300 ${isHovered ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}><div className="flex justify-between items-center"><p className="text-4xl font-bold text-white">{animatedValue.toLocaleString('fa-IR')}</p><div className="p-3 rounded-full bg-gray-700">{icon}</div></div><p className="text-sm text-gray-400 mt-2 text-right">{label}</p></div>
            <div className={`absolute inset-0 p-4 flex flex-col items-center justify-center text-center transition-all duration-300 bg-gray-800/80 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>{renderHoverContent()}</div>
        </div>
    );
};

const GroveMap: React.FC<{ allDeeds: Deed[]; userDeedIds: Set<string>; onDeedClick: (deed: Deed) => void }> = ({ allDeeds, userDeedIds, onDeedClick }) => {
    const MAX_DOTS = 500;
    const dots = useMemo(() => {
        const userDeeds = allDeeds.filter(d => userDeedIds.has(d.id));
        const communityDeeds = allDeeds.filter(d => !userDeedIds.has(d.id)).slice(0, Math.max(0, MAX_DOTS - userDeeds.length));
        return [...userDeeds, ...communityDeeds].map((deed) => ({
            deed, isUser: userDeedIds.has(deed.id), style: { left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${userDeedIds.has(deed.id) ? '2s' : '4s'}` },
        }));
    }, [allDeeds, userDeedIds]);

    return (
        <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden border-2 border-green-500/20 shadow-2xl group">
            <style>{`@keyframes glow { 0%, 100% { opacity: 0.6; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } } .animate-glow { animation: glow 4s infinite ease-in-out; } .shadow-green { box-shadow: 0 0 8px 1px rgba(74, 222, 128, 0.7); } .shadow-yellow { box-shadow: 0 0 10px 2px rgba(252, 211, 77, 0.8); }`}</style>
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/30 to-transparent"></div>
            {dots.map((dot, i) => <div key={i} className={`absolute w-2 h-2 rounded-full cursor-pointer transition-transform hover:scale-150 ${dot.isUser ? 'bg-yellow-300 shadow-yellow' : 'bg-green-300 shadow-green'} animate-glow`} style={dot.style} onClick={() => onDeedClick(dot.deed)} title={dot.deed.intention}></div>)}
             <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-300"><p className="text-lg">نقشه زنده نخلستان ما</p><p className="text-sm text-gray-400">(روی نقاط نورانی کلیک کنید)</p></div>
        </div>
    );
};


const OurGroveView: React.FC = () => {
    const { user, orders, allDeeds, communityStats, personalStats } = useAppState();
    const dispatch = useAppDispatch();
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isAsking, setIsAsking] = useState(false);
    const [aiError, setAiError] = useState('');
    const [selectedDeed, setSelectedDeed] = useState<Deed | null>(null);
    const [viewMode, setViewMode] = useState<'map' | '3d'>('map');

    const onStartPlantingFlow = () => dispatch({ type: 'START_PLANTING_FLOW' });
    const onAuthClick = () => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
    const onNavigateToProfileTab = (tab: string) => dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: tab });

    const userPlantedDeeds = useMemo(() => user ? orders.flatMap(o => o.deeds || []) : [], [user, orders]);
    const userDeedIds = useMemo<Set<string>>(() => new Set(userPlantedDeeds.map(d => d.id)), [userPlantedDeeds]);

    const handleAskQuestion = async () => {
        if (!question.trim()) return;
        setIsAsking(true); setAiError(''); setAnswer('');
        try {
            const stats = { totalPalms: communityStats.totalPalmsPlanted, jobHours: communityStats.totalJobHours, co2Absorbed: communityStats.totalCo2Absorbed };
            const result = await askTheGrove(question, stats);
            setAnswer(result);
        } catch (error) {
            setAiError('متاسفانه دستیار هوشمانا در حال استراحت است. لطفاً بعداً تلاش کنید.');
        } finally {
            setIsAsking(false);
        }
    };
    
    const hasPlanted = !!user && personalStats.palms > 0;
    const communitySize = Math.floor(communityStats.totalPalmsPlanted / 1.2);

    const statsData = [
        { icon: <UserGroupIcon className="w-8 h-8 text-indigo-400" />, value: communitySize.toLocaleString('fa-IR'), label: "عضو جامعه (تخمین)" },
        { icon: <CloudIcon className="w-8 h-8 text-teal-400" />, value: communityStats.totalCo2Absorbed.toLocaleString('fa-IR'), personalValue: personalStats.co2Absorbed.toLocaleString('fa-IR'), label: "جذب CO2 (کیلوگرم/سال)" },
        { icon: <BriefcaseIcon className="w-8 h-8 text-blue-400" />, value: communityStats.totalJobHours.toLocaleString('fa-IR'), personalValue: personalStats.jobHours.toLocaleString('fa-IR'), label: "ساعت اشتغال‌زایی (تخمین)" },
        { icon: <SproutIcon className="w-8 h-8 text-green-400" />, value: communityStats.totalPalmsPlanted.toLocaleString('fa-IR'), personalValue: personalStats.palms.toLocaleString('fa-IR'), label: "مجموع نخل‌های کاشته شده" },
    ];


    return (
        <div className="pt-22 pb-24 min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-6 py-12">
                <div className="text-center mb-12"><h1 className="text-5xl font-bold mb-4 text-green-400">نخلستان ما</h1><p className="text-xl max-w-3xl mx-auto text-gray-300">اینجا تاثیر جمعی ما را می‌بینید. هر نخل، داستانی از امید و نمادی از یک حرکت بزرگ است.</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {statsData.map(stat => <InteractiveStatCard key={stat.label} label={stat.label} communityValue={stat.value} personalValue={stat.personalValue} isLoggedIn={!!user} hasPlanted={hasPlanted} onLoginClick={onAuthClick} onNavigateToProfileTab={onNavigateToProfileTab} onStartPlantingFlow={onStartPlantingFlow} icon={stat.icon} />)}
                </div>
                
                <div className="flex justify-end mb-4 gap-2">
                    <button 
                        onClick={() => setViewMode('map')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${viewMode === 'map' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        <MapIcon className="w-4 h-4" /> نمای نقشه
                    </button>
                    <button 
                        onClick={() => setViewMode('3d')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${viewMode === '3d' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        <GlobeIcon className="w-4 h-4" /> باغ سه بعدی
                    </button>
                </div>

                {viewMode === 'map' ? (
                    <GroveMap allDeeds={allDeeds} userDeedIds={userDeedIds} onDeedClick={setSelectedDeed} />
                ) : (
                    <ThreeDGarden />
                )}

                <p className="text-center text-yellow-400 text-sm mt-4">{userPlantedDeeds.length > 0 ? `نخل‌های شما با درخشش زرد مشخص شده‌اند.` : 'با کاشت اولین نخل، تاثیر خود را روی نقشه ببینید.'}</p>
                
                <section className="bg-gray-800/50 p-6 rounded-lg my-12 border border-gray-700 max-w-4xl mx-auto">
                    <div className="flex items-center mb-4"><SparklesIcon className="w-8 h-8 text-green-400 ml-3" /><h2 className="text-2xl font-bold text-white">از نخلستان بپرسید</h2></div>
                    <p className="text-gray-300 mb-4">سوالی درباره تاثیرات پروژه دارید؟ از دستیار هوشمانا ما بپرسید تا بر اساس آمارهای زنده پاسخ دهد.</p>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <input type="text" value={question} onChange={e => setQuestion(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAskQuestion()} placeholder="مثال: هر نخل چقدر CO2 جذب می‌کند؟" className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500" disabled={isAsking}/>
                        <button onClick={handleAskQuestion} disabled={isAsking || !question.trim()} className="w-full sm:w-auto flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-wait text-white font-bold py-3 px-6 rounded-md transition-colors">{isAsking ? '...' : <PaperAirplaneIcon className="w-6 h-6" />}</button>
                    </div>
                     {(answer || aiError) && (<div className="mt-4 p-4 bg-gray-700 rounded-md border border-gray-600">{aiError ? <p className="text-red-400">{aiError}</p> : <p className="text-gray-200 leading-relaxed">{answer}</p>}</div>)}
                </section>
            </div>
             {selectedDeed && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDeed(null)}>
                    <div className="relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedDeed(null)} className="absolute -top-3 -left-3 bg-gray-700 rounded-full p-1 z-10"><XMarkIcon /></button>
                        <DeedDisplay deed={selectedDeed} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default OurGroveView;
