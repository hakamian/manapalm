
import React from 'react';
import { User, Page, PathMilestone, View } from '../types.ts';
import { PATH_MILESTONES } from '../utils/path.ts';
import { StarIcon, LeafIcon, AwardIcon, PlusIcon, HeartIcon, CheckIcon, BrainCircuitIcon, WellIcon, HandshakeIcon } from './icons.tsx';
import { getUserLevel } from '../utils/gamification.ts';


const MilestoneNode: React.FC<{ milestone: PathMilestone; status: 'completed' | 'current' | 'locked'; isLast: boolean }> = ({ milestone, status, isLast }) => {
    const Icon = milestone.icon;
    
    const statusClasses = {
        completed: {
            node: 'bg-green-500',
            icon: 'text-white',
            line: 'bg-green-500',
            card: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
        },
        current: {
            node: 'bg-amber-500 ring-4 ring-amber-200 dark:ring-amber-500/30 animate-pulse',
            icon: 'text-white',
            line: 'bg-stone-200 dark:bg-stone-700',
            card: 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20'
        },
        locked: {
            node: 'bg-stone-200 dark:bg-stone-700',
            icon: 'text-stone-400 dark:text-stone-500',
            line: 'bg-stone-200 dark:bg-stone-700',
            card: 'border-stone-200 dark:border-stone-700/50 bg-stone-100/50 dark:bg-stone-800/20 opacity-70'
        }
    };
    
    const classes = statusClasses[status];

    return (
        <div className="flex items-start gap-4">
            <div className="flex flex-col items-center self-stretch">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${classes.node}`}>
                    {status === 'completed' ? <CheckIcon className={`w-6 h-6 ${classes.icon}`} /> : <Icon className={`w-6 h-6 ${classes.icon}`} />}
                </div>
                {!isLast && <div className={`w-1 flex-grow transition-colors duration-300 ${classes.line}`}></div>}
            </div>
            <div className="flex-1 pb-10 pt-1">
                <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 ${classes.card}`}>
                    <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100">{milestone.title}</h3>
                    <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">{milestone.description}</p>
                </div>
            </div>
        </div>
    );
};


const QuickAction: React.FC<{ icon: React.FC<any>, title: string, description: string, onClick: () => void }> = ({ icon: Icon, title, description, onClick }) => {
    return (
        <button onClick={onClick} className="bg-white dark:bg-stone-800/50 p-4 rounded-2xl text-right w-full flex gap-4 items-center hover:bg-amber-50 dark:hover:bg-stone-700/50 transition-colors border border-stone-200/50 dark:border-stone-700/50">
            <Icon className="w-8 h-8 text-amber-500 flex-shrink-0" />
            <div>
                <h4 className="font-bold text-stone-800 dark:text-stone-100">{title}</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">{description}</p>
            </div>
        </button>
    );
};

const PathPage: React.FC<{ user: User; setPage: (page: Page) => void; }> = ({ user, setPage }) => {
    const currentLevel = getUserLevel(user.points);
    const palmsPlanted = user.timeline?.filter(e => e.type === 'palm_planted').length || 0;
    
    let currentMilestoneIndex = -1;
    const userMilestones = PATH_MILESTONES.map((milestone, index) => {
        const completed = milestone.isComplete(user);
        if (completed) {
            currentMilestoneIndex = index;
        }
        return { ...milestone, completed };
    });

    return (
        <div className="space-y-12 animate-fade-in-up">
            <div className="text-center">
                 <img src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.name}&background=a16207&color=fff&size=96`} alt={user.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-stone-800 mx-auto" />
                <h1 className="text-3xl md:text-4xl font-extrabold text-amber-900 dark:text-amber-200 mt-3">مسیر معنای شما، {user.name}</h1>
                <p className="text-base text-stone-600 dark:text-stone-300 mt-1">
                    اینجا نقشه راه شما در جنبش نخلستان معناست. هر قدم، یک تاثیر است.
                </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                 <div className="bg-white dark:bg-stone-800/50 p-4 rounded-2xl text-center border border-stone-200/50 dark:border-stone-700/50">
                    <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">امتیاز</p>
                    <p className="text-2xl font-bold flex items-center justify-center gap-1"><StarIcon className="w-6 h-6 text-amber-400"/> {user.points.toLocaleString('fa-IR')}</p>
                 </div>
                 <div className="bg-white dark:bg-stone-800/50 p-4 rounded-2xl text-center border border-stone-200/50 dark:border-stone-700/50">
                    <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">سطح</p>
                    <p className="text-2xl font-bold flex items-center justify-center gap-1"><AwardIcon className="w-6 h-6 text-indigo-400"/> {currentLevel.level}</p>
                 </div>
                 <div className="bg-white dark:bg-stone-800/50 p-4 rounded-2xl text-center border border-stone-200/50 dark:border-stone-700/50 col-span-2 md:col-span-1">
                     <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">عنوان سطح</p>
                    <p className="text-lg font-bold">{currentLevel.name}</p>
                 </div>
                 <div className="bg-white dark:bg-stone-800/50 p-4 rounded-2xl text-center border border-stone-200/50 dark:border-stone-700/50">
                    <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">میراث کاشته شده</p>
                    <p className="text-2xl font-bold flex items-center justify-center gap-1"><LeafIcon className="w-6 h-6 text-green-400"/> {palmsPlanted.toLocaleString('fa-IR')}</p>
                 </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-6 text-center">نقشه راه شما</h2>
                <div className="max-w-2xl mx-auto relative">
                    <div className="absolute left-6 top-0 h-full w-1 bg-stone-200 dark:bg-stone-700 -translate-x-1/2"></div>
                    <div className="space-y-0">
                         {userMilestones.map((milestone, index) => {
                            let status: 'completed' | 'current' | 'locked';
                            if (milestone.completed) {
                                status = 'completed';
                            } else if (index === currentMilestoneIndex + 1) {
                                status = 'current';
                            } else {
                                status = 'locked';
                            }
                            return <MilestoneNode key={milestone.id} milestone={milestone} status={status} isLast={index === userMilestones.length - 1} />;
                         })}
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-bold mb-4 text-center">قدم بعدی شما چیست؟</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                    <QuickAction 
                        icon={HandshakeIcon}
                        title="مشارکت در پروژه‌های اجتماعی"
                        description="با همراهی دیگر اعضا، در پروژه‌های بزرگ‌تر و تأثیرگذارتر سهیم شوید."
                        onClick={() => setPage(View['community-projects'])}
                    />
                    <QuickAction 
                        icon={BrainCircuitIcon}
                        title="گفتگو با مربی معنا"
                        description="با راهنمایی هوش مصنوعی، به کاوش در دنیای درون خود بپردازید."
                        onClick={() => setPage(View['meaning-coach'])}
                    />
                    <QuickAction 
                        icon={PlusIcon}
                        title="کاشت میراث جدید"
                        description="یک خاطره یا تصمیم جدید را ثبت کنید."
                        onClick={() => setPage(View.HallOfHeritage)}
                    />
                    <QuickAction 
                        icon={HeartIcon}
                        title="مشاهده باغ زنده"
                        description="تمام لحظات ثبت شده خود را در باغ شخصی‌تان مرور کنید."
                        onClick={() => setPage(View.UserProfile)}
                    />
                </div>
            </div>
        </div>
    );
};

export default PathPage;
