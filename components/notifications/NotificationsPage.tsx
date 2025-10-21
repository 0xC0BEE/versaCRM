import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import { Card } from '../ui/Card';
import Tabs from '../ui/Tabs';
import { useNotifications } from '../../contexts/NotificationContext';
import { useApp } from '../../contexts/AppContext';
import { AppNotification } from '../../types';
import { AtSign, Bell, CheckSquare, LifeBuoy, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Button from '../ui/Button';

const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
        case 'mention': return <AtSign className="h-5 w-5 text-purple-500" />;
        case 'chat_mention': return <MessageSquare className="h-5 w-5 text-indigo-500" />;
        case 'task_assigned': return <CheckSquare className="h-5 w-5 text-blue-500" />;
        case 'deal_won': return <CheckSquare className="h-5 w-5 text-green-500" />;
        case 'ticket_assigned':
        case 'ticket_reply': return <LifeBuoy className="h-5 w-5 text-green-500" />;
        default: return <Bell className="h-5 w-5 text-text-secondary" />;
    }
};

const NotificationsPage: React.FC = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { setCurrentPage, setInitialRecordLink } = useApp();
    const [activeTab, setActiveTab] = useState('All');

    const filteredNotifications = React.useMemo(() => {
        if (activeTab.startsWith('Unread')) {
            return notifications.filter(n => !n.isRead);
        }
        return notifications;
    }, [notifications, activeTab]);

    const handleNotificationClick = (notification: AppNotification) => {
        markAsRead(notification.id);
        if (notification.linkTo) {
            setInitialRecordLink(notification.linkTo);
            setCurrentPage(notification.linkTo.page);
        }
    };

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-text-heading">Notifications</h1>
                {unreadCount > 0 && (
                    <Button variant="secondary" onClick={markAllAsRead}>Mark all as read</Button>
                )}
            </div>
            <Card>
                <div className="p-6">
                    <Tabs tabs={[`All (${notifications.length})`, `Unread (${unreadCount})`]} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="mt-6">
                        {filteredNotifications.length > 0 ? (
                            <ul className="divide-y divide-border-subtle">
                                {filteredNotifications.map(notification => (
                                    <li
                                        key={notification.id}
                                        className={`p-4 hover:bg-hover-bg cursor-pointer ${!notification.isRead ? 'bg-primary/5' : ''}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 pt-0.5">{getNotificationIcon(notification.type)}</div>
                                            <div className="flex-grow">
                                                <p className="text-sm text-text-primary">{notification.message}</p>
                                                <p className="text-xs text-text-secondary mt-1">
                                                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="flex-shrink-0 self-center">
                                                    <div className="w-2.5 h-2.5 bg-primary rounded-full" title="Unread"></div>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-20 text-text-secondary">
                                <Bell className="mx-auto h-16 w-16 text-text-secondary/50" />
                                <h2 className="mt-4 text-lg font-semibold text-text-primary">All caught up!</h2>
                                <p className="mt-2 text-sm">You have no new notifications.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </PageWrapper>
    );
};

export default NotificationsPage;