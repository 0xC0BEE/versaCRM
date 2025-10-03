import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Clock, FileText, Bot, LifeBuoy } from 'lucide-react';
import ClientProfileTab from './client_portal/ProfileTab';
import ClientHistoryTab from './client_portal/HistoryTab';
import ClientDocumentsTab from './client_portal/DocumentsTab';
import AiAssistantTab from './client_portal/AiAssistantTab';
import ClientTicketsTab from './client_portal/ClientTicketsTab';

type ClientPortalTab = 'Profile' | 'History' | 'Documents' | 'Tickets' | 'AI Assistant';

const ClientPortal: React.FC = () => {
    const { authenticatedUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<ClientPortalTab>('Profile');

    const tabs: { name: ClientPortalTab, icon: React.ElementType }[] = [
        { name: 'Profile', icon: User },
        { name: 'History', icon: Clock },
        { name: 'Documents', icon: FileText },
        { name: 'Tickets', icon: LifeBuoy },
        { name: 'AI Assistant', icon: Bot },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'Profile':
                return <ClientProfileTab />;
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
        <div className="min-h-screen bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-gray-200">
            <header className="bg-white dark:bg-dark-card shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Client Portal</h1>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-semibold">{authenticatedUser?.name}</p>
                                <p className="text-xs text-gray-500">Client</p>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                aria-label="Logout"
                            >
                                <LogOut size={20} className="text-red-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
                    <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
                        <nav className="space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`w-full group rounded-md px-3 py-2 flex items-center text-sm font-medium ${
                                        activeTab === tab.name
                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <tab.icon className={`mr-3 h-6 w-6 flex-shrink-0 ${
                                         activeTab === tab.name ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                                    }`} />
                                    <span className="truncate">{tab.name}</span>
                                </button>
                            ))}
                        </nav>
                    </aside>

                    <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
                        <div className="bg-white dark:bg-dark-card shadow rounded-lg p-6">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClientPortal;
