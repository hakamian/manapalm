'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppState } from '@/AppContext';
import {
    Bars3Icon,
    MagnifyingGlassIcon,
    BellIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface AdminHeaderProps {
    onMenuToggle: () => void;
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
    const { currentUser } = useAppState();
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-black/20 backdrop-blur-md z-40">
            {/* Left Section */}
            <div className="flex items-center gap-4 flex-grow max-w-xl">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onMenuToggle}
                    className="p-2 hover:bg-white/5 rounded-xl transition-colors md:hidden"
                >
                    <Bars3Icon className="w-5 h-5" />
                </button>

                {/* Search */}
                <div className="relative flex-grow hidden sm:block">
                    <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                        type="text"
                        placeholder="جستجو در پنل مدیریت..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pr-10 pl-4 text-sm 
                                   placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/50 
                                   focus:ring-2 focus:ring-emerald-500/10 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <button className="relative p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5">
                    <BellIcon className="w-5 h-5" />
                    <span className="absolute top-1.5 left-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#050505]"></span>
                </button>

                {/* Back to Site */}
                <Link
                    href="/"
                    className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5 text-sm text-stone-400 hover:text-white"
                >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span>بازگشت به سایت</span>
                </Link>

                {/* Admin Avatar */}
                <div className="flex items-center gap-3 pr-3 border-r border-white/10">
                    <div className="text-left hidden sm:block">
                        <p className="text-sm font-medium text-white">{currentUser?.fullName || 'مدیر'}</p>
                        <p className="text-[10px] text-emerald-500">مدیر سیستم</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
                        {currentUser?.fullName?.charAt(0) || 'A'}
                    </div>
                </div>
            </div>
        </header>
    );
}
