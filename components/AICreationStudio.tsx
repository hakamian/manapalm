
import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppState } from '../AppContext';
import { useStudioLogic } from '../hooks/useStudioLogic';
import { View } from '../types';
import ActiveToolRenderer from './ai-studio/ActiveToolRenderer';
import ToolDemoModal from './ToolDemoModal';
import PurchaseStorageModal from './PurchaseStorageModal';
import ToolGrid from './ai-studio/ToolGrid';
import AIAcademyView from './ai-studio/AIAcademyView';
import { SparklesIcon, AcademicCapIcon, StarIcon, MagnifyingGlassIcon, ArrowRightIcon, XMarkIcon } from './icons';
import { ToolCategory } from '../utils/aiStudioConfig';

interface AICreationStudioProps {
    initialTab?: 'studio' | 'academy';
}

const categories: { id: ToolCategory; label: string }[] = [
    { id: 'all', label: 'همه ابزارها' },
    { id: 'visual', label: 'تصویر و ویدیو' },
    { id: 'text', label: 'متن و نوشتار' },
    { id: 'audio', label: 'صوت و گفتار' },
    { id: 'strategy', label: 'استراتژی و کد' },
    { id: 'education', label: 'آموزش' },
];

const AICreationStudio: React.FC<AICreationStudioProps> = ({ initialTab = 'studio' }) => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [activeTab, setActiveTab] = useState<'studio' | 'academy'>(initialTab);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
    const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Custom Hook for Logic Separation
    const {
        activeToolId,
        setActiveToolId,
        demoTool,
        setDemoTool,
        groupedTools,
        handleToolSelect
    } = useStudioLogic(user, searchQuery);

    // Sync initialTab prop with state
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        if (isSearchExpanded && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchExpanded]);

    const handleUpdateProfile = (updatedUser: any) => {
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    };

    const toggleSearch = () => {
        if (isSearchExpanded && searchQuery) {
            setSearchQuery(''); // Clear search on close
        }
        setIsSearchExpanded(!isSearchExpanded);
    };

    return (
        <div className="flex flex-col h-[100dvh] pt-16 bg-[#050505] text-white overflow-hidden relative">
            
            {/* Top Navigation Bar (Stylish Tabs) */}
            <header className="flex-shrink-0 h-16 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-40 absolute top-0 left-0 right-0">
                
                {/* Left: Tool Back Button or Logo */}
                <div className="flex items-center gap-4 min-w-[120px]">
                    {activeToolId ? (
                        <button 
                            onClick={() => setActiveToolId(null)}
                            className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                        >
                            <ArrowRightIcon className="w-4 h-4" />
                            <span className="hidden md:inline">بازگشت</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 text-purple-500">
                            <SparklesIcon className="w-5 h-5" />
                            <span className="font-bold text-sm tracking-widest hidden md:inline">STUDIO</span>
                        </div>
                    )}
                </div>

                {/* Center: Modern Tabs (Filters) */}
                {!activeToolId && activeTab === 'studio' && (
                    <div className="flex-1 flex justify-center max-w-2xl mx-4 overflow-hidden">
                        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-full border border-white/5 overflow-x-auto custom-scrollbar no-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`
                                        px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap
                                        ${selectedCategory === cat.id 
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/20' 
                                            : 'text-stone-400 hover:text-white hover:bg-white/5'}
                                    `}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Right: Search & Points */}
                <div className="flex items-center justify-end gap-3 min-w-[120px]">
                    
                    {/* Expandable Search */}
                    {!activeToolId && activeTab === 'studio' && (
                        <div className={`relative flex items-center transition-all duration-300 ${isSearchExpanded ? 'w-48 md:w-64' : 'w-8'}`}>
                            <button 
                                onClick={toggleSearch}
                                className={`absolute left-0 z-10 p-1.5 text-stone-400 hover:text-white transition-colors ${isSearchExpanded ? 'left-2' : ''}`}
                            >
                                {isSearchExpanded ? <XMarkIcon className="w-4 h-4" /> : <MagnifyingGlassIcon className="w-5 h-5" />}
                            </button>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="جستجو..."
                                className={`
                                    w-full bg-stone-800 text-white text-xs rounded-full border border-stone-700 focus:border-purple-500 outline-none transition-all duration-300
                                    ${isSearchExpanded ? 'pl-8 pr-4 py-2 opacity-100' : 'w-0 p-0 opacity-0 border-none'}
                                `}
                            />
                        </div>
                    )}

                    {user && (
                        <div className="hidden md:flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-full border border-white/5">
                            <span className="text-xs font-bold text-white">{user.points.toLocaleString('fa-IR')}</span>
                            <StarIcon className="w-3 h-3 text-yellow-400 fill-current" />
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 bg-[#050505] overflow-hidden relative flex flex-col pt-0">
                
                {/* Mode Switcher (Studio vs Academy) - Only show if no tool active */}
                {!activeToolId && (
                    <div className="absolute top-20 right-6 z-30 hidden lg:flex flex-col gap-2">
                         <button 
                            onClick={() => setActiveTab('studio')}
                            className={`p-3 rounded-xl transition-all duration-300 border ${activeTab === 'studio' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-stone-900 border-stone-800 text-stone-500 hover:text-stone-300'}`}
                            title="استودیو خلاقیت"
                        >
                            <SparklesIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setActiveTab('academy')}
                            className={`p-3 rounded-xl transition-all duration-300 border ${activeTab === 'academy' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-stone-900 border-stone-800 text-stone-500 hover:text-stone-300'}`}
                            title="آکادمی هوش مصنوعی"
                        >
                            <AcademicCapIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Mobile Tab Switcher */}
                {!activeToolId && (
                    <div className="lg:hidden flex justify-center gap-4 mt-4 mb-2 px-6">
                        <button 
                             onClick={() => setActiveTab('studio')}
                             className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${activeTab === 'studio' ? 'bg-purple-900/20 border-purple-500/50 text-purple-300' : 'border-transparent text-stone-500'}`}
                        >
                            استودیو
                        </button>
                        <button 
                             onClick={() => setActiveTab('academy')}
                             className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${activeTab === 'academy' ? 'bg-blue-900/20 border-blue-500/50 text-blue-300' : 'border-transparent text-stone-500'}`}
                        >
                            آکادمی
                        </button>
                    </div>
                )}

                {activeTab === 'studio' ? (
                    activeToolId ? (
                        <div className="flex-1 overflow-hidden relative animate-fade-in h-full">
                            <ActiveToolRenderer 
                                activeToolId={activeToolId} 
                                user={user}
                                onUpdateProfile={handleUpdateProfile}
                                onOpenStorageModal={() => setIsStorageModalOpen(true)}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto h-full custom-scrollbar p-4 md:p-8 animate-fade-in">
                            <div className="max-w-7xl mx-auto mt-4">
                                <ToolGrid 
                                    groupedTools={groupedTools} 
                                    selectedCategory={selectedCategory}
                                    user={user}
                                    onToolSelect={handleToolSelect}
                                />
                            </div>
                        </div>
                    )
                ) : (
                    <div className="flex-1 overflow-y-auto h-full custom-scrollbar animate-fade-in">
                        <AIAcademyView user={user} />
                    </div>
                )}
            </main>
            
            {/* Modals */}
            {demoTool && (
                <ToolDemoModal 
                    isOpen={!!demoTool}
                    onClose={() => setDemoTool(null)}
                    tool={demoTool}
                    onAction={() => {
                        if (!user) {
                            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
                        } else {
                             dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: demoTool.unlockCost || 0, action: `باز کردن ابزار ${demoTool.title}` } });
                             const newUnlocked = [...(user.unlockedTools || []), demoTool.id];
                             dispatch({ type: 'UPDATE_USER', payload: { unlockedTools: newUnlocked } });
                             setDemoTool(null);
                        }
                    }}
                    actionLabel={!user ? 'login' : 'unlock'}
                />
            )}

            {user && (
                <PurchaseStorageModal
                    isOpen={isStorageModalOpen}
                    onClose={() => setIsStorageModalOpen(false)}
                    userPoints={user.points}
                    onConfirm={() => {
                        setIsStorageModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default AICreationStudio;
