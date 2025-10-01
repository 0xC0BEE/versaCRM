import React, { Suspense, lazy } from 'react';
import TeamMemberSidebar from '../layout/TeamMemberSidebar';
import Header from '../layout/Header';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../ui/LoadingSpinner';

// Convert all page imports to use React.lazy for code splitting
const MyTasksPage = lazy(() => import('../tasks/MyTasksPage'));
const ContactsPage = lazy(() => import('../organizations/ContactsPage'));
const CalendarPage = lazy(() => import('../calendar/CalendarPage'));
const InteractionsPage = lazy(() => import('../interactions/InteractionsPage'));
const DashboardPage = lazy(() => import('../dashboard/DashboardPage'));


const TeamMemberConsole: React.FC = () => {
    const { currentPage } = useApp();

    const renderPage = () => {
        switch (currentPage) {
            case 'My Tasks': return <MyTasksPage />;
            case 'Contacts': return <ContactsPage />;
            case 'Calendar': return <CalendarPage />;
            case 'Interactions': return <InteractionsPage />;
            case 'Dashboard': return <DashboardPage />;
            default: return <MyTasksPage />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-gray-200">
            <TeamMemberSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <Suspense fallback={<LoadingSpinner />}>
                    {renderPage()}
                </Suspense>
            </div>
        </div>
    );
};

export default TeamMemberConsole;
