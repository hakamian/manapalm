import React, { useState } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View, StrengthsReport, PointLog } from '../types';
import { getStrengthsAnalysis } from '../services/geminiService';
import { SparklesIcon, ArrowLeftIcon, TrophyIcon } from './icons';

const questionPairs = [
  { id: 'q1', a: 'من ترجیح می‌دهم روی یک کار تمرکز کنم تا آن را به بهترین شکل انجام دهم.', b: 'من از مدیریت همزمان چندین کار و پروژه لذت می‌برم.' },
  { id: 'q2', a: 'من به طور طبیعی می‌توانم احساسات دیگران را درک کنم و با آن‌ها همدلی کنم.', b: 'من بیشتر بر اساس منطق و تحلیل عینی تصمیم‌گیری می‌کنم.' },
  { id: 'q3', a: 'من دوست دارم مسئولیت را به عهده بگیرم و دیگران را رهبری کنم.', b: 'من ترجیح می‌دهم به عنوان یک عضو قابل اعتماد در تیم کار کنم.' },
  { id: 'q4', a: 'من همیشه به دنبال پیدا کردن راه‌های بهتر و کارآمدتر برای انجام کارها هستم.', b: 'من به روش‌های آزمایش شده و قابل اعتماد پایبند هستم.' },
  { id: 'q5', a: 'من از رقابت و تلاش برای برنده شدن انرژی می‌گیرم.', b: 'من از همکاری و دستیابی به یک هدف مشترک لذت می‌برم.' },
  { id: 'q6', a: 'من به راحتی می‌توانم با افراد جدید ارتباط برقرار کنم و شبکه بسازم.', b: 'من روابط عمیق و نزدیک با تعداد کمی از دوستان را ترجیح می‌دهم.' },
  { id: 'q7', a: 'من به طور طبیعی به آینده و احتمالات آن فکر می‌کنم.', b: 'من بیشتر روی زمان حال و وظایف فعلی تمرکز دارم.' },
  { id: 'q8', a: 'برای من مهم است که در کاری که انجام می‌دهم متخصص و آگاه باشم.', b: 'برای من مهم است که ایده‌هایم شنیده شود و تاثیرگذار باشم.' },
  { id: 'q9', a: 'من نظم و ترتیب را دوست دارم و برای همه چیز برنامه‌ریزی می‌کنم.', b: 'من با انعطاف‌پذیری و سازگاری با شرایط پیش‌بینی نشده راحت‌ترم.' },
  { id: 'q10', a: 'من باور دارم که هر فردی منحصر به فرد است و باید با او به طور خاص رفتار کرد.', b: 'من باور دارم که با همه باید به طور یکسان و منصفانه رفتار کرد.' },
];


const StrengthsTestView: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, 'a' | 'b'>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<StrengthsReport | null>(null);

    const handleAnswer = (answer: 'a' | 'b') => {
        const newAnswers = { ...answers, [questionPairs[currentQuestionIndex].id]: answer };
        setAnswers(newAnswers);

        if (currentQuestionIndex < questionPairs.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleSubmit(newAnswers);
        }
    };

    const handleSubmit = async (finalAnswers: Record<string, 'a' | 'b'>) => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await getStrengthsAnalysis(finalAnswers, user);
            setReport(result);

            const pointsToAdd = 350;
            const newManaPoints = (user.manaPoints || 0) + pointsToAdd;
            
            const newPointLog: PointLog = {
                action: 'تکمیل آزمون چشمه استعدادها',
                points: pointsToAdd,
                type: 'mana',
                date: new Date().toISOString()
            };

            const updatedUser = {
                ...user,
                strengthsReport: result,
                manaPoints: newManaPoints,
                pointsHistory: [newPointLog, ...(user.pointsHistory || [])]
            };
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            dispatch({ type: 'SHOW_POINTS_TOAST', payload: { points: pointsToAdd, action: 'تکمیل آزمون استعدادها' } });

        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "خطا در تحلیل پاسخ‌ها. لطفاً دوباره تلاش کنید.");
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!user) return null;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center text-center p-4">
                <TrophyIcon className="w-16 h-16 text-yellow-300 animate-pulse mb-4" />
                <h2 className="text-2xl font-bold">در حال کشف استعدادهای شما...</h2>
                <p className="text-gray-400 mt-2">هوش مصنوعی در حال تحلیل نقاط قوت منحصر به فرد شماست.</p>
            </div>
        );
    }
    
    if (report) {
        return (
             <div className="min-h-screen bg-gray-900 text-white pt-22 pb-24">
                <div className="container mx-auto px-6 py-12 max-w-3xl">
                    <h1 className="text-4xl font-bold text-center mb-4 text-green-300">گزارش چشمه استعدادهای شما</h1>
                     <div className="bg-gray-800 p-8 rounded-lg mt-8 border border-gray-700">
                        <h2 className="text-3xl font-bold text-center mb-6">۵ استعداد برتر شما:</h2>
                        <div className="space-y-4">
                            {report.topStrengths.map((s, i) => (
                                <div key={i} className="bg-gray-700/50 p-3 rounded-lg">
                                    <h3 className="font-bold text-lg">{s.name}</h3>
                                    <p className="text-sm text-gray-300 mt-1">{s.description}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <h3 className="text-xl font-semibold mb-3 text-blue-400">روایت استعداد شما:</h3>
                            <p className="italic text-gray-300">"{report.narrative}"</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-700">
                             <h3 className="text-xl font-semibold mb-3 text-yellow-400">نقشه راه شما:</h3>
                             <p className="text-gray-300 whitespace-pre-wrap">{report.roadmap}</p>
                        </div>
                    </div>
                    <div className="text-center mt-8">
                        <button onClick={() => dispatch({type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: 'strengths_report'})} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full">
                            بازگشت به پروفایل
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questionPairs[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questionPairs.length) * 100;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                <div className="mb-4">
                    <p className="text-sm text-gray-400 text-center">سوال {currentQuestionIndex + 1} از {questionPairs.length}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <div className="bg-gray-800 p-8 rounded-lg text-center">
                    <h2 className="text-2xl font-semibold mb-8">کدام عبارت شما را بهتر توصیف می‌کند؟</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => handleAnswer('a')} className="p-6 bg-gray-700 hover:bg-green-800 rounded-lg transition-colors text-lg h-32 flex items-center justify-center">
                            {currentQuestion.a}
                        </button>
                        <button onClick={() => handleAnswer('b')} className="p-6 bg-gray-700 hover:bg-green-800 rounded-lg transition-colors text-lg h-32 flex items-center justify-center">
                            {currentQuestion.b}
                        </button>
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

export default StrengthsTestView;