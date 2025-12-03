
import React, { useState } from 'react';
import { useAppState, useAppDispatch } from '../AppContext.tsx';
import { WebDevProject } from '../types.ts';
import { CheckIcon, SparklesIcon, SitemapIcon, BanknotesIcon, PaperAirplaneIcon, GlobeIcon, BrainCircuitIcon, ArrowLeftIcon, ClockIcon, ChevronDownIcon } from './icons.tsx';
import ProjectDiscoveryChatModal from './ProjectDiscoveryChatModal.tsx';

const ArchitectJourney: React.FC = () => {
    const { user: currentUser } = useAppState();
    const dispatch = useAppDispatch();
    const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const advanceWebDevProject = (update: Partial<WebDevProject>) => {
        if (!currentUser || !currentUser.webDevProject) return;
        const updatedProject = { ...currentUser.webDevProject, ...update };
        dispatch({ type: 'UPDATE_USER', payload: { ...currentUser, webDevProject: updatedProject } });
    };

    if (!currentUser?.webDevProject || currentUser.webDevProject.status === 'none') {
        return null; 
    }

    const project = currentUser.webDevProject;
    
    const steps = [
        { id: 'requested', title: 'شروع', icon: CheckIcon, description: 'درخواست ثبت شد' },
        { id: 'discovery_chat', title: 'کشف', icon: BrainCircuitIcon, description: 'گفتگو با معمار' },
        { id: 'generating_prototype', title: 'طراحی', icon: SparklesIcon, description: 'هوش مصنوعی در حال کار' },
        { id: 'prototype_ready', title: 'بازبینی', icon: SitemapIcon, description: 'پیش‌نمونه آماده' },
        { id: 'launching', title: 'ساخت', icon: PaperAirplaneIcon, description: 'توسعه نهایی' },
        { id: 'live', title: 'پایان', icon: GlobeIcon, description: 'سایت فعال است' },
    ];
    
    const currentStepIndex = steps.findIndex(s => s.id === project.status) === -1 ? 0 : steps.findIndex(s => s.id === project.status);
    const progressPercentage = ((currentStepIndex) / (steps.length - 1)) * 100;
    
    const handleDiscoveryComplete = (data: WebDevProject['discoveryData']) => {
        advanceWebDevProject({ discoveryData: data, status: 'generating_prototype' });
        setIsDiscoveryModalOpen(false);
        // Simulate prototype generation
        setTimeout(() => {
            const prototype: WebDevProject['prototype'] = {
                colors: [{hex: '#f59e0b', name: 'Amber'}, {hex: '#1c1917', name: 'Stone'}, {hex: '#ffffff', name: 'White'}],
                fonts: [{name: 'Vazirmatn', type: 'Sans-serif'}],
                tagline: project.initialRequest?.vision || 'ساختن آینده، امروز.',
                layout: ['بخش اصلی', 'درباره ما', 'خدمات', 'تماس با ما'],
                imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2940&auto=format&fit=crop'
            };
            advanceWebDevProject({ prototype: prototype, status: 'prototype_ready' });
        }, 8000);
    };
    
    const renderActionArea = () => {
        switch (project.status) {
            case 'requested':
                return (
                    <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="font-bold text-amber-400">ماموریت فعال: گفتگوی کشف</h4>
                            <p className="text-sm text-stone-300 mt-1">برای اینکه هوش مصنوعی بتواند دقیق‌ترین طرح را برای شما بزند، نیاز به یک گفتگوی کوتاه دارد.</p>
                        </div>
                        <button 
                            onClick={() => setIsDiscoveryModalOpen(true)} 
                            className="bg-amber-500 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-amber-600 shadow-lg flex items-center gap-2 whitespace-nowrap animate-pulse"
                        >
                            <BrainCircuitIcon className="w-5 h-5" />
                            شروع گفتگو
                        </button>
                    </div>
                );
            case 'generating_prototype':
                 return (
                    <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl text-center">
                        <SparklesIcon className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-spin"/>
                        <h4 className="font-bold text-indigo-300">معمار هوشمند در حال طراحی است...</h4>
                        <p className="text-sm text-stone-300 mt-1">لطفاً چند لحظه صبر کنید. داریم زیرساخت‌های دیجیتال شما را می‌چینیم.</p>
                    </div>
                );
            case 'prototype_ready':
                return (
                    <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl">
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                             <div className="flex-grow">
                                <h4 className="font-bold text-green-400 flex items-center gap-2"><SitemapIcon className="w-5 h-5"/> پیش‌نمونه آماده شد!</h4>
                                <p className="text-sm text-stone-300 mt-1">هوش مصنوعی طرح اولیه را بر اساس صحبت‌های شما آماده کرده است.</p>
                             </div>
                             <button onClick={() => advanceWebDevProject({ status: 'launching' })} className="bg-green-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-green-700 shadow-lg whitespace-nowrap">
                                تایید و شروع ساخت
                            </button>
                        </div>
                         {project.prototype && (
                            <div className="mt-4 p-3 bg-stone-800 rounded-lg text-xs text-stone-400 border border-stone-700 grid grid-cols-2 gap-2">
                                <p>شعار: <span className="text-white">{project.prototype.tagline}</span></p>
                                <p>رنگ‌ها: {project.prototype.colors.map(c=>c.name).join(', ')}</p>
                            </div>
                        )}
                    </div>
                );
            case 'launching':
                return (
                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl text-center">
                        <h4 className="font-bold text-blue-300">در حال توسعه و کدنویسی...</h4>
                        <p className="text-sm text-stone-300 mt-1">تیم فنی در حال پیاده‌سازی نهایی است. به زودی خبرهای خوبی می‌شنوید.</p>
                         <button onClick={() => advanceWebDevProject({ status: 'live' })} className="mt-3 text-xs bg-stone-700 hover:bg-stone-600 px-3 py-1 rounded text-stone-300">
                            (شبیه‌سازی تکمیل پروژه)
                        </button>
                    </div>
                );
            case 'live':
                 return (
                    <div className="bg-gradient-to-r from-green-800 to-emerald-900 p-6 rounded-xl text-center shadow-lg border border-green-500/50">
                        <GlobeIcon className="w-12 h-12 text-white mx-auto mb-2" />
                        <h3 className="font-bold text-2xl text-white">میراث دیجیتال شما زنده است!</h3>
                        <p className="text-green-100 mt-2 mb-4">وب‌سایت شما با موفقیت راه‌اندازی شد و اکنون در دسترس جهانیان است.</p>
                        <a href="#" className="inline-block bg-white text-green-900 font-bold px-8 py-3 rounded-full hover:bg-green-50 shadow-lg transition-transform transform hover:scale-105">
                            مشاهده وب‌سایت
                        </a>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-stone-900 rounded-2xl border border-stone-700 overflow-hidden shadow-xl mb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-stone-800 to-stone-900 p-4 border-b border-stone-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/50">
                        <SitemapIcon className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">پروژه: {project.initialRequest?.projectName || 'میراث دیجیتال'}</h3>
                        <p className="text-xs text-stone-400">{project.packageName}</p>
                    </div>
                </div>
                <button onClick={() => setIsDetailsOpen(!isDetailsOpen)} className="text-stone-400 hover:text-white transition-colors">
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Details Accordion */}
            {isDetailsOpen && (
                <div className="bg-stone-800/50 p-4 border-b border-stone-700 text-sm text-stone-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <p className="text-stone-500 text-xs uppercase mb-1">چشم‌انداز</p>
                        <p>{project.initialRequest?.vision}</p>
                    </div>
                    <div>
                        <p className="text-stone-500 text-xs uppercase mb-1">مخاطبان</p>
                        <p>{project.initialRequest?.targetAudience}</p>
                    </div>
                </div>
            )}

            <div className="p-6">
                {/* Visual Timeline */}
                <div className="relative mb-8 px-2">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-700 -translate-y-1/2 rounded-full"></div>
                    <div 
                        className="absolute top-1/2 right-0 h-1 bg-gradient-to-l from-amber-500 to-green-500 -translate-y-1/2 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                    <div className="relative flex justify-between">
                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            const Icon = step.icon;
                            
                            return (
                                <div key={step.id} className="flex flex-col items-center group">
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${isCurrent ? 'bg-stone-900 border-amber-500 text-amber-500 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : isCompleted ? 'bg-green-600 border-green-600 text-white' : 'bg-stone-800 border-stone-600 text-stone-500'}`}>
                                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <div className={`absolute top-12 text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-opacity duration-300 ${isCurrent ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-100 text-stone-400'}`}>
                                        {step.title}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Action Area */}
                <div className="animate-fade-in">
                    {renderActionArea()}
                </div>
            </div>
            
            <ProjectDiscoveryChatModal
                isOpen={isDiscoveryModalOpen}
                onClose={() => setIsDiscoveryModalOpen(false)}
                onComplete={handleDiscoveryComplete}
            />
        </div>
    );
};

export default ArchitectJourney;
