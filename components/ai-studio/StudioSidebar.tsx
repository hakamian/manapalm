
import React from 'react';
import { SparklesIcon, AcademicCapIcon, ChevronRightIcon, CubeTransparentIcon, StarIcon, ArrowRightIcon } from '../icons';

interface StudioSidebarProps {
    activeTab: 'studio' | 'academy';
    setActiveTab: (tab: 'studio' | 'academy') => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    userPoints: number;
    activeToolId: string | null;
    onCloseTool: () => void;
}

const StudioSidebar: React.FC<StudioSidebarProps> = ({
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    userPoints,
    activeToolId,
    onCloseTool
}) => {
    return (
        <aside 
            className={`
                fixed inset-y-0 right-0 z-50 w-64 bg-[#09090b] border-l border-white/10 transform transition-transform duration-300 ease-in-out pt-16
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
                md:relative md:translate-x-0 md:pt-0
                ${!isSidebarOpen ? 'md:w-20' : 'md:w-64'}
            `}
        >
            {/* Toggle Button (Desktop Only) */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden md:flex absolute -left-3 top-20 bg-stone-800 text-stone-400 p-1 rounded-full border border-stone-700 hover:text-white transition-colors z-50"
            >
                <ChevronRightIcon className={`w-4 h-4 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex flex-col h-full">
                {/* User Balance */}
                <div className={`p-6 ${!isSidebarOpen ? 'items-center' : ''} flex flex-col border-b border-white/5`}>
                    {isSidebarOpen ? (
                        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 rounded-2xl border border-purple-500/20">
                            <p className="text-xs text-purple-200 mb-1">موجودی امتیاز معنا</p>
                            <div className="flex items-center gap-2">
                                <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                                <span className="text-2xl font-bold text-white">{userPoints.toLocaleString('fa-IR')}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center border border-purple-500/30" title={`${userPoints} امتیاز`}>
                            <StarIcon className="w-5 h-5 text-yellow-400" />
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {activeToolId && (
                         <button 
                            onClick={onCloseTool}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-4 bg-stone-800 text-stone-300 hover:text-white border border-stone-700 ${!isSidebarOpen ? 'justify-center' : ''}`}
                        >
                            <ArrowRightIcon className="w-5 h-5" />
                            {isSidebarOpen && <span className="font-semibold">بازگشت به ابزارها</span>}
                        </button>
                    )}

                    <button 
                        onClick={() => { setActiveTab('studio'); setIsMobileMenuOpen(false); if(activeToolId) onCloseTool(); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                            activeTab === 'studio' && !activeToolId
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/40' 
                                : 'text-stone-400 hover:bg-white/5 hover:text-white'
                        } ${!isSidebarOpen ? 'justify-center' : ''}`}
                    >
                        <SparklesIcon className="w-6 h-6" />
                        {isSidebarOpen && <span className="font-semibold">ابزارهای خلق</span>}
                    </button>

                    <button 
                        onClick={() => { setActiveTab('academy'); setIsMobileMenuOpen(false); if(activeToolId) onCloseTool(); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                            activeTab === 'academy' 
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-900/40' 
                                : 'text-stone-400 hover:bg-white/5 hover:text-white'
                        } ${!isSidebarOpen ? 'justify-center' : ''}`}
                    >
                        <AcademicCapIcon className="w-6 h-6" />
                        {isSidebarOpen && <span className="font-semibold">آکادمی هوش مصنوعی</span>}
                    </button>

                     <div className={`mt-8 pt-8 border-t border-white/5 ${!isSidebarOpen ? 'hidden' : 'block'}`}>
                        <p className="px-4 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">پروژه‌های اخیر</p>
                        {/* Placeholder for recent projects list */}
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-stone-400 hover:text-white transition-colors">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>تصویرسازی نخل...</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-stone-400 hover:text-white transition-colors">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span>ویدیو تبلیغاتی...</span>
                        </button>
                    </div>
                </nav>

                {/* Footer */}
                <div className={`p-4 border-t border-white/5 ${!isSidebarOpen ? 'hidden' : 'block'}`}>
                    <button className="w-full flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs transition-colors">
                        <CubeTransparentIcon className="w-4 h-4" />
                        <span>نسخه v2.5 (Beta)</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default StudioSidebar;
