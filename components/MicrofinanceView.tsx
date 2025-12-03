
import React, { useState, useMemo } from 'react';
import { useAppDispatch, useAppState } from '../AppContext';
import { MicrofinanceProject, View } from '../types';
import { HandCoinIcon, BriefcaseIcon, SproutIcon, ArrowLeftIcon, UsersIcon, SparklesIcon, CheckCircleIcon, HeartIcon, StarIcon } from './icons';
import Modal from './Modal';

interface ProjectCardProps {
    project: MicrofinanceProject;
    onInvest: (project: MicrofinanceProject) => void;
    isLoggedIn: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onInvest, isLoggedIn }) => {
    const percentFunded = Math.min(100, (project.amountFunded / project.amountRequested) * 100);
    const isFullyFunded = project.amountFunded >= project.amountRequested;

    return (
        <div className="bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden flex flex-col shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
            <div className="relative h-48">
                <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-3 right-3 text-white">
                    <div className="flex items-center gap-2">
                        {project.category === 'expansion' ? <SproutIcon className="w-5 h-5 text-green-400"/> : <BriefcaseIcon className="w-5 h-5 text-blue-400"/>}
                        <span className="text-xs font-bold uppercase bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
                            {project.category === 'expansion' ? 'توسعه نخلستان' : 'کارآفرینی'}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold mt-1">{project.title}</h3>
                </div>
                {project.riskScore && (
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold uppercase ${
                        project.riskScore === 'low' ? 'bg-green-500 text-white' : 
                        project.riskScore === 'medium' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
                    }`}>
                        ریسک: {project.riskScore === 'low' ? 'کم' : project.riskScore === 'medium' ? 'متوسط' : 'بالا'}
                    </div>
                )}
            </div>
            
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-1">
                        <UsersIcon className="w-4 h-4"/> {project.borrowerName}
                    </span>
                    <span className="text-xs text-stone-400">{project.location}</span>
                </div>
                
                <p className="text-stone-600 dark:text-stone-300 text-sm mb-4 line-clamp-3 flex-grow">
                    {project.description}
                </p>

                <div className="bg-stone-100 dark:bg-stone-700/30 p-3 rounded-lg mb-4 text-xs space-y-1">
                    <div className="flex justify-between">
                        <span className="text-stone-500 dark:text-stone-400">تاثیر:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">{project.impact}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-stone-500 dark:text-stone-400">دوره بازگشت:</span>
                        <span className="font-semibold text-stone-700 dark:text-stone-200">{project.repaymentPeriod} ماه</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-stone-500 dark:text-stone-400">تحلیل ریسک:</span>
                        <span className="font-semibold text-stone-700 dark:text-stone-200">{project.riskReasoning}</span>
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-amber-600 dark:text-amber-400">{percentFunded.toFixed(0)}% تامین شده</span>
                        <span className="text-stone-500">{project.amountFunded.toLocaleString('fa-IR')} / {project.amountRequested.toLocaleString('fa-IR')} تومان</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2 mb-4 overflow-hidden">
                        <div className="bg-amber-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${percentFunded}%` }}></div>
                    </div>

                    <button 
                        onClick={() => onInvest(project)}
                        disabled={isFullyFunded}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            isFullyFunded 
                            ? 'bg-green-600/20 text-green-500 cursor-default' 
                            : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-amber-500/30'
                        }`}
                    >
                        {isFullyFunded ? (
                            <>
                                <CheckCircleIcon className="w-5 h-5" /> تکمیل شد
                            </>
                        ) : (
                            <>
                                <HandCoinIcon className="w-5 h-5" />
                                {isLoggedIn ? 'سرمایه‌گذاری' : 'مشاهده و مشارکت'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const InvestModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    project: MicrofinanceProject; 
    user: any; 
    onConfirm: (amount: number, method: 'wallet' | 'points') => void; 
}> = ({ isOpen, onClose, project, user, onConfirm }) => {
    const [amount, setAmount] = useState<number>(100000);
    const [method, setMethod] = useState<'wallet' | 'points'>('wallet');
    const pointsRate = 100; // 100 points = 1000 Tomans (Example)
    
    if (!isOpen) return null;
    
    const maxInvest = project.amountRequested - project.amountFunded;
    const pointsNeeded = amount / 10; // Example rate

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-2 text-center">سرمایه‌گذاری در «{project.title}»</h3>
                <p className="text-sm text-stone-500 text-center mb-6">
                    بازگشت سرمایه به کیف پول چرخشی شما خواهد بود.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">مبلغ سرمایه‌گذاری (تومان)</label>
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(Math.min(Number(e.target.value), maxInvest))} 
                            className="w-full p-3 bg-stone-100 dark:bg-stone-700 rounded-lg text-center font-bold text-lg dir-ltr"
                            step={50000}
                            min={50000}
                        />
                         <p className="text-xs text-stone-400 mt-1 text-center">حداقل ۵۰,۰۰۰ تومان</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setMethod('wallet')}
                            className={`p-3 rounded-xl border-2 transition-all text-sm ${method === 'wallet' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-stone-200 dark:border-stone-600'}`}
                        >
                            پرداخت آنلاین
                        </button>
                        <button 
                            onClick={() => setMethod('points')}
                            className={`p-3 rounded-xl border-2 transition-all text-sm ${method === 'points' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-stone-200 dark:border-stone-600'}`}
                        >
                             امتیاز ({pointsNeeded.toLocaleString()} پ)
                        </button>
                    </div>
                    
                    {method === 'points' && user.points < pointsNeeded && (
                        <p className="text-xs text-red-500 text-center">موجودی امتیاز شما کافی نیست ({user.points.toLocaleString()}).</p>
                    )}
                    
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                        <SparklesIcon className="w-4 h-4 flex-shrink-0 mt-0.5"/>
                        <p>با این کار، شما در {project.impact} سهیم می‌شوید و نام شما در لیست حامیان ثبت می‌گردد.</p>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-semibold">انصراف</button>
                    <button 
                        onClick={() => onConfirm(amount, method)} 
                        disabled={method === 'points' && user.points < pointsNeeded}
                        className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        تایید و پرداخت
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const MicrofinanceView: React.FC = () => {
    const { microfinanceProjects, user } = useAppState();
    const dispatch = useAppDispatch();
    const [filter, setFilter] = useState<'all' | 'expansion' | 'entrepreneurship'>('all');
    const [selectedProject, setSelectedProject] = useState<MicrofinanceProject | null>(null);

    const filteredProjects = useMemo(() => {
        if (filter === 'all') return microfinanceProjects;
        return microfinanceProjects.filter(p => p.category === filter);
    }, [microfinanceProjects, filter]);

    const handleInvestClick = (project: MicrofinanceProject) => {
        if (!user) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
        } else {
            setSelectedProject(project);
        }
    };

    const handleConfirmInvest = (amount: number, method: 'wallet' | 'points') => {
        if (selectedProject && user) {
            dispatch({ type: 'INVEST_IN_PROJECT', payload: { projectId: selectedProject.id, amount, method } });
            setSelectedProject(null);
            // Show success toast via dispatch or local state
            alert(`سرمایه‌گذاری شما به مبلغ ${amount.toLocaleString('fa-IR')} تومان با موفقیت ثبت شد.`);
        }
    };

    return (
        <div className="bg-gray-900 text-white pt-22 pb-24 min-h-screen">
            {/* Hero Section */}
            <div className="relative pb-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1590682680695-43b964a3ae17?q=80&w=2000&auto=format&fit=crop')" }}>
                <div className="absolute inset-0 bg-gradient-to-b from-stone-900/90 via-stone-900/80 to-gray-900"></div>
                <div className="relative container mx-auto px-6 text-center z-10 pt-12">
                    <div className="inline-block p-4 bg-green-900/30 rounded-full mb-6 border border-green-500/30 animate-pulse-slow">
                        <HandCoinIcon className="w-12 h-12 text-green-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-500">
                        صندوق رویش
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
                        سرمایه‌گذاری بر کرامت، نه فقط خیریه. <br/>
                        با حمایت از کسب‌وکارهای کوچک و توسعه نخلستان، چرخه‌ای از برکت بسازید که به جامعه (و شما) بازمی‌گردد.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-16 relative z-20">
                {/* Filters */}
                <div className="flex justify-center mb-10">
                    <div className="bg-gray-800 p-1.5 rounded-full flex shadow-lg border border-gray-700">
                        <button onClick={() => setFilter('all')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${filter === 'all' ? 'bg-green-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>همه</button>
                        <button onClick={() => setFilter('entrepreneurship')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${filter === 'entrepreneurship' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                            <BriefcaseIcon className="w-4 h-4"/> کارآفرینان
                        </button>
                        <button onClick={() => setFilter('expansion')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${filter === 'expansion' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                            <SproutIcon className="w-4 h-4"/> توسعه نخلستان
                        </button>
                    </div>
                </div>

                {/* Portfolio Summary (If User) */}
                {user && user.impactPortfolio && user.impactPortfolio.length > 0 && (
                    <div className="mb-12 bg-gradient-to-r from-stone-800 to-gray-800 rounded-2xl p-6 border border-stone-700 shadow-xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <StarIcon className="w-5 h-5 text-yellow-400" />
                            پورتفوی تاثیر شما
                        </h3>
                        <div className="flex gap-8">
                             <div>
                                <p className="text-xs text-gray-400">مجموع سرمایه‌گذاری</p>
                                <p className="text-xl font-bold text-white">{user.impactPortfolio.reduce((acc, i) => acc + i.amountLent, 0).toLocaleString('fa-IR')} <span className="text-xs text-gray-500">تومان</span></p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">پروژه‌های فعال</p>
                                <p className="text-xl font-bold text-green-400">{user.impactPortfolio.filter(i => i.status === 'active').length}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map(project => (
                        <ProjectCard 
                            key={project.id} 
                            project={project} 
                            onInvest={handleInvestClick} 
                            isLoggedIn={!!user} 
                        />
                    ))}
                </div>

                {filteredProjects.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p>پروژه‌ای با این فیلتر یافت نشد.</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedProject && (
                <InvestModal 
                    isOpen={!!selectedProject}
                    onClose={() => setSelectedProject(null)}
                    project={selectedProject}
                    user={user || { points: 0 }}
                    onConfirm={handleConfirmInvest}
                />
            )}
        </div>
    );
};

export default MicrofinanceView;
