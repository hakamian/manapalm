
import React, { useState } from 'react';
import { GOAL_CONFIG, TIME_COMMITMENT_CONFIG, UserGoal, UserBarrier, UserInterest, TimeCommitment } from '../../utils/englishAcademyConfig';
import { SparklesIcon, ClockIcon, ShieldCheckIcon, HeartIcon } from '../icons';

interface OnboardingProps {
    onComplete: (config: { goal: UserGoal; barrier: UserBarrier; interest: UserInterest | string; timeCommitment: TimeCommitment | string }) => void;
}

const AcademyOnboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState<{ goal?: UserGoal; barrier?: UserBarrier; interest?: UserInterest | string; timeCommitment?: TimeCommitment | string }>({});
    const [customInterest, setCustomInterest] = useState('');
    const [customTime, setCustomTime] = useState('');

    const handleSelection = (key: 'goal' | 'barrier' | 'interest' | 'timeCommitment', value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
        
        if (value === 'other') {
            return;
        }

        if (step < 4) setStep(s => s + 1);
        else if (config.goal && config.barrier) {
             onComplete({ ...config, [key]: value } as any);
        }
    };
    
    const handleCustomInterestSubmit = () => {
        if (config.goal && config.barrier && customInterest.trim()) {
             onComplete({ ...config, interest: customInterest } as any);
        }
    };

    const handleCustomTimeSubmit = () => {
        if (customTime.trim()) {
            setConfig(prev => ({ ...prev, timeCommitment: customTime }));
            setStep(3);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl text-center animate-fade-in relative overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
                <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
            </div>

            {step === 1 && (
                <div className="animate-fade-in-right">
                    <SparklesIcon className="w-12 h-12 mx-auto text-amber-400 mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-2">نقش خود را انتخاب کنید</h2>
                    <p className="text-gray-400 mb-8">می‌خواهید در دنیای زبان انگلیسی چه کسی باشید؟</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(Object.keys(GOAL_CONFIG) as UserGoal[]).map(goal => {
                            const conf = GOAL_CONFIG[goal];
                            return (
                                <button
                                    key={goal}
                                    onClick={() => handleSelection('goal', goal)}
                                    className="group p-6 rounded-2xl bg-gray-700/30 border-2 border-transparent hover:border-blue-500 hover:bg-gray-700 transition-all flex items-center gap-4 text-right"
                                >
                                    <div className={`p-3 rounded-full bg-${conf.color}-900/30 text-${conf.color}-400 group-hover:scale-110 transition-transform`}>
                                        <conf.icon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{conf.title}</h3>
                                        <p className="text-xs text-gray-400 mt-1 group-hover:text-gray-300 transition-colors">
                                            تمرکز بر: {conf.moduleAlias}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {step === 2 && (
                <div className="animate-fade-in-right">
                    <ClockIcon className="w-12 h-12 mx-auto text-green-400 mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-2">چقدر می‌توانید وقت بگذارید؟</h2>
                    <p className="text-gray-400 mb-8">سرعت پیشرفت خود را تعیین کنید.</p>
                    
                    {config.timeCommitment === 'other' ? (
                         <div className="max-w-md mx-auto animate-fade-in-up">
                            <label className="block text-sm text-gray-300 mb-2 text-right">مدت زمان روزانه (مثلاً ۴۵ دقیقه):</label>
                            <input 
                                type="text" 
                                value={customTime} 
                                onChange={(e) => setCustomTime(e.target.value)} 
                                className="w-full p-4 rounded-xl bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="زمان دلخواه..."
                                autoFocus
                            />
                            <div className="flex gap-3 mt-4">
                                <button onClick={() => setConfig(prev => ({...prev, timeCommitment: undefined}))} className="flex-1 py-3 rounded-xl bg-gray-600 hover:bg-gray-500 text-gray-200">بازگشت</button>
                                <button onClick={handleCustomTimeSubmit} disabled={!customTime.trim()} className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold disabled:opacity-50">تایید</button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(Object.keys(TIME_COMMITMENT_CONFIG) as TimeCommitment[]).map(key => {
                                const timeConf = TIME_COMMITMENT_CONFIG[key];
                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleSelection('timeCommitment', key)}
                                        className="group p-5 rounded-2xl bg-gray-700/30 hover:bg-gray-700 border border-gray-600 hover:border-green-400 transition-all text-center"
                                    >
                                        <h3 className="font-bold text-white text-lg">{timeConf.title}</h3>
                                        <p className="text-2xl font-black text-green-400 my-2">{timeConf.daily}</p>
                                        <p className="text-xs text-gray-400">{timeConf.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
            
            {step === 3 && (
                <div className="animate-fade-in-right">
                    <ShieldCheckIcon className="w-12 h-12 mx-auto text-red-400 mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-2">دشمن اصلی شما کیست؟</h2>
                    <p className="text-gray-400 mb-8">چه چیزی تا الان مانع پیشرفت شما شده است؟</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { id: 'fear', title: 'ترس از اشتباه (The Silencer)', icon: '🤐' },
                            { id: 'vocabulary', title: 'کمبود کلمات (The Blank Mind)', icon: '🧠' },
                            { id: 'grammar', title: 'پیچیدگی گرامر (The Maze)', icon: '🌀' },
                            { id: 'time', title: 'کمبود زمان (The Clock)', icon: '⏳' }
                        ].map((item) => (
                            <button 
                                key={item.id}
                                onClick={() => handleSelection('barrier', item.id)}
                                className="p-5 rounded-2xl bg-gray-700/30 hover:bg-gray-700 border border-gray-600 hover:border-red-400 transition-all flex items-center gap-4 text-right"
                            >
                                <span className="text-3xl">{item.icon}</span>
                                <span className="font-bold text-gray-200">{item.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="animate-fade-in-right">
                    <HeartIcon className="w-12 h-12 mx-auto text-pink-400 mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-2">علاقه شما چیست؟</h2>
                    <p className="text-gray-400 mb-8">ما محتوای درس‌ها را با علایق شما ترکیب می‌کنیم تا خسته‌کننده نباشد.</p>
                    
                    {config.interest === 'other' ? (
                         <div className="max-w-md mx-auto animate-fade-in-up">
                            <label className="block text-sm text-gray-300 mb-2 text-right">لطفاً علاقه خود را بنویسید:</label>
                            <input 
                                type="text" 
                                value={customInterest} 
                                onChange={(e) => setCustomInterest(e.target.value)} 
                                className="w-full p-4 rounded-xl bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                placeholder="مثلاً: آشپزی، نجوم، فوتبال..."
                                autoFocus
                            />
                            <div className="flex gap-3 mt-4">
                                <button onClick={() => setConfig(prev => ({...prev, interest: undefined}))} className="flex-1 py-3 rounded-xl bg-gray-600 hover:bg-gray-500 text-gray-200">بازگشت</button>
                                <button onClick={handleCustomInterestSubmit} disabled={!customInterest.trim()} className="flex-1 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold disabled:opacity-50">تایید</button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             {[
                                { id: 'tech', title: 'تکنولوژی', icon: '💻' },
                                { id: 'art', title: 'هنر و سینما', icon: '🎨' },
                                { id: 'business', title: 'کسب‌وکار', icon: '💼' },
                                { id: 'culture', title: 'فرهنگ و سفر', icon: '🌍' },
                                { id: 'other', title: 'سایر موارد', icon: '✨' }
                            ].map((item) => (
                                 <button 
                                    key={item.id}
                                    onClick={() => handleSelection('interest', item.id)}
                                    className="p-6 rounded-2xl bg-gray-700/30 hover:bg-gray-700 border border-gray-600 hover:border-pink-400 transition-all flex flex-col items-center gap-3"
                                >
                                    <span className="text-4xl">{item.icon}</span>
                                    <span className="font-bold text-gray-200">{item.title}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AcademyOnboarding;
