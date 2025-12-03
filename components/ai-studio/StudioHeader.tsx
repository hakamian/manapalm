
import React from 'react';
import { SparklesIcon, MagnifyingGlassIcon } from '../icons';
import { ToolCategory } from '../../utils/aiStudioConfig';

interface StudioHeaderProps {
    selectedCategory: ToolCategory;
    onSelectCategory: (category: ToolCategory) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const StudioHeader: React.FC<StudioHeaderProps> = ({ selectedCategory, onSelectCategory, searchQuery, onSearchChange }) => {
    const categories: { id: ToolCategory; label: string }[] = [
        { id: 'all', label: 'همه ابزارها' },
        { id: 'visual', label: 'تصویر و ویدیو' },
        { id: 'text', label: 'متن و نوشتار' },
        { id: 'audio', label: 'صوت و گفتار' },
        { id: 'strategy', label: 'استراتژی و کد' },
        { id: 'education', label: 'آموزش' },
    ];

    return (
        <div className="relative mb-12 px-6 animate-fade-in-down">
            {/* Hero Section */}
            <div className="text-center py-12 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-bold mb-6 uppercase tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                        <SparklesIcon className="w-4 h-4" />
                        هوش مصنوعی مولد (Generative AI)
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-gray-300 mb-6 tracking-tight leading-tight">
                        استودیوی خلاقیت <br className="hidden md:block" /> <span className="text-purple-400">هوشمانا</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        قدرتمندترین ابزارهای هوش مصنوعی جهان (Gemini, Imagen, Veo) در یک پلتفرم یکپارچه. <br/>
                        ایده‌های خود را به متن، تصویر، ویدیو و صدا تبدیل کنید.
                    </p>
                </div>
            </div>

            {/* Navigation & Search Bar */}
            <div className="max-w-5xl mx-auto">
                <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700 rounded-2xl p-2 flex flex-col md:flex-row items-center gap-4 shadow-2xl">
                    {/* Categories */}
                    <div className="flex overflow-x-auto gap-1 w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => onSelectCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                                    selectedCategory === cat.id
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 scale-105'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-8 bg-gray-700 mx-2"></div>

                    {/* Search Input */}
                    <div className="relative w-full md:flex-grow group">
                        <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="جستجو در ابزارها (مثلا: ساخت ویدیو...)"
                            className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl py-3 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder-gray-600"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudioHeader;
