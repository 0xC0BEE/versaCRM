import React from 'react';
import { useApp } from '../../contexts/AppContext';
import DashboardPage from '../dashboard/DashboardPage';
import OrganizationsPage from '../organizations/OrganizationsPage';
import ContactsPage from '../organizations/ContactsPage';
import InteractionsPage from '../interactions/InteractionsPage';
import CalendarPage from '../calendar/CalendarPage';
import MyTasksPage from '../tasks/MyTasksPage';
import ReportsPage from '../reports/ReportsPage';
import SettingsPage from '../settings/SettingsPage';
import TeamPage from '../team/TeamPage';
import InventoryPage from '../inventory/InventoryPage';
import OrganizationDetailPage from '../organizations/OrganizationDetailPage';
import DealsPage from '../deals/DealsPage';
import TicketsPage from '../tickets/TicketsPage';
import WorkflowsPage from '../workflows/WorkflowsPage';
import SyncedEmailPage from '../synced_email/SyncedEmailPage';
import ApiDocsPage from '../api/ApiDocsPage';
import CampaignsPage from '../campaigns/CampaignsPage';
import FormsPage from '../forms/FormsPage';
import LandingPagesPage from '../landing_pages/LandingPagesPage';
import KnowledgeBasePage from '../kb/KnowledgeBasePage';
import CustomObjectListPage from '../custom_objects/CustomObjectListPage';
import AppMarketplacePage from '../marketplace/AppMarketplacePage';

const PageRenderer: React.FC = () => {
    const { currentPage } = useApp();

    switch (currentPage) {
        case 'Dashboard':
            return <DashboardPage />;
        case 'Organizations':
            return <OrganizationsPage />;
        case 'OrganizationDetails':
            return <OrganizationDetailPage />;
        case 'Contacts':
            return <ContactsPage />;
        case 'Deals':
            return <DealsPage />;
        case 'Tickets':
            return <TicketsPage />;
        case 'Interactions':
            return <InteractionsPage />;
        case 'SyncedEmail':
            return <SyncedEmailPage />;
        case 'Campaigns':
            return <CampaignsPage />;
        case 'Forms':
            return <FormsPage />;
        case 'LandingPages':
            return <LandingPagesPage />;
        case 'Calendar':
            return <CalendarPage />;
        case 'Tasks':
            return <MyTasksPage />;
        case 'Reports':
            return <ReportsPage />;
        case 'Inventory':
            return <InventoryPage />;
        case 'Team':
            return <TeamPage />;
        case 'Workflows':
            return <WorkflowsPage />;
        case 'Settings':
            return <SettingsPage />;
        case 'ApiDocs':
            return <ApiDocsPage />;
        case 'KnowledgeBase':
            return <KnowledgeBasePage />;
        case 'CustomObjects':
            return <CustomObjectListPage />;
        case 'AppMarketplace':
            return <AppMarketplacePage />;
        default:
            return <DashboardPage />;
    }
};

export default PageRenderer;