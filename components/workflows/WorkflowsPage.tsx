import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Plus, Bot, Play, Pause } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
// FIX: Imported the Workflow type.
import { Workflow } from '../../types';
import WorkflowBuilder from './WorkflowBuilder';

interface WorkflowsPageProps {
    isTabbedView?: boolean;
}

const WorkflowsPage: React.FC<WorkflowsPageProps> = ({ isTabbedView = false }) => {
    const { authenticatedUser } = useAuth();
    const { workflowsQuery } = useData();
    const { data: workflows = [], isLoading } = workflowsQuery;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

    const handleEdit = (workflow: Workflow) => {
        setSelectedWorkflow(workflow);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedWorkflow(null);
        setIsModalOpen(true);
    };

    const pageContent = (
         <>
            {!isTabbedView && (
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Workflows</h1>
                    <Button onClick={handleAdd} leftIcon={<Plus size={16}/>}>
                        Create Workflow
                    </Button>
                </div>
            )}
            <Card>
                <div className="p-6">
                    {isLoading ? (
                        <div>Loading workflows...</div>
                    ) : (
                        <div className="space-y-4">
                            {workflows.length > 0 ? workflows.map((wf: Workflow) => (
                                <div key={wf.id} className="p-4 border dark:border-dark-border rounded-lg flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <Bot className="text-primary-500" />
                                        <div>
                                            <p className="font-semibold">{wf.name}</p>
                                            <p className="text-xs text-gray-500">Trigger: New Contact Created</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${wf.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {wf.isActive ? <Play size={12} className="mr-1" /> : <Pause size={12} className="mr-1" />}
                                            {wf.isActive ? 'Active' : 'Paused'}
                                        </span>
                                        <Button size="sm" variant="secondary" onClick={() => handleEdit(wf)}>Edit</Button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <Bot className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2">No workflows created yet.</p>
                                    <p className="text-sm">Automate your tasks by creating a new workflow.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>
            {isModalOpen && (
                <WorkflowBuilder 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    workflow={selectedWorkflow}
                    organizationId={authenticatedUser!.organizationId!}
                />
            )}
        </>
    );

    if (isTabbedView) {
        return pageContent;
    }

    return (
        <PageWrapper>
            {pageContent}
        </PageWrapper>
    );
};

export default WorkflowsPage;
