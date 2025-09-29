import React from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

// Import all possible pages for this console
import DashboardPage from '../dashboard/DashboardPage';
import OrganizationsPage from '../organizations/OrganizationsPage';
import ContactsPage from '../organizations/ContactsPage';
import InteractionsPage from '../interactions/InteractionsPage';
import CalendarPage from '../calendar/CalendarPage';
import InventoryPage from '../inventory/InventoryPage';
import ReportsPage from '../reports/ReportsPage';
import WorkflowsPage from '../workflows/WorkflowsPage';
import TeamPage from '../team/TeamPage';
import SettingsPage from '../settings/SettingsPage';
import OrganizationDetailPage from '../organizations/OrganizationDetailPage';


const OrganizationConsole: React.FC = () => {
    const { currentPage } = useApp();
    const { authenticatedUser } = useAuth();

    const renderPage = () => {
        // For org admin, "Organizations" page shows their own org details.
        if (authenticatedUser?.role === 'Organization Admin' && currentPage === 'Organizations') {
            return <OrganizationDetailPage />;
        }

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
            // The 'Profiles' page is now handled by 'Contacts'
            case 'Profiles': return <ContactsPage />;
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

export default OrganizationConsole;