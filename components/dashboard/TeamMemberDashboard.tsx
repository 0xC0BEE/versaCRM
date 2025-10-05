import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import KpiCard from './KpiCard';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Task, CalendarEvent, Deal } from '../../types';
import { format } from 'date-fns';
import { useApp } from '../../contexts/AppContext';
import PageWrapper from '../layout/PageWrapper';
import Button from '../ui/Button';

interface TeamMemberDashboardProps {
    isTabbedView?: boolean;
}

const TeamMemberDashboard: React.FC<TeamMemberDashboardProps> = ({ isTabbedView = false }) => {
    const { authenticatedUser } = useAuth();
    const { setCurrentPage } = useApp();
    const { tasksQuery, calendarEventsQuery, dealsQuery } = useData();

    const { data: allTasks = [], isLoading: tasksLoading } = tasksQuery;
    const { data: allEvents = [], isLoading: eventsLoading } = calendarEventsQuery;
    const { data: allDeals = [], isLoading: dealsLoading } = dealsQuery;

    if (!authenticatedUser) return null;

    const myTasks = allTasks.filter((task: Task) => task.userId === authenticatedUser.id && !task.isCompleted);
    const myUpcomingEvents = allEvents
        .filter((event: CalendarEvent) => event.userIds.includes(authenticatedUser.id) && new Date(event.start) > new Date())
        .sort((a: CalendarEvent, b: CalendarEvent) => new Date(a.start).getTime() - new Date(b.start).getTime());
    
    // This is a simplification as deals are not directly assigned to users in the current data model.
    // We'll show KPIs for all open deals in the organization as a team-relevant metric.
    const openDeals = allDeals.filter((deal: Deal) => deal.stageId !== 'stage_5' && deal.stageId !== 'stage_6'); // Closed Won/Lost
    const openDealsValue = openDeals.reduce((sum: number, deal: Deal) => sum + deal.value, 0);

    const isLoading = tasksLoading || eventsLoading || dealsLoading;

    if (isLoading && !isTabbedView) return <PageWrapper><LoadingSpinner /></PageWrapper>;
    if (isLoading && isTabbedView) return <LoadingSpinner />;
    
    const dashboardContent = (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KpiCard title="My Pending Tasks" value={myTasks.length} iconName="Ticket" />
                <KpiCard title="My Upcoming Appointments" value={myUpcomingEvents.length} iconName="Calendar" />
                <KpiCard title="Org. Open Deal Value" value={openDealsValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} iconName="Handshake" />
            </div>

            {/* Tasks and Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="My Pending Tasks">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {myTasks.length > 0 ? (
                            myTasks.slice(0, 5).map((task: Task) => (
                                <div key={task.id} className="p-2 border-b border-border-subtle flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium">{task.title}</p>
                                        <p className="text-xs text-text-secondary">Due {format(new Date(task.dueDate), 'MMM d')}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-text-secondary p-4 text-center">No pending tasks. Great job!</p>
                        )}
                        {myTasks.length > 5 && (
                            <div className="text-center mt-2 p-2">
                                <Button size="sm" variant="secondary" onClick={() => setCurrentPage('Tasks')}>View All Tasks</Button>
                            </div>
                        )}
                    </div>
                </Card>
                <Card title="My Upcoming Appointments">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {myUpcomingEvents.length > 0 ? (
                            myUpcomingEvents.slice(0, 5).map((event: CalendarEvent) => (
                                <div key={event.id} className="p-2 border-b border-border-subtle">
                                    <p className="text-sm font-medium">{event.title}</p>
                                    <p className="text-xs text-text-secondary">{format(new Date(event.start), 'MMM d, h:mm a')}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-text-secondary p-4 text-center">No upcoming appointments.</p>
                        )}
                        {myUpcomingEvents.length > 5 && (
                            <div className="text-center mt-2 p-2">
                                <Button size="sm" variant="secondary" onClick={() => setCurrentPage('Calendar')}>View Calendar</Button>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );

    if (isTabbedView) {
        return dashboardContent;
    }

    return (
        <PageWrapper>
            <h1 className="text-3xl font-bold text-text-heading mb-6">My Dashboard</h1>
            {dashboardContent}
        </PageWrapper>
    );
};

export default TeamMemberDashboard;
