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
import TeamPage from '../team/TeamPage';
import SyncedEmailPage from '../synced_email/SyncedEmailPage';

const PageRenderer: React.FC = () => {
    const { currentPage } = useApp();
    const { authenticatedUser } = useAuth();
    
    // The main App component now decides which console to render.
    // This renderer just needs to map page names to components.

    switch (currentPage) {
        case 'Dashboard': 
            // The dashboard itself can decide what to show based on role/permissions
            return authenticatedUser?.isClient ? <div /> : <DashboardPage />;
        case 'Contacts': return <ContactsPage />;
        case 'Team': return <TeamPage />;
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
        case 'Synced Email': return <SyncedEmailPage />;
        default: 
            return <DashboardPage />;
    }
};

export default PageRenderer;
