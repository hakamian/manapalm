
import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../AppContext';
import { View } from '../types';
import { 
    MagnifyingGlassIcon, ArrowLeftIcon, HomeIcon, 
    ShoppingCartIcon, UserCircleIcon, SparklesIcon,
    BookOpenIcon, UsersIcon
} from './icons';

interface Command {
    id: string;
    title: string;
    icon: React.FC<any>;
    action: () => void;
    category: string;
    shortcut?: string;
}

const CommandPalette: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const dispatch = useAppDispatch();
    const inputRef = useRef<HTMLInputElement>(null);

    const commands: Command[] = [
        { id: 'home', title: 'خانه', icon: HomeIcon, category: 'ناوبری', action: () => dispatch({ type: 'SET_VIEW', payload: View.Home }) },
        { id: 'profile', title: 'پروفایل من', icon: UserCircleIcon, category: 'ناوبری', action: () => dispatch({ type: 'SET_VIEW', payload: View.UserProfile }) },
        { id: 'shop', title: 'فروشگاه نخل', icon: ShoppingCartIcon, category: 'ناوبری', action: () => dispatch({ type: 'SET_VIEW', payload: View.Shop }) },
        { id: 'studio', title: 'استودیو هوش مصنوعی', icon: SparklesIcon, category: 'ابزارها', action: () => dispatch({ type: 'SET_VIEW', payload: View['ai-tools'] }) },
        { id: 'academy', title: 'آکادمی آموزشی', icon: BookOpenIcon, category: 'آموزش', action: () => dispatch({ type: 'SET_VIEW', payload: View.BUSINESS_ACADEMY }) },
        { id: 'community', title: 'کانون جامعه', icon: UsersIcon, category: 'جامعه', action: () => dispatch({ type: 'SET_VIEW', payload: View.CommunityHub }) },
        { id: 'plant', title: 'کاشت نخل جدید', icon: SparklesIcon, category: 'عملیات', action: () => dispatch({ type: 'START_PLANTING_FLOW' }) },
    ];

    const filteredCommands = commands.filter(cmd => 
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const handleSelect = (cmd: Command) => {
        cmd.action();
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                handleSelect(filteredCommands[selectedIndex]);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)}></div>
            
            <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center px-4 border-b border-stone-800">
                    <MagnifyingGlassIcon className="w-5 h-5 text-stone-500" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                        onKeyDown={handleKeyDown}
                        placeholder="جستجو در نخلستان... (یا دستوری تایپ کنید)"
                        className="w-full bg-transparent p-4 text-white placeholder-stone-500 outline-none text-lg"
                    />
                    <div className="hidden md:flex items-center gap-1 text-xs text-stone-500 bg-stone-800 px-2 py-1 rounded">
                        <span className="font-mono">ESC</span>
                        <span>لغو</span>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar">
                    {filteredCommands.length === 0 ? (
                        <div className="p-4 text-center text-stone-500">
                            نتیجه‌ای یافت نشد.
                        </div>
                    ) : (
                        <div className="px-2">
                            {filteredCommands.map((cmd, index) => (
                                <button
                                    key={cmd.id}
                                    onClick={() => handleSelect(cmd)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                                        index === selectedIndex ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800'
                                    }`}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-white/20' : 'bg-stone-800 text-stone-400 group-hover:text-stone-200'}`}>
                                            <cmd.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">{cmd.title}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs ${index === selectedIndex ? 'text-amber-200' : 'text-stone-600'}`}>
                                            {cmd.category}
                                        </span>
                                        {index === selectedIndex && <ArrowLeftIcon className="w-4 h-4" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="p-2 bg-stone-950 border-t border-stone-800 text-center">
                    <p className="text-[10px] text-stone-500">
                        از کلیدهای جهت‌نما <span className="font-mono bg-stone-800 px-1 rounded">↑↓</span> برای انتخاب و <span className="font-mono bg-stone-800 px-1 rounded">Enter</span> برای اجرا استفاده کنید.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
