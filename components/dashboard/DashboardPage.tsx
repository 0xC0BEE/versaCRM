import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import { useApp } from '../../contexts/AppContext';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
import KpiCard from './KpiCard';
import DynamicChart from './DynamicChart';
import Card from '../ui/Card';
import AiInsightsCard from './AiInsightsCard';
import { Users, HeartPulse, Landmark, Handshake, ScrollText, Scale, Building, Briefcase, LucideIcon } from 'lucide-react';
import Tabs from '../ui/Tabs';
import TeamMemberDashboard from './TeamMemberDashboard';
import DashboardWidget from './DashboardWidget';

// Map icon names from config to actual components
const iconMap: Record<string, LucideIcon> = {
    Users,
    HeartPulse,
    Landmark,
    Handshake,
    ScrollText,
    Scale,
    Building,
    Briefcase,
};

const OrganizationOverview: React.FC = () => {
    const { industryConfig } = useApp();
    // FIX: Destructure dashboardDataQuery and derive data and isLoading from it.
    const { dashboardDataQuery, dashboardWidgetsQuery } = useData();
    const { data: dashboardData, isLoading } = dashboardDataQuery;
    const { data: widgets = [] } = dashboardWidgetsQuery;

    const renderKpis = () => {
        return industryConfig.dashboard.kpis.map(kpi => {
            const Icon = iconMap[kpi.icon];
            if (!Icon) return null; // Or a default icon
            const value = dashboardData ? dashboardData.kpis[kpi.key as keyof typeof dashboardData.kpis] : '...';
            return <KpiCard key={kpi.key} title={kpi.title} value={value} icon={<Icon className="h-6 w-6 text-primary-500" />} />;
        });
    };

    const renderCharts = () => {
        return industryConfig.dashboard.charts.map(chart => {
            const data = dashboardData ? dashboardData.charts[chart.dataKey as keyof typeof dashboardData.charts] : [];
            return (
                <Card key={chart.dataKey} title={chart.title}>
                    <DynamicChart type={chart.type} data={data} />
                </Card>
            );
        });
    };
    
    return (
        <div className="mt-6">
            <div className="mb-6">
                <AiInsightsCard dashboardData={dashboardData} isLoading={isLoading} />
            </div>

            {isLoading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}><div className="h-24 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md"></div></Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {renderKpis()}
                </div>
            )}
             <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoading ? (
                    <>
                    <Card><div className="h-80 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md"></div></Card>
                    <Card><div className="h-80 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md"></div></Card>
                    </>
                ) : (
                    renderCharts()
                )}
            </div>
            
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">My Widgets</h2>
                {widgets.length > 0 ? (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {widgets.map(widget => (
                            <DashboardWidget key={widget.id} widget={widget} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <div className="text-center p-8 text-gray-500">
                            <p>You can add custom reports to your dashboard from the Reports page.</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

// FIX: Add props interface to handle tabbed view
interface DashboardPageProps {
    isTabbedView?: boolean;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ isTabbedView = false }) => {
    const [activeTab, setActiveTab] = useState('Organization Overview');
    const tabs = ['Organization Overview', 'My Dashboard'];

    // FIX: Extracted page content to conditionally render wrappers
    const pageContent = (
        <>
            {!isTabbedView && (
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Dashboard</h1>
            )}
            <Card>
                <div className="p-6">
                    <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                    {activeTab === 'Organization Overview' ? (
                        <OrganizationOverview />
                    ) : (
                        // We need to wrap TeamMemberDashboard in PageWrapper's child structure
                        // so it doesn't get double padding/margins.
                        <div className="mt-6">
                             <TeamMemberDashboard isTabbedView={true} />
                        </div>
                    )}
                </div>
            </Card>
        </>
    );
    
    // FIX: Conditionally render PageWrapper based on isTabbedView prop
    if (isTabbedView) {
        return pageContent;
    }

    return (
        <PageWrapper>
            {pageContent}
        </PageWrapper>
    );
};

export default DashboardPage;