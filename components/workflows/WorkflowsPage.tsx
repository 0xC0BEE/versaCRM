import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Bot, Plus, Zap, CheckCircle, XCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Workflow } from '../../types';
import WorkflowBuilder from './WorkflowBuilder';

interface WorkflowsPageProps {
    isTabbedView?: boolean;
}

const WorkflowsPage: React.FC<WorkflowsPageProps> = ({ isTabbedView = false }) => {
    const { workflowsQuery, updateWorkflowMutation } = useData();
    const { data: workflows = [], isLoading } = workflowsQuery;
    const [view, setView] = useState<'list' | 'builder'>('list');
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

    const handleEdit = (workflow: Workflow) => {
        setSelectedWorkflow(workflow);
        setView('builder');
    };

    const handleAdd = () => {
        setSelectedWorkflow(null);
        setView('builder');
    };
    
    const handleCloseBuilder = () => {
        setView('list');
        setSelectedWorkflow(null);
    };
    
    const handleToggleActive = (workflow: Workflow) => {
        updateWorkflowMutation.mutate({ ...workflow, isActive: !workflow.isActive });
    };

    if (view === 'builder') {
        return (
            <WorkflowBuilder
                workflow={selectedWorkflow}
                onClose={handleCloseBuilder}
            />
        );
    }

    const pageContent = (
        <>
            {!isTabbedView && (
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-text-heading">Workflows</h1>
                    <Button onClick={handleAdd} leftIcon={<Plus size={16} />}>
                        New Workflow
                    </Button>
                </div>
            )}
            <Card>
                {isLoading ? (
                    <div className="p-8 text-center">Loading workflows...</div>
                ) : workflows.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-secondary">
                             <thead className="text-xs uppercase bg-card-bg/50 text-text-secondary">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-medium">Name</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Trigger</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Status</th>
                                    <th scope="col" className="px-6 py-3 font-medium"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {workflows.map((wf: Workflow) => (
                                    <tr key={wf.id} className="border-b border-border-subtle hover:bg-hover-bg">
                                        <td className="px-6 py-4 font-medium text-text-primary">{wf.name}</td>
                                        <td className="px-6 py-4 capitalize">{wf.trigger.type.replace(/([A-Z])/g, ' $1')}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleToggleActive(wf)} className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-micro ${wf.isActive ? 'bg-success/10 text-success' : 'bg-slate-400/10 text-text-secondary'}`}>
                                                {wf.isActive ? <CheckCircle size={12}/> : <XCircle size={12} />}
                                                {wf.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button size="sm" variant="secondary" onClick={() => handleEdit(wf)}>Edit</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20 text-text-secondary">
                        <Bot className="mx-auto h-16 w-16 text-text-secondary/50" />
                        <h2 className="mt-4 text-lg font-semibold text-text-primary">No Workflows Created Yet</h2>
                        <p className="mt-2 text-sm">Automate your tasks by creating a new workflow.</p>
                         <Button onClick={handleAdd} leftIcon={<Plus size={16} />} className="mt-4">
                            Create First Workflow
                        </Button>
                    </div>
                )}
            </Card>
        </>
    );
    
    if (isTabbedView) {
        return <div className="p-1">{pageContent}</div>;
    }

    return <PageWrapper>{pageContent}</PageWrapper>;
};

export default WorkflowsPage;