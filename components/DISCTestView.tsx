import React, { useState } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View, DISCReport, PointLog } from '../types';
import { getDISCAnalysis } from '../services/geminiService';
import { SparklesIcon, ArrowLeftIcon } from './icons';
import { getLevelForPoints } from '../services/gamificationService';

const questions = [
  { id: 'q1', text: 'وقتی با یک چالش بزرگ روبرو می‌شوم، من معمولاً...' },
  { id: 'q2', text: 'در یک جمع دوستانه، من بیشتر...' },
  { id: 'q3', text: 'وقتی نیاز به تصمیم‌گیری سریع دارم، من...' },
  { id: 'q4', text: 'همکارانم مرا به عنوان فردی ... توصیف می‌کنند.' },
  { id: 'q5', text: 'مهم‌ترین چیز برای من در محیط کار این است که...' },
  { id: 'q6', text: 'وقتی با یک تغییر ناگهانی مواجه می‌شوم، اولین واکنش من...' },
  { id: 'q7', text: 'در یک پروژه گروهی، من ترجیح می‌دهم نقش ... را داشته باشم.' },
  { id: 'q8', text: 'بزرگترین ترس من در یک محیط حرفه‌ای ... است.' },
  { id: 'q9', text: 'برای من، یک روز کاری ایده‌آل روزی است که...' },
  { id: 'q10', text: 'وقتی کسی با من مخالفت می‌کند، من...' },
];

// FIX: Define option texts to be passed to the handler instead of just the option number.
const optionTexts = [
    'مستقیم به سراغ راه‌حل می‌روم و مسئولیت را به عهده می‌گیرم.',
    'با دیگران صحبت می‌کنم تا ایده‌ها و حمایتشان را جلب کنم.',
    'با آرامش و به صورت مرحله به مرحله، یک برنامه پایدار طراحی می‌کنم.',
    'ابتدا تمام داده‌ها و جزئیات را برای پیدا کردن بهترین و دقیق‌ترین راه‌حل تحلیل می‌کنم.'
];

const DISCTestView: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<DISCReport | null>(null);

    const handleAnswer = (answer: string) => {
        const newAnswers = { ...answers, [questions[currentQuestionIndex].id]: answer };
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleSubmit(newAnswers);
        }
    };

    const handleSubmit = async (finalAnswers: Record<string, string>) => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await getDISCAnalysis(finalAnswers, user);
            setReport(result);

            // Award points and update user profile
            const pointsToAdd = 250;
            const newManaPoints = (user.manaPoints || 0) + pointsToAdd;
            
            const newPointLog: PointLog = {
                action: 'تکمیل آزمون آینه رفتارشناسی (DISC)',
                points: pointsToAdd,
                type: 'mana',
                date: new Date().toISOString()
            };

            const updatedUser = {
                ...user,
                discReport: result,
                manaPoints: newManaPoints,
                pointsHistory: [newPointLog, ...(user.pointsHistory || [])]
            };
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            dispatch({ type: 'SHOW_POINTS_TOAST', payload: { points: pointsToAdd, action: 'تکمیل آزمون DISC' } });

        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "خطا در تحلیل پاسخ‌ها. لطفاً دوباره تلاش کنید.");
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!user) return null; // Or show login prompt

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center text-center p-4">
                <SparklesIcon className="w-16 h-16 text-yellow-300 animate-pulse mb-4" />
                <h2 className="text-2xl font-bold">در حال تحلیل شخصیت شما...</h2>
                <p className="text-gray-400 mt-2">آینه در حال شفاف شدن است. لطفاً کمی صبر کنید.</p>
            </div>
        );
    }
    
    if (report) {
        return (
             <div className="min-h-screen bg-gray-900 text-white pt-22 pb-24">
                <div className="container mx-auto px-6 py-12 max-w-3xl">
                    <h1 className="text-4xl font-bold text-center mb-4 text-green-300">گزارش آینه رفتارشناسی شما</h1>
                     <div className="bg-gray-800 p-8 rounded-lg mt-8 border border-gray-700">
                        <h2 className="text-3xl font-bold text-center mb-6">سبک غالب شما: {report.styleName}</h2>
                        <p className="text-lg text-gray-300 leading-relaxed italic text-center mb-6">"{report.analysis}"</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-green-400">نقاط قوت کلیدی:</h3>
                                <ul className="list-disc list-inside space-y-2 text-gray-200">
                                    {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-yellow-400">زمینه‌های رشد:</h3>
                                <ul className="list-disc list-inside space-y-2 text-gray-200">
                                    {report.growthAreas.map((g, i) => <li key={i}>{g}</li>)}
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-700">
                             <h3 className="text-xl font-semibold mb-3 text-blue-400">ماموریت پیشنهادی برای شما:</h3>
                             <div className="bg-gray-700/50 p-4 rounded-lg">
                                 <h4 className="font-bold text-lg">{report.suggestedMission.title}</h4>
                                <p className="text-sm text-gray-300 mt-1">{report.suggestedMission.description}</p>
                             </div>
                        </div>
                    </div>
                    <div className="text-center mt-8">
                        <button onClick={() => dispatch({type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: 'disc_report'})} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full">
                            بازگشت به پروفایل
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="mb-4">
                    <p className="text-sm text-gray-400 text-center">سوال {currentQuestionIndex + 1} از {questions.length}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <div className="bg-gray-800 p-8 rounded-lg text-center">
                    <h2 className="text-2xl font-semibold mb-8 h-16">{currentQuestion.text}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => handleAnswer(optionTexts[0])} className="p-4 bg-gray-700 hover:bg-green-800 rounded-lg transition-colors">گزینه ۱: {optionTexts[0]}</button>
                        <button onClick={() => handleAnswer(optionTexts[1])} className="p-4 bg-gray-700 hover:bg-green-800 rounded-lg transition-colors">گزینه ۲: {optionTexts[1]}</button>
                        <button onClick={() => handleAnswer(optionTexts[2])} className="p-4 bg-gray-700 hover:bg-green-800 rounded-lg transition-colors">گزینه ۳: {optionTexts[2]}</button>
                        <button onClick={() => handleAnswer(optionTexts[3])} className="p-4 bg-gray-700 hover:bg-green-800 rounded-lg transition-colors">گزینه ۴: {optionTexts[3]}</button>
                    </div>
                     {error && <p className="text-red-400 mt-4">{error}</p>}
                </div>
                 <button onClick={() => dispatch({type: 'SET_VIEW', payload: View.HerosJourney})} className="text-sm text-gray-400 hover:text-white mt-6 flex items-center gap-2 mx-auto">
                    <ArrowLeftIcon />
                    بازگشت به سفر قهرمانی
                </button>
            </div>
        </div>
    );
};

export default DISCTestView;