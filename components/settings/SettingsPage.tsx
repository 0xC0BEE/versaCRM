import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Tabs from '../ui/Tabs';
import FormBuilder from './FormBuilder';
import InteractionFormBuilder from './InteractionFormBuilder';
import ThemeCustomizer from './ThemeCustomizer';
import ThemeBuilder from './ThemeBuilder';
import DataMigration from './DataMigration';
import EmailTemplates from './EmailTemplates';
import TicketSettings from './TicketSettings';
import LeadScoringSettings from './LeadScoringSettings';
import LiveChatSettings from './LiveChatSettings';
import RolesAndPermissionsPage from './RolesAndPermissionsPage';
import { useAuth } from '../../contexts/AuthContext';
import IntegrationsSettings from './IntegrationsSettings';
import ApiAndAppsPage from './ApiAndAppsPage';
import TrackingCodeSettings from './TrackingCodeSettings';

const SettingsPage: React.FC = () => {
    const { hasPermission } = useAuth();
    const [activeTab, setActiveTab] = useState('Lead Scoring');
    
    const allTabs = [
        { name: 'Roles & Permissions', permission: 'settings:manage:roles' },
        { name: 'Integrations' },
        { name: 'API & Apps', permission: 'settings:manage:api' },
        { name: 'Tracking Code' },
        { name: 'Live Chat' },
        { name: 'Lead Scoring' },
        { name: 'Contact Forms' }, 
        { name: 'Interaction Forms' }, 
        { name: 'Email Templates' },
        { name: 'Ticket Settings' },
        { name: 'Appearance' }, 
        { name: 'Custom Themes' },
        { name: 'Data Migration' }
    ];

    const availableTabs = allTabs.filter(tab => !tab.permission || hasPermission(tab.permission as any)).map(tab => tab.name);

    const renderContent = () => {
        switch (activeTab) {
            case 'Roles & Permissions':
                return <RolesAndPermissionsPage />;
            case 'Integrations':
                return <IntegrationsSettings />;
            case 'API & Apps':
                return <ApiAndAppsPage />;
            case 'Tracking Code':
                return <TrackingCodeSettings />;
            case 'Live Chat':
                return <LiveChatSettings />;
            case 'Lead Scoring':
                return <LeadScoringSettings />;
            case 'Contact Forms':
                return <FormBuilder />;
            case 'Interaction Forms':
                return <InteractionFormBuilder />;
            case 'Email Templates':
                return <EmailTemplates />;
            case 'Ticket Settings':
                return <TicketSettings />;
            case 'Appearance':
                return <ThemeCustomizer />;
            case 'Custom Themes':
                return <ThemeBuilder />;
            case 'Data Migration':
                return <DataMigration />;
            default:
                return null;
        }
    };
    
    return (
        <PageWrapper>
             <h1 className="text-2xl font-semibold text-text-heading mb-6">Settings</h1>
            <Card>
                <div className="p-6">
                    <Tabs tabs={availableTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="mt-6">
                        {renderContent()}
                    </div>
                </div>
            </Card>
        </PageWrapper>
    );
};

export default SettingsPage;