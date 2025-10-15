import React, { useMemo, useState } from 'react';
import { Campaign, AnyContact, Interaction, AttributedDeal } from '../../types';
import PageWrapper from '../layout/PageWrapper';
import { ArrowLeft, DollarSign } from 'lucide-react';
import Button from '../ui/Button';
import { useData } from '../../contexts/DataContext';
import KpiCard from '../dashboard/KpiCard';
// FIX: Changed default import of 'Card' to a named import '{ Card, CardHeader, CardTitle, CardContent }' and refactored usage to resolve module export error.
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import CampaignFunnelChart from './CampaignFunnelChart';
import CampaignEngagementTimeline from './CampaignEngagementTimeline';
import Tabs from '../ui/Tabs';
// FIX: Corrected import path to the non-deprecated ContactsTable component.
import ContactsTable from '../organizations/ContactsTable';
import LoadingSpinner from '../ui/LoadingSpinner';
import { format } from 'date-fns';

interface CampaignReportPageProps {
    campaign: Campaign;
    onBack: () => void;
}

const CampaignReportPage: React.FC<CampaignReportPageProps> = ({ campaign, onBack }) => {
    const { allInteractionsQuery, contactsQuery, campaignAttributionQuery } = useData();
    const { data: allInteractions = [], isLoading: interactionsLoading } = allInteractionsQuery;
    const { data: allContacts = [], isLoading: contactsLoading } = contactsQuery;
    const { data: attributedDeals = [], isLoading: attributionLoading } = campaignAttributionQuery(campaign.id);
    const [activeTab, setActiveTab] = useState('Opened');

    const isLoading = interactionsLoading || contactsLoading || attributionLoading;

    const { openRate, clickRate, interactions, openedContacts, clickedContacts } = useMemo(() => {
        if (!campaign || !allInteractions.length || !allContacts.length) {
            return { openRate: 0, clickRate: 0, interactions: [], openedContacts: [], clickedContacts: [] };
        }

        const campaignInteractions = (allInteractions as Interaction[]).filter(i => i.notes.includes(`(Campaign: ${campaign.name})`));
        const sentCount = campaign.stats.sent;
        const openedCount = campaign.stats.opened;
        const clickedCount = campaign.stats.clicked;
        
        const openRate = sentCount > 0 ? (openedCount / sentCount) * 100 : 0;
        const clickRate = openedCount > 0 ? (clickedCount / openedCount) * 100 : 0; // Click-through rate based on opens

        const contactMap = new Map((allContacts as AnyContact[]).map(c => [c.id, c]));
        
        const openedContactIds = new Set(campaignInteractions.filter(i => i.openedAt).map(i => i.contactId));
        const clickedContactIds = new Set(campaignInteractions.filter(i => i.clickedAt).map(i => i.contactId));
        
        const openedContacts = Array.from(openedContactIds).map(id => contactMap.get(id)).filter(Boolean) as AnyContact[];
        const clickedContacts = Array.from(clickedContactIds).map(id => contactMap.get(id)).filter(Boolean) as AnyContact[];

        return { openRate, clickRate, interactions: campaignInteractions, openedContacts, clickedContacts };
    }, [campaign, allInteractions, allContacts]);
    
    const attributedRevenue = useMemo(() => {
        return (attributedDeals as AttributedDeal[]).reduce((sum, deal) => sum + deal.dealValue, 0);
    }, [attributedDeals]);

    const tabs = [`Opened (${openedContacts.length})`, `Clicked (${clickedContacts.length})`, `Attribution (${(attributedDeals as AttributedDeal[]).length})`];

    const renderContactList = () => {
        if (activeTab.startsWith('Attribution')) {
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs uppercase bg-card-bg/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-medium">Deal Name</th>
                                <th scope="col" className="px-6 py-3 font-medium">Contact</th>
                                <th scope="col" className="px-6 py-3 font-medium text-right">Value</th>
                                <th scope="col" className="px-6 py-3 font-medium">Closed At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(attributedDeals as AttributedDeal[]).map(deal => (
                                <tr key={deal.dealId} className="border-b border-border-subtle">
                                    <td className="px-6 py-4 font-medium text-text-primary">{deal.dealName}</td>
                                    <td className="px-6 py-4">{deal.contactName}</td>
                                    <td className="px-6 py-4 text-right">{deal.dealValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                    <td className="px-6 py-4">{format(new Date(deal.closedAt), 'PP')}</td>
                                </tr>
                            ))}
                             {(attributedDeals as AttributedDeal[]).length === 0 && (
                                <tr><td colSpan={4} className="text-center p-8">No deals have been attributed to this campaign yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )
        }
        const contactsToShow = activeTab.startsWith('Opened') ? openedContacts : clickedContacts;
        return (
            <ContactsTable 
                contacts={contactsToShow}
                onRowClick={() => {}} // Read-only view
                isError={false}
                selectedContactIds={new Set()}
                setSelectedContactIds={() => {}}
            />
        );
    }
    
    if (isLoading) {
        return <PageWrapper><LoadingSpinner/></PageWrapper>;
    }

    return (
        <PageWrapper>
            <div className="flex items-center mb-6">
                <Button variant="secondary" onClick={onBack} className="mr-4">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold text-text-heading">{campaign.name}</h1>
                    <p className="text-sm text-text-secondary">Performance Report</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    <KpiCard title="Recipients" value={campaign.stats.recipients} iconName="Users" />
                    <KpiCard title="Sent" value={campaign.stats.sent} iconName="Send" />
                    <KpiCard title="Open Rate" value={`${openRate.toFixed(1)}%`} iconName="MailOpen" />
                    <KpiCard title="Click Rate" value={`${clickRate.toFixed(1)}%`} iconName="MousePointerClick" />
                    <KpiCard title="Attributed Revenue" value={attributedRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} iconName="DollarSign" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Campaign Funnel</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CampaignFunnelChart stats={campaign.stats} />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Engagement Timeline (First 48h)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CampaignEngagementTimeline interactions={interactions} campaignStartDate={new Date()} />
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <div className="p-6">
                        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                        <div className="mt-4">
                            {renderContactList()}
                        </div>
                    </div>
                </Card>
            </div>
        </PageWrapper>
    );
};

export default CampaignReportPage;