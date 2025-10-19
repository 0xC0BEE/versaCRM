import React, { useState, useEffect, useCallback } from 'react';
import { ReactFlowProvider, Node, Edge, useReactFlow } from 'reactflow';
import PageWrapper from '../../layout/PageWrapper';
import Button from '../../ui/Button';
import { AdvancedWorkflow, ProcessInsight } from '../../../types';
import { ArrowLeft, Monitor } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Card } from '../../ui/Card';
import WorkflowCanvas from './WorkflowCanvas';
import Toolbox from '../Toolbox';
import ConfigPanel from './ConfigPanel';

interface AdvancedWorkflowBuilderProps {
    workflow: AdvancedWorkflow | null;
    onClose: () => void;
}

const AdvancedWorkflowBuilderComponent: React.FC<AdvancedWorkflowBuilderProps> = ({ workflow, onClose }) => {
    const { createAdvancedWorkflowMutation, updateAdvancedWorkflowMutation } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !workflow;
    
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [workflowName, setWorkflowName] = useState('');
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    const reactFlowInstance = useReactFlow();

    useEffect(() => {
        if (workflow) {
            setNodes(workflow.nodes || []);
            setEdges(workflow.edges || []);
            setWorkflowName(workflow.name || '');
        } else {
            setNodes([
                { id: '1', type: 'trigger', position: { x: 250, y: 5 }, data: { label: 'Contact is Created', nodeType: 'contactCreated' } }
            ]);
            setEdges([]);
            setWorkflowName('');
        }
    }, [workflow]);

    const handleSave = () => {
        if (!workflowName.trim()) return toast.error("Workflow name is required.");

        const workflowData = {
            name: workflowName,
            organizationId: authenticatedUser!.organizationId!,
            isActive: workflow?.isActive ?? true,
            nodes,
            edges,
        };

        if (isNew) {
            createAdvancedWorkflowMutation.mutate(workflowData, { onSuccess: onClose });
        } else {
            updateAdvancedWorkflowMutation.mutate({ ...workflow!, ...workflowData }, { onSuccess: onClose });
        }
    };

    const handleSuggest = useCallback((insight: ProcessInsight) => {
        toast.success("AI suggestion applied to the canvas!");
        setWorkflowName(insight.suggestion.substring(0, 50));
        // FIX: The ProcessInsight type's 'workflow' property is for simple workflows.
        // The AI prompt for advanced workflows correctly provides nodes/edges.
        // Casting to the AdvancedWorkflow shape aligns with the actual data received from the AI.
        // FIX: The type assertion from 'Omit<Workflow, ...>' to 'Omit<AdvancedWorkflow, ...>' was failing because the types do not sufficiently overlap. By first casting to 'unknown', we can perform the assertion as intended by the developer comment, resolving the TypeScript error.
        const workflowData = insight.workflow as unknown as Omit<AdvancedWorkflow, 'id' | 'name' | 'organizationId' | 'isActive'>;
        setNodes(workflowData.nodes);
        setEdges(workflowData.edges);
        // This is a bit of a hack to get React Flow to re-layout
        setTimeout(() => {
            reactFlowInstance.fitView({ duration: 300 });
        }, 100);
    }, [setNodes, setEdges, setWorkflowName, reactFlowInstance]);

    const isPending = createAdvancedWorkflowMutation.isPending || updateAdvancedWorkflowMutation.isPending;

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-4">
                <Button variant="secondary" onClick={onClose} leftIcon={<ArrowLeft size={16} />}>Back to Workflows</Button>
                <div className="hidden md:flex items-center gap-4">
                    <input
                        id="workflow-name"
                        placeholder="Enter Advanced Workflow Name..."
                        value={workflowName}
                        onChange={e => setWorkflowName(e.target.value)}
                        className="w-72 bg-transparent text-xl font-semibold focus:outline-none focus:border-b border-border-subtle"
                    />
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Workflow'}</Button>
                </div>
            </div>
            <div className="hidden md:grid grid-cols-12 gap-4 h-[calc(100vh-12rem)]">
                <Card className="col-span-3 p-4 overflow-y-auto">
                    <Toolbox onSuggest={handleSuggest} />
                </Card>
                <div className="col-span-6 h-full">
                    <WorkflowCanvas
                        nodes={nodes}
                        edges={edges}
                        setNodes={setNodes}
                        setEdges={setEdges}
                        onNodeClick={(event, node) => setSelectedNode(node)}
                        onPaneClick={() => setSelectedNode(null)}
                    />
                </div>
                <Card className="col-span-3 p-4 overflow-y-auto">
                   <ConfigPanel selectedNode={selectedNode} setNodes={setNodes} />
                </Card>
            </div>
            <div className="md:hidden flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center p-4">
                <Monitor size={48} className="text-text-secondary" />
                <h3 className="mt-4 font-semibold text-lg">Builder Not Available on Mobile</h3>
                <p className="text-text-secondary mt-1">Please switch to a desktop or tablet to use the workflow builder.</p>
            </div>
        </PageWrapper>
    );
};

// Wrap with provider for useReactFlow hook
const AdvancedWorkflowBuilder: React.FC<AdvancedWorkflowBuilderProps> = (props) => (
    <ReactFlowProvider>
        <AdvancedWorkflowBuilderComponent {...props} />
    </ReactFlowProvider>
);


export default AdvancedWorkflowBuilder;