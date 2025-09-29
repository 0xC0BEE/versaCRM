import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useApp } from '../../contexts/AppContext';
import DashboardPage from '../dashboard/DashboardPage';
// FIX: Imported all pages to be rendered in the main console.
import OrganizationsPage from '../organizations/OrganizationsPage';
import ContactsPage from '../organizations/ContactsPage';
import SettingsPage from '../settings/SettingsPage';
import InteractionsPage from '../interactions/InteractionsPage';
import CalendarPage from '../calendar/CalendarPage';
import InventoryPage from '../inventory/InventoryPage';
import ReportsPage from '../reports/ReportsPage';
import WorkflowsPage from '../workflows/WorkflowsPage';
import TeamPage from '../team/TeamPage';


const MainConsole: React.FC = () => {
    const { currentPage } = useApp();

    const renderPage = () => {
        switch (currentPage) {
            case 'Dashboard': return <DashboardPage />;
            case 'Organizations': return <OrganizationsPage />;
            case 'Contacts': return <ContactsPage />;
            case 'Settings': return <SettingsPage />;
            case 'Interactions': return <InteractionsPage />;
            case 'Calendar': return <CalendarPage />;
            case 'Inventory': return <InventoryPage />;
            case 'Reports': return <ReportsPage />;
            case 'Workflows': return <WorkflowsPage />;
            case 'Team': return <TeamPage />;
            default: return <DashboardPage />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-gray-200">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                {renderPage()}
            </div>
        </div>
    );
};

export default MainConsole;
