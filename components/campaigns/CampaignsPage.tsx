import React, { useState, useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
// FIX: Changed default import of 'Card' to a named import '{ Card }' to resolve module export error.
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Plus, Play, BarChart2, Zap, Trash2, Wand2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Campaign } from '../../types';
import { useApp } from '../../contexts/AppContext';
import CampaignBuilderPage from './CampaignBuilderPage';
import CampaignReportPage from './CampaignReportPage';
import toast from 'react-hot-toast';
import AiContentStudioModal from '../ai/AiContentStudioModal';

const CampaignsPage: React.FC = () => {
    const { campaignsQuery, launchCampaignMutation, advanceDayMutation } = useData();
    const { simulatedDate, setSimulatedDate, isFeatureEnabled } = useApp();
    const { data: campaigns = [], isLoading: campaignsLoading } = campaignsQuery;

    const [view, setView] = useState<'list' | 'builder' | 'report'>('list');
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [isAiStudioOpen, setIsAiStudioOpen] = useState(false);

    const handleNew = () => {
        setSelectedCampaign(null);
        setView('builder');
    };

    const handleEdit = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setView('builder');
    };
    
    const handleViewReport = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setView('report');
    };

    const handleLaunch = (campaignId: string) => {
        launchCampaignMutation.mutate(campaignId);
    };
    
    const handleAdvanceDay = () => {
        advanceDayMutation.mutate(simulatedDate, {
            onSuccess: (newDateString: string) => {
                // The API returns a string, so we must convert it back to a Date object
                setSimulatedDate(new Date(newDateString));
            }
        });
    }

    // FIX: Add a handler for the 'onGenerate' prop on AiContentStudioModal to copy generated content to the clipboard.
    const handleContentGenerated = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success("Content copied to clipboard!");
    };

    if (view === 'builder') {
        return (
            <CampaignBuilderPage
                campaign={selectedCampaign}
                onClose={() => setView('list')}
                organizationId={"org_1"} // Placeholder
            />
        );
    }
    
    if (view === 'report') {
        return (
            <CampaignReportPage
                campaign={selectedCampaign!}
                onBack={() => setView('list')}
            />
        )
    }
    
    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h1 className="text-2xl font-semibold text-text-heading">Marketing Campaigns</h1>
                    <p className="text-sm text-text-secondary">Simulated Date: {simulatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2">
                     <Button variant="secondary" onClick={handleAdvanceDay} disabled={advanceDayMutation.isPending}>
                        Advance Day
                    </Button>
                    {isFeatureEnabled('aiContentStudio') && (
                        <Button variant="secondary" onClick={() => setIsAiStudioOpen(true)} leftIcon={<Wand2 size={16}/>}>
                            AI Content Studio
                        </Button>
                    )}
                    <Button onClick={handleNew} leftIcon={<Plus size={16} />}>
                        New Campaign
                    </Button>
                </div>
            </div>
            
            <Card>
                {campaignsLoading ? (
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
                                {(campaigns as Campaign[]).map((c) => (
                                    <tr key={c.id} className="border-b border-border-subtle hover:bg-hover-bg">
                                        <td className="px-6 py-4 font-medium text-text-primary">{c.name}</td>
                                        <td className="px-6 py-4">
                                             <span className={`text-xs font-medium px-2 py-0.5 rounded-micro ${
                                                c.status === 'Active' ? 'bg-success/10 text-success' : 
                                                c.status === 'Draft' ? 'bg-slate-400/10 text-text-secondary' : 
                                                'bg-blue-500/10 text-blue-400'
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
                                                <Button size="sm" variant="secondary" onClick={() => handleViewReport(c)} leftIcon={<BarChart2 size={14}/>}>Report</Button>
                                                {c.status === 'Draft' && (
                                                    <>
                                                        <Button size="sm" variant="secondary" onClick={() => handleEdit(c)}>Edit</Button>
                                                        <Button size="sm" variant="success" onClick={() => handleLaunch(c.id)} leftIcon={<Play size={14} />} disabled={launchCampaignMutation.isPending}>Launch</Button>
                                                    </>
                                                )}
                                                <Button size="sm" variant="danger" onClick={() => toast.error("Delete not implemented")}><Trash2 size={14}/></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20 text-text-secondary">
                        <Zap className="mx-auto h-16 w-16 text-text-secondary/50" />
                        <h2 className="mt-4 text-lg font-semibold text-text-primary">No Campaigns Created Yet</h2>
                        <p className="mt-2 text-sm">Automate your outreach by creating a new customer journey.</p>
                         <Button onClick={handleNew} leftIcon={<Plus size={16} />} className="mt-4">
                            Create First Journey
                        </Button>
                    </div>
                )}
            </Card>

            <AiContentStudioModal 
                isOpen={isAiStudioOpen}
                onClose={() => setIsAiStudioOpen(false)}
                onGenerate={handleContentGenerated}
            />
        </PageWrapper>
    );
};

export default CampaignsPage;