import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import { useData } from '../../contexts/DataContext';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import KpiCard from './KpiCard';
import Card from '../ui/Card';
import DynamicChart from './DynamicChart';
import AiInsightsCard from './AiInsightsCard';
import TeamMemberDashboard from './TeamMemberDashboard';
import Tabs from '../ui/Tabs';

interface DashboardPageProps {
    isTabbedView?: boolean;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ isTabbedView = false }) => {
    const { authenticatedUser } = useAuth();
    const { industryConfig } = useApp();
    const { dashboardDataQuery } = useData();
    const { data: dashboardData, isLoading } = dashboardDataQuery;
    
    const isAdmin = authenticatedUser?.role === 'Organization Admin' || authenticatedUser?.role === 'Super Admin';
    const [activeView, setActiveView] = useState('Organization Overview');

    const renderOrgDashboard = () => {
        if (isLoading) return <LoadingSpinner />;
        if (!dashboardData) return <div>No dashboard data available.</div>;

        return (
            <div className="space-y-6">
                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {industryConfig.dashboard.kpis.map(kpi => (
                        <KpiCard
                            key={kpi.key}
                            title={kpi.title}
                            value={dashboardData.kpis[kpi.key as keyof typeof dashboardData.kpis] ?? 0}
                            iconName={kpi.icon}
                        />
                    ))}
                </div>

                {/* AI Insights */}
                <AiInsightsCard dashboardData={dashboardData} isLoading={isLoading} />

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {industryConfig.dashboard.charts.map(chart => (
                        <Card title={chart.title} key={chart.dataKey}>
                            <DynamicChart
                                type={chart.type}
                                data={dashboardData.charts[chart.dataKey as keyof typeof dashboardData.charts] ?? []}
                            />
                        </Card>
                    ))}
                </div>
            </div>
        );
    };

    const pageContent = (
        <>
            {isAdmin && !isTabbedView && (
                <div className="mb-6">
                    <Tabs
                        tabs={['Organization Overview', 'My Dashboard']}
                        activeTab={activeView}
                        setActiveTab={setActiveView}
                    />
                </div>
            )}

            {activeView === 'Organization Overview' || !isAdmin ? renderOrgDashboard() : <TeamMemberDashboard isTabbedView={true} />}
        </>
    );

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
