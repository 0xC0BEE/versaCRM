import React from 'react';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import { useApp } from '../../contexts/AppContext';
import { Page } from '../../types';

import DashboardPage from '../dashboard/DashboardPage';
import ContactsPage from '../organizations/ContactsPage';
import OrganizationsPage from '../organizations/OrganizationsPage';
import InteractionsPage from '../interactions/InteractionsPage';
import CalendarPage from '../calendar/CalendarPage';
import MyTasksPage from '../tasks/MyTasksPage';
import InventoryPage from '../inventory/InventoryPage';
import ReportsPage from '../reports/ReportsPage';
import SettingsPage from '../settings/SettingsPage';
import DealsPage from '../deals/DealsPage';
import WorkflowsPage from '../workflows/WorkflowsPage';
import CampaignsPage from '../campaigns/CampaignsPage';

const PageRenderer: React.FC = () => {
    const { currentPage } = useApp();
    switch (currentPage) {
        case 'Dashboard': return <DashboardPage />;
        case 'Contacts': return <ContactsPage />;
        case 'Organizations': return <OrganizationsPage />;
        case 'Deals': return <DealsPage />;
        case 'Interactions': return <InteractionsPage />;
        case 'Calendar': return <CalendarPage />;
        case 'Tasks': return <MyTasksPage />;
        case 'Inventory': return <InventoryPage />;
        case 'Reports': return <ReportsPage />;
        case 'Settings': return <SettingsPage />;
        case 'Workflows': return <WorkflowsPage />;
        case 'Campaigns': return <CampaignsPage />;
        default: return <DashboardPage />;
    }
};

const OrganizationConsole: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-gray-200">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <PageRenderer />
                </main>
            </div>
        </div>
    );
};

export default OrganizationConsole;
