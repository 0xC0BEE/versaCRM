import React, { useState, useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useData } from '../../contexts/DataContext';
import { AppMarketplaceItem, InstalledApp } from '../../types';
import Tabs from '../ui/Tabs';
import AppDetailModal from './AppDetailModal';
import { Shapes } from 'lucide-react';

const AppMarketplacePage: React.FC = () => {
    const { marketplaceAppsQuery, installedAppsQuery } = useData();
    const { data: marketplaceApps = [], isLoading: appsLoading } = marketplaceAppsQuery;
    const { data: installedApps = [], isLoading: installedLoading } = installedAppsQuery;

    const [activeTab, setActiveTab] = useState('Discover');
    const [selectedApp, setSelectedApp] = useState<AppMarketplaceItem | null>(null);

    const installedAppMap = useMemo(() => {
        return new Map((installedApps as InstalledApp[]).map(app => [app.appId, app]));
    }, [installedApps]);

    const isLoading = appsLoading || installedLoading;

    const DiscoverTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(marketplaceApps as AppMarketplaceItem[]).map(app => {
                const isInstalled = installedAppMap.has(app.id);
                return (
                    <Card key={app.id} className="flex flex-col">
                        <div className="flex items-start gap-4">
                            <img src={app.logo} alt={`${app.name} logo`} className="w-12 h-12 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-text-primary">{app.name}</h3>
                                <p className="text-xs text-text-secondary">{app.category}</p>
                            </div>
                        </div>
                        <p className="text-sm text-text-secondary mt-2 flex-grow">{app.description}</p>
                        <div className="mt-4 flex justify-end">
                            <Button size="sm" variant="secondary" onClick={() => setSelectedApp(app)}>
                                {isInstalled ? 'View Details' : 'Learn More'}
                            </Button>
                        </div>
                    </Card>
                );
            })}
        </div>
    );

    const InstalledAppsTab = () => (
        <div>
            {(installedApps as InstalledApp[]).length > 0 ? (
                <div className="space-y-3">
                    {(installedApps as InstalledApp[]).map(installed => {
                        const app = (marketplaceApps as AppMarketplaceItem[]).find(a => a.id === installed.appId);
                        if (!app) return null;
                        return (
                            <div key={installed.id} className="p-3 border border-border-subtle rounded-md bg-card-bg/50 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <img src={app.logo} alt={`${app.name} logo`} className="w-10 h-10" />
                                    <div>
                                        <p className="font-medium">{app.name}</p>
                                        <p className="text-xs text-text-secondary">Installed on {new Date(installed.installedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="secondary" onClick={() => setSelectedApp(app)}>
                                    Configure
                                </Button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 text-text-secondary">
                    <Shapes className="mx-auto h-12 w-12 text-text-secondary/50" />
                    <p className="mt-2">No apps installed yet. Go to the "Discover" tab to find new integrations.</p>
                </div>
            )}
        </div>
    );

    return (
        <PageWrapper>
            <h1 className="text-2xl font-semibold text-text-heading mb-6">App Marketplace</h1>
            <Card>
                <div className="p-6">
                    <Tabs tabs={['Discover', 'Installed Apps']} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="mt-6">
                        {isLoading ? (
                            <p>Loading apps...</p>
                        ) : activeTab === 'Discover' ? (
                            <DiscoverTab />
                        ) : (
                            <InstalledAppsTab />
                        )}
                    </div>
                </div>
            </Card>

            {selectedApp && (
                <AppDetailModal
                    isOpen={!!selectedApp}
                    onClose={() => setSelectedApp(null)}
                    app={selectedApp}
                    installedApp={installedAppMap.get(selectedApp.id)}
                />
            )}
        </PageWrapper>
    );
};

export default AppMarketplacePage;