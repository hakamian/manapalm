'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/AppContext';
import AdminSidebar from '@/components/admin-v2/AdminSidebar';
import AdminHeader from '@/components/admin-v2/AdminHeader';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentUser } = useAppState();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        // Auth Guard: Check if user is admin
        if (!currentUser) {
            router.push('/');
            return;
        }

        if (!currentUser.isAdmin) {
            router.push('/profile');
            return;
        }

        setIsLoading(false);
    }, [currentUser, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="text-stone-400 text-sm">در حال بارگذاری پنل مدیریت...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#050505] text-stone-300 overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] to-[#050505]">
                {/* Noise Overlay */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none"></div>

                {/* Header */}
                <AdminHeader
                    onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                {/* Scrollable Content */}
                <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
                    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
