import React from 'react';
import PageWrapper from '../layout/PageWrapper';
import { useAuth } from '../../contexts/AuthContext';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
import { useApp } from '../../contexts/AppContext';
import KpiCard from './KpiCard';
import Card from '../ui/Card';
import { AlertTriangle } from 'lucide-react';
// FIX: Corrected import path for types.
import { Task, Ticket } from '../../types';
import { isPast, format } from 'date-fns';
// FIX: Corrected import path for types.
import { AnyContact } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';

// FIX: Add props interface to handle tabbed view
interface TeamMemberDashboardProps {
    isTabbedView?: boolean;
}

const TeamMemberDashboard: React.FC<TeamMemberDashboardProps> = ({ isTabbedView = false }) => {
    const { authenticatedUser } = useAuth();
    const { tasksQuery, ticketsQuery, contactsQuery } = useData();
    const { setCurrentPage } = useApp();

    const { data: tasks = [], isLoading: tasksLoading } = tasksQuery;
    const { data: tickets = [], isLoading: ticketsLoading } = ticketsQuery;
    const { data: contacts = [], isLoading: contactsLoading } = contactsQuery;

    const myTasks = React.useMemo(() => tasks.filter((t: Task) => t.userId === authenticatedUser?.id), [tasks, authenticatedUser]);
    const myTickets = React.useMemo(() => tickets.filter((t: Ticket) => t.assignedToId === authenticatedUser?.id), [tickets, authenticatedUser]);
    const contactMap = React.useMemo(() => new Map<string, string>(contacts.map((c: AnyContact) => [c.id, c.contactName])), [contacts]);

    const isLoading = tasksLoading || ticketsLoading || contactsLoading;

    if (isLoading) {
        return <LoadingSpinner />;
    }

    // Calculate KPIs
    const openTasksCount = myTasks.filter(t => !t.isCompleted).length;
    const openTicketsCount = myTickets.filter(t => t.status !== 'Closed').length;
    const performanceMetric = myTasks.filter(t => t.isCompleted).length;

    // Filter data for lists
    const overdueTasks = myTasks.filter(t => !t.isCompleted && isPast(new Date(t.dueDate))).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const openTickets = myTickets.filter(t => t.status !== 'Closed').slice(0, 5);

    // FIX: Extracted page content to conditionally render wrappers
    const pageContent = (
        <>
            {!isTabbedView && (
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">My Dashboard</h1>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="cursor-pointer" onClick={() => setCurrentPage('Tasks')}>
                    <KpiCard title="My Open Tasks" value={openTasksCount} iconName="CheckSquare" />
                </div>
                <div className="cursor-pointer" onClick={() => setCurrentPage('Tickets')}>
                    <KpiCard title="My Open Tickets" value={openTicketsCount} iconName="LifeBuoy" />
                </div>
                 <div className="cursor-pointer" onClick={() => setCurrentPage('Tasks')}>
                    <KpiCard title="Total Completed Tasks" value={performanceMetric} iconName="TrendingUp" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Overdue Tasks">
                    {overdueTasks.length > 0 ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {overdueTasks.map(task => (
                                <div key={task.id} className="p-3 rounded-lg border dark:border-dark-border bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer" onClick={() => setCurrentPage('Tasks')}>
                                    <p className="font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
                                        <AlertTriangle size={16} />
                                        {task.title}
                                    </p>
                                    <p className="text-sm text-red-600 dark:text-red-300">Due: {format(new Date(task.dueDate), 'PP')}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>No overdue tasks. Great job!</p>
                        </div>
                    )}
                </Card>
                <Card title="My Open Tickets">
                    {openTickets.length > 0 ? (
                         <div className="space-y-2 max-h-96 overflow-y-auto">
                            {openTickets.map(ticket => (
                                <div key={ticket.id} className="p-3 rounded-lg border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer" onClick={() => setCurrentPage('Tickets')}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white">{ticket.subject}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">For: {contactMap.get(ticket.contactId) || 'Unknown'}</p>
                                        </div>
                                         <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                            ticket.priority === 'High' ? 'bg-red-100 text-red-800' : 
                                            ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {ticket.priority}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>No open tickets assigned to you.</p>
                        </div>
                    )}
                </Card>
            </div>
        </>
    );

    // FIX: Conditionally render PageWrapper based on isTabbedView prop
    if (isTabbedView) {
        return pageContent;
    }

    return (
        <PageWrapper>
            {pageContent}
        </PageWrapper>
    );
};

export default TeamMemberDashboard;