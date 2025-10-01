import React from 'react';
import PageWrapper from '../layout/PageWrapper';
// FIX: Corrected import path for useApp.
import { useApp } from '../../contexts/AppContext';
// FIX: Corrected the import path for DataContext to be a valid relative path.
import { useData } from '../../contexts/DataContext';
import KpiCard from './KpiCard';
import DynamicChart from './DynamicChart';
import Card from '../ui/Card';
import AiInsightsCard from './AiInsightsCard';
import { Users, HeartPulse, Landmark, Handshake, ScrollText, Scale, Building, Briefcase, LucideIcon } from 'lucide-react';

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

interface DashboardPageProps {
    isTabbedView?: boolean;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ isTabbedView = false }) => {
    const { industryConfig } = useApp();
    const { dashboardData, isLoading } = useData();

    const renderKpis = () => {
        return industryConfig.dashboard.kpis.map(kpi => {
            const Icon = iconMap[kpi.icon];
            if (!Icon) return null; // Or a default icon
            const value = dashboardData ? dashboardData.kpis[kpi.key] : '...';
            return <KpiCard key={kpi.key} title={kpi.title} value={value} icon={<Icon className="h-6 w-6 text-primary-500" />} />;
        });
    };

    const renderCharts = () => {
        return industryConfig.dashboard.charts.map(chart => {
            const data = dashboardData ? dashboardData.charts[chart.dataKey] : [];
            return (
                <Card key={chart.dataKey} title={chart.title}>
                    <DynamicChart type={chart.type} data={data} />
                </Card>
            );
        });
    };
    
    const pageContent = (
        <>
            {!isTabbedView && <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Dashboard</h1>}
            
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
        </>
    );

    if (isTabbedView) {
        return <div className="p-1">{pageContent}</div>;
    }
    
    return (
        <PageWrapper>
            {pageContent}
        </PageWrapper>
    );
};

export default DashboardPage;