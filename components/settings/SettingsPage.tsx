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

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Contact Forms');
    
    const tabs = [
        'Contact Forms', 
        'Interaction Forms', 
        'Email Templates',
        'Ticket Settings',
        'Appearance', 
        'Custom Themes',
        'Data Migration'
    ];

    const renderContent = () => {
        switch (activeTab) {
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
             <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Settings</h1>
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

export default SettingsPage;
