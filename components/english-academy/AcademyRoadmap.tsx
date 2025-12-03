
import React from 'react';
import { GOAL_CONFIG, TIME_COMMITMENT_CONFIG, UserGoal, UserBarrier, UserInterest, TimeCommitment } from '../../utils/englishAcademyConfig';
import { LockClosedIcon, CheckCircleIcon, MicrophoneIcon, TrophyIcon, SproutIcon } from '../icons';

interface RoadmapPreviewProps { 
    config: { goal: UserGoal; barrier: UserBarrier; interest: UserInterest | string; timeCommitment: TimeCommitment | string }; 
    onUnlock: () => void; 
    onDemo: () => void; 
}

const AcademyRoadmapPreview: React.FC<RoadmapPreviewProps> = ({ config, onUnlock, onDemo }) => {
    const goalConfig = GOAL_CONFIG[config.goal];
    
    const timeConfig = (config.timeCommitment in TIME_COMMITMENT_CONFIG) 
        ? TIME_COMMITMENT_CONFIG[config.timeCommitment as TimeCommitment]
        : { title: 'برنامه شخصی', description: 'بر اساس زمان شما', daily: config.timeCommitment as string };
    
    const barrierTitle = {
        fear: 'شکستن یخ مکالمه',
        vocabulary: 'گنجینه لغات هوشمند',
        grammar: 'گرامر بدون درد',
        time: 'یادگیری سریع (Micro-learning)'
    }[config.barrier];

    const interestTitle = {
        tech: 'انگلیسی در دنیای تک',
        art: 'نقد فیلم و هنر',
        business: 'مذاکره تجاری',
        culture: 'داستان‌های ملل'
    }[config.interest as string] || `مکالمات جذاب درباره ${config.interest}`;

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-10">
            <div className="text-center mb-12">
                <div className="inline-block px-4 py-1 rounded-full bg-green-900/50 text-green-400 text-sm font-bold mb-4 border border-green-700/50">
                    نقشه راه اختصاصی شما آماده شد
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                    مسیر تبدیل شدن به یک <span className={`text-${goalConfig.color}-400`}>{goalConfig.title.split('(')[1]?.replace(')', '') || 'Expert'}</span>
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                    با تعهد روزانه <strong>{timeConfig.daily}</strong>، بر <strong>{barrierTitle}</strong> غلبه کنید و از طریق <strong>{interestTitle}</strong> لذت ببرید.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Roadmap Visual */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative pl-8 border-l-2 border-gray-700 space-y-8">
                        {/* Module 1 */}
                        <div className="relative">
                            <div className="absolute -left-[41px] top-0 w-10 h-10 rounded-full bg-blue-600 border-4 border-gray-900 flex items-center justify-center font-bold text-white z-10">1</div>
                            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                                <h3 className="text-xl font-bold text-white mb-2">شروع قدرتمند: {barrierTitle}</h3>
                                <p className="text-gray-400 text-sm">از بین بردن موانع ذهنی و ایجاد اعتماد به نفس اولیه.</p>
                                <div className="mt-4 flex gap-2">
                                    <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded">شبیه‌ساز مکالمه</span>
                                    <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded">ویدیو تعاملی</span>
                                </div>
                            </div>
                        </div>

                        {/* Module 2 - Locked */}
                        <div className="relative opacity-75">
                            <div className="absolute -left-[41px] top-0 w-10 h-10 rounded-full bg-gray-700 border-4 border-gray-900 flex items-center justify-center font-bold text-gray-400 z-10">2</div>
                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 border-dashed">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-gray-300 flex items-center gap-2">
                                        <LockClosedIcon className="w-5 h-5"/> ماژول تخصصی: {interestTitle}
                                    </h3>
                                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">شخصی‌سازی شده</span>
                                </div>
                                <p className="text-gray-500 text-sm mt-2">یادگیری اصطلاحات تخصصی در قالب سناریوهای واقعی.</p>
                            </div>
                        </div>

                        {/* Module 3 - Locked */}
                        <div className="relative opacity-50">
                            <div className="absolute -left-[41px] top-0 w-10 h-10 rounded-full bg-gray-700 border-4 border-gray-900 flex items-center justify-center font-bold text-gray-400 z-10">3</div>
                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 border-dashed">
                                <h3 className="text-xl font-bold text-gray-300 mb-2">تسلط نهایی: {goalConfig.moduleAlias}</h3>
                                <p className="text-gray-500 text-sm">پروژه پایانی و دریافت مدرک افتخاری.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Card */}
                <div className="lg:col-span-1 flex flex-col gap-6 sticky top-24 h-fit">
                    {/* Success Guarantee Banner */}
                    <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-amber-300 text-sm">تضمین موفقیت</h4>
                            <p className="text-xs text-amber-100/80 mt-1">
                                اگر با سیستم {timeConfig.title} ما پیش بروید، رسیدن به هدف {goalConfig.title} قطعی است. به همین راحتی!
                            </p>
                        </div>
                    </div>

                    {/* Demo CTA */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
                        <h3 className="text-xl font-bold text-white mb-2">هنوز مطمئن نیستید؟</h3>
                        <p className="text-indigo-100 text-sm mb-6">
                            همین حالا یک مکالمه کوتاه ۹۰ ثانیه‌ای با هوش مصنوعی درباره «{interestTitle}» داشته باشید.
                        </p>
                        <button 
                            onClick={onDemo}
                            className="w-full bg-white text-indigo-700 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                            <MicrophoneIcon className="w-5 h-5" />
                            تست رایگان (۹۰ ثانیه)
                        </button>
                    </div>

                    {/* Pay CTA */}
                    <div className="bg-gray-800 rounded-2xl p-6 border border-green-500/30 shadow-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <TrophyIcon className="w-6 h-6 text-yellow-400" />
                            <h3 className="text-lg font-bold text-white">شروع ماجراجویی</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-gray-300 mb-6">
                            <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-green-500"/> دسترسی نامحدود به تمام دروس</li>
                            <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-green-500"/> مربی هوشمند ۲۴ ساعته</li>
                            <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-green-500"/> نشان افتخار «{goalConfig.title.split(' ')[2] || 'Polyglot'}»</li>
                            <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-green-500"/> کمک به کاشت نخل واقعی</li>
                        </ul>
                        <div className="mb-6 text-center">
                             <span className="text-3xl font-bold text-white">۷۵,۰۰۰</span> <span className="text-gray-400">تومان</span>
                        </div>
                        <button 
                            id="plant-palm-academy-btn"
                            onClick={onUnlock} 
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            <SproutIcon className="w-6 h-6" />
                            کاشت نخل و شروع دوره
                        </button>
                        <p className="text-xs text-center text-gray-500 mt-3">یک بار پرداخت، دسترسی مادام‌العمر</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcademyRoadmapPreview;
