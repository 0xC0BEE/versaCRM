import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Tabs from '../ui/Tabs';
import ThemeCustomizer from './ThemeCustomizer';
import FormBuilder from './FormBuilder';
import InteractionFormBuilder from './InteractionFormBuilder';
import DataMigration from './DataMigration';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Theme');
    const tabs = ['Theme', 'Contact Fields', 'Interaction Fields', 'Data Migration'];

    const renderContent = () => {
        switch(activeTab) {
            case 'Theme': return <ThemeCustomizer />;
            case 'Contact Fields': return <FormBuilder />;
            case 'Interaction Fields': return <InteractionFormBuilder />;
            case 'Data Migration': return <DataMigration />;
            default: return null;
        }
    }

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
