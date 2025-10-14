import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';
// FIX: Changed default import of 'Card' to a named import '{ Card }' to resolve module export error.
import { Card } from '../ui/Card';
import Tabs from '../ui/Tabs';
import ClientProfileTab from './client_portal/ProfileTab';
import ClientHistoryTab from './client_portal/HistoryTab';
import ClientDocumentsTab from './client_portal/DocumentsTab';
import ClientTicketsTab from './client_portal/ClientTicketsTab';
import AiAssistantTab from './client_portal/AiAssistantTab';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
import LiveChatWidget from '../chat/LiveChatWidget';
import ClientProjectsTab from './client_portal/ClientProjectsTab';

const ClientPortal: React.FC = () => {
    const { authenticatedUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('Profile');
    const { organizationSettingsQuery } = useData();
    const { data: settings, isLoading: settingsLoading } = organizationSettingsQuery;

    const tabs = ['Profile', 'Projects', 'History', 'Documents', 'Tickets', 'AI Assistant'];

    const renderContent = () => {
        switch (activeTab) {
            case 'Profile':
                return <ClientProfileTab />;
            case 'Projects':
                return <ClientProjectsTab />;
            case 'History':
                return <ClientHistoryTab />;
            case 'Documents':
                return <ClientDocumentsTab />;
            case 'Tickets':
                return <ClientTicketsTab />;
            case 'AI Assistant':
                return <AiAssistantTab />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary">
            <header className="flex h-16 bg-card-bg shadow-sm border-b border-border-subtle">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-text-primary">Client Portal</h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-text-primary">{authenticatedUser?.name}</p>
                            <p className="text-xs text-text-secondary">{authenticatedUser?.role}</p>
                        </div>
                        <button onClick={logout} className="p-2 rounded-full hover:bg-hover-bg" aria-label="Logout">
                            <LogOut size={20} className="text-error" />
                        </button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Card>
                    <div className="p-6">
                        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                        <div className="mt-6">
                            {renderContent()}
                        </div>
                    </div>
                </Card>
            </main>
            {!settingsLoading && settings?.liveChat.isEnabled && (
                <LiveChatWidget settings={settings.liveChat} user={authenticatedUser} />
            )}
        </div>
    );
};

export default ClientPortal;
