
import React, { useMemo, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Task, CalendarEvent, Notification } from '../../types';
import { format, isToday, isFuture } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Calendar, CheckSquare, Bell, Plus, StickyNote } from 'lucide-react';
import Button from '../ui/Button';
import { useNotifications } from '../../contexts/NotificationContext';
import TaskEditModal from '../tasks/TaskEditModal';
import { useApp } from '../../contexts/AppContext';

const MobileDashboard: React.FC = () => {
    const { authenticatedUser } = useAuth();
    const { setCurrentPage } = useApp();
    const { tasksQuery, calendarEventsQuery } = useData();
    const { notifications } = useNotifications();

    const { data: tasks = [] } = tasksQuery;
    const { data: events = [] } = calendarEventsQuery;
    
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    const { todayEvents, upcomingTasks, recentNotifications } = useMemo(() => {
        const todaysEvents = (events as CalendarEvent[])
            .filter(e => isToday(new Date(e.start)) && e.practitionerIds.includes(authenticatedUser!.id))
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        const urgentTasks = (tasks as Task[])
            .filter(t => !t.isCompleted && new Date(t.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)) // Due in next 3 days
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        const latestNotifications = notifications.slice(0, 5);

        return { todayEvents: todaysEvents, upcomingTasks: urgentTasks, recentNotifications: latestNotifications };
    }, [events, tasks, notifications, authenticatedUser]);

    return (
        <div className="p-4 space-y-4 pb-20">
            <h1 className="text-2xl font-bold text-text-heading">Welcome, {authenticatedUser?.name.split(' ')[0]}!</h1>
            
            {/* Today's Agenda */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base"><Calendar size={18} /> Today's Agenda</CardTitle>
                </CardHeader>
                <CardContent>
                    {todayEvents.length > 0 ? (
                        <ul className="space-y-3">
                            {todayEvents.map(event => (
                                <li key={event.id} className="text-sm">
                                    <p className="font-semibold">{event.title}</p>
                                    <p className="text-xs text-text-secondary">{format(new Date(event.start), 'p')} - {format(new Date(event.end), 'p')}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-text-secondary text-center py-4">No appointments scheduled for today.</p>}
                </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base"><CheckSquare size={18} /> Urgent Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                     {upcomingTasks.length > 0 ? (
                        <ul className="space-y-3">
                            {upcomingTasks.map(task => (
                                <li key={task.id} className="text-sm">
                                    <p className="font-semibold">{task.title}</p>
                                    <p className="text-xs text-text-secondary">Due: {format(new Date(task.dueDate), 'PP')}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-text-secondary text-center py-4">No urgent tasks due soon.</p>}
                </CardContent>
            </Card>
            
            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base"><Bell size={18} /> Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                     {recentNotifications.length > 0 ? (
                        <ul className="space-y-3">
                            {recentNotifications.map(notif => (
                                <li key={notif.id} className="text-sm">
                                    <p>{notif.message}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-text-secondary text-center py-4">No new notifications.</p>}
                </CardContent>
            </Card>

            {/* Floating Action Buttons */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3">
                <Button size="icon" className="rounded-full h-14 w-14 shadow-lg" onClick={() => setIsTaskModalOpen(true)}>
                    <Plus size={24} />
                </Button>
            </div>
            
            <TaskEditModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                task={null}
            />
        </div>
    );
};

export default MobileDashboard;
