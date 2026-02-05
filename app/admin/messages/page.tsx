'use client';

import React from 'react';
import {
    EnvelopeIcon,
    EnvelopeOpenIcon,
    TrashIcon,
    ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';

// Mock messages for demo
const mockMessages = [
    { id: '1', name: 'علی رضایی', email: 'ali@example.com', subject: 'سوال درباره نخل میراث', message: 'سلام، می‌خواستم بدانم نخل میراث دقیقاً کجا کاشته می‌شود؟', read: false, date: '2026-02-05' },
    { id: '2', name: 'مریم احمدی', email: 'maryam@example.com', subject: 'مشکل در پرداخت', message: 'پرداخت من انجام شد ولی سفارش ثبت نشد.', read: true, date: '2026-02-04' },
    { id: '3', name: 'حسین محمدی', email: 'hossein@example.com', subject: 'همکاری', message: 'امکان همکاری با نخلستان معنا وجود دارد؟', read: false, date: '2026-02-03' },
];

export default function MessagesPage() {
    const [messages, setMessages] = React.useState(mockMessages);
    const [selectedMessage, setSelectedMessage] = React.useState<typeof mockMessages[0] | null>(null);

    const unreadCount = messages.filter(m => !m.read).length;

    const markAsRead = (id: string) => {
        setMessages(msgs => msgs.map(m => m.id === id ? { ...m, read: true } : m));
    };

    const deleteMessage = (id: string) => {
        setMessages(msgs => msgs.filter(m => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">پیام‌های تماس</h1>
                    <p className="text-stone-500 text-sm mt-1">پیام‌های دریافتی از فرم تماس با ما</p>
                </div>
                {unreadCount > 0 && (
                    <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm">
                        {unreadCount} خوانده نشده
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Messages List */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="divide-y divide-white/5">
                        {messages.map((msg) => (
                            <button
                                key={msg.id}
                                onClick={() => {
                                    setSelectedMessage(msg);
                                    markAsRead(msg.id);
                                }}
                                className={`w-full p-4 text-right hover:bg-white/5 transition-colors ${selectedMessage?.id === msg.id ? 'bg-white/10' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-2 ${msg.read ? 'bg-stone-600' : 'bg-emerald-500'}`}></div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className={`font-medium truncate ${msg.read ? 'text-stone-400' : 'text-white'}`}>
                                                {msg.name}
                                            </p>
                                            <span className="text-xs text-stone-600 flex-shrink-0">{msg.date}</span>
                                        </div>
                                        <p className={`text-sm truncate ${msg.read ? 'text-stone-600' : 'text-stone-400'}`}>
                                            {msg.subject}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                        {messages.length === 0 && (
                            <div className="p-8 text-center text-stone-500">
                                <EnvelopeIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>پیامی وجود ندارد</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Message Detail */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
                    {selectedMessage ? (
                        <div className="space-y-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedMessage.subject}</h2>
                                    <p className="text-stone-500 text-sm mt-1">
                                        از: {selectedMessage.name} ({selectedMessage.email})
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => window.open(`mailto:${selectedMessage.email}`, '_blank')}
                                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-emerald-500"
                                        title="پاسخ"
                                    >
                                        <ArrowUturnLeftIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => deleteMessage(selectedMessage.id)}
                                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-red-500"
                                        title="حذف"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-stone-300 leading-relaxed whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </p>
                            </div>
                            <button
                                onClick={() => window.open(`mailto:${selectedMessage.email}`, '_blank')}
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
                            >
                                ارسال پاسخ
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-stone-500">
                            <EnvelopeOpenIcon className="w-16 h-16 mb-4 opacity-50" />
                            <p>یک پیام را انتخاب کنید</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
