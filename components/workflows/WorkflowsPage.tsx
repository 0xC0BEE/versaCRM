import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Bot, Plus } from 'lucide-react';
// FIX: Corrected import path for useData.
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Workflow } from '../../types';
import WorkflowBuilder from './WorkflowBuilder';

interface WorkflowsPageProps {
    isTabbedView?: boolean;
}

const WorkflowsPage: React.FC<WorkflowsPageProps> = ({ isTabbedView = false }) => {
    const { workflowsQuery } = useData();
    const { authenticatedUser } = useAuth();
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

    if (view === 'builder') {
        return (
            <WorkflowBuilder 
                workflow={selectedWorkflow}
                onClose={handleCloseBuilder}
                organizationId={authenticatedUser!.organizationId!}
            />
        );
    }
    
    const pageContent = (
        <>
            {!isTabbedView && (
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Workflows</h1>
                    <Button onClick={handleAdd} leftIcon={<Plus size={16} />}>
                        New Workflow
                    </Button>
                </div>
            )}
            <Card>
                {isLoading ? (
                    <div className="p-8 text-center">Loading workflows...</div>
                ) : (
                    workflows.length > 0 ? (
                        <div className="divide-y dark:divide-dark-border">
                            {workflows.map((wf: Workflow) => (
                                <div key={wf.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-1 rounded-full ${wf.isActive ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                            <Bot className={`h-5 w-5 ${wf.isActive ? 'text-green-600 dark:text-green-300' : 'text-gray-500'}`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-white">{wf.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Trigger: {wf.trigger.type}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${wf.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                            {wf.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <Button size="sm" variant="secondary" onClick={() => handleEdit(wf)}>Edit</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <Bot className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 font-semibold">No workflows created yet.</p>
                            <p className="text-sm">Automate your tasks by creating a new workflow.</p>
                        </div>
                    )
                )}
            </Card>
        </>
    );
    
    if (isTabbedView) {
        return <div className="p-1">{pageContent}</div>;
    }
    
    return (
        <PageWrapper>
            {pageContent}
        </PageWrapper>
    );
};

export default WorkflowsPage;