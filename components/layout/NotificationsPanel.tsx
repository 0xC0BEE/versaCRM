import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Bell, X, AtSign, CheckSquare, LifeBuoy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface NotificationsPanelProps {
    onClose: () => void;
}

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'mention':
            return <AtSign className="h-5 w-5 text-purple-500" />;
        case 'task_assigned':
            return <CheckSquare className="h-5 w-5 text-blue-500" />;
        case 'ticket_assigned':
        case 'ticket_reply':
            return <LifeBuoy className="h-5 w-5 text-green-500" />;
        default:
            // Fallback for any other types like 'deal_won'
            return <Bell className="h-5 w-5 text-gray-500" />;
    }
};

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ onClose }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { setCurrentPage } = useApp();

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.type === 'task_assigned') {
            setCurrentPage('Tasks');
        }
        if (notification.type === 'ticket_assigned' || notification.type === 'ticket_reply') {
            setCurrentPage('Tickets');
        }
        // Add more navigation logic here for other notification types
        onClose();
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-dark-card rounded-lg shadow-lg border dark:border-dark-border z-20 flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center p-4 border-b dark:border-dark-border">
                <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                            Mark all as read
                        </button>
                    )}
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-96">
                {notifications.length > 0 ? (
                    <ul className="divide-y dark:divide-dark-border">
                        {notifications.map(notification => (
                            <li
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${!notification.isRead ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 pt-0.5">{getNotificationIcon(notification.type)}</div>
                                    <div className="flex-grow">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{notification.message}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="flex-shrink-0 self-center">
                                            <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        <Bell className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm">You're all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;