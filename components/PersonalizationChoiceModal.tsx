
import React from 'react';
import Modal from './Modal';
import { SparklesIcon, BrainCircuitIcon, StarIcon, DocumentTextIcon } from './icons';

interface PersonalizationChoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onChooseStandard: () => void;
    onChoosePersonalized: () => void;
    manaCost: number;
}

const PersonalizationChoiceModal: React.FC<PersonalizationChoiceModalProps> = ({ isOpen, onClose, onChooseStandard, onChoosePersonalized, manaCost }) => {
    if (!isOpen) return null;
    
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 w-full max-w-lg bg-stone-900 text-white rounded-2xl border border-stone-700">
                <div className="text-center mb-6">
                    <SparklesIcon className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-white">انتخاب مسیر یادگیری</h2>
                    <p className="text-stone-400 mt-2">چگونه می‌خواهید این دوره را تجربه کنید؟</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {/* Option A: Personalized */}
                    <button 
                        onClick={onChoosePersonalized}
                        className="group relative p-5 rounded-xl bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-2 border-indigo-500/50 hover:border-indigo-400 transition-all text-right overflow-hidden shadow-lg"
                    >
                        <div className="absolute top-0 left-0 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-br-lg shadow-md z-10">پیشنهاد هوشمانا</div>
                        <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <BrainCircuitIcon className="w-5 h-5 text-amber-400" />
                                تجربه شخصی‌سازی شده
                            </h3>
                            <p className="text-sm text-stone-300 mt-2 leading-relaxed">
                                هوش مصنوعی محتوای دوره را دقیقا بر اساس شغل، صنعت و چالش‌های شما بازنویسی می‌کند.
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-indigo-300">
                                <StarIcon className="w-4 h-4 text-yellow-400" />
                                هزینه: {manaCost.toLocaleString('fa-IR')} امتیاز معنا
                            </div>
                        </div>
                    </button>

                    {/* Option B: Standard */}
                    <button 
                        onClick={onChooseStandard}
                        className="p-5 rounded-xl bg-stone-800 hover:bg-stone-700 border-2 border-stone-600 hover:border-stone-500 transition-all text-right group"
                    >
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <DocumentTextIcon className="w-5 h-5 text-stone-400" />
                            دوره استاندارد
                        </h3>
                        <p className="text-sm text-stone-400 mt-2 leading-relaxed">
                            محتوای اصلی و اورجینال دوره را بدون تغییر مشاهده کنید.
                        </p>
                        <div className="mt-3 text-xs font-bold text-green-400">
                            رایگان (همراه با دوره)
                        </div>
                    </button>
                </div>

                <button onClick={onClose} className="w-full mt-6 text-stone-500 hover:text-stone-300 text-sm">
                    انصراف
                </button>
            </div>
        </Modal>
    );
};

export default PersonalizationChoiceModal;
