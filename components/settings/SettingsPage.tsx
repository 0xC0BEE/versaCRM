import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Tabs from '../ui/Tabs';
import ThemeCustomizer from './ThemeCustomizer';
// FIX: Corrected import path for FormBuilder.
import FormBuilder from './FormBuilder';
import InteractionFormBuilder from './InteractionFormBuilder';
import DataMigration from './DataMigration';
import EmailTemplates from './EmailTemplates';
import ThemeBuilder from './ThemeBuilder';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Theme');
    const tabs = ['Theme', 'Theme Builder', 'Forms', 'Interactions', 'Email Templates', 'Data'];

    const renderContent = () => {
        switch(activeTab) {
            case 'Theme': return <ThemeCustomizer />;
            case 'Theme Builder': return <ThemeBuilder />;
            case 'Forms': return <FormBuilder />;
            case 'Interactions': return <InteractionFormBuilder />;
            case 'Email Templates': return <EmailTemplates />;
            case 'Data': return <DataMigration />;
            default: return null;
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