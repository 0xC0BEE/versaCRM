import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import { Card } from '../ui/Card';
import Tabs from '../ui/Tabs';
import { useAuth } from '../../contexts/AuthContext';

// New grouped components
import AppearanceSettings from './AppearanceSettings';
import ObjectsAndFieldsSettings from './ObjectsAndFieldsSettings';
import ChannelsAndLeadGenSettings from './ChannelsAndLeadGenSettings';
import DeveloperSettings from './DeveloperSettings';
import BillingAndCommerceSettings from './SubscriptionSettings';
import ComplianceSettings from './ComplianceSettings';
import OrganizationProfileSettings from './OrganizationProfileSettings';

// Standalone components for tabs
import RolesAndPermissionsPage from './RolesAndPermissionsPage';

const SettingsPage: React.FC = () => {
    const { hasPermission } = useAuth();
    
    const allTabs = [
        { name: 'Organization', component: <OrganizationProfileSettings /> },
        { name: 'Users & Roles', permission: 'settings:manage:roles', component: <RolesAndPermissionsPage /> },
        { name: 'Objects & Fields', component: <ObjectsAndFieldsSettings /> },
        { name: 'Appearance', component: <AppearanceSettings /> },
        { name: 'Channels & Lead Gen', component: <ChannelsAndLeadGenSettings /> },
        { name: 'Billing & Commerce', component: <BillingAndCommerceSettings /> },
        { name: 'Compliance & Audit', component: <ComplianceSettings /> },
        { name: 'Developer & Data', permission: 'settings:manage:api', component: <DeveloperSettings /> },
    ];

    const availableTabs = allTabs.filter(tab => !tab.permission || hasPermission(tab.permission as any));
    
    // Set initial active tab safely
    const [activeTab, setActiveTab] = useState(availableTabs.length > 0 ? availableTabs[0].name : '');

    const activeComponent = availableTabs.find(tab => tab.name === activeTab)?.component || null;

    return (
        <PageWrapper>
             <h1 className="text-2xl font-semibold text-text-heading mb-6">Settings</h1>
            <Card data-tour-id="settings-page">
                <div className="p-6">
                    <Tabs tabs={availableTabs.map(t => t.name)} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="mt-6">
                        {activeComponent}
                    </div>
                </div>
            </Card>
        </PageWrapper>
    );
};

export default SettingsPage;