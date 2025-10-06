import React, { useState, useEffect } from 'react';
import { ReactFlowProvider, Node, Edge } from 'reactflow';
import PageWrapper from '../../layout/PageWrapper';
import Button from '../../ui/Button';
import { AdvancedWorkflow } from '../../../types';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';
import WorkflowCanvas from './WorkflowCanvas';
import Toolbox from './Toolbox';
import ConfigPanel from './ConfigPanel';
import Card from '../../ui/Card';

interface AdvancedWorkflowBuilderProps {
    workflow: AdvancedWorkflow | null;
    onClose: () => void;
}

const AdvancedWorkflowBuilder: React.FC<AdvancedWorkflowBuilderProps> = ({ workflow, onClose }) => {
    const { createAdvancedWorkflowMutation, updateAdvancedWorkflowMutation } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !workflow;

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [workflowName, setWorkflowName] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    useEffect(() => {
        if (workflow) {
            setNodes(workflow.nodes || []);
            setEdges(workflow.edges || []);
            setWorkflowName(workflow.name || '');
            setIsActive(workflow.isActive);
        } else {
            // Default for a new workflow
            setNodes([
                { id: '1', type: 'trigger', position: { x: 250, y: 5 }, data: { label: 'Contact is Created', nodeType: 'contactCreated' } }
            ]);
            setEdges([]);
            setWorkflowName('');
            setIsActive(true);
        }
    }, [workflow]);

    const handleSave = () => {
        if (!workflowName.trim()) return toast.error("Workflow name is required.");

        const workflowData = {
            name: workflowName,
            organizationId: authenticatedUser!.organizationId!,
            isActive,
            nodes,
            edges,
        };

        if (isNew) {
            createAdvancedWorkflowMutation.mutate(workflowData as Omit<AdvancedWorkflow, 'id'>, { onSuccess: onClose });
        } else {
            updateAdvancedWorkflowMutation.mutate({ ...workflow!, ...workflowData }, { onSuccess: onClose });
        }
    };

    const isPending = createAdvancedWorkflowMutation.isPending || updateAdvancedWorkflowMutation.isPending;

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-4">
                <Button variant="secondary" onClick={onClose} leftIcon={<ArrowLeft size={16} />}>Back to Workflows</Button>
                <div className="flex items-center gap-4">
                    <input
                        id="workflow-name"
                        placeholder="Enter Workflow Name..."
                        value={workflowName}
                        onChange={e => setWorkflowName(e.target.value)}
                        className="w-72 bg-transparent text-xl font-semibold focus:outline-none focus:border-b border-border-subtle"
                    />
                    <label className="flex items-center text-sm font-medium text-text-primary cursor-pointer">
                        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-border-subtle text-primary focus:ring-primary"/>
                        <span className="ml-2">Active</span>
                    </label>
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Workflow'}</Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4 h-[calc(100vh-12rem)]">
                <Card className="col-span-3 p-4 overflow-y-auto">
                    <Toolbox />
                </Card>
                <div className="col-span-6 h-full">
                    <ReactFlowProvider>
                        <WorkflowCanvas 
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
                    <ConfigPanel selectedNode={selectedNode} setNodes={setNodes} />
                </Card>
            </div>
        </PageWrapper>
    );
};

export default AdvancedWorkflowBuilder;