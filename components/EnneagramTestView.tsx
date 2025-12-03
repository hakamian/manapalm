import React, { useState } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View, EnneagramReport, PointLog } from '../types';
import { getEnneagramAnalysis } from '../services/geminiService';
import { SparklesIcon, ArrowLeftIcon, CompassIcon } from './icons';

const questionPairs = [
  { id: 'q1', a: 'من تمایل دارم منطقی و عینی باشم.', b: 'من تمایل دارم احساسی و شخصی باشم.' },
  { id: 'q2', a: 'من به دنبال امنیت و اطمینان هستم.', b: 'من به دنبال هیجان و تجربه‌های جدید هستم.' },
  { id: 'q3', a: 'برای من مهم است که مفید و مورد نیاز دیگران باشم.', b: 'برای من مهم است که مستقل و خودکفا باشم.' },
  { id: 'q4', a: 'من اغلب احساساتم را برای خودم نگه می‌دارم.', b: 'من اغلب احساساتم را به راحتی بروز می‌دهم.' },
  { id: 'q5', a: 'من از رویارویی و تعارض اجتناب می‌کنم.', b: 'من در صورت لزوم با تعارض روبرو می‌شوم.' },
  { id: 'q6', a: 'من تمایل دارم کارها را به روش صحیح و درست انجام دهم.', b: 'من تمایل دارم کارها را به روشی انجام دهم که برای همه خوشایند باشد.' },
  { id: 'q7', a: 'من به آینده خوش‌بین هستم و روی احتمالات تمرکز می‌کنم.', b: 'من واقع‌بین هستم و برای بدترین سناریوها آماده می‌شوم.' },
  { id: 'q8', a: 'من دوست دارم کنترل اوضاع را در دست داشته باشم.', b: 'من ترجیح می‌دهم با جریان زندگی پیش بروم.' },
  { id: 'q9', a: 'من به دنبال درک عمیق دنیا و جایگاه خود در آن هستم.', b: 'من به دنبال ایجاد تاثیر و دستیابی به موفقیت هستم.' },
  { id: 'q10', a: 'برای من مهم است که منحصر به فرد و اصیل باشم.', b: 'برای من مهم است که بخشی از یک گروه یا جامعه باشم.' },
];


const EnneagramTestView: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, 'a' | 'b'>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<EnneagramReport | null>(null);

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
            const result = await getEnneagramAnalysis(finalAnswers, user);
            setReport(result);

            const pointsToAdd = 300;
            const newManaPoints = (user.manaPoints || 0) + pointsToAdd;
            
            const newPointLog: PointLog = {
                action: 'تکمیل آزمون نقشه روان (انیاگرام)',
                points: pointsToAdd,
                type: 'mana',
                date: new Date().toISOString()
            };

            const updatedUser = {
                ...user,
                enneagramReport: result,
                manaPoints: newManaPoints,
                pointsHistory: [newPointLog, ...(user.pointsHistory || [])]
            };
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            dispatch({ type: 'SHOW_POINTS_TOAST', payload: { points: pointsToAdd, action: 'تکمیل آزمون انیاگرام' } });

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
                <CompassIcon className="w-16 h-16 text-yellow-300 animate-spin mb-4" />
                <h2 className="text-2xl font-bold">در حال ترسیم نقشه روان شما...</h2>
                <p className="text-gray-400 mt-2">هوش مصنوعی در حال تحلیل عمیق انگیزه‌های شماست.</p>
            </div>
        );
    }
    
    if (report) {
        return (
             <div className="min-h-screen bg-gray-900 text-white pt-22 pb-24">
                <div className="container mx-auto px-6 py-12 max-w-3xl">
                    <h1 className="text-4xl font-bold text-center mb-4 text-green-300">گزارش نقشه روان انیاگرام شما</h1>
                     <div className="bg-gray-800 p-8 rounded-lg mt-8 border border-gray-700">
                        <h2 className="text-3xl font-bold text-center mb-2">تیپ {report.typeNumber} بال {report.wing}: {report.typeName}</h2>
                        <p className="text-lg text-gray-300 leading-relaxed italic text-center mb-8">"{report.analysis}"</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 text-center">
                            <div className="bg-gray-700/50 p-4 rounded-lg"><h3 className="text-xl font-semibold mb-2 text-green-400">انگیزه اصلی</h3><p>{report.coreMotivation}</p></div>
                            <div className="bg-gray-700/50 p-4 rounded-lg"><h3 className="text-xl font-semibold mb-2 text-red-400">ترس بنیادین</h3><p>{report.coreFear}</p></div>
                            <div className="bg-gray-700/50 p-4 rounded-lg"><h3 className="text-xl font-semibold mb-2 text-blue-400">مسیر رشد (یکپارچگی)</h3><p>{report.growthPath}</p></div>
                            <div className="bg-gray-700/50 p-4 rounded-lg"><h3 className="text-xl font-semibold mb-2 text-yellow-400">مسیر استرس (فروپاشی)</h3><p>{report.stressPath}</p></div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-700"><h3 className="text-xl font-semibold mb-3 text-indigo-400">ماموریت پیشنهادی:</h3><div className="bg-gray-700/50 p-4 rounded-lg"><h4 className="font-bold">{report.suggestedMission.title}</h4><p className="text-sm text-gray-300 mt-1">{report.suggestedMission.description}</p></div></div>
                    </div>
                    <div className="text-center mt-8">
                        <button onClick={() => dispatch({type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: 'enneagram_report'})} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full">
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

export default EnneagramTestView;