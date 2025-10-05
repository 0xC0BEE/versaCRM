import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Bot, Plus, Rocket } from 'lucide-react';
// FIX: Corrected import path for useData.
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
// FIX: Corrected import path for types.
import { Campaign } from '../../types';
import CampaignBuilderPage from './CampaignBuilderPage';

const CampaignsPage: React.FC = () => {
    const { campaignsQuery, launchCampaignMutation } = useData();
    const { authenticatedUser } = useAuth();
    const { data: campaigns = [], isLoading } = campaignsQuery;
    const [view, setView] = useState<'list' | 'builder'>('list');
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

    const handleEdit = (campaign: Campaign) => {
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

    if (view === 'builder') {
        return (
            <CampaignBuilderPage
                campaign={selectedCampaign}
                onClose={handleCloseBuilder}
                organizationId={authenticatedUser!.organizationId!}
            />
        );
    }

    const getStatusColor = (status: Campaign['status']) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-text-heading">Campaigns</h1>
                <Button onClick={handleAdd} leftIcon={<Plus size={16} />}>
                    New Campaign
                </Button>
            </div>
            <Card>
                {isLoading ? (
                    <div className="p-8 text-center">Loading campaigns...</div>
                ) : campaigns.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Campaign Name</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Recipients</th>
                                    <th scope="col" className="px-6 py-3">Open Rate</th>
                                    <th scope="col" className="px-6 py-3">Click Rate</th>
                                    <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.map((c: Campaign) => (
                                    <tr key={c.id} className="bg-white border-b dark:bg-dark-card dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{c.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(c.status)}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{c.stats.recipients}</td>
                                        <td className="px-6 py-4">{(c.stats.opened / (c.stats.sent || 1) * 100).toFixed(1)}%</td>
                                        <td className="px-6 py-4">{(c.stats.clicked / (c.stats.opened || 1) * 100).toFixed(1)}%</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {c.status === 'Draft' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="secondary" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm(`Are you sure you want to launch the campaign "${c.name}"? This will send emails to all recipients.`)) {
                                                                 launchCampaignMutation.mutate(c.id);
                                                            }
                                                        }}
                                                        disabled={launchCampaignMutation.isPending}
                                                        leftIcon={<Rocket size={14} />}
                                                    >
                                                        {launchCampaignMutation.isPending ? 'Launching...' : 'Launch'}
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="secondary" onClick={() => handleEdit(c)}>Edit</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                        <Bot className="mx-auto h-16 w-16 text-gray-400" />
                        <h2 className="mt-4 text-lg font-semibold">No Campaigns Created Yet</h2>
                        <p className="mt-2 text-sm">Create your first automated email campaign to get started.</p>
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