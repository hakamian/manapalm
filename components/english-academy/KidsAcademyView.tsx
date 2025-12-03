
import React, { useState, useEffect } from 'react';
import { StarIcon, ArrowLeftIcon, SparklesIcon, PlayIcon, CheckCircleIcon, XMarkIcon, SpeakerWaveIcon, MapIcon, LockClosedIcon, TrophyIcon, FireIcon, MicrophoneIcon } from '../icons';
import { useAppDispatch } from '../../AppContext';

interface KidsAcademyViewProps {
    onBack: () => void;
}

// --- Types & Data Structures for KidsLingua-AI ---

type WorldId = 'jungle' | 'town' | 'magic' | 'space' | 'time';

interface World {
    id: WorldId;
    title: string;
    description: string;
    color: string;
    icon: string; // Emoji for now
    locked: boolean;
    levels: Level[];
}

interface Level {
    id: number;
    title: string;
    type: 'story' | 'game' | 'speech' | 'boss';
    isCompleted: boolean;
    stars: number; // 0-3
}

const WORLDS: World[] = [
    {
        id: 'jungle',
        title: 'The Singing Jungle',
        description: 'Learn sounds, animals, and colors!',
        color: 'from-green-400 to-teal-500',
        icon: '🦁',
        locked: false,
        levels: [
            { id: 1, title: 'Meet Leo the Lion', type: 'story', isCompleted: false, stars: 0 },
            { id: 2, title: 'Roar Like a Lion', type: 'speech', isCompleted: false, stars: 0 },
            { id: 3, title: 'Fruit Party', type: 'game', isCompleted: false, stars: 0 },
            { id: 4, title: 'Jungle Concert', type: 'boss', isCompleted: false, stars: 0 },
        ]
    },
    {
        id: 'town',
        title: 'Busy Town',
        description: 'Daily routines, jobs, and polite words.',
        color: 'from-blue-400 to-indigo-500',
        icon: '🏙️',
        locked: true,
        levels: []
    },
    {
        id: 'magic',
        title: 'Magic Academy',
        description: 'Grammar spells and reading potions.',
        color: 'from-purple-400 to-pink-500',
        icon: '🧙‍♂️',
        locked: true,
        levels: []
    }
];

// --- Sub-Components ---

const AICompanionWidget = () => (
    <div className="fixed bottom-4 right-4 flex items-end gap-2 animate-bounce-slow z-50">
        <div className="bg-white p-3 rounded-2xl rounded-br-none shadow-lg border-2 border-purple-400 max-w-[150px]">
            <p className="text-xs text-gray-700 font-bold">Hi! I'm Sparky! Let's play! ⚡</p>
        </div>
        <div className="w-16 h-16 bg-yellow-300 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-yellow-400 opacity-50 rounded-full animate-pulse"></div>
            🤖
        </div>
    </div>
);

const WorldCard: React.FC<{ world: World; onClick: () => void }> = ({ world, onClick }) => (
    <button 
        onClick={onClick}
        disabled={world.locked}
        className={`relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 ${world.locked ? 'grayscale opacity-80' : ''}`}
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${world.color}`}></div>
        
        {/* Decorative Circles */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-black/10 rounded-full blur-2xl"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
            <div className="text-6xl mb-4 drop-shadow-md transform transition-transform group-hover:scale-110">{world.icon}</div>
            <h3 className="text-2xl font-black tracking-tight drop-shadow-md">{world.title}</h3>
            <p className="text-sm font-medium opacity-90 mt-1">{world.description}</p>
            
            {world.locked && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                    <LockClosedIcon className="w-12 h-12 text-white/80" />
                </div>
            )}
        </div>
    </button>
);

const LevelPath: React.FC<{ world: World; onLevelClick: (level: Level) => void }> = ({ world, onLevelClick }) => {
    return (
        <div className="flex flex-col items-center space-y-8 py-8 relative">
            {/* Path Line */}
            <div className="absolute top-0 bottom-0 w-4 bg-white/20 rounded-full z-0"></div>

            {world.levels.map((level, index) => (
                <div key={level.id} className={`relative z-10 w-full flex ${index % 2 === 0 ? 'justify-start pl-10' : 'justify-end pr-10'}`}>
                     <button 
                        onClick={() => onLevelClick(level)}
                        className="group relative w-24 h-24"
                    >
                        <div className={`absolute inset-0 bg-white rounded-full shadow-[0_8px_0_rgb(0,0,0,0.1)] transition-transform group-active:translate-y-[4px] group-active:shadow-none border-4 ${level.isCompleted ? 'border-green-400' : 'border-purple-400'} flex items-center justify-center`}>
                            <span className="text-3xl">
                                {level.type === 'story' ? '📖' : level.type === 'game' ? '🎮' : level.type === 'speech' ? '🎤' : '🏆'}
                            </span>
                        </div>
                        {/* Stars */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {[1, 2, 3].map(s => (
                                <StarIcon key={s} className={`w-4 h-4 ${s <= level.stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                        </div>
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <span className="text-white font-bold text-sm bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm">{level.title}</span>
                        </div>
                    </button>
                </div>
            ))}
        </div>
    );
};

