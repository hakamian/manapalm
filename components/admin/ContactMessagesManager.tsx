'use client';

import React, { useState, useEffect } from 'react';
import { EnvelopeIcon, CheckCircleIcon, TrashIcon, EyeIcon, XMarkIcon } from '../icons';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

interface ContactMessagesManagerProps {
    // Optional: pass supabase client if available
}

const ContactMessagesManager: React.FC<ContactMessagesManagerProps> = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/contact-messages');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setMessages(data.messages || []);
        } catch (err) {
            setError('خطا در بارگذاری پیام‌ها');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await fetch('/api/contact-messages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_read: true })
            });
            setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
            if (selectedMessage?.id === id) {
                setSelectedMessage({ ...selectedMessage, is_read: true });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('آیا مطمئن هستید؟')) return;
        try {
            await fetch('/api/contact-messages', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            setMessages(prev => prev.filter(m => m.id !== id));
            if (selectedMessage?.id === id) {
                setSelectedMessage(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredMessages = messages.filter(m => {
        if (filter === 'unread') return !m.is_read;
        if (filter === 'read') return m.is_read;
        return true;
    });

    const unreadCount = messages.filter(m => !m.is_read).length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 text-red-400">
                <p>{error}</p>
                <button onClick={fetchMessages} className="mt-4 text-green-400 underline">تلاش مجدد</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <EnvelopeIcon className="w-8 h-8 text-green-400" />
                    <div>
                        <h2 className="text-2xl font-bold">پیام‌های ارتباط با ما</h2>
                        <p className="text-sm text-gray-400">
                            {unreadCount > 0 ? `${unreadCount} پیام خوانده نشده` : 'همه پیام‌ها خوانده شده'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                        همه ({messages.length})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-3 py-1 rounded-full text-sm ${filter === 'unread' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                        خوانده نشده ({unreadCount})
                    </button>
                    <button
                        onClick={() => setFilter('read')}
                        className={`px-3 py-1 rounded-full text-sm ${filter === 'read' ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                        خوانده شده
                    </button>
                </div>
            </div>

            {/* Messages List */}
            {filteredMessages.length === 0 ? (
                <div className="text-center py-16 bg-gray-800 rounded-lg">
                    <EnvelopeIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">پیامی وجود ندارد</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredMessages.map(msg => (
                        <div
                            key={msg.id}
                            className={`bg-gray-800 rounded-lg p-4 border transition-all cursor-pointer hover:border-green-500/50 ${!msg.is_read ? 'border-yellow-500/50 bg-gray-800/80' : 'border-gray-700'
                                } ${selectedMessage?.id === msg.id ? 'ring-2 ring-green-500' : ''}`}
                            onClick={() => setSelectedMessage(msg)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {!msg.is_read && (
                                            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                        )}
                                        <h3 className="font-semibold text-white">{msg.name}</h3>
                                        <span className="text-xs text-gray-500">•</span>
                                        <span className="text-sm text-gray-400">{msg.email}</span>
                                    </div>
                                    <p className="text-green-400 font-medium text-sm mb-1">{msg.subject}</p>
                                    <p className="text-gray-300 text-sm line-clamp-2">{msg.message}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-xs text-gray-500">
                                        {new Date(msg.created_at).toLocaleDateString('fa-IR')}
                                    </span>
                                    <div className="flex gap-1">
                                        {!msg.is_read && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleMarkAsRead(msg.id); }}
                                                className="p-1 rounded bg-green-600/20 text-green-400 hover:bg-green-600/40"
                                                title="علامت‌گذاری به عنوان خوانده شده"
                                            >
                                                <CheckCircleIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                                            className="p-1 rounded bg-red-600/20 text-red-400 hover:bg-red-600/40"
                                            title="حذف"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Message Detail Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMessage(null)}>
                    <div
                        className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedMessage.subject}</h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        از: {selectedMessage.name} ({selectedMessage.email})
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(selectedMessage.created_at).toLocaleString('fa-IR')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                                    {selectedMessage.message}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <a
                                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 rounded-lg font-medium"
                                >
                                    پاسخ با ایمیل
                                </a>
                                {!selectedMessage.is_read && (
                                    <button
                                        onClick={() => handleMarkAsRead(selectedMessage.id)}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                                    >
                                        علامت خوانده شده
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(selectedMessage.id)}
                                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg"
                                >
                                    حذف
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactMessagesManager;
