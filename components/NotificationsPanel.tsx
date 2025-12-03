
// Fix: Created the full content for NotificationsPanel.tsx.
import React from 'react';
import { Notification } from '../types.ts';
import { iconMap } from './icons.tsx';
import { timeAgo } from '../utils/time.ts';

interface NotificationsPanelProps {
    notifications: Notification[];
    onClose: () => void;
    onMarkAllRead: () => void;
    onNotificationClick: (notification: Notification) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onClose, onMarkAllRead, onNotificationClick }) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div 
            className="absolute left-0 mt-2 w-80 bg-white dark:bg-stone-800 rounded-lg shadow-lg border dark:border-stone-700 animate-fade-in-down"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-3 border-b dark:border-stone-700 flex justify-between items-center">
                <h3 className="font-bold text-lg">اعلان‌ها</h3>
                {unreadCount > 0 && (
                    <button onClick={onMarkAllRead} className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                        علامت‌گذاری همه به عنوان خوانده شده
                    </button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(n => {
                        const Icon = iconMap[n.icon as keyof typeof iconMap] || iconMap.default;
                        return (
                            <button 
                                key={n.id} 
                                onClick={() => onNotificationClick(n)}
                                className={`w-full text-right flex items-start gap-3 p-3 transition-colors ${!n.isRead ? 'bg-amber-50 dark:bg-amber-900/20' : ''} hover:bg-stone-100 dark:hover:bg-stone-700/50`}
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-stone-600 dark:text-stone-300" />
                                </div>
                                <div className="flex-grow">
                                    <p className={`text-sm font-semibold ${!n.isRead ? 'text-stone-800 dark:text-stone-100' : 'text-stone-600 dark:text-stone-300'}`}>
                                        {n.title}
                                    </p>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">{n.description}</p>
                                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">{timeAgo(n.date)}</p>
                                </div>
                                {!n.isRead && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>}
                            </button>
                        )
                    })
                ) : (
                    <p className="text-center text-sm text-stone-500 dark:text-stone-400 py-8">
                        شما اعلان جدیدی ندارید.
                    </p>
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;
