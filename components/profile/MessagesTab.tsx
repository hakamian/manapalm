import React, { useState } from 'react';
import { User } from '../../types';
import { EnvelopeIcon, ChatBubbleOvalLeftEllipsisIcon, CheckCircleIcon, ExclamationCircleIcon } from '../icons';

interface MessagesTabProps {
    user: User;
}

const MessagesTab: React.FC<MessagesTabProps> = ({ user }) => {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    // Fallback to empty array if undefined
    const messages = user.messages || [];

    const displayedMessages = filter === 'all'
        ? messages
        : messages.filter(m => !m.isRead);

    return (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <EnvelopeIcon className="w-6 h-6 text-green-400" />
                    پیام‌ها و درخواست‌ها
                </h2>
                <div className="flex bg-gray-700 rounded-lg p-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${filter === 'all' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        همه پیام‌ها
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${filter === 'unread' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        خوانده نشده
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {displayedMessages.length > 0 ? (
                    displayedMessages.map(msg => (
                        <div key={msg.id} className={`p-4 rounded-lg border transition-colors ${!msg.isRead ? 'bg-green-900/10 border-green-800/50' : 'bg-gray-700/30 border-gray-700'} hover:border-gray-500`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    {msg.type === 'ticket' ? (
                                        <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-amber-400" />
                                    ) : (
                                        <ExclamationCircleIcon className="w-5 h-5 text-blue-400" />
                                    )}
                                    <h3 className={`font-bold ${!msg.isRead ? 'text-white' : 'text-gray-300'}`}>{msg.title}</h3>
                                    {msg.reply && (
                                        <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded border border-green-800/50 flex items-center gap-1">
                                            <CheckCircleIcon className="w-3 h-3" /> پاسخ داده شده
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500">{new Date(msg.date).toLocaleDateString('fa-IR')}</span>
                            </div>

                            <p className="text-sm text-gray-300 mb-3 leading-relaxed border-l-2 border-gray-600 pl-3 ml-1">
                                {msg.body}
                            </p>

                            {msg.reply && (
                                <div className="bg-gray-700/50 p-3 rounded text-sm mt-3 ml-4 border-r-2 border-green-500 pr-3">
                                    <span className="text-xs text-green-400 font-bold block mb-1">پاسخ پشتیبانی:</span>
                                    <p className="text-gray-300">{msg.reply}</p>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <EnvelopeIcon className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-400">پیامی برای نمایش وجود ندارد.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesTab;
