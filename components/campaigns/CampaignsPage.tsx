import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Plus, Send, BarChart, Mail } from 'lucide-react';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Campaign } from '../../types';
import CampaignBuilderPage from './CampaignBuilderPage';
import toast from 'react-hot-toast';

const CampaignsPage: React.FC = () => {
    const { campaignsQuery, launchCampaignMutation } = useData();
    const { authenticatedUser } = useAuth();
    const { data: campaigns = [], isLoading } = campaignsQuery;
    const [view, setView] = useState<'list' | 'builder'>('list');
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

    const handleEdit = (campaign: Campaign) => {
        if (campaign.status !== 'Draft') {
            toast.error("Only draft campaigns can be edited.");
            return;
        }
        setSelectedCampaign(campaign);
        setView('builder');
    };

    const handleAdd = () => {
        setSelectedCampaign(null);
        setView('builder');
    };

    const handleCloseBuilder = () => {
        setView('list');
        setSelectedCampaign(null);
    };
    
    const handleLaunch = (campaign: Campaign) => {
        if (window.confirm(`Are you sure you want to launch the "${campaign.name}" campaign? This action cannot be undone.`)) {
            launchCampaignMutation.mutate(campaign.id);
        }
    }

    if (view === 'builder') {
        return (
            <CampaignBuilderPage
                campaign={selectedCampaign}
                onClose={handleCloseBuilder}
                organizationId={authenticatedUser!.organizationId!}
            />
        );
    }

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-text-heading">Marketing Campaigns</h1>
                <Button onClick={handleAdd} leftIcon={<Plus size={16} />}>
                    New Campaign
                </Button>
            </div>
            <Card>
                {isLoading ? (
                    <div className="p-8 text-center">Loading campaigns...</div>
                ) : campaigns.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-secondary">
                            <thead className="text-xs uppercase bg-card-bg/50 text-text-secondary">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-medium">Campaign Name</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Status</th>
                                    <th scope="col" className="px-6 py-3 font-medium text-center">Recipients</th>
                                    <th scope="col" className="px-6 py-3 font-medium text-center">Sent</th>
                                    <th scope="col" className="px-6 py-3 font-medium text-center">Opened</th>
                                    <th scope="col" className="px-6 py-3 font-medium text-center">Clicked</th>
                                    <th scope="col" className="px-6 py-3 font-medium"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(campaigns as Campaign[]).map((c: Campaign) => (
                                    <tr key={c.id} className="border-b border-border-subtle hover:bg-hover-bg">
                                        <td className="px-6 py-4 font-medium text-text-primary">{c.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-micro ${
                                                c.status === 'Active' ? 'bg-success/10 text-success' :
                                                c.status === 'Completed' ? 'bg-blue-500/10 text-blue-400' :
                                                'bg-slate-400/10 text-text-secondary'
                                            }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">{c.stats.recipients}</td>
                                        <td className="px-6 py-4 text-center">{c.stats.sent}</td>
                                        <td className="px-6 py-4 text-center">{c.stats.opened}</td>
                                        <td className="px-6 py-4 text-center">{c.stats.clicked}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                {c.status === 'Draft' && (
                                                    <>
                                                        <Button size="sm" variant="secondary" onClick={() => handleEdit(c)}>Edit</Button>
                                                        <Button size="sm" onClick={() => handleLaunch(c)} leftIcon={<Send size={14}/>} disabled={launchCampaignMutation.isPending}>Launch</Button>
                                                    </>
                                                )}
                                                {c.status !== 'Draft' && (
                                                    <Button size="sm" variant="secondary" leftIcon={<BarChart size={14}/>}>Report</Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20 text-text-secondary">
                        <Mail className="mx-auto h-16 w-16 text-text-secondary/50" />
                        <h2 className="mt-4 text-lg font-semibold text-text-primary">No Campaigns Created Yet</h2>
                        <p className="mt-2 text-sm">Create automated email sequences to nurture your leads.</p>
                         <Button onClick={handleAdd} leftIcon={<Plus size={16} />} className="mt-4">
                            Create First Campaign
                        </Button>
                    </div>
                )}
            </Card>
        </PageWrapper>
    );
};

export default CampaignsPage;