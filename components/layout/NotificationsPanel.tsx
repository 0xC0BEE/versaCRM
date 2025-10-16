import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Bell, X, AtSign, CheckSquare, LifeBuoy, ArrowRight } from 'lucide-react';
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
        case 'deal_won':
            return <CheckSquare className="h-5 w-5 text-green-500" />;
        case 'ticket_assigned':
        case 'ticket_reply':
            return <LifeBuoy className="h-5 w-5 text-green-500" />;
        default:
            return <Bell className="h-5 w-5 text-text-secondary" />;
    }
};

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ onClose }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { setCurrentPage, setInitialRecordLink } = useApp();

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.linkTo) {
            setInitialRecordLink(notification.linkTo);
            setCurrentPage(notification.linkTo.page);
        }
        onClose();
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card-bg rounded-lg shadow-lg-new border border-border-subtle z-20 flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-subtle">
                <h3 className="font-semibold text-text-primary">Notifications</h3>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                            Mark all as read
                        </button>
                    )}
                    <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-hover-bg">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-96">
                {notifications.length > 0 ? (
                    <ul className="divide-y divide-border-subtle">
                        {notifications.slice(0, 10).map(notification => (
                            <li
                                key={notification.id}
                                className={`p-4 hover:bg-hover-bg cursor-pointer ${!notification.isRead ? 'bg-primary/5' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 pt-0.5">{getNotificationIcon(notification.type)}</div>
                                    <div className="flex-grow">
                                        <p className="text-sm text-text-primary">{notification.message}</p>

                                        <p className="text-xs text-text-secondary mt-1">
                                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="flex-shrink-0 self-center">
                                            <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-16 text-text-secondary">
                        <Bell className="mx-auto h-12 w-12 text-text-secondary/50" />
                        <p className="mt-2 text-sm">You're all caught up!</p>
                    </div>
                )}
            </div>
             <div className="flex-shrink-0 p-2 border-t border-border-subtle">
                <button
                    onClick={() => { setCurrentPage('Notifications'); onClose(); }}
                    className="w-full text-center text-sm font-semibold text-primary py-2 rounded-md hover:bg-primary/10 flex items-center justify-center gap-1"
                >
                    View All Notifications <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default NotificationsPanel;