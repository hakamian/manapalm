
import React, { useState } from 'react';
import { CoursePersonalization } from '../../types';
import { UserCircleIcon, LockClosedIcon, CheckCircleIcon, BoltIcon, TrophyIcon, ChevronDownIcon, LightBulbIcon, ClockIcon } from '../icons';

interface DiagramProps {
    persona?: CoursePersonalization | null;
}

// --- DATA FOR ACTION ENGINES ---
export const ACTION_PLANS: Record<string, { title: string; estimatedMinutes: number; tasks: { id: string; text: string; brief: string; xp: number }[] }> = {
    'ACTION_ENGINE_INCOME_1': {
        title: "پروتکل کشتن آماتور (جلسه ۱)",
        estimatedMinutes: 15,
        tasks: [
            { 
                id: 't1', 
                text: "جراحی باورها", 
                brief: "یک کاغذ بردارید و ۳ جمله بنویسید: «پول درآوردن سخت است چون...»، «آدم‌های پولدار...»، «من نمی‌توانم چون...». حالا روبروی هر کدام، حقیقت متضاد آن را بنویسید. این‌ها باورهای جدید شما هستند.",
                xp: 50 
            },
            { 
                id: 't2', 
                text: "تغییر هویت آنلاین", 
                brief: "به پروفایل اینستاگرام/لینکدین خود بروید. هر جا نوشتید «من عاشق...» را پاک کنید. به جای آن بنویسید: «من به [مشتری هدف] کمک می‌کنم تا [مشکل] را حل کنند و به [نتیجه] برسند».",
                xp: 50 
            },
            { 
                id: 't3', 
                text: "محاسبه ارزش ساعت", 
                brief: "درآمد هدف ماهانه را تقسیم بر ۱۶۰ ساعت کنید. این قیمت هر ساعت شماست. از فردا، هر کاری که ارزشش کمتر از این عدد است (مثل طراحی پست با فتوشاپ وقتی گرافیست نیستید) را برونسپاری یا حذف کنید.",
                xp: 100 
            }
        ]
    },
    'ACTION_ENGINE_INCOME_2': {
        title: "تنظیم ترموستات مالی (جلسه ۲)",
        estimatedMinutes: 20,
        tasks: [
            { 
                id: 't1', 
                text: "شناسایی ویروس‌های پولی", 
                brief: "چه جمله‌ای درباره پول در خانه شما تکرار می‌شد؟ «پول علف خرس نیست»؟ «پول چرک کف دست است»؟ این ویروس را پیدا کنید و آگاهانه آن را با «پول انرژی الهی برای خدمت است» جایگزین کنید.",
                xp: 50 
            },
            { 
                id: 't2', 
                text: "تمرین خرج کردن ذهنی", 
                brief: "تصور کنید همین الان ۱۰ میلیون تومان به حسابتان واریز شد. باید تا شب تمامش را خرج کنید (پس‌انداز ممنوع). لیست خریدتان را با جزئیات و قیمت بنویسید. این کار ظرفیت ذهنی را باز می‌کند.",
                xp: 50 
            },
            { 
                id: 't3', 
                text: "ارتقای استاندارد", 
                brief: "یک چیز کوچک در زندگی‌تان که حس «فقر» می‌دهد را عوض کنید. مثلاً جوراب‌های کهنه را دور بریزید و یک جفت جوراب عالی بخرید. یا ماگ چای خود را عوض کنید. پیام به ناخودآگاه: من لایق بهترینم.",
                xp: 50 
            }
        ]
    },
    'ACTION_ENGINE_COACTIVE_1': {
        title: "ماموریت تغییر لنز (جلسه ۱)",
        estimatedMinutes: 15,
        tasks: [
            { 
                id: 't1', 
                text: "چالش سکوت مطلق", 
                brief: "امروز در یک مکالمه ۱۰ دقیقه‌ای (با دوست یا همکار)، عهد ببندید هیچ راهکار یا پیشنهادی ندهید. فقط گوش دهید و بگویید «آهان»، «دیگه چی؟». ببینید چقدر سخت است و طرف مقابل چقدر بیشتر حرف می‌زند.",
                xp: 50 
            },
            { 
                id: 't2', 
                text: "مشاهده NCRW", 
                brief: "به کسی نگاه کنید که همیشه فکر می‌کردید «ضعیف» یا «نیازمند کمک» است. ۵ دقیقه وقت بگذارید و ۳ ویژگی قدرتمند در او پیدا کنید که نشان می‌دهد او توانمند است. نگاهتان را عوض کنید.",
                xp: 75 
            },
            { 
                id: 't3', 
                text: "مانترا: او خودش می‌داند", 
                brief: "این جمله را روی یک کاغذ بنویسید و روی میزتان بچسبانید: «او خراب نیست. او پاسخ را دارد. من فقط باید سوال را بپرسم.»",
                xp: 25 
            }
        ]
    },
    'ACTION_ENGINE_COACTIVE_2': {
        title: "تمرین سطوح شنیدن (جلسه ۲)",
        estimatedMinutes: 20,
        tasks: [
            { 
                id: 't1', 
                text: "مچ‌گیری از ذهن (سطح ۱)", 
                brief: "در مکالمه بعدی، دقت کنید کی ذهنتان می‌رود سراغ: «منم همینطور...» یا «من اگه بودم...». همان لحظه مچ خودتان را بگیرید و برگردید به تمرکز روی طرف مقابل.",
                xp: 50 
            },
            { 
                id: 't2', 
                text: "تکنیک آینه‌کاری (سطح ۲)", 
                brief: "برای اینکه مطمئن شوید در سطح ۲ هستید، ۳ کلمه آخر طرف مقابل را تکرار کنید. مثلاً اگر گفت «خیلی خسته‌ام»، بگویید «خسته‌ای...». این کار اتصال را عمیق می‌کند.",
                xp: 50 
            },
            { 
                id: 't3', 
                text: "شکار انرژی (سطح ۳)", 
                brief: "وارد یک اتاق شوید (کافه، جلسه، خانه) و قبل از حرف زدن، حس کنید: «هوای اینجا چطور است؟» سنگین؟ شاد؟ پر استرس؟ سعی کنید برایش یک اسم بگذارید.",
                xp: 75 
            }
        ]
    }
};

// --- ACTION ENGINE COMPONENT ---
export const ActionEngine: React.FC<{ planId: string }> = ({ planId }) => {
    const plan = ACTION_PLANS[planId];
    const [completedTasks, setCompletedTasks] = useState<string[]>([]);
    const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!plan) return null;

    const toggleTaskComplete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (completedTasks.includes(id)) {
            setCompletedTasks(completedTasks.filter(t => t !== id));
            setShowSuccess(false);
        } else {
            const newCompleted = [...completedTasks, id];
            setCompletedTasks(newCompleted);
            if (newCompleted.length === plan.tasks.length) {
                setShowSuccess(true);
            }
        }
    };

    const toggleTaskExpand = (id: string) => {
        if (expandedTasks.includes(id)) {
            setExpandedTasks(expandedTasks.filter(t => t !== id));
        } else {
            setExpandedTasks([...expandedTasks, id]);
        }
    };

    const progress = (completedTasks.length / plan.tasks.length) * 100;

    return (
        <div className="my-6 bg-stone-900 rounded-3xl border-2 border-stone-800 overflow-hidden shadow-xl relative w-full max-w-md mx-auto">
            {/* Header */}
            <div className="bg-stone-800 p-4 border-b border-stone-700 flex justify-between items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-transparent z-0"></div>
                <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2 bg-amber-500 rounded-lg shadow-lg shadow-amber-500/30">
                        <BoltIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-white tracking-tight">موتور اقدام</h3>
                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">{plan.title}</p>
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-2">
                     <div className="flex items-center gap-1 bg-stone-900/50 px-2 py-0.5 rounded-full border border-stone-600/50 text-stone-400 text-[10px]">
                        <ClockIcon className="w-3 h-3" />
                        <span>{plan.estimatedMinutes}m</span>
                    </div>
                    <span className="text-lg font-black text-stone-200">{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 w-full bg-stone-800">
                <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(245,158,11,0.7)]" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Tasks */}
            <div className="p-3 space-y-2">
                {plan.tasks.map((task) => {
                    const isDone = completedTasks.includes(task.id);
                    const isExpanded = expandedTasks.includes(task.id);
                    
                    return (
                        <div 
                            key={task.id}
                            className={`group relative rounded-xl border transition-all duration-300 overflow-hidden ${isDone ? 'bg-green-900/10 border-green-500/30' : 'bg-stone-800/50 border-stone-700 hover:border-stone-500'}`}
                        >
                            <div 
                                onClick={() => toggleTaskExpand(task.id)}
                                className="p-3 flex items-center gap-3 cursor-pointer"
                            >
                                <button
                                    onClick={(e) => toggleTaskComplete(e, task.id)}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 flex-shrink-0 ${isDone ? 'bg-green-500 border-green-500 scale-110' : 'border-stone-500 hover:border-amber-400 hover:bg-stone-700'}`}
                                >
                                    {isDone && <CheckCircleIcon className="w-3 h-3 text-white" />}
                                </button>

                                <div className="flex-grow">
                                    <p className={`text-xs md:text-sm font-bold transition-all duration-300 ${isDone ? 'text-green-400 line-through opacity-70' : 'text-stone-200'}`}>
                                        {task.text}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                     <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors ${isDone ? 'bg-green-900/30 text-green-400' : 'bg-stone-900 text-stone-500'}`}>
                                        +{task.xp} XP
                                    </div>
                                    <ChevronDownIcon className={`w-3 h-3 text-stone-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-amber-400' : ''}`} />
                                </div>
                            </div>

                            <div 
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="px-3 pb-3 pl-11">
                                    <div className="bg-stone-900/50 p-2 rounded-lg border-l-2 border-amber-500 flex gap-2">
                                        <LightBulbIcon className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-[10px] md:text-xs text-stone-300 leading-relaxed">
                                            {task.brief}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Success Overlay */}
            {showSuccess && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-fade-in">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.5)] transform scale-110">
                        <div className="bg-stone-900 rounded-xl p-6 text-center">
                            <TrophyIcon className="w-12 h-12 text-yellow-400 mx-auto mb-3 animate-bounce" />
                            <h3 className="text-xl font-black text-white mb-1">ماموریت تکمیل شد!</h3>
                            <p className="text-xs text-stone-400 mb-4">شما قدرت عمل خود را ثابت کردید.</p>
                            <button 
                                onClick={() => setShowSuccess(false)}
                                className="px-5 py-1.5 bg-white text-black text-sm font-bold rounded-lg hover:bg-stone-200 transition-colors"
                            >
                                ادامه
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 1. TRUST TRIANGLE ---
export const TrustTriangle: React.FC<DiagramProps> = ({ persona }) => {
    const [active, setActive] = useState<'trust' | 'empathy' | 'authority' | null>(null);

    const details = {
        trust: { label: "اعتماد (Trust)", desc: "آیا شما امن هستید؟", color: "#F59E0B", context: persona ? `برای ${persona.role}: "آیا به قولتان عمل می‌کنید؟"` : "پایه رابطه" },
        empathy: { label: "همدلی (Empathy)", desc: "آیا من را می‌فهمید؟", color: "#F59E0B", context: persona ? `درک چالش‌های ${persona.industry}` : "شنیدن فعال" },
        authority: { label: "اقتدار (Authority)", desc: "آیا راهکار را بلدید؟", color: "#F59E0B", context: persona ? `حل مشکل: ${persona.challenge}` : "تخصص و مهارت" }
    };

    const current = active ? details[active] : { label: "مثلث اعتماد", desc: "تعادل بین سه راس", color: "#F59E0B", context: "برای جزئیات کلیک کنید" };

    return (
        <div className="my-6 flex flex-col items-center w-full">
            <div className="relative w-64 h-56">
                <svg viewBox="0 0 200 175" className="w-full h-full drop-shadow-2xl">
                    <path d="M100 20 L180 160 L20 160 Z" fill="none" stroke={current.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="filter drop-shadow-lg" />
                    
                    <g onClick={() => setActive('trust')} className="cursor-pointer hover:opacity-80 transition-opacity">
                        <circle cx="100" cy="20" r="14" fill={active === 'trust' ? current.color : '#1c1917'} stroke={current.color} strokeWidth="2" />
                        <text x="100" y="24" textAnchor="middle" fontSize="8" fill={active === 'trust' ? 'black' : current.color} fontWeight="bold">Trust</text>
                    </g>
                    <g onClick={() => setActive('empathy')} className="cursor-pointer hover:opacity-80 transition-opacity">
                        <circle cx="180" cy="160" r="14" fill={active === 'empathy' ? current.color : '#1c1917'} stroke={current.color} strokeWidth="2" />
                        <text x="180" y="164" textAnchor="middle" fontSize="7" fill={active === 'empathy' ? 'black' : current.color} fontWeight="bold">Emp</text>
                    </g>
                    <g onClick={() => setActive('authority')} className="cursor-pointer hover:opacity-80 transition-opacity">
                        <circle cx="20" cy="160" r="14" fill={active === 'authority' ? current.color : '#1c1917'} stroke={current.color} strokeWidth="2" />
                        <text x="20" y="164" textAnchor="middle" fontSize="7" fill={active === 'authority' ? 'black' : current.color} fontWeight="bold">Auth</text>
                    </g>
                </svg>
                
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-stone-900/95 border border-amber-500/40 p-2 rounded-xl text-center w-40 shadow-xl backdrop-blur-sm">
                    <h4 className="text-amber-400 font-bold text-xs mb-1">{current.label}</h4>
                    <p className="text-white text-[9px] leading-tight">{current.desc}</p>
                </div>
            </div>
        </div>
    );
};

// --- 2. FOUR CORNERSTONES ---
export const FourCornerstones: React.FC<DiagramProps> = () => {
    const stones = [
        { title: "NCRW", desc: "ذاتاً خلاق و کامل", icon: "🌱", color: "border-green-500 text-green-400 bg-green-900/20" },
        { title: "رقص در لحظه", desc: "انعطاف و حضور", icon: "💃", color: "border-blue-500 text-blue-400 bg-blue-900/20" },
        { title: "تمامیت وجود", desc: "انسان کامل", icon: "👤", color: "border-purple-500 text-purple-400 bg-purple-900/20" },
        { title: "تحول", desc: "تغییر پایدار", icon: "🦋", color: "border-amber-500 text-amber-400 bg-amber-900/20" },
    ];

    return (
        <div className="my-6 grid grid-cols-2 gap-2 max-w-xs mx-auto">
            {stones.map((s, i) => (
                <div key={i} className={`p-3 rounded-xl border ${s.color} flex flex-col items-center text-center transition-transform hover:-translate-y-1 hover:shadow-lg`}>
                    <span className="text-xl mb-1">{s.icon}</span>
                    <h4 className="font-bold text-xs mb-0.5">{s.title}</h4>
                    <p className="text-[8px] opacity-80 leading-snug">{s.desc}</p>
                </div>
            ))}
        </div>
    );
};

// --- 3. ICEBERG MODEL ---
export const IcebergModel: React.FC<DiagramProps> = ({ persona }) => {
    return (
        <div className="my-6 flex flex-col items-center relative w-56 h-56 mx-auto bg-gradient-to-b from-sky-400/20 to-blue-900/80 rounded-2xl border border-blue-500/30 overflow-hidden shadow-2xl">
            <div className="absolute top-[30%] w-full h-0.5 bg-blue-300/50 z-10 shadow-[0_0_10px_rgba(147,197,253,0.8)]"></div>
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-b-[60px] border-b-white/90 z-0 filter drop-shadow-lg"></div>
            <div className="absolute top-8 w-full text-center z-20">
                <p className="text-stone-900 font-bold text-xs">رفتارها</p>
                <span className="text-[8px] text-stone-800 font-mono">۱۰٪ آشکار</span>
            </div>
            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[70px] border-l-transparent border-r-[70px] border-r-transparent border-t-[140px] border-t-blue-100/20 blur-[1px]"></div>
            <div className="absolute top-[50%] w-full text-center z-20 space-y-2 px-2">
                <div>
                    <p className="text-blue-100 font-bold text-xs">باورها</p>
                    <p className="text-blue-200/70 text-[8px]">ارزش‌ها، هویت {persona ? `(${persona.role})` : ''}</p>
                </div>
                <div>
                    <p className="text-blue-100 font-bold text-xs">ترس‌ها</p>
                    <p className="text-blue-200/70 text-[8px]">{persona ? persona.challenge : "انگیزه‌های پنهان"}</p>
                </div>
            </div>
        </div>
    );
};

// --- 4. VALUE LADDER ---
export const ValueLadder: React.FC<DiagramProps> = ({ persona }) => {
    const [step, setStep] = useState(0);
    const steps = [
        { title: "رایگان", sub: "Magnet", val: "Free", ex: "PDF" },
        { title: "ارزان", sub: "Tripwire", val: "$", ex: "۹۹ تومانی" },
        { title: "اصلی", sub: "Core", val: "$$", ex: persona ? `خدمات ${persona.industry}` : "دوره جامع" },
        { title: "VIP", sub: "High Ticket", val: "$$$", ex: "کوچینگ" }
    ];

    return (
        <div className="my-6 p-4 bg-stone-900 rounded-2xl border border-stone-700 max-w-xs mx-auto">
            <div className="flex items-end justify-between h-32 px-1 pb-1 gap-1">
                {steps.map((s, i) => (
                    <div 
                        key={i}
                        onClick={() => setStep(i)}
                        className={`relative w-1/4 rounded-t-md cursor-pointer transition-all duration-300 flex flex-col items-center justify-end pb-1 group ${step === i ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)] scale-y-105' : 'bg-stone-700 hover:bg-stone-600'}`}
                        style={{ height: `${(i + 1) * 25}%` }}
                    >
                        <span className={`text-[9px] font-bold -rotate-90 whitespace-nowrap mb-1 ${step === i ? 'text-black' : 'text-stone-400'}`}>{s.title}</span>
                        <span className={`text-[9px] font-mono ${step === i ? 'text-black font-black' : 'text-stone-500'}`}>{s.val}</span>
                    </div>
                ))}
            </div>
            <div className="mt-3 p-2 bg-stone-800 rounded-lg border border-stone-600 flex justify-between items-center">
                <div>
                    <h4 className="text-amber-400 font-bold text-xs">{steps[step].title}</h4>
                    <p className="text-stone-400 text-[9px]">مثال: {steps[step].ex}</p>
                </div>
            </div>
        </div>
    );
};

// --- 5. SALES FUNNEL ---
export const SalesFunnel: React.FC<DiagramProps> = ({ persona }) => {
    const [active, setActive] = useState<number | null>(null);
    const layers = [
        { id: 0, name: "آگاهی", w: "w-full", c: "bg-blue-600", d: "تبلیغات" },
        { id: 1, name: "علاقه", w: "w-3/4", c: "bg-indigo-600", d: "لید مگنت" },
        { id: 2, name: "تمایل", w: "w-1/2", c: "bg-purple-600", d: "وبینار" },
        { id: 3, name: "اقدام", w: "w-1/4", c: "bg-green-600", d: "خرید" },
    ];

    return (
        <div className="my-6 flex flex-col items-center">
            <div className="w-48 flex flex-col items-center gap-1">
                {layers.map((l) => (
                    <div 
                        key={l.id}
                        onClick={() => setActive(active === l.id ? null : l.id)}
                        className={`relative h-8 flex items-center justify-center text-white font-bold text-[10px] cursor-pointer transition-all shadow-md ${l.w} ${l.c} hover:brightness-110 ${active === l.id ? 'scale-110 z-10 ring-1 ring-white' : ''} rounded-sm`}
                    >
                        {l.name}
                        {active === l.id && (
                            <div className="absolute top-1/2 left-full ml-2 -translate-y-1/2 bg-stone-800 text-white text-[9px] p-1.5 rounded w-24 shadow-xl border border-stone-600 z-20">
                                {l.d}
                            </div>
                        )}
                    </div>
                ))}
                <div className="mt-1 text-green-400 font-bold text-base animate-bounce">$$$</div>
            </div>
        </div>
    );
};

// --- 6. LEAN CANVAS ---
export const LeanCanvas: React.FC<DiagramProps> = ({ persona }) => {
    const [sel, setSel] = useState<string | null>(null);
    const boxes = [
        { id: 'prob', t: '۱. مسئله', g: 'row-span-2', c: 'bg-red-900/20 border-red-500/30', d: persona ? persona.challenge : 'درد اصلی' },
        { id: 'sol', t: '۴. راه‌حل', g: '', c: 'bg-blue-900/20 border-blue-500/30', d: 'ویژگی‌ها' },
        { id: 'uvp', t: '۳. ارزش', g: 'row-span-2', c: 'bg-yellow-900/20 border-yellow-500/30', d: 'پیام برند' },
        { id: 'adv', t: '۹. مزیت', g: '', c: 'bg-purple-900/20 border-purple-500/30', d: 'سد دفاعی' },
        { id: 'cust', t: '۲. مشتری', g: 'row-span-2', c: 'bg-green-900/20 border-green-500/30', d: persona ? `${persona.role}` : 'مخاطب' },
        { id: 'met', t: '۸. سنجه', g: '', c: 'bg-stone-800 border-stone-600', d: 'KPIs' },
        { id: 'chn', t: '۵. کانال', g: '', c: 'bg-stone-800 border-stone-600', d: 'مسیر' },
        { id: 'cst', t: '۷. هزینه', g: 'col-span-3', c: 'bg-stone-800 border-stone-600', d: 'زیرساخت' },
        { id: 'rev', t: '۶. درآمد', g: 'col-span-2', c: 'bg-emerald-900/30 border-emerald-500/40', d: 'پول' },
    ];

    return (
        <div className="my-6 p-1.5 bg-stone-900 rounded-xl border border-stone-700 max-w-md mx-auto shadow-2xl">
            <div className="grid grid-cols-5 gap-1 h-48 text-[8px]">
                <div className="col-span-1 flex flex-col gap-1"><div onClick={() => setSel('prob')} className={`flex-1 p-1 rounded border ${boxes[0].c} ${sel==='prob'?'ring-1 ring-white':''} cursor-pointer`}><b>{boxes[0].t}</b><br/>{boxes[0].d}</div></div>
                <div className="col-span-1 flex flex-col gap-1"><div onClick={() => setSel('sol')} className={`h-1/2 p-1 rounded border ${boxes[1].c} ${sel==='sol'?'ring-1 ring-white':''} cursor-pointer`}><b>{boxes[1].t}</b></div><div onClick={() => setSel('met')} className={`h-1/2 p-1 rounded border ${boxes[5].c} ${sel==='met'?'ring-1 ring-white':''} cursor-pointer`}><b>{boxes[5].t}</b></div></div>
                <div className="col-span-1 flex flex-col gap-1"><div onClick={() => setSel('uvp')} className={`flex-1 p-1 rounded border ${boxes[2].c} ${sel==='uvp'?'ring-1 ring-white':''} cursor-pointer`}><b>{boxes[2].t}</b><br/>{boxes[2].d}</div></div>
                <div className="col-span-1 flex flex-col gap-1"><div onClick={() => setSel('adv')} className={`h-1/2 p-1 rounded border ${boxes[3].c} ${sel==='adv'?'ring-1 ring-white':''} cursor-pointer`}><b>{boxes[3].t}</b></div><div onClick={() => setSel('chn')} className={`h-1/2 p-1 rounded border ${boxes[6].c} ${sel==='chn'?'ring-1 ring-white':''} cursor-pointer`}><b>{boxes[6].t}</b></div></div>
                <div className="col-span-1 flex flex-col gap-1"><div onClick={() => setSel('cust')} className={`flex-1 p-1 rounded border ${boxes[4].c} ${sel==='cust'?'ring-1 ring-white':''} cursor-pointer`}><b>{boxes[4].t}</b><br/>{boxes[4].d}</div></div>
            </div>
            <div className="grid grid-cols-5 gap-1 mt-1 h-12 text-[8px]">
                 <div onClick={() => setSel('cst')} className={`col-span-3 p-1 rounded border ${boxes[7].c} ${sel==='cst'?'ring-1 ring-white':''} cursor-pointer`}><b>{boxes[7].t}</b><br/>{boxes[7].d}</div>
                 <div onClick={() => setSel('rev')} className={`col-span-2 p-1 rounded border ${boxes[8].c} ${sel==='rev'?'ring-1 ring-white':''} cursor-pointer`}><b>{boxes[8].t}</b><br/>{boxes[8].d}</div>
            </div>
        </div>
    );
};