const LessonPlayer: React.FC<{ level: Level; onComplete: () => void }> = ({ level, onComplete }) => {
    const [step, setStep] = useState(0);
    
    // Mock Lesson content based on type
    const renderContent = () => {
        if (level.type === 'story') {
            return (
                <div className="text-center animate-scale-in">
                    <div className="aspect-video bg-white/20 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden border-4 border-white/30 shadow-2xl">
                        {/* Placeholder for AI generated video/image */}
                        <div className="text-6xl animate-bounce">🦁</div>
                        <p className="absolute bottom-4 text-white font-bold text-xl drop-shadow-md">"Hello! I am Leo."</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <button className="bg-white text-purple-600 p-4 rounded-full shadow-lg hover:scale-110 transition-transform">
                            <SpeakerWaveIcon className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            );
        }
        if (level.type === 'speech') {
             return (
                <div className="text-center animate-scale-in">
                    <h2 className="text-3xl font-black text-white mb-8">Say "Hello Leo!"</h2>
                    <div className="w-40 h-40 mx-auto bg-red-500 rounded-full flex items-center justify-center shadow-[0_10px_0_rgb(153,27,27)] active:shadow-none active:translate-y-[10px] transition-all cursor-pointer border-4 border-white">
                        <MicrophoneIcon className="w-20 h-20 text-white animate-pulse" />
                    </div>
                    <p className="mt-8 text-white/80 font-bold">Tap to speak</p>
                </div>
            );
        }
        return <div className="text-white text-2xl font-bold">Game Loading... 🎮</div>;
    };

    return (
        <div className="fixed inset-0 z-[60] bg-gradient-to-b from-purple-600 to-blue-600 flex flex-col">
            {/* Header */}
            <div className="p-4 flex justify-between items-center">
                <button onClick={onComplete} className="bg-white/20 p-2 rounded-full text-white hover:bg-white/30"><XMarkIcon className="w-6 h-6"/></button>
                <div className="flex-grow mx-4 bg-black/30 h-3 rounded-full overflow-hidden">
                    <div className="bg-yellow-400 h-full transition-all duration-500" style={{ width: `${(step + 1) * 20}%` }}></div>
                </div>
                <div className="bg-yellow-500 text-black font-black px-3 py-1 rounded-full flex items-center gap-1">
                    <StarIcon className="w-4 h-4 fill-current"/> 0
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow flex items-center justify-center p-6">
                {renderContent()}
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-white/10 backdrop-blur-md">
                <button onClick={onComplete} className="w-full bg-green-500 hover:bg-green-400 text-white text-xl font-black py-4 rounded-2xl shadow-[0_6px_0_rgb(21,128,61)] active:shadow-none active:translate-y-[6px] transition-all">
                    Continue ➔
                </button>
            </div>
        </div>
    );
};

// --- Main Component ---

const KidsAcademyView: React.FC<KidsAcademyViewProps> = ({ onBack }) => {
    const dispatch = useAppDispatch();
    const [activeWorld, setActiveWorld] = useState<World | null>(null);
    const [activeLevel, setActiveLevel] = useState<Level | null>(null);
    const [currency, setCurrency] = useState(1250); // Glowberries

    const handleWorldSelect = (world: World) => {
        if (!world.locked) {
            setActiveWorld(world);
        }
    };

    const handleLevelComplete = () => {
        // Logic to update state, add stars, unlock next level
        setActiveLevel(null);
        setCurrency(c => c + 50);
        // Play sound effect
    };

    return (
        <div className="min-h-screen bg-[#1a1a2e] font-sans selection:bg-pink-500 relative overflow-hidden">
            {/* Starry Background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 animate-pulse-slow"></div>
            
            {/* Top Bar */}
            <header className="relative z-20 flex justify-between items-center p-4 md:p-6">
                <button onClick={activeWorld ? () => setActiveWorld(null) : onBack} className="bg-white text-indigo-900 p-3 rounded-2xl shadow-lg border-b-4 border-gray-300 active:border-b-0 active:translate-y-1 transition-all">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-3">
                    <div className="bg-black/40 backdrop-blur-md border-2 border-purple-500 rounded-full px-4 py-2 flex items-center gap-2">
                        <FireIcon className="w-5 h-5 text-orange-500 animate-bounce" />
                        <span className="text-white font-black">3 Day Streak!</span>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md border-2 border-yellow-500 rounded-full px-4 py-2 flex items-center gap-2">
                        <span className="text-xl">🫐</span>
                        <span className="text-yellow-300 font-black">{currency}</span>
                    </div>
                </div>
            </header>

            {/* Main Scroll View */}
            <main className="relative z-10 container mx-auto px-4 pb-24">
                {!activeWorld ? (
                    // World Select Mode
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="text-center py-6">
                            <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
                                LingoLand 🌍
                            </h1>
                            <p className="text-purple-200 mt-2 font-bold">Choose your adventure!</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {WORLDS.map(world => (
                                <WorldCard key={world.id} world={world} onClick={() => handleWorldSelect(world)} />
                            ))}
                        </div>
                    </div>
                ) : (
                    // Level Select Mode
                    <div className="max-w-md mx-auto animate-fade-in">
                        <div className={`text-center py-8 rounded-3xl bg-gradient-to-b ${activeWorld.color} shadow-2xl mb-8 border-4 border-white/20`}>
                            <div className="text-6xl mb-2 animate-bounce">{activeWorld.icon}</div>
                            <h2 className="text-3xl font-black text-white drop-shadow-md">{activeWorld.title}</h2>
                        </div>
                        
                        <LevelPath world={activeWorld} onLevelClick={setActiveLevel} />
                    </div>
                )}
            </main>

            {/* Companion */}
            <AICompanionWidget />

            {/* Active Lesson Modal */}
            {activeLevel && (
                <LessonPlayer level={activeLevel} onComplete={handleLevelComplete} />
            )}
            
             <style>{`
                .animate-bounce-slow { animation: bounce 3s infinite; }
                @keyframes pulse-slow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
                .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default KidsAcademyView;
