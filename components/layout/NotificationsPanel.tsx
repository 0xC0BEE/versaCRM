import React, { useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck, MessageSquare, CheckSquare } from 'lucide-react';
import Button from '../ui/Button';
import { NotificationType } from '../../types';

interface NotificationsPanelProps {
    onClose: () => void;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
    mention: <MessageSquare className="h-5 w-5 text-purple-500" />,
    task_assigned: <CheckSquare className="h-5 w-5 text-blue-500" />,
};

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ onClose }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const panelRef = useRef<HTMLDivElement>(null);

    // Close panel if clicked outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div ref={panelRef} className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-dark-card rounded-lg shadow-lg border dark:border-dark-border z-20">
            <div className="p-3 flex justify-between items-center border-b dark:border-dark-border">
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                    <Button size="sm" variant="secondary" onClick={markAllAsRead} leftIcon={<CheckCheck size={14} />}>
                        Mark all as read
                    </Button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <div
                            key={n.id}
                            className={`p-3 flex items-start gap-3 border-b dark:border-dark-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${!n.isRead ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                            onClick={() => markAsRead(n.id)}
                        >
                            <div className="flex-shrink-0 mt-1">
                                {notificationIcons[n.type]}
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm text-gray-800 dark:text-gray-200">{n.message}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                            {!n.isRead && (
                                <div className="flex-shrink-0 mt-1">
                                    <span className="block h-2.5 w-2.5 rounded-full bg-primary-500" title="Unread"></span>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Bell size={32} className="mx-auto" />
                        <p className="mt-2 text-sm">You're all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;