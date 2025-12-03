
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { User } from '../types.ts';
import { getUserLevel } from '../utils/gamification.ts';
import { CheckIcon, AcademicCapIcon, AwardIcon, BookOpenIcon, HeartIcon, SparklesIcon } from './icons.tsx';

interface ScholarshipPageProps {
    user: User;
    onApply: () => void;
}

const ScholarshipPage: React.FC<ScholarshipPageProps> = ({ user, onApply }) => {
    const [statement, setStatement] = useState('');
    const [isImproving, setIsImproving] = useState(false);
    const [pointsToContribute, setPointsToContribute] = useState(50);

    // Prerequisites
    const levelRequirement = 4;
    const requiredCourses = ['1', '2']; // IDs for 'Coaching for Meaning' and 'Social Entrepreneurship'
    const requiredPalmsForOthers = 3;

    const userLevel = getUserLevel(user.points);
    const hasReachedLevel = userLevel.level >= levelRequirement;
    
    const completedCourses = (user.purchasedCourseIds || []).filter(id => requiredCourses.includes(id)).length;
    const hasCompletedCourses = completedCourses >= requiredCourses.length;
    
    const palmsForOthers = user.timeline?.filter(e => e.type === 'palm_planted' && e.details.recipient !== user.name).length || 0;
    const hasPlantedForOthers = palmsForOthers >= requiredPalmsForOthers;

    const allPrerequisitesMet = hasReachedLevel && hasCompletedCourses && hasPlantedForOthers;

    const handleApply = () => {
        if (!allPrerequisitesMet || !statement.trim()) {
            return;
        }
        onApply();
    };
    
    const handleImproveStatement = async () => {
        if (!statement.trim()) return;
        setIsImproving(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `You are an expert writing coach, specializing in personal statements for scholarships, in Persian. The user has written a draft for their "Statement of Meaning" for a scholarship to a meaning-centered coaching retreat. Your task is to improve it. Make it more compelling, clear, and impactful. Enhance the storytelling and emotional connection, but PRESERVE the user's authentic voice and core message.\n\nOriginal statement: "${statement}"\n\nRespond ONLY with the improved Persian text.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });
            setStatement(response.text);
        } catch (error) {
            console.error("AI statement improvement failed:", error);
        } finally {
            setIsImproving(false);
        }
    };

    const Prerequisite: React.FC<{ title: string; description: string; isComplete: boolean; icon: React.FC<any>; progressText?: string }> = ({ title, description, isComplete, icon: Icon, progressText }) => (
        <div className={`flex items-start gap-4 p-4 rounded-lg transition-all ${isComplete ? 'bg-green-50 dark:bg-green-900/20' : 'bg-stone-50 dark:bg-stone-800/50'}`}>
            <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${isComplete ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'}`}>
                {isComplete ? <CheckIcon className="w-6 h-6 text-white" /> : <Icon className={`w-6 h-6 ${isComplete ? 'text-white' : 'text-stone-500'}`} />}
            </div>
            <div>
                <h4 className={`font-bold ${isComplete ? 'text-green-800 dark:text-green-200' : 'text-stone-800 dark:text-stone-100'}`}>{title}</h4>
                <p className="text-sm text-stone-600 dark:text-stone-300">{description} {progressText && <span className={`font-semibold ${isComplete ? 'text-green-600 dark:text-green-300' : 'text-stone-500'}`}>{progressText}</span>}</p>
            </div>
        </div>
    );

    const renderContent = () => {
        if (user.scholarshipStatus === 'awarded') {
            return (
                 <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                    <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">تبریک! بورسیه به شما تعلق گرفت</h3>
                    <p className="mt-2 text-stone-600 dark:text-stone-300">شما برای شرکت در "سفر ۶ روزه کوچینگ معنا" انتخاب شده‌اید. اطلاعات تکمیلی به زودی برای شما ارسال خواهد شد. برای این سفر تحول‌آفرین آماده شوید!</p>
                </div>
            );
        }
        if (user.scholarshipStatus === 'applied') {
            return (
                 <div className="text-center p-8 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
                    <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-300">درخواست شما ثبت شد</h3>
                    <p className="mt-2 text-stone-600 dark:text-stone-300">بیانیه معنای شما دریافت شد و در حال بررسی است. نتیجه از طریق پروفایل به شما اطلاع داده خواهد شد. از شکیبایی شما سپاسگزاریم.</p>
                </div>
            );
        }
        return (
            <>
                 <div>
                    <h2 className="text-2xl font-bold mb-4">مسیر دریافت بورسیه</h2>
                    <div className="space-y-4">
                        <Prerequisite title="رسیدن به سطح ۴: شریک برتر" description="این سطح نشان‌دهنده تعهد شما به جنبش است." isComplete={hasReachedLevel} icon={AwardIcon} progressText={`(سطح فعلی: ${userLevel.level})`} />
                        <Prerequisite title="تکمیل دوره‌های پیش‌نیاز" description="گذراندن دوره‌های 'کوچینگ معنا' و 'کارآفرینی اجتماعی'." isComplete={hasCompletedCourses} icon={BookOpenIcon} progressText={`(${completedCourses}/${requiredCourses.length})`} />
                        <Prerequisite title="انجام ۳ عمل بخشش" description="کاشتن حداقل سه نخل به نیت دیگران (سپاس، یادبود و...)." isComplete={hasPlantedForOthers} icon={HeartIcon} progressText={`(${palmsForOthers}/${requiredPalmsForOthers})`} />
                    </div>
                </div>

                <div className={`p-6 rounded-2xl transition-opacity ${!allPrerequisitesMet ? 'opacity-50' : ''}`}>
                    <h2 className="text-2xl font-bold mb-2">ثبت بیانیه معنا</h2>
                    <p className="text-sm text-stone-600 dark:text-stone-300 mb-4">
                        این آخرین و مهم‌ترین قدم است. در چند جمله، توضیح دهید که چرا این سفر برای شما حیاتی است و چگونه به شما کمک می‌کند تا تأثیر بزرگ‌تری در دنیا خلق کنید. (می‌توانید از گفتگوهایتان با مربی معنا الهام بگیرید)
                    </p>
                    <div className="relative">
                        <textarea
                            value={statement}
                            onChange={(e) => setStatement(e.target.value)}
                            rows={5}
                            placeholder="داستان خود را بنویسید..."
                            className="w-full p-3 border-2 rounded-lg bg-transparent dark:border-stone-600 focus:border-amber-400 focus:ring-amber-400"
                            disabled={!allPrerequisitesMet}
                        />
                        <button 
                            onClick={handleImproveStatement}
                            disabled={isImproving || !statement.trim() || !allPrerequisitesMet}
                            className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-1.5 rounded-full hover:bg-amber-200 disabled:opacity-50"
                        >
                            <SparklesIcon className="w-4 h-4"/>
                            {isImproving ? 'در حال پردازش...' : 'بهبود متن با AI'}
                        </button>
                    </div>
                    <button
                        onClick={handleApply}
                        disabled={!allPrerequisitesMet || !statement.trim()}
                        className="mt-4 w-full bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-amber-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <SparklesIcon className="w-5 h-5"/>
                        ارسال درخواست بورسیه
                    </button>
                     {!allPrerequisitesMet && <p className="text-xs text-center mt-2 text-stone-500">پس از تکمیل تمام پیش‌نیازها، امکان ارسال درخواست فعال می‌شود.</p>}
                </div>
            </>
        );
    };

    return (
        <div className="space-y-16 animate-fade-in-up">
            <section className="text-center container mx-auto px-4">
                <AcademicCapIcon className="w-20 h-20 text-amber-500 mx-auto mb-4" />
                <h1 className="text-4xl md:text-5xl font-extrabold text-amber-900 dark:text-amber-200 mb-4 leading-tight">
                    بورسیه سفر ۶ روزه معنا
                </h1>
                <p className="text-lg md:text-xl text-stone-700 dark:text-stone-300 max-w-3xl mx-auto">
                    این یک فرصت برای عمیق‌ترین همراهان ماست تا در یک اردوی تحول‌آفرین شرکت کنند. با تکمیل پیش‌نیازها، شایستگی خود را برای دریافت این هدیه ارزشمند نشان دهید.
                </p>
            </section>
            
            <section className="container mx-auto px-4 max-w-3xl">
                <div className="bg-white dark:bg-stone-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50 space-y-8">
                   {renderContent()}
                </div>
            </section>

             <section className="container mx-auto px-4 max-w-3xl">
                <div className="bg-white dark:bg-stone-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50 text-center">
                    <h2 className="text-2xl font-bold mb-2">صندوق بورسیه معنا</h2>
                     <p className="text-sm text-stone-600 dark:text-stone-300 mb-4">
                        شما هم می‌توانید در این حرکت سهیم باشید. با اهدای امتیاز خود به این صندوق، به یک عضو دیگر کمک کنید تا در این سفر شرکت کند.
                     </p>
                     <div className="flex justify-center items-center gap-4 bg-stone-100 dark:bg-stone-700/50 p-4 rounded-lg">
                        <input
                            type="range"
                            min="50"
                            max={user.points}
                            step="50"
                            value={pointsToContribute}
                            onChange={(e) => setPointsToContribute(Number(e.target.value))}
                            className="w-full"
                        />
                        <span className="font-bold text-lg w-28 text-center">{pointsToContribute.toLocaleString('fa-IR')} امتیاز</span>
                        <button className="bg-green-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            اهدا می‌کنم
                        </button>
                     </div>
                </div>
            </section>
        </div>
    );
};

export default ScholarshipPage;
