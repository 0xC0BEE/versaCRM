

import React from 'react';
import PageWrapper from '../layout/PageWrapper';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import KpiCard from './KpiCard';
import { Task, Deal, CalendarEvent, DealStage } from '../../types';
import { format, isFuture } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { useApp } from '../../contexts/AppContext';
import Button from '../ui/Button';
import MobileDashboard from './MobileDashboard';

interface TeamMemberDashboardProps {
    isTabbedView?: boolean;
    isMobile?: boolean;
}

const TeamMemberDashboard: React.FC<TeamMemberDashboardProps> = ({ isTabbedView = false, isMobile = false }) => {
    const { authenticatedUser } = useAuth();
    const { setCurrentPage } = useApp();
    const { tasksQuery, dealsQuery, calendarEventsQuery, dealStagesQuery } = useData();

    const { data: tasks = [], isLoading: tasksLoading } = tasksQuery;
    const { data: deals = [], isLoading: dealsLoading } = dealsQuery;
    const { data: events = [], isLoading: eventsLoading } = calendarEventsQuery;
    const { data: stages = [] } = dealStagesQuery;


    const isLoading = tasksLoading || dealsLoading || eventsLoading;

    const pendingTasks = React.useMemo(() => tasks.filter((task: Task) => !task.isCompleted), [tasks]);
    
    const openDeals = React.useMemo(() => {
        const closedStageIds = (stages as DealStage[]).filter(s => s.name === 'Closed Won' || s.name === 'Closed Lost').map(s => s.id);
        return deals.filter((deal: Deal) => !closedStageIds.includes(deal.stageId));
    }, [deals, stages]);
    
    const upcomingAppointments = React.useMemo(() => 
        (events as CalendarEvent[])
            .filter(e => isFuture(new Date(e.start)) && e.practitionerIds.includes(authenticatedUser!.id))
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()), 
    [events, authenticatedUser]);

    if (isLoading) {
        return <PageWrapper><LoadingSpinner /></PageWrapper>;
    }
    
    if (isMobile) {
        return <MobileDashboard />;
    }

    const pageContent = (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-tour-id="dashboard-team-kpis">
                <KpiCard title="My Pending Tasks" value={pendingTasks.length} iconName="Ticket" />
                <KpiCard title="My Open Deals" value={openDeals.length} iconName="Handshake" />
                <KpiCard title="Upcoming Appointments" value={upcomingAppointments.length} iconName="Calendar" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>My Pending Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-96 overflow-y-auto">
                            {pendingTasks.length > 0 ? (
                                <ul className="divide-y divide-border-subtle">
                                    {pendingTasks.slice(0, 10).map((task: Task) => (
                                        <li key={task.id} className="py-3">
                                            <p className="text-sm font-medium text-text-primary">{task.title}</p>
                                            <p className="text-xs text-text-secondary">Due: {format(new Date(task.dueDate), 'PP')}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-text-secondary py-4 text-center">No pending tasks!</p>
                            )}
                            {pendingTasks.length > 10 && (
                                <div className="text-center mt-4">
                                    <Button size="sm" variant="secondary" onClick={() => setCurrentPage('Tasks')}>View All</Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>My Upcoming Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-96 overflow-y-auto">
                            {upcomingAppointments.length > 0 ? (
                                <ul className="divide-y divide-border-subtle">
                                    {upcomingAppointments.slice(0, 10).map(event => (
                                        <li key={event.id} className="py-3">
                                            <p className="text-sm font-medium text-text-primary">{event.title}</p>
                                            <p className="text-xs text-text-secondary">{format(new Date(event.start), 'Pp')}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-text-secondary py-4 text-center">No upcoming appointments.</p>
                            )}
                            {upcomingAppointments.length > 10 && (
                                <div className="text-center mt-4">
                                    <Button size="sm" variant="secondary" onClick={() => setCurrentPage('Calendar')}>View Calendar</Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    if (isTabbedView) {
        return <div className="p-1">{pageContent}</div>;
    }

    return (
        <PageWrapper>
            <h1 className="text-3xl font-bold text-text-heading mb-6">My Dashboard</h1>
            {pageContent}
        </PageWrapper>
    );
};

export default TeamMemberDashboard;