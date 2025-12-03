import React, { useState, useEffect } from 'react';
import { User } from '../types.ts';
import Modal from './Modal.tsx';
import { SparklesIcon, BrainCircuitIcon, CheckIcon, ArrowLeftIcon, ArrowRightIcon } from './icons.tsx';

interface ConsultationModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSubmit: (details: any) => void;
}

type Step = 'intro' | 'details' | 'status' | 'success';

const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose, user, onSubmit }) => {
    const [step, setStep] = useState<Step>('intro');
    const [animationClass, setAnimationClass] = useState('animate-fade-in');
    
    // Form state
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [projectType, setProjectType] = useState('');
    const [vision, setVision] = useState('');
    const [projectStatus, setProjectStatus] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setStep('intro');
            setName(user.name);
            setContact(user.email || user.phone || '');
            setProjectType('');
            setVision('');
            setProjectStatus('');
        }
    }, [isOpen, user]);

    const changeStep = (newStep: Step, direction: 'forward' | 'backward') => {
        setAnimationClass(direction === 'forward' ? 'animate-fade-out-left' : 'animate-fade-out-right');
        setTimeout(() => {
            setStep(newStep);
            setAnimationClass(direction === 'forward' ? 'animate-fade-in-right' : 'animate-fade-in-left');
        }, 200);
    };

    const handleSubmit = () => {
        const details = { name, contact, projectType, vision, projectStatus };
        onSubmit(details);
        // The success step is now handled by the context navigating to the dashboard.
        // changeStep('success', 'forward'); 
    };

    const renderContent = () => {
        switch (step) {
            case 'intro':
                return (
                    <div className="text-center">
                        <SparklesIcon className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold">آیین شروع همکاری</h2>
                        <p className="my-3 text-stone-600 dark:text-stone-300">
                            خوشحالیم که قصد دارید میراث دیجیتال خود را با ما بسازید. این جلسه برای درک عمیق چشم‌انداز و معنای پروژه شما طراحی شده است.
                        </p>
                        <button onClick={() => changeStep('details', 'forward')} className="w-full mt-4 bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 flex items-center justify-center gap-2">
                            <span>شروع کنیم</span>
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                    </div>
                );
            case 'details':
                return (
                    <div>
                        <h3 className="text-xl font-bold mb-4">جزئیات پروژه</h3>
                        <div className="space-y-4 text-right">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">نام شما</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-md bg-stone-100 dark:bg-stone-700" readOnly />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">ایمیل یا تلفن</label>
                                    <input type="text" value={contact} onChange={e => setContact(e.target.value)} className="w-full p-2 border rounded-md bg-stone-100 dark:bg-stone-700" readOnly />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">نوع پروژه</label>
                                <select value={projectType} onChange={e => setProjectType(e.target.value)} className="w-full p-2 border rounded-md bg-transparent dark:border-stone-600 dark:bg-stone-800">
                                    <option value="">انتخاب کنید...</option>
                                    <option value="personal">وب‌سایت شخصی / برندینگ</option>
                                    <option value="business">وب‌سایت کسب‌وکار / فروشگاهی</option>
                                    <option value="ngo">وب‌سایت موسسه / غیرانتفاعی</option>
                                    <option value="other">سایر</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">چشم‌انداز و معنای اصلی پروژه شما چیست؟</label>
                                <textarea value={vision} onChange={e => setVision(e.target.value)} rows={3} placeholder="داستان و هدف پشت این پروژه را برای ما بنویسید..." className="w-full p-2 border rounded-md bg-transparent dark:border-stone-600"></textarea>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-between">
                             <button onClick={() => changeStep('intro', 'backward')} className="font-semibold text-stone-600 hover:text-stone-800 flex items-center gap-2"><ArrowRightIcon className="w-5 h-5"/> بازگشت</button>
                             <button onClick={() => changeStep('status', 'forward')} disabled={!projectType || !vision} className="bg-amber-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-amber-600 disabled:bg-amber-300">ادامه</button>
                        </div>
                    </div>
                );
            case 'status':
                 return (
                    <div>
                        <h3 className="text-xl font-bold mb-4">وضعیت پروژه</h3>
                         <div className="space-y-3 text-right">
                             <label className="block text-sm font-medium mb-2">در حال حاضر در چه مرحله‌ای از پروژه خود هستید؟</label>
                             
                             <div 
                                onClick={() => setProjectStatus('exploring')}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${projectStatus === 'exploring' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'border-stone-200 dark:border-stone-600 hover:bg-stone-50'}`}
                             >
                                <p className="font-semibold">ایده‌پردازی و کاوش</p>
                                <p className="text-xs text-stone-500 dark:text-stone-400">هنوز در مراحل اولیه هستم و به راهنمایی برای شفاف‌سازی ایده نیاز دارم.</p>
                             </div>
                             
                             <div 
                                onClick={() => setProjectStatus('ready')}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${projectStatus === 'ready' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'border-stone-200 dark:border-stone-600 hover:bg-stone-50'}`}
                            >
                                <p className="font-semibold">طرح مشخص و آماده برآورد هزینه</p>
                                <p className="text-xs text-stone-500 dark:text-stone-400">چشم‌انداز روشنی دارم و می‌خواهم در مورد هزینه و زمان‌بندی صحبت کنم.</p>
                             </div>

                             <div 
                                onClick={() => setProjectStatus('rebuild')}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${projectStatus === 'rebuild' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'border-stone-200 dark:border-stone-600 hover:bg-stone-50'}`}
                             >
                                <p className="font-semibold">بازسازی وب‌سایت موجود</p>
                                <p className="text-xs text-stone-500 dark:text-stone-400">یک وب‌سایت دارم و به دنبال بازطراحی یا ارتقای آن هستم.</p>
                             </div>
                        </div>
                        <div className="mt-6 flex justify-between">
                             <button onClick={() => changeStep('details', 'backward')} className="font-semibold text-stone-600 hover:text-stone-800 flex items-center gap-2"><ArrowRightIcon className="w-5 h-5"/> بازگشت</button>
                             <button onClick={handleSubmit} disabled={!projectStatus} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 disabled:bg-green-300">ارسال درخواست</button>
                        </div>
                    </div>
                );
            // Success step is removed as it's now handled by the context
            case 'success': return null;
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <style>{`
                @keyframes fade-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes fade-out-left { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-20px); } }
                @keyframes fade-in-left { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes fade-out-right { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(20px); } }
                .animate-fade-in-right { animation: fade-in-right 0.3s ease-out forwards; }
                .animate-fade-out-left { animation: fade-out-left 0.2s ease-in forwards; }
                .animate-fade-in-left { animation: fade-in-left 0.3s ease-out forwards; }
                .animate-fade-out-right { animation: fade-out-right 0.2s ease-in forwards; }
            `}</style>
            <div className="p-4 sm:p-6 w-full max-w-lg min-h-[350px]">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">جلسه مشاوره</span>
                    {step !== 'intro' && step !== 'success' && (
                        <span className="text-xs text-stone-500">
                           مرحله {step === 'details' ? '۱' : '۲'} از ۲
                        </span>
                    )}
                </div>
                <div className={animationClass}>
                    {renderContent()}
                </div>
            </div>
        </Modal>
    );
};

export default ConsultationModal;