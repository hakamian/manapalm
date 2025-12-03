
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppState } from '../AppContext';
import { View, LMSLesson, TargetLanguage, PointLog } from '../types';
import { GOAL_CONFIG, UserGoal, UserBarrier, UserInterest, TimeCommitment } from '../utils/englishAcademyConfig';
import { generateSyllabus } from '../services/geminiService';
import AcademyGatekeeper from './english-academy/AcademyGatekeeper';
import AcademyOnboarding from './english-academy/AcademyOnboarding';
import AcademyRoadmapPreview from './english-academy/AcademyRoadmap';
import AcademyDashboard from './english-academy/AcademyDashboard';
import AcademyClassroom from './english-academy/AcademyClassroom';
import KidsAcademyView from './english-academy/KidsAcademyView';
import { SparklesIcon, StarIcon } from './icons';
import AcademyLandingHero from './AcademyLandingHero';
import { ACADEMY_CONTENTS } from '../utils/academyLandingContent';

type AcademyMode = 'gatekeeper' | 'onboarding' | 'roadmap_preview' | 'dashboard' | 'classroom' | 'kids_mode';

const EnglishAcademyView: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user, products, selectedLanguage } = useAppState();
    
    const [mode, setMode] = useState<AcademyMode>('gatekeeper');
    const [userConfig, setUserConfig] = useState<{ goal: UserGoal; barrier: UserBarrier; interest: UserInterest | string; timeCommitment: TimeCommitment | string } | null>(null);
    const [activeLesson, setActiveLesson] = useState<LMSLesson | null>(null);
    const [isSyllabusGenerating, setIsSyllabusGenerating] = useState(false);

    // --- STATE PERSISTENCE LOGIC (Fix 1) ---
    useEffect(() => {
        // Restore state on mount if not fully unlocked
        if (!user?.hasUnlockedEnglishTest) {
            const savedState = localStorage.getItem('academy_state');
            if (savedState) {
                try {
                    const parsed = JSON.parse(savedState);
                    if (parsed.mode && parsed.mode !== 'gatekeeper') {
                        setMode(parsed.mode);
                    }
                    if (parsed.config) {
                        setUserConfig(parsed.config);
                    }
                    if (parsed.selectedLanguage && !selectedLanguage) {
                        dispatch({ type: 'SET_SELECTED_LANGUAGE', payload: parsed.selectedLanguage });
                    }
                } catch (e) {
                    console.error("Failed to restore academy state", e);
                }
            }
        }
    }, []);

    useEffect(() => {
        // Save state whenever it changes, unless user has unlocked dashboard (no need to save temp state then)
        if (!user?.hasUnlockedEnglishTest) {
            const stateToSave = {
                mode,
                config: userConfig,
                selectedLanguage: selectedLanguage
            };
            localStorage.setItem('academy_state', JSON.stringify(stateToSave));
        } else {
            // Cleanup if unlocked
            localStorage.removeItem('academy_state');
        }
    }, [mode, userConfig, selectedLanguage, user?.hasUnlockedEnglishTest]);
    // ---------------------------------------

    // Effect to handle transitions based on user state (e.g. after payment)
    useEffect(() => {
        if (user) {
            // If user explicitly selected kids mode, stay there
            if (mode === 'kids_mode') return;

            // Priority 1: If user has unlocked the academy, send them straight to dashboard.
            if (user.hasUnlockedEnglishTest) {
                setMode('dashboard');
                
                // If target language is missing (maybe paid via direct link), try to recover or set default
                if (!user.languageConfig?.targetLanguage) {
                     const langToSet = selectedLanguage || 'English';
                     dispatch({
                        type: 'UPDATE_USER',
                        payload: {
                            languageConfig: { ...user.languageConfig, targetLanguage: langToSet }
                        }
                    });
                }

                // If no syllabus exists, generate one automatically
                if (!user.languageConfig?.syllabus && !isSyllabusGenerating) {
                    generateAndSaveSyllabus();
                }
            } 
            // Priority 2: If user is logged in but NOT unlocked, we let them stay in their current flow 
            // (onboarding/roadmap). We ONLY redirect to gatekeeper if they are in 'dashboard' or 'classroom'
            // illegally (e.g. session expired or manual navigation).
            else if (mode === 'dashboard' || mode === 'classroom') {
                setMode('gatekeeper');
            }
            // If user is logged in but hasn't selected a language yet/started onboarding
            else if (mode === 'gatekeeper' && selectedLanguage) {
                setMode('onboarding');
            }
        } else {
             // Not logged in always goes to gatekeeper
             if (mode !== 'kids_mode' && mode !== 'onboarding' && mode !== 'roadmap_preview') {
                 setMode('gatekeeper');
             }
        }
    }, [user?.hasUnlockedEnglishTest, user?.languageConfig?.targetLanguage, user?.id, user?.languageConfig?.syllabus]);

    const generateAndSaveSyllabus = async () => {
        if (!user || !user.languageConfig) return;
        // Prevent double generation
        if (user.languageConfig.syllabus && user.languageConfig.syllabus.length > 0) return;

        setIsSyllabusGenerating(true);
        try {
            const syllabus = await generateSyllabus(
                user.languageConfig.targetLanguage || 'English',
                user.languageConfig.level || 'A1',
                user.languageConfig.goal || 'connection',
                user.languageConfig.interest || 'general'
            );
            
            dispatch({
                type: 'UPDATE_USER',
                payload: {
                    languageConfig: {
                        ...user.languageConfig,
                        syllabus: syllabus
                    }
                }
            });
        } catch (e) {
            console.error("Syllabus generation failed", e);
        } finally {
            setIsSyllabusGenerating(false);
        }
    };

    const handleLanguageSelect = (lang: TargetLanguage) => {
         dispatch({ type: 'SET_SELECTED_LANGUAGE', payload: lang });
         // Force mode update to trigger persistence
         setMode('onboarding');
         if (!user) {
              dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
         }
    };

    const handleOnboardingComplete = (config: { goal: UserGoal; barrier: UserBarrier; interest: UserInterest | string; timeCommitment: TimeCommitment | string }) => {
        setUserConfig(config);
        setMode('roadmap_preview');
        
        // Crucial: Persist the config immediately so it's ready when payment completes
        if (user) {
             dispatch({
                type: 'UPDATE_USER',
                payload: {
                    languageConfig: {
                        ...user.languageConfig,
                        targetLanguage: selectedLanguage || user.languageConfig?.targetLanguage || 'English',
                        goal: config.goal,
                        barrier: config.barrier,
                        interest: config.interest as string,
                        timeCommitment: config.timeCommitment as string
                    }
                }
            });
        }
        
        const goalTitle = GOAL_CONFIG[config.goal].title;
        dispatch({ type: 'SET_ENGLISH_SCENARIO', payload: goalTitle });
    };

    const handlePlantPalm = () => {
        const product = products.find(p => p.id === 'p_heritage_language');
        if (product) {
            // Add to cart and open cart
            // Fix: Pass product object correctly
            dispatch({ type: 'ADD_TO_CART', payload: { product, quantity: 1 } });
            dispatch({ type: 'TOGGLE_CART', payload: true });
        }
    };

    const handleStartDemo = () => {
        if (!userConfig) return;
        
        let scenario = 'Free Talk';
        const interest = userConfig.interest;
        
        if (interest === 'tech') scenario = 'Talking about AI trends';
        else if (interest === 'art') scenario = 'Discussing a favorite movie';
        else scenario = `Discussing ${interest}`;
        
        dispatch({ type: 'SET_ENGLISH_SCENARIO', payload: scenario });
        dispatch({ type: 'SET_VIEW', payload: View.AI_CONVERSATION_PARTNER });
    };
    
    const handleStartPlacementTest = () => {
        dispatch({ type: 'SET_VIEW', payload: View.ENGLISH_PLACEMENT_TEST });
    };

    const handleLessonSelect = (lesson: LMSLesson) => {
        setActiveLesson(lesson);
        setMode('classroom');
        window.scrollTo(0, 0);
    };

    const handleCompleteLesson = () => {
        if (!activeLesson || !user) return;
        const userProgress = user.englishAcademyProgress || {};
        const newProgress = { ...userProgress, [activeLesson.id]: true };
        const pointsToAdd = activeLesson.xp;
        
        const pointLog: PointLog = { 
            action: `تکمیل درس: ${activeLesson.title}`, 
            points: pointsToAdd, 
            type: 'mana', 
            date: new Date().toISOString() 
        };

        dispatch({ 
            type: 'UPDATE_USER', 
            payload: { 
                englishAcademyProgress: newProgress,
                points: user.points + pointsToAdd,
                pointsHistory: [...(user.pointsHistory || []), pointLog]
            } 
        });
        
        setMode('dashboard');
        setActiveLesson(null);
    };

    const renderContent = () => {
        switch (mode) {
            case 'gatekeeper':
                return (
                    <>
                        <div className="max-w-6xl mx-auto pt-6 px-4">
                             <AcademyLandingHero content={ACADEMY_CONTENTS['english_academy']} />
                        </div>
                        <AcademyGatekeeper 
                            isLoggedIn={!!user} 
                            onLogin={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })} 
                            onLanguageSelect={handleLanguageSelect} 
                        />
                    </>
                );
            case 'onboarding':
                return <AcademyOnboarding onComplete={handleOnboardingComplete} />;
            case 'roadmap_preview':
                return <AcademyRoadmapPreview 
                    config={userConfig!} 
                    onUnlock={handlePlantPalm} 
                    onDemo={handleStartDemo}
                />;
            case 'dashboard':
                return <AcademyDashboard 
                    user={user!} 
                    onStartPlacementTest={handleStartPlacementTest}
                    onLessonSelect={handleLessonSelect}
                />;
            case 'classroom':
                if (!activeLesson) return null;
                return <AcademyClassroom 
                    activeLesson={activeLesson}
                    userProgress={user?.englishAcademyProgress || {}}
                    onCompleteLesson={handleCompleteLesson}
                    onBackToDashboard={() => setMode('dashboard')}
                    onSetActiveLesson={setActiveLesson}
                    language={user?.languageConfig?.targetLanguage || 'English'}
                    level={user?.languageConfig?.level || 'Beginner'}
                />;
            case 'kids_mode':
                return <KidsAcademyView onBack={() => setMode('gatekeeper')} />;
            default:
                return <div>Loading...</div>;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen pt-16">
            {renderContent()}
        </div>
    );
};

export default EnglishAcademyView;
