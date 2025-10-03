import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

import DashboardPage from '../dashboard/DashboardPage';
import TeamMemberDashboard from '../dashboard/TeamMemberDashboard';
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
import TicketsPage from '../tickets/TicketsPage';

const PageRenderer: React.FC = () => {
    const { currentPage } = useApp();
    const { authenticatedUser } = useAuth();
    const role = authenticatedUser?.role;

    // Team Member specific pages
    if (role === 'Team Member') {
        switch (currentPage) {
            case 'Dashboard': return <TeamMemberDashboard />;
            case 'Contacts': return <ContactsPage />;
            case 'Deals': return <DealsPage />;
            case 'Tickets': return <TicketsPage />;
            case 'Interactions': return <InteractionsPage />;
            case 'Calendar': return <CalendarPage />;
            case 'Tasks': return <MyTasksPage />;
            default: return <TeamMemberDashboard />;
        }
    }

    // Org Admin / Super Admin pages
    switch (currentPage) {
        case 'Dashboard': return <DashboardPage />;
        case 'Contacts': return <ContactsPage />;
        case 'Organizations': return <OrganizationsPage />;
        case 'Deals': return <DealsPage />;
        case 'Tickets': return <TicketsPage />;
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

export default PageRenderer;