import React, { useState, useEffect } from 'react';
// FIX: MeaningCompassAnalysis is imported from types.ts, not geminiService.ts
import { User, View, MeaningCompassAnalysis } from '../types';
import { useAppDispatch, useAppState } from '../AppContext';
import { getMeaningCompassAnalysis } from '../services/geminiService';
import { CompassIcon, SparklesIcon, ArrowPathIcon, ArrowLeftIcon } from './icons';

interface MeaningCompassProps {
    user: User;
}

const MeaningCompass: React.FC<MeaningCompassProps> = ({ user }) => {
    const dispatch = useAppDispatch();
    const { appSettings } = useAppState();
    const [analysis, setAnalysis] = useState<MeaningCompassAnalysis | null>(user.meaningCompassAnalysis);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const chatHistory = user.meaningCoachHistory || [];
    const ANALYSIS_THRESHOLD_SECONDS = 10 * 60; // 600 seconds
    const duration = user.compassChatDuration || 0;

    const handleAnalysis = async () => {
        if (chatHistory.length < 2) {
            setError("برای تحلیل، به گفتگوی بیشتری نیاز است.");
            return;
        };
        setIsLoading(true);
        setError(null);
        try {
            const result = await getMeaningCompassAnalysis(chatHistory);
            setAnalysis(result); // Update local state for immediate UI change
            dispatch({
                type: 'UPDATE_USER',
                payload: { ...user, meaningCompassAnalysis: result }
            });
        } catch (e) {
            console.error("Meaning Compass analysis failed:", e);
            setError("خطا در تحلیل گفتگو. لطفاً دوباره تلاش کنید.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNavigate = (view: View) => {
        dispatch({ type: 'SET_VIEW', payload: view });
    };

    if (!user.hasUnlockedCompass) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg text-center border-2 border-dashed border-gray-600 mb-8 relative overflow-hidden">
                <div className="absolute inset-0 blur-sm p-6" aria-hidden="true">
                    <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                        <CompassIcon className="w-7 h-7 text-green-400" />
                        قطب‌نمای معنای شما
                    </h3>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-3 text-gray-500">ارزش‌های کلیدی شما:</h4>
                            <div className="flex flex-wrap gap-2 justify-center">
                                <span className="bg-gray-700 text-gray-500 text-sm font-semibold px-3 py-1 rounded-full">...</span>
                                <span className="bg-gray-700 text-gray-500 text-sm font-semibold px-3 py-1 rounded-full">...</span>
                                <span className="bg-gray-700 text-gray-500 text-sm font-semibold px-3 py-1 rounded-full">...</span>
                            </div>
                        </div>
                        <div className="bg-green-900/10 border border-green-700/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-800/50 flex items-center justify-center gap-2"><SparklesIcon className="w-5 h-5" /> قدم بعدی پیشنهادی</h4>
                            <p className="text-lg font-bold text-gray-500 mt-2">...</p>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 bg-black/40 backdrop-blur-md -m-6 p-6 rounded-lg flex flex-col items-center justify-center min-h-[340px]">
                    <div className="w-full max-w-md">
                        <h3 className="text-xl font-bold text-white">قطب‌نمای معنای شما قفل است</h3>
                        <p className="text-gray-300 mt-2 leading-relaxed">این یک قابلیت ویژه است که با تحلیل گفتگوهای شما، مسیرهای شخصی‌سازی شده را به شما پیشنهاد می‌دهد.</p>
                        <div className="my-4 font-semibold text-amber-300 bg-amber-900/30 border border-amber-700/50 rounded-md px-4 py-2 inline-block">
                            ارزش: {appSettings.meaningCompassPrice.toLocaleString('fa-IR')} تومان
                        </div>
                        <p className="text-gray-300 mb-6 leading-relaxed">به جای پرداخت، قفل آن را با شروع یک گفتگوی عمیق و رایگان باز کنید.</p>
                        <button 
                            onClick={() => handleNavigate(View.CompassUnlockChat)} 
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-md transition-colors flex items-center gap-2 mx-auto"
                        >
                            <SparklesIcon className="w-5 h-5"/>
                            فعال‌سازی با گفتگو
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    if (analysis) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <CompassIcon className="w-7 h-7 text-green-400" />
                            قطب‌نمای معنای شما
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">بر اساس گفتگوهای شما با مربی معنا</p>
                    </div>
                    <button onClick={handleAnalysis} disabled={isLoading} className="p-2 rounded-full hover:bg-gray-700 text-gray-400 disabled:opacity-50" title="تحلیل مجدد">
                        <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                 <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold mb-3">ارزش‌های کلیدی شما:</h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.themes.map((theme, i) => (
                                <span key={i} className="bg-gray-700 text-gray-200 text-sm font-semibold px-3 py-1 rounded-full">{theme}</span>
                            ))}
                        </div>
                    </div>
                    <div className="bg-green-900/40 border border-green-700 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-300 flex items-center gap-2"><SparklesIcon className="w-5 h-5" /> قدم بعدی پیشنهادی</h4>
                        <p className="text-lg font-bold text-white mt-2">{analysis.suggestion.title}</p>
                        <p className="text-sm text-gray-300 mt-1">{analysis.suggestion.description}</p>
                        <button 
                            onClick={() => handleNavigate(analysis.suggestion.view)}
                            className="mt-4 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-1"
                        >
                            <span>{analysis.suggestion.cta}</span>
                            <ArrowLeftIcon className="w-4 h-4" />
                        </button>
                    </div>
                 </div>
                 {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
            </div>
        );
    }

    if (duration >= ANALYSIS_THRESHOLD_SECONDS) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8 text-center">
                <h3 className="text-xl font-bold text-white">قطب‌نمای شما آماده تحلیل است</h3>
                <p className="text-gray-300 my-4">شما به اندازه کافی با مربی معنا گفتگو کرده‌اید. برای دریافت ارزش‌های کلیدی و قدم بعدی پیشنهادی، تحلیل را شروع کنید.</p>
                <button onClick={handleAnalysis} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-md transition-colors flex items-center gap-2 mx-auto disabled:bg-gray-600">
                    <SparklesIcon className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`}/>
                    {isLoading ? 'در حال تحلیل...' : 'تحلیل گفتگو'}
                </button>
                {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
            </div>
        );
    }

    // Default case: not enough time chatted
    const remainingSeconds = ANALYSIS_THRESHOLD_SECONDS - duration;
    const remainingMinutes = Math.ceil(remainingSeconds / 60);

    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CompassIcon className="w-7 h-7 text-green-400" />
                قطب‌نمای معنای شما
            </h3>
            <p className="text-gray-300 mt-4">برای فعال‌سازی تحلیل هوشمند، باید حداقل ۱۰ دقیقه با مربی معنا گفتگو کنید.</p>
            <p className="font-semibold text-yellow-300 mt-2">
                زمان باقیمانده برای تحلیل: حدود {remainingMinutes.toLocaleString('fa-IR')} دقیقه
            </p>
            <button onClick={() => handleNavigate(View.CompassUnlockChat)} className="mt-4 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-1">
                <span>ادامه گفتگو</span>
                <ArrowLeftIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export default MeaningCompass;
