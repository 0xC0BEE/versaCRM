import React, { createContext, useContext, ReactNode, useMemo, useEffect, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Notification, NotificationContextType } from '../types';
import { useAuth } from './AuthContext';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

const mockNotifications: Omit<Notification, 'userId'>[] = [
  {
    id: 'notif_1',
    type: 'mention',
    message: 'Alice Admin mentioned you in a note for John Patient.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    isRead: false,
    linkTo: '/contacts/contact_1',
  },
  {
    id: 'notif_2',
    type: 'task_assigned',
    message: 'Alice Admin assigned you a new task: "Prepare quarterly report".',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isRead: false,
    linkTo: '/tasks',
  },
  {
    id: 'notif_3',
    type: 'mention',
    message: 'Alice Admin mentioned you in a note for Jane Doe.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
    linkTo: '/contacts/contact_2',
  },
];

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { authenticatedUser } = useAuth();
    const [allNotifications, setAllNotifications] = useLocalStorage<Notification[]>('notifications', []);
    
    // On first load for a user, populate with mock data
    useEffect(() => {
        if (authenticatedUser && !allNotifications.some(n => n.userId === authenticatedUser.id)) {
            const userNotifications = mockNotifications.map(n => ({...n, userId: authenticatedUser.id!}));
             setAllNotifications(prev => [...prev, ...userNotifications]);
        }
    }, [authenticatedUser, setAllNotifications, allNotifications]);

    // Filter notifications for the currently logged-in user
    const notifications = useMemo(() => {
        if (!authenticatedUser) return [];
        return allNotifications
            .filter(n => n.userId === authenticatedUser.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [allNotifications, authenticatedUser]);
    
    const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `notif_${Date.now()}`,
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        setAllNotifications(prev => [newNotification, ...prev]);
    }, [setAllNotifications]);
    
    const markAsRead = useCallback((notificationId: string) => {
        setAllNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    }, [setAllNotifications]);

    const markAllAsRead = useCallback(() => {
        const userId = authenticatedUser?.id;
        if (!userId) return;
        setAllNotifications(prev => prev.map(n => n.userId === userId ? { ...n, isRead: true } : n));
    }, [setAllNotifications, authenticatedUser?.id]);

    const value: NotificationContextType = useMemo(() => ({
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
    }), [notifications, unreadCount, addNotification, markAsRead, markAllAsRead]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
