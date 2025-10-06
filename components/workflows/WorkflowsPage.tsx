import React, { useState, useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Plus, Zap, Code, Trash2, TestTube2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Workflow, AdvancedWorkflow } from '../../types';
import WorkflowBuilder from './WorkflowBuilder';
// FIX: Corrected import path for AdvancedWorkflowBuilder.
import AdvancedWorkflowBuilder from './advanced/AdvancedWorkflowBuilder';
import toast from 'react-hot-toast';
import WorkflowTestModal from './WorkflowTestModal';

interface WorkflowsPageProps {
    isTabbedView?: boolean;
}

const WorkflowsPage: React.FC<WorkflowsPageProps> = ({ isTabbedView = false }) => {
    const { 
        workflowsQuery, 
        advancedWorkflowsQuery,
        // deleteWorkflowMutation, // Add when simple workflow deletion is needed
        deleteAdvancedWorkflowMutation
    } = useData();
    const { data: workflows = [], isLoading: simpleLoading } = workflowsQuery;
    const { data: advancedWorkflows = [], isLoading: advancedLoading } = advancedWorkflowsQuery;

    const [view, setView] = useState<'list' | 'builder' | 'advanced'>('list');
    const [selectedItem, setSelectedItem] = useState<Workflow | AdvancedWorkflow | null>(null);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);

    const allWorkflows = useMemo(() => {
        const simple = (workflows as Workflow[]).map(w => ({ ...w, workflowType: 'Simple' as const }));
        const advanced = (advancedWorkflows as AdvancedWorkflow[]).map(w => ({ ...w, workflowType: 'Advanced' as const }));
        return [...simple, ...advanced];
    }, [workflows, advancedWorkflows]);

    const handleEdit = (item: (Workflow | AdvancedWorkflow) & { workflowType: string }) => {
        setSelectedItem(item);
        if (item.workflowType === 'Advanced') {
            setView('advanced');
        } else {
            setView('builder');
        }
    };

    const handleNewSimple = () => {
        setSelectedItem(null);
        setView('builder');
    };

    const handleNewAdvanced = () => {
        setSelectedItem(null);
        setView('advanced');
    };
    
    const handleCloseBuilder = () => {
        setView('list');
        setSelectedItem(null);
    };

    const handleDelete = (item: (Workflow | AdvancedWorkflow) & { workflowType: string }) => {
        if (item.workflowType === 'Advanced') {
            if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
                deleteAdvancedWorkflowMutation.mutate(item.id);
            }
        } else {
            toast.error("Deletion for simple workflows is not yet implemented.");
        }
    };

    const isLoading = simpleLoading || advancedLoading;

    if (view === 'builder') {
        return <WorkflowBuilder workflow={selectedItem as Workflow | null} onClose={handleCloseBuilder} />;
    }

    if (view === 'advanced') {
        return <AdvancedWorkflowBuilder workflow={selectedItem as AdvancedWorkflow | null} onClose={handleCloseBuilder} />;
    }

    const pageContent = (
        <>
            {!isTabbedView && (
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-text-heading">Workflows</h1>
                    <div className="flex gap-2">
                        <Button onClick={() => setIsTestModalOpen(true)} leftIcon={<TestTube2 size={16}/>} variant="secondary">
                            Test Triggers
                        </Button>
                        <Button onClick={handleNewAdvanced} leftIcon={<Code size={16}/>} variant="secondary">
                            New Advanced Workflow
                        </Button>
                        <Button onClick={handleNewSimple} leftIcon={<Plus size={16} />}>
                            New Simple Workflow
                        </Button>
                    </div>
                </div>
            )}
            <Card>
                {isLoading ? (
                    <div className="p-8 text-center">Loading workflows...</div>
                ) : allWorkflows.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-secondary">
                            <thead className="text-xs uppercase bg-card-bg/50 text-text-secondary">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-medium">Name</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Type</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Status</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Trigger</th>
                                    <th scope="col" className="px-6 py-3 font-medium"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {allWorkflows.map((w) => (
                                    <tr key={w.id} className="border-b border-border-subtle hover:bg-hover-bg">
                                        <td className="px-6 py-4 font-medium text-text-primary">{w.name}</td>
                                        <td className="px-6 py-4">
                                             <span className={`text-xs font-medium px-2 py-0.5 rounded-micro ${
                                                // FIX: Use 'in' operator for type guarding instead of accessing a dynamically added property.
                                                'nodes' in w ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                                            }`}>
                                                {w.workflowType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-micro ${
                                                w.isActive ? 'bg-success/10 text-success' : 'bg-slate-400/10 text-text-secondary'
                                            }`}>
                                                {w.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{w.workflowType === 'Simple' ? w.trigger.type : ('nodes' in w && w.nodes.find(n => n.type === 'trigger')?.data.label)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="secondary" onClick={() => handleEdit(w)}>Edit</Button>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(w)} disabled={deleteAdvancedWorkflowMutation.isPending}>
                                                    <Trash2 size={14}/>
                                                </Button>
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
                        <h2 className="mt-4 text-lg font-semibold text-text-primary">No Workflows Created Yet</h2>
                        <p className="mt-2 text-sm">Automate your processes by creating a new workflow.</p>
                         <Button onClick={handleNewSimple} leftIcon={<Plus size={16} />} className="mt-4">
                            Create First Workflow
                        </Button>
                    </div>
                )}
            </Card>
            <WorkflowTestModal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} />
        </>
    );

    if (isTabbedView) {
        return <div className="p-1">{pageContent}</div>
    }
    
    return <PageWrapper>{pageContent}</PageWrapper>;
};

export default WorkflowsPage;