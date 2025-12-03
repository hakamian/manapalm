
import React, { useState } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View, CoachingRole } from '../types';
import { TrophyIcon, BrainCircuitIcon, MapIcon, BookOpenIcon, LockClosedIcon, PlusIcon, SparklesIcon } from './icons';
import CoachingLabAccessModal from './CoachingLabAccessModal';
import PracticeTab from './coaching-lab/PracticeTab';
import LearnTab from './coaching-lab/LearnTab';
import MasteryTab from './coaching-lab/MasteryTab';
import ModuleBriefingModal from './coaching-lab/ModuleBriefingModal';
import { bookJourneys } from '../utils/coachingData';
import AcademyLandingHero from './AcademyLandingHero';
import { ACADEMY_CONTENTS } from '../utils/academyLandingContent';

const CoachingLabView: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const [pendingRole, setPendingRole] = useState<CoachingRole | null>(null);
    const [activeTab, setActiveTab] = useState<'practice' | 'learn' | 'mastery'>('practice');
    
    // Briefing Modal State (Used for Mastery Path)
    const [isBriefingOpen, setIsBriefingOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState<typeof bookJourneys[0]['modules'][0] | null>(null);
    const [selectedBookTitle, setSelectedBookTitle] = useState('');
    
    // Track unlocked modules for the current session (using title as ID for simplicity)
    const [tempUnlockedModules, setTempUnlockedModules] = useState<Set<string>>(new Set());

    // Check for user login
    if (!user) {
        return (
             <div className="bg-gray-900 text-white pt-22 pb-24 min-h-screen">
                <div className="max-w-6xl mx-auto px-6 pt-10">
                     {/* Landing Hero for Guests */}
                    <AcademyLandingHero content={ACADEMY_CONTENTS['coaching_lab']} />
                    
                    <div className="max-w-lg mx-auto text-center animate-fade-in-up mt-10">
                        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl">
                            <div className="inline-block p-4 bg-amber-900/30 rounded-full mb-6 border border-amber-500/30">
                                <SparklesIcon className="w-12 h-12 text-amber-500" />
                            </div>
                            <h2 className="text-xl font-bold mb-4 text-white">ورود به منطقه امن تمرین</h2>
                            <p className="text-gray-300 mb-8 leading-relaxed">
                                برای شروع تمرین با هوش مصنوعی و ارتقای مهارت‌های خود، لطفاً ابتدا وارد حساب کاربری شوید.
                            </p>
                            <button 
                                onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <LockClosedIcon className="w-5 h-5" />
                                ورود به حساب کاربری
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Gatekeeper for non-coaches
    if (!user.isCoach && !user.isAdmin) {
        return (
            <div className="bg-gray-900 text-white pt-22 pb-24 min-h-screen">
                 <div className="max-w-6xl mx-auto px-6 pt-10">
                     {/* Landing Hero for Non-Coach Users */}
                    <AcademyLandingHero content={ACADEMY_CONTENTS['coaching_lab']} />

                    <div className="max-w-lg mx-auto text-center animate-fade-in-up mt-10">
                        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl">
                            <LockClosedIcon className="w-16 h-16 mx-auto text-amber-500 mb-6" />
                            <h2 className="text-2xl font-bold mb-4">منطقه تخصصی کوچ‌ها</h2>
                            <p className="text-gray-300 mb-8 leading-relaxed">
                                آزمایشگاه کوچینگ فضایی برای تمرین و ارتقای مهارت‌های حرفه‌ای کوچ‌ها است. برای دسترسی به این بخش، باید در پروفایل خود به عنوان «کوچ» ثبت‌نام کرده باشید.
                            </p>
                            <div className="space-y-3">
                                <button 
                                    onClick={() => dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: 'profile' })}
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                                >
                                    فعال‌سازی پروفایل کوچ
                                </button>
                                <button 
                                    onClick={() => dispatch({ type: 'SET_VIEW', payload: View.SMART_CONSULTANT })}
                                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                                >
                                    من کاربر هستم (مشاوره می‌خواهم)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const hasSubscription = user.coachingLabAccess && new Date(user.coachingLabAccess.expiresAt) > new Date();

    // Logic to start a session
    const startSessionLogic = (role: CoachingRole, topic: string = 'تمرین آزاد') => {
        dispatch({ 
            type: 'START_COACHING_SESSION', 
            payload: {
                role,
                topic,
                currentStep: 1,
                startTime: new Date().toISOString(),
                isRealSession: false,
                returnView: View.COACHING_LAB
            }
        });
        dispatch({ type: 'SET_VIEW', payload: View.COACHING_SESSION });
    };

    // Handler called by PracticeTab
    const handleStartSession = (role: CoachingRole, topic?: string) => {
        if (hasSubscription || user.isAdmin) {
             startSessionLogic(role, topic);
        } else {
            setPendingRole(role);
            setIsAccessModalOpen(true);
        }
    };

    // Handler for Mastery Path Module Selection
    const handleModuleSelect = (moduleTitle: string, moduleData: typeof bookJourneys[0]['modules'][0]) => {
        const book = bookJourneys.find(b => b.modules.some(m => m.title === moduleTitle));
        setSelectedBookTitle(book?.title || '');
        setSelectedModule(moduleData);
        setIsBriefingOpen(true);
    };
    
    // Handler for "Start Journey" generic button on Book Detail
    const handleStartBookSession = (topic: string) => {
         handleStartSession('coachee', topic);
    };

    // Confirm start from Briefing Modal -> Triggers AI Session
    const confirmStartModule = () => {
        if (selectedModule) {
            const topic = `${selectedBookTitle}: ${selectedModule.title}`;
            startSessionLogic('coachee', topic);
            setIsBriefingOpen(false);
        }
    };

    const handleUnlockModule = () => {
        if (selectedModule) {
             setPendingRole('coachee'); // Set a default role for context
             setIsAccessModalOpen(true);
        }
    };

    const handlePayWithPoints = () => {
         if (user.manaPoints >= 500 && pendingRole) {
             dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: 500, action: `تمرین در آزمایشگاه کوچینگ` } });
             
             // If we are in the module flow, unlock it locally for this session
             if (selectedModule && isBriefingOpen) {
                 setTempUnlockedModules(prev => new Set(prev).add(selectedModule.title));
                 setIsAccessModalOpen(false);
                 // The module modal will stay open and re-render with isUnlocked=true (passed via props below)
             } else {
                 // Normal practice flow
                 startSessionLogic(pendingRole);
                 setIsAccessModalOpen(false);
                 setPendingRole(null);
             }
         }
    };

    return (
        <>
            <div className="bg-gray-900 text-white pt-22 pb-24 min-h-screen">
                <div className="container mx-auto px-4">
                    <header className="text-center mb-8">
                        <div className="inline-block p-3 bg-amber-900/30 rounded-full mb-4 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                            <TrophyIcon className="w-12 h-12 text-amber-500" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">آزمایشگاه کوچینگ</h1>
                        <p className="text-sm md:text-lg text-gray-400 max-w-2xl mx-auto">
                            فضایی برای تسلط بر هنر کوچینگ با تمرین، بازخورد و دانش عمیق.
                        </p>
                    </header>

                    {/* Tabs */}
                    <div className="flex justify-center mb-8 overflow-x-auto">
                        <div className="bg-gray-800 p-1 rounded-xl flex shadow-lg border border-gray-700 whitespace-nowrap">
                            <button 
                                onClick={() => setActiveTab('practice')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'practice' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                <BrainCircuitIcon className="w-4 h-4"/> اتاق تمرین
                            </button>
                            <button 
                                onClick={() => setActiveTab('mastery')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'mastery' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                <MapIcon className="w-4 h-4"/> مسیرهای تسلط
                            </button>
                            <button 
                                onClick={() => setActiveTab('learn')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'learn' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                <BookOpenIcon className="w-4 h-4"/> مخزن دانش
                            </button>
                        </div>
                    </div>
                    
                    {activeTab === 'practice' && (
                        <PracticeTab 
                            user={user} 
                            onOpenAccessModal={() => { setPendingRole('coach'); setIsAccessModalOpen(true); }}
                            onStartSession={handleStartSession}
                        />
                    )}
                    
                    {activeTab === 'mastery' && (
                        <MasteryTab 
                            user={user}
                            onStartSession={handleStartBookSession}
                            onModuleSelect={handleModuleSelect}
                        />
                    )}

                    {activeTab === 'learn' && (
                        <LearnTab />
                    )}
                </div>
            </div>
            
            <CoachingLabAccessModal
                isOpen={isAccessModalOpen}
                onClose={() => setIsAccessModalOpen(false)}
                userManaPoints={user.manaPoints}
                onPayWithPoints={handlePayWithPoints}
            />
            
            {selectedModule && (
                 <ModuleBriefingModal
                    isOpen={isBriefingOpen}
                    onClose={() => setIsBriefingOpen(false)}
                    onStart={confirmStartModule}
                    module={selectedModule}
                    bookTitle={selectedBookTitle}
                    isUnlocked={user.isAdmin || hasSubscription || selectedModule.status === 'unlocked' || tempUnlockedModules.has(selectedModule.title)}
                    onUnlockRequest={handleUnlockModule}
                />
            )}
        </>
    );
};

export default CoachingLabView;
