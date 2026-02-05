'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    PresentationChartLineIcon,
    ShoppingBagIcon,
    CubeIcon,
    UsersIcon,
    CurrencyDollarIcon,
    SparklesIcon,
    DocumentTextIcon,
    EnvelopeIcon,
    Cog6ToothIcon,
    ChevronLeftIcon,
    BoltIcon,
} from '@heroicons/react/24/outline';

interface AdminSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

const navigation = [
    {
        group: 'اصلی',
        items: [
            { id: 'dashboard', label: 'داشبورد', icon: PresentationChartLineIcon, href: '/admin' },
        ]
    },
    {
        group: 'فروش و تجارت',
        items: [
            { id: 'orders', label: 'سفارشات', icon: ShoppingBagIcon, href: '/admin/orders' },
            { id: 'products', label: 'محصولات', icon: CubeIcon, href: '/admin/products' },
            { id: 'finance', label: 'گزارش مالی', icon: CurrencyDollarIcon, href: '/admin/finance' },
        ]
    },
    {
        group: 'کاربران و نخل‌ها',
        items: [
            { id: 'users', label: 'کاربران', icon: UsersIcon, href: '/admin/users' },
            { id: 'palms', label: 'نخل‌ها', icon: SparklesIcon, href: '/admin/palms' },
        ]
    },
    {
        group: 'محتوا و ارتباطات',
        items: [
            { id: 'content', label: 'محتوا', icon: DocumentTextIcon, href: '/admin/content' },
            { id: 'messages', label: 'پیام‌ها', icon: EnvelopeIcon, href: '/admin/messages' },
        ]
    },
    {
        group: 'سیستم',
        items: [
            { id: 'settings', label: 'تنظیمات', icon: Cog6ToothIcon, href: '/admin/settings' },
        ]
    }
];

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname?.startsWith(href);
    };

    return (
        <aside className={`
            relative z-50 flex flex-col transition-all duration-300 ease-in-out 
            border-l border-white/5 bg-black/40 backdrop-blur-xl
            ${isOpen ? 'w-64' : 'w-20'}
        `}>
            {/* Logo Area */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                        <BoltIcon className="w-5 h-5 text-black" />
                    </div>
                    {isOpen && (
                        <div className="animate-fade-in">
                            <h2 className="text-white font-bold text-sm">نخلستان معنا</h2>
                            <p className="text-[10px] text-emerald-500 font-medium">پنل مدیریت</p>
                        </div>
                    )}
                </div>

                {/* Toggle Button */}
                <button
                    onClick={onToggle}
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                >
                    <ChevronLeftIcon className={`w-4 h-4 text-stone-400 transition-transform ${!isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-grow overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
                {navigation.map((group, idx) => (
                    <div key={idx} className="space-y-1">
                        {isOpen && (
                            <p className="px-3 text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-2">
                                {group.group}
                            </p>
                        )}
                        {group.items.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 p-2.5 rounded-xl transition-all group
                                        ${active
                                            ? 'bg-emerald-500/10 text-white border border-emerald-500/20'
                                            : 'hover:bg-white/5 text-stone-500 hover:text-stone-300 border border-transparent'
                                        }
                                    `}
                                >
                                    <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-emerald-400' : ''}`} />
                                    {isOpen && (
                                        <span className="text-sm font-medium">{item.label}</span>
                                    )}
                                    {active && isOpen && (
                                        <div className="mr-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Footer */}
            {isOpen && (
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] font-medium text-stone-500 mb-2">
                        <span>سلامت سیستم</span>
                        <span className="text-emerald-500">آنلاین</span>
                    </div>
                    <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[99%]"></div>
                    </div>
                </div>
            )}
        </aside>
    );
}
