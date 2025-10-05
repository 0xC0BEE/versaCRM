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
import ContactCard from './ContactCard';
import ReviewPromptCard from './ReviewPromptCard';
import Tabs from '../ui/Tabs';
import ContactDetailModal from '../organizations/ContactDetailModal';
import { AnyContact } from '../../types';


interface DashboardPageProps {
    isTabbedView?: boolean;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ isTabbedView = false }) => {
    const { authenticatedUser } = useAuth();
    const { industryConfig } = useApp();
    const { dashboardDataQuery, contactsQuery, updateContactMutation, deleteContactMutation } = useData();
    const { data: dashboardData, isLoading: isDashboardLoading } = dashboardDataQuery;
    const { data: contacts = [], isLoading: isContactsLoading } = contactsQuery;
    
    const isAdmin = authenticatedUser?.role === 'Organization Admin' || authenticatedUser?.role === 'Super Admin';
    const [activeTab, setActiveTab] = useState('Organization');
    
    // State for managing the contact detail modal
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<AnyContact | null>(null);
    const [initialModalTab, setInitialModalTab] = useState('Profile');

    // For demo purposes, find a contact to feature
    const featuredContact = contacts.length > 0 ? contacts[0] : null;
    const requiresReviewContact = contacts.length > 1 ? contacts[1] : null;

    const handleOpenEmailModal = (contact: AnyContact) => {
        setSelectedContact(contact);
        setInitialModalTab('Email');
        setIsDetailModalOpen(true);
    };

    const handleOpenReviewModal = (contact: AnyContact) => {
        setSelectedContact(contact);
        setInitialModalTab('Documents');
        setIsDetailModalOpen(true);
    };
    
    const handleSaveModal = (contactData: AnyContact) => {
        if (contactData.id) {
            updateContactMutation.mutate(contactData, {
                onSuccess: () => setIsDetailModalOpen(false)
            });
        }
    };
    
    const handleDeleteModal = (contactId: string) => {
        deleteContactMutation.mutate(contactId, {
            onSuccess: () => setIsDetailModalOpen(false)
        });
    };

    const renderOrgDashboard = () => {
        if (isDashboardLoading || isContactsLoading) return <LoadingSpinner />;
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

                 {/* Living Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredContact && (
                        <ContactCard 
                            contact={featuredContact}
                            aiSuggestion="AI Suggestion: Time to reconnect with John. It's been over 30 days."
                            onEmailClick={() => handleOpenEmailModal(featuredContact)}
                        />
                    )}
                    {requiresReviewContact && (
                        <ReviewPromptCard 
                            contact={requiresReviewContact} 
                            onReviewClick={() => handleOpenReviewModal(requiresReviewContact)}
                        />
                    )}
                     <AiInsightsCard dashboardData={dashboardData} isLoading={isDashboardLoading} />
                </div>


                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {industryConfig.dashboard.charts.map(chart => (
                        <Card title={chart.title} key={chart.dataKey} className="card-hover">
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

    const renderAdminDashboardWithTabs = () => (
        <>
            <div className="mb-6">
                <Tabs
                    tabs={['Organization', 'My Dashboard']}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </div>
            {activeTab === 'Organization' ? renderOrgDashboard() : <TeamMemberDashboard isTabbedView={true} />}
        </>
    );

    const pageContent = (
        <>
            {isAdmin && !isTabbedView ? (
                renderAdminDashboardWithTabs()
            ) : authenticatedUser?.role === 'Team Member' ? (
                <TeamMemberDashboard isTabbedView={true} />
            ) : (
                renderOrgDashboard()
            )}
        </>
    );


    if (isTabbedView) {
        // When used inside another tab (e.g., Organization Details), just show the org data.
        return renderOrgDashboard();
    }

    return (
        <PageWrapper>
            <h1 className="text-3xl font-bold text-text-heading mb-6">Dashboard</h1>
            {pageContent}

            <ContactDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                contact={selectedContact}
                onSave={handleSaveModal}
                onDelete={handleDeleteModal}
                isSaving={updateContactMutation.isPending}
                isDeleting={deleteContactMutation.isPending}
                initialTab={initialModalTab}
            />
        </PageWrapper>
    );
};

export default DashboardPage;