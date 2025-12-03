import React, { useState } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View, IkigaiReport, PointLog } from '../types';
import { getIkigaiAnalysis } from '../services/geminiService';
import { SparklesIcon, ArrowLeftIcon, FlagIcon } from './icons';

const IkigaiTestView: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState({ passion: '', vocation: '', mission: '', profession: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<IkigaiReport | null>(null);

    const steps = [
        { key: 'passion', title: 'آنچه دوست دارید', question: 'چه کارهایی را انجام می‌دهید که گذر زمان را حس نمی‌کنید؟ به چه موضوعاتی عمیقاً علاقه دارید؟' },
        { key: 'vocation', title: 'آنچه در آن خوب هستید', question: 'چه مهارت‌ها و استعدادهایی دارید؟ دیگران شما را در چه زمینه‌هایی تحسین می‌کنند؟' },
        { key: 'mission', title: 'آنچه دنیا به آن نیاز دارد', question: 'چه مشکلی در دنیا یا جامعه شما وجود دارد که دوست دارید در حل آن سهیم باشید؟' },
        { key: 'profession', title: 'آنچه برایش پول دریافت می‌کنید', question: 'برای چه مهارت‌ها یا خدماتی می‌توانید از دیگران پول دریافت کنید یا در حال حاضر دریافت می‌کنید؟' },
    ];
    
    const currentStep = steps[step - 1];
    const progress = (step / steps.length) * 100;

    const handleNext = () => {
        if (step < steps.length) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrev = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAnswers(prev => ({ ...prev, [currentStep.key]: e.target.value }));
    };

    const handleSubmit = async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await getIkigaiAnalysis(answers, user);
            setReport(result);

            const pointsToAdd = 400;
            const newManaPoints = (user.manaPoints || 0) + pointsToAdd;
            
            const newPointLog: PointLog = {
                action: 'تکمیل قطب‌نمای ایکیگای',
                points: pointsToAdd,
                type: 'mana',
                date: new Date().toISOString()
            };

            const updatedUser = {
                ...user,
                ikigaiReport: result,
                manaPoints: newManaPoints,
                pointsHistory: [newPointLog, ...(user.pointsHistory || [])]
            };
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            dispatch({ type: 'SHOW_POINTS_TOAST', payload: { points: pointsToAdd, action: 'تکمیل ایکیگای' } });

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
                <FlagIcon className="w-16 h-16 text-yellow-300 animate-pulse mb-4" />
                <h2 className="text-2xl font-bold">در حال تنظیم قطب‌نمای شما...</h2>
                <p className="text-gray-400 mt-2">هوش مصنوعی در حال یافتن نقطه تلاقی شور، مهارت، نیاز و حرفه شماست.</p>
            </div>
        );
    }
    
    if (report) {
        return (
             <div className="min-h-screen bg-gray-900 text-white pt-22 pb-24">
                <div className="container mx-auto px-6 py-12 max-w-3xl">
                    <h1 className="text-4xl font-bold text-center mb-4 text-green-300">گزارش قطب‌نمای ایکیگای شما</h1>
                     <div className="bg-gray-800 p-8 rounded-lg mt-8 border border-gray-700">
                        <h2 className="text-2xl font-bold text-center mb-6">بیانیه ایکیگای شما:</h2>
                        <p className="text-lg text-gray-200 leading-relaxed italic text-center bg-gray-700/50 p-4 rounded-lg mb-6">"{report.statement}"</p>
                        
                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <h3 className="text-xl font-semibold mb-3 text-blue-400">تحلیل:</h3>
                            <p className="text-gray-300">"{report.analysis}"</p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-700">
                             <h3 className="text-xl font-semibold mb-3 text-yellow-400">اقدامات عملی پیشنهادی:</h3>
                             <div className="space-y-4">
                                <div className="bg-gray-700/50 p-3 rounded-lg"><h4 className="font-bold">پروژه هم‌آفرینی: {report.actionSteps.project.title}</h4><p className="text-sm text-gray-300 mt-1">{report.actionSteps.project.description}</p></div>
                                <div className="bg-gray-700/50 p-3 rounded-lg"><h4 className="font-bold">دوره آموزشی: {report.actionSteps.course.title}</h4><p className="text-sm text-gray-300 mt-1">{report.actionSteps.course.description}</p></div>
                                <div className="bg-gray-700/50 p-3 rounded-lg"><h4 className="font-bold">نیت کاشت نخل: {report.actionSteps.deed.intention}</h4><p className="text-sm text-gray-300 mt-1">{report.actionSteps.deed.description}</p></div>
                             </div>
                        </div>
                    </div>
                    <div className="text-center mt-8">
                        <button onClick={() => dispatch({type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: 'ikigai_report'})} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full">
                            بازگشت به پروفایل
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="mb-4">
                    <p className="text-sm text-gray-400 text-center">مرحله {step} از {steps.length}: {currentStep.title}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <div className="bg-gray-800 p-8 rounded-lg text-center">
                    <h2 className="text-2xl font-semibold mb-6">{currentStep.question}</h2>
                    <textarea
                        value={answers[currentStep.key as keyof typeof answers]}
                        onChange={handleChange}
                        rows={6}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="پاسخ خود را اینجا بنویسید..."
                    />
                     {error && <p className="text-red-400 mt-4">{error}</p>}
                </div>
                 <div className="mt-6 flex justify-between items-center">
                    <button onClick={handlePrev} disabled={step === 1} className="py-2 px-4 text-sm rounded-md font-semibold transition-colors bg-gray-600 hover:bg-gray-500 disabled:opacity-50">قبلی</button>
                    <button onClick={handleNext} className="py-2 px-6 text-sm rounded-md font-semibold transition-colors bg-green-600 hover:bg-green-700 text-white">
                        {step === steps.length ? 'تحلیل و دریافت ایکیگای' : 'بعدی'}
                    </button>
                </div>
                 <button onClick={() => dispatch({type: 'SET_VIEW', payload: View.HerosJourney})} className="text-sm text-gray-400 hover:text-white mt-6 flex items-center gap-2 mx-auto">
                    <ArrowLeftIcon />
                    بازگشت به سفر قهرمانی
                </button>
            </div>
        </div>
    );
};

export default IkigaiTestView;