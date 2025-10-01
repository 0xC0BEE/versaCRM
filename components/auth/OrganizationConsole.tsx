import React, { Suspense, lazy } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../ui/LoadingSpinner';

// Convert all page imports to use React.lazy for code splitting
const DashboardPage = lazy(() => import('../dashboard/DashboardPage'));
const OrganizationsPage = lazy(() => import('../organizations/OrganizationsPage'));
const ContactsPage = lazy(() => import('../organizations/ContactsPage'));
const InteractionsPage = lazy(() => import('../interactions/InteractionsPage'));
const CalendarPage = lazy(() => import('../calendar/CalendarPage'));
const InventoryPage = lazy(() => import('../inventory/InventoryPage'));
const ReportsPage = lazy(() => import('../reports/ReportsPage'));
const WorkflowsPage = lazy(() => import('../workflows/WorkflowsPage'));
const TeamPage = lazy(() => import('../team/TeamPage'));
const SettingsPage = lazy(() => import('../settings/SettingsPage'));
const MyTasksPage = lazy(() => import('../tasks/MyTasksPage'));

const OrganizationConsole: React.FC = () => {
    const { currentPage } = useApp();

    const renderPage = () => {
        switch (currentPage) {
            case 'Dashboard': return <DashboardPage />;
            case 'Organizations': return <OrganizationsPage />;
            case 'Contacts': return <ContactsPage />;
            case 'Interactions': return <InteractionsPage />;
            case 'Calendar': return <CalendarPage />;
            case 'Inventory': return <InventoryPage />;
            case 'Reports': return <ReportsPage />;
            case 'Workflows': return <WorkflowsPage />;
            case 'Team': return <TeamPage />;
            case 'Settings': return <SettingsPage />;
            case 'My Tasks': return <MyTasksPage />;
            default: return <DashboardPage />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-gray-200">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <Suspense fallback={<LoadingSpinner />}>
                    {renderPage()}
                </Suspense>
            </div>
        </div>
    );
};

export default OrganizationConsole;
