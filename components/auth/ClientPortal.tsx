import React, { useState } from 'react';
import Header from '../layout/Header';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Tabs from '../ui/Tabs';
import { useAuth } from '../../contexts/AuthContext';
import ClientProfileTab from './client_portal/ProfileTab';
import ClientHistoryTab from './client_portal/HistoryTab';
import ClientDocumentsTab from './client_portal/DocumentsTab';
import AiAssistantTab from './client_portal/AiAssistantTab';

const ClientPortal: React.FC = () => {
    const { authenticatedUser } = useAuth();
    const [activeTab, setActiveTab] = useState('Profile');
    const tabs = ['Profile', 'History', 'Documents', 'AI Assistant'];

    const renderContent = () => {
        if (!authenticatedUser) return null;

        switch(activeTab) {
            case 'Profile': return <ClientProfileTab />;
            case 'History': return <ClientHistoryTab />;
            case 'Documents': return <ClientDocumentsTab />;
            case 'AI Assistant': return <AiAssistantTab />;
            default: return null;
        }
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-gray-200">
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <PageWrapper>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                        Welcome, {authenticatedUser?.name}
                    </h1>
                    <Card>
                        <div className="p-6">
                            <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                            <div className="mt-6">
                                {renderContent()}
                            </div>
                        </div>
                    </Card>
                </PageWrapper>
            </div>
        </div>
    );
};

export default ClientPortal;