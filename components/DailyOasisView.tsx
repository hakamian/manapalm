

import React, { useState, useEffect, useCallback } from 'react';
import { User, View, TimelineEvent, HyperPersonalizedReport, JournalAnalysisReport } from '../types';
import { getDailyReflectionPrompt, getJournalReflection, getHyperPersonalizedAnalysis, getAIAssistedText, getJournalAnalysis } from '../services/geminiService';
import { SparklesIcon, CalendarDaysIcon, CheckCircleIcon, PaperAirplaneIcon, BookOpenIcon, LockClosedIcon, ArrowLeftIcon, KeyIcon, FlagIcon, LightBulbIcon, PencilSquareIcon } from './icons';
import { useAppState, useAppDispatch } from '../AppContext';

const DailyOasisView: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    
    const onNavigate = (view: View) => dispatch({ type: 'SET_VIEW', payload: view });

    const [dailyPrompt, setDailyPrompt] = useState('');
    const [journalEntry, setJournalEntry] = useState('');
    const [aiReflection, setAiReflection] = useState('');
    const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);
    const [isLoadingReflection, setIsLoadingReflection] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [shareAnonymously, setShareAnonymously] = useState(false);
    const [reminderSet, setReminderSet] = useState(false);


    const [hyperPersonalizedReport, setHyperPersonalizedReport] = useState<HyperPersonalizedReport | null>(user?.hyperPersonalizedReport || null);
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    const [reportError, setReportError] = useState('');

    const [journalAnalysisReport, setJournalAnalysisReport] = useState<JournalAnalysisReport | null>(user?.journalAnalysisReport || null);
    const [isLoadingJournalAnalysis, setIsLoadingJournalAnalysis] = useState(false);
    const [journalAnalysisError, setJournalAnalysisError] = useState('');


    const today = new Date().toISOString().split('T')[0];
    const todaysEntry = user?.timeline?.find(e => (e.type === 'JOURNAL_ENTRY' || e.type === 'reflection') && e.date.startsWith(today));
    const journalEntries = user?.timeline?.filter(e => e.type === 'JOURNAL_ENTRY' || e.type === 'reflection').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

    const fetchPrompt = useCallback(async () => {
        if (!user?.meaningGoal) {
            setDailyPrompt("برای دریافت سوالات روزانه، ابتدا هدف معنوی خود را در صفحه سفر قهرمانی مشخص کنید.");
            setIsLoadingPrompt(false);
            return;
        }
        try {
            const prompt = await getDailyReflectionPrompt(user.meaningGoal);
            setDailyPrompt(prompt);
        } catch (e) {
            setError(e instanceof Error ? e.message : "خطا در دریافت الهام روزانه. لطفاً بعداً تلاش کنید.");
        } finally {
            setIsLoadingPrompt(false);
        }
    }, [user?.meaningGoal]);

    useEffect(() => {
        if (user && !todaysEntry) {
            fetchPrompt();
        } else {
            setIsLoadingPrompt(false);
        }
    }, [user, todaysEntry, fetchPrompt]);

    useEffect(() => {
        // Reset reminder status when a new day starts (i.e., when we can write a new entry)
        if (!todaysEntry) {
            setReminderSet(false);
        }
    }, [todaysEntry]);

    const handleSetReminder = () => {
        if (user) {
            localStorage.setItem('journalReminder', JSON.stringify({ userId: user.id, setAt: new Date().toISOString() }));
            setReminderSet(true);
        }
    };

    const handleGetReflection = async () => {
        if (!journalEntry.trim()) return;
        setIsLoadingReflection(true);
        setError('');
        try {
            const reflection = await getJournalReflection(journalEntry);
            setAiReflection(reflection);
        } catch (e) {
            setError(e instanceof Error ? e.message : "خطا در دریافت بازخورد هوشمند.");
        } finally {
            setIsLoadingReflection(false);
        }
    };
    
    const handleSave = () => {
        if (!journalEntry.trim()) return;
        setIsSaving(true);
        
        const newEvent: TimelineEvent = {
            id: `journal-${Date.now()}`,
            title: shareAnonymously ? 'تامل ناشناس ثبت شد' : 'یادداشت روزانه ثبت شد',
            description: journalEntry.substring(0, 50) + '...',
            details: { entry: journalEntry },
            type: shareAnonymously ? 'reflection' : 'JOURNAL_ENTRY',
            date: new Date().toISOString(),
            userReflection: { notes: journalEntry },
            aiReflection: aiReflection,
            isSharedAnonymously: shareAnonymously,
            ...(shareAnonymously && { status: 'pending' })
        };

        dispatch({ type: 'ADD_TIMELINE_EVENT', payload: newEvent });
        
        // No need for timeout, React will re-render and hide the form
        setIsSaving(false);
    };

     const handleGenerateReport = async () => {
        if (!user || journalEntries.length < 3) return;

        if (user.reflectionAnalysesRemaining <= 0) {
            dispatch({ type: 'SHOW_REFLECTION_UNLOCK_MODAL', payload: true });
            return;
        }

        setIsLoadingReport(true);
        setReportError('');
        setHyperPersonalizedReport(null);
        try {
            const result = await getHyperPersonalizedAnalysis(user);
            setHyperPersonalizedReport(result);
            dispatch({ type: 'UPDATE_USER', payload: { hyperPersonalizedReport: result, reflectionAnalysesRemaining: user.reflectionAnalysesRemaining - 1 }});
        } catch(e) {
            setReportError(e instanceof Error ? e.message : 'خطا در تحلیل. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsLoadingReport(false);
        }
    };

    const handleJournalAnalysis = async () => {
        if (!user || journalEntries.length < 3) return;

        if (user.reflectionAnalysesRemaining <= 0) {
            dispatch({ type: 'SHOW_REFLECTION_UNLOCK_MODAL', payload: true });
            return;
        }

        setIsLoadingJournalAnalysis(true);
        setJournalAnalysisError('');
        setJournalAnalysisReport(null);
        try {
            const entriesToAnalyze = journalEntries.slice(0, 10).map(e => e.userReflection?.notes || ''); // Analyze last 10 entries
            const result = await getJournalAnalysis(entriesToAnalyze, user.meaningGoal || '');
            setJournalAnalysisReport(result);
            dispatch({ type: 'UPDATE_USER', payload: { journalAnalysisReport: result, reflectionAnalysesRemaining: user.reflectionAnalysesRemaining - 1 }});
        } catch(e) {
            setJournalAnalysisError(e instanceof Error ? e.message : 'خطا در تحلیل. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsLoadingJournalAnalysis(false);
        }
    };


    const handleAIAssist = async (mode: 'generate' | 'improve') => {
        setIsLoadingReflection(true); // Reuse loading state for spinner
        setError('');
        try {
            const response = await getAIAssistedText({
                mode: mode,
                type: 'journal_entry',
                text: journalEntry, // Used as a prompt for generation if user has typed something
                context: dailyPrompt,
            });
            setJournalEntry(response);
            setAiReflection(''); // Clear old reflection as the text has changed
        } catch (e) {
            setError("خطا در دریافت کمک هوشمند.");
        } finally {
            setIsLoadingReflection(false);
        }
    };


    if (!user) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl mb-4">برای ورود به خلوت روزانه، لطفاً ابتدا وارد شوید.</p>
                    <button onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md">
                        ورود / ثبت‌نام
                    </button>
                </div>
            </div>
        );
    }
    
    const renderSavedEntry = () => (
        <div className="bg-gray-800 p-8 rounded-lg border border-green-700/50">
            <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-400" />
                <h2 className="text-2xl font-bold">خلوت امروز شما با موفقیت ثبت شد!</h2>
            </div>
            <p className="text-center text-gray-300 mb-6">
                از اینکه برای تامل خود وقت گذاشتید سپاسگزاریم. با ثبت این یادداشت، امتیاز معنا دریافت کردید.
            </p>
            {!reminderSet ? (
                <div className="mt-4 p-4 bg-gray-700/50 rounded-lg text-center">
                    <p className="text-sm text-gray-300 mb-3">آیا مایلید ۲۴ ساعت دیگر برای ثبت یادداشت بعدی به شما یادآوری کنیم؟</p>
                    <button onClick={handleSetReminder} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-md">
                        بله، یادآوری کن
                    </button>
                </div>
            ) : (
                <div className="mt-4 p-4 bg-green-900/40 text-green-300 rounded-lg text-center">
                    <p>بسیار عالی! یادآور شما برای ۲۴ ساعت دیگر تنظیم شد.</p>
                </div>
            )}
        </div>
    );
    
    const renderJournalingSpace = () => (
        <>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
                <h2 className="text-2xl font-bold mb-4">الهام امروز</h2>
                {isLoadingPrompt ? (
                    <p className="text-gray-400">در حال دریافت الهام...</p>
                ) : (
                    <p className="text-lg text-green-300 italic">"{dailyPrompt}"</p>
                )}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold">یادداشت شما</h2>
                    <button 
                        type="button" 
                        onClick={() => handleAIAssist(journalEntry ? 'improve' : 'generate')} 
                        disabled={isLoadingReflection} 
                        className="flex items-center gap-1 text-xs py-1 px-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white disabled:bg-gray-500" title="کمک گرفتن از هوش مصنوعی">
                        <SparklesIcon className="w-4 h-4"/>
                        <span>{journalEntry ? 'بهبود با AI' : 'کمک از AI'}</span>
                    </button>
                </div>
                <textarea
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    rows={8}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                    placeholder="افکار و احساسات خود را اینجا بنویسید..."
                />

                <div className="mt-4">
                    <label className="flex items-center text-sm text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={shareAnonymously}
                            onChange={(e) => setShareAnonymously(e.target.checked)}
                            className="ml-2 h-4 w-4 rounded bg-gray-600 border-gray-500 text-green-500 focus:ring-green-500"
                        />
                        اشتراک‌گذاری به صورت ناشناس در چاه معنا (برای پیش‌نیاز کوچینگ)
                    </label>
                </div>
                
                {aiReflection && (
                    <div className="mt-4 p-4 bg-blue-900/20 border-l-4 border-blue-500 text-blue-200 rounded">
                        <p className="font-semibold">بازخورد همسفر هوشمند:</p>
                        <p className="italic">"{aiReflection}"</p>
                    </div>
                )}

                <div className="mt-6 flex flex-col sm:flex-row justify-end items-center gap-4">
                     <button onClick={handleGetReflection} disabled={isLoadingReflection || !journalEntry.trim() || !!aiReflection} className="flex items-center gap-2 text-sm py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                        <SparklesIcon className="w-5 h-5" />
                        <span>دریافت بازخورد هوشمند</span>
                    </button>
                    <button onClick={handleSave} disabled={isSaving || !journalEntry.trim()} className="flex items-center gap-2 text-sm py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                        <PaperAirplaneIcon className="w-5 h-5"/>
                        <span>{isSaving ? 'در حال ثبت...' : 'ثبت در گاهشمار'}</span>
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <header className="text-center mb-12">
                     <div className="inline-block p-4 bg-gray-800 rounded-full mb-4 border-2 border-green-700/50">
                        <BookOpenIcon className="w-12 h-12 text-green-400" />
                    </div>
                    <h1 className="text-5xl font-bold mb-4">{user.name ? `خلوت روزانه ${user.name}` : 'خلوت روزانه'}</h1>
                    <p className="text-lg text-gray-400">
                        فضایی برای درنگ، نوشتن و گفتگو با خود. امروز چه چیزی در قلبت می‌گذرد؟
                    </p>
                </header>
                
                {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                
                {todaysEntry ? renderSavedEntry() : renderJournalingSpace()}

                
                <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Smart Mirror */}
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="w-6 h-6 text-blue-400" />
                            <h2 className="text-2xl font-bold">آینه هوشمند تاملات</h2>
                        </div>
                        <p className="text-sm text-gray-400 mt-2 mb-4">این ابزار با تحلیل داده‌های سفر شما، یک گزارش شخصی برای راهنمایی شما ارائه می‌دهد.</p>
                        
                        {journalEntries.length < 3 ? (
                            <div className="text-center p-4 bg-gray-700/50 rounded-md"><p className="text-sm text-gray-400">برای استفاده، حداقل ۳ یادداشت ثبت کنید.</p></div>
                        ) : (
                            <button onClick={handleGenerateReport} disabled={isLoadingReport} className="flex items-center gap-2 text-sm py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                                {isLoadingReport ? 'در حال تحلیل...' : 'رونمایی از آینه هوشمند'}
                            </button>
                        )}
                        <p className="text-xs text-gray-500 mt-2">تعداد تحلیل باقی‌مانده: {user.reflectionAnalysesRemaining.toLocaleString('fa-IR')}</p>
                        
                        {isLoadingReport && <div className="mt-4 text-center text-gray-400"><p>در حال تامل بر روی سفر شما...</p></div>}
                        {reportError && <p className="text-red-400 text-sm mt-3">{reportError}</p>}
                        {hyperPersonalizedReport && (
                            <div className="mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600 space-y-4">
                                <div className="text-center"><h3 className="font-semibold text-blue-300">ارزش کلیدی شما:</h3><p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-green-300">{hyperPersonalizedReport.coreValue}</p></div>
                                <div><h3 className="font-semibold text-blue-300">بینش هوشمند:</h3><p className="text-sm italic text-gray-300">"{hyperPersonalizedReport.currentFocus}"</p></div>
                                <div className="pt-3 border-t border-gray-600"><h3 className="font-semibold text-blue-300">ماموریت پیشنهادی:</h3><div className="bg-green-900/40 p-3 rounded-lg mt-2"><h4 className="font-bold text-white">{hyperPersonalizedReport.suggestedMission.title}</h4><p className="text-xs text-gray-300 mt-1">{hyperPersonalizedReport.suggestedMission.description}</p></div></div>
                            </div>
                        )}
                    </div>
                    {/* Journal Analysis */}
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="w-6 h-6 text-indigo-400" />
                            <h2 className="text-2xl font-bold">تحلیل هوشمند تاملات</h2>
                        </div>
                        <p className="text-sm text-gray-400 mt-2 mb-4">با تحلیل عمیق‌تر یادداشت‌های اخیر خود، الگوهای فکری و احساسی پنهان را کشف کنید.</p>
                        
                        {journalEntries.length < 3 ? (
                            <div className="text-center p-4 bg-gray-700/50 rounded-md"><p className="text-sm text-gray-400">برای استفاده، حداقل ۳ یادداشت ثبت کنید.</p></div>
                        ) : (
                            <button onClick={handleJournalAnalysis} disabled={isLoadingJournalAnalysis} className="flex items-center gap-2 text-sm py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                                {isLoadingJournalAnalysis ? 'در حال تحلیل...' : 'شروع تحلیل عمیق'}
                            </button>
                        )}
                         <p className="text-xs text-gray-500 mt-2">تعداد تحلیل باقی‌مانده: {user.reflectionAnalysesRemaining.toLocaleString('fa-IR')}</p>
                        
                        {isLoadingJournalAnalysis && <div className="mt-4 text-center text-gray-400"><p>در حال کاوش در نوشته‌های شما...</p></div>}
                        {journalAnalysisError && <p className="text-red-400 text-sm mt-3">{journalAnalysisError}</p>}
                        {journalAnalysisReport && (
                            <div className="mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600 space-y-4">
                                <div><h4 className="font-semibold text-indigo-300 mb-2">الگوهای فکری:</h4><ul className="list-disc list-inside space-y-1 text-sm text-gray-300">{journalAnalysisReport.thoughtPatterns.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
                                <div><h4 className="font-semibold text-indigo-300 mb-2">احساسات تکرارشونده:</h4><div className="flex flex-wrap gap-2">{journalAnalysisReport.recurringEmotions.map((e, i) => <span key={i} className="bg-gray-600 text-xs px-2 py-1 rounded-full">{e}</span>)}</div></div>
                                <div><h4 className="font-semibold text-indigo-300 mb-2">ارتباط با هدف اصلی:</h4><p className="text-sm italic text-gray-300">"{journalAnalysisReport.goalConnection}"</p></div>
                            </div>
                        )}
                    </div>
                </section>
                
            </div>
        </div>
    );
};

export default DailyOasisView;