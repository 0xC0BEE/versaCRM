import React, { useState, useEffect } from 'react';
import { ReactFlowProvider, Node, Edge } from 'reactflow';
import PageWrapper from '../layout/PageWrapper';
import Button from '../ui/Button';
import { Campaign, ContactStatus } from '../../types';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
// FIX: Changed default import of 'Card' to a named import '{ Card }' to resolve module export error.
import { Card } from '../ui/Card';
import JourneyToolbox from './journey/Toolbox';
import JourneyCanvas from './journey/JourneyCanvas';
import JourneyConfigPanel from './journey/ConfigPanel';

interface CampaignBuilderPageProps {
    campaign: Campaign | null;
    onClose: () => void;
    organizationId: string;
}

const CampaignBuilderPage: React.FC<CampaignBuilderPageProps> = ({ campaign, onClose, organizationId }) => {
    const { createCampaignMutation, updateCampaignMutation } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !campaign;

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [campaignName, setCampaignName] = useState('');
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

     useEffect(() => {
        if (campaign) {
            setNodes(campaign.nodes || []);
            setEdges(campaign.edges || []);
            setCampaignName(campaign.name || '');
        } else {
            // Default for a new campaign journey
            const defaultAudience = { status: 'Lead' as ContactStatus };
            setNodes([
                { 
                    id: '1', 
                    type: 'journeyTrigger', 
                    position: { x: 250, y: 25 }, 
                    data: { 
                        label: 'Target Audience', 
                        nodeType: 'targetAudience',
                        targetAudience: defaultAudience
                    } 
                }
            ]);
            setEdges([]);
            setCampaignName('');
        }
    }, [campaign]);

    const handleSave = () => {
        if (!campaignName.trim()) return toast.error("Campaign name is required.");

        const triggerNode = nodes.find(n => n.type === 'journeyTrigger');
        if (!triggerNode) return toast.error("A journey must have a trigger node.");
        
        const audience = triggerNode.data.targetAudience || { status: 'Lead' };

        const campaignData = {
            name: campaignName,
            organizationId: authenticatedUser!.organizationId!,
            status: 'Draft' as const,
            stats: campaign?.stats || { recipients: 0, sent: 0, opened: 0, clicked: 0 },
            targetAudience: audience,
            nodes,
            edges,
        };

        if (isNew) {
            createCampaignMutation.mutate(campaignData, { onSuccess: onClose });
        } else {
            updateCampaignMutation.mutate({ ...campaign!, ...campaignData }, { onSuccess: onClose });
        }
    };

    const isPending = createCampaignMutation.isPending || updateCampaignMutation.isPending;

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-4">
                <Button variant="secondary" onClick={onClose} leftIcon={<ArrowLeft size={16} />}>Back to Campaigns</Button>
                <div className="flex items-center gap-4">
                     <input
                        id="campaign-name"
                        placeholder="Enter Journey Name..."
                        value={campaignName}
                        onChange={e => setCampaignName(e.target.value)}
                        className="w-72 bg-transparent text-xl font-semibold focus:outline-none focus:border-b border-border-subtle"
                    />
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Journey'}</Button>
                </div>
            </div>
             <div className="grid grid-cols-12 gap-4 h-[calc(100vh-12rem)]">
                <Card className="col-span-3 p-4 overflow-y-auto">
                    <JourneyToolbox />
                </Card>
                <div className="col-span-6 h-full">
                    <ReactFlowProvider>
                        <JourneyCanvas 
                            nodes={nodes}
                            edges={edges}
                            setNodes={setNodes}
                            setEdges={setEdges}
                            onNodeClick={(event, node) => setSelectedNode(node)}
                            onPaneClick={() => setSelectedNode(null)}
                        />
                    </ReactFlowProvider>
                </div>
                <Card className="col-span-3 p-4 overflow-y-auto">
                   <JourneyConfigPanel selectedNode={selectedNode} setNodes={setNodes} />
                </Card>
            </div>
        </PageWrapper>
    );
};

export default CampaignBuilderPage;