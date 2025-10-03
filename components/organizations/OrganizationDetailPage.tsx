import React, { useState } from 'react';
// FIX: Corrected the import path for DataContext to be a valid relative path.
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Tabs from '../ui/Tabs';
import OrganizationDashboardTab from './detail_tabs/OrganizationDashboardTab';
import ContactsPage from './ContactsPage';
import TeamPage from '../team/TeamPage';
import OrganizationSettings from './OrganizationSettings';
import OrganizationWorkflowsTab from './detail_tabs/OrganizationWorkflowsTab';
import OrganizationReportsTab from './detail_tabs/OrganizationReportsTab';
import { Organization } from '../../types';

const OrganizationDetailPage: React.FC = () => {
    const { authenticatedUser } = useAuth();
    const { organizationsQuery } = useData();
    const { data: organizations = [], isLoading } = organizationsQuery;
    const [activeTab, setActiveTab] = useState('Dashboard');
    
    // In a real app with Super Admin access, we'd get the org from a URL param.
    // For Org Admin, we get it from their user profile.
    // Since this view is only for Org Admins, we find their org from the list.
    const organization = organizations.find((o: any) => o.id === authenticatedUser?.organizationId);

    const tabs = ['Dashboard', 'Contacts', 'Team', 'Workflows', 'Reports', 'Settings'];

    const renderContent = () => {
        if (!organization) return null;
        switch (activeTab) {
            case 'Dashboard':
                return <OrganizationDashboardTab organization={organization} />;
            case 'Contacts':
                return <ContactsPage isTabbedView={true} />; // This already filters by orgId in DataContext
            case 'Team':
                return <TeamPage isTabbedView={true} />; // This already filters by orgId in DataContext
             case 'Workflows':
                return <OrganizationWorkflowsTab organization={organization} />;
            case 'Reports':
                return <OrganizationReportsTab organization={organization} />;
            case 'Settings':
                return <OrganizationSettings organization={organization} />;
            default:
                return null;
        }
    };
    
    if (isLoading) return <PageWrapper><div>Loading organization details...</div></PageWrapper>;
    if (!organization) return <PageWrapper><div>Could not find organization details.</div></PageWrapper>;

    return (
        <PageWrapper>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{organization.name}</h1>
                <p className="text-sm text-gray-500">{organization.industry} Industry</p>
            </div>
            <Card>
                <div className="p-6">
                    <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="mt-6">
                        {renderContent()}
                    </div>
                </div>
            </Card>
        </PageWrapper>
    );
};

export default OrganizationDetailPage;