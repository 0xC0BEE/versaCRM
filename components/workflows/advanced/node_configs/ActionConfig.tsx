import React, { useState, useEffect } from 'react';
import Select from '../../../ui/Select';
import Input from '../../../ui/Input';
import { Node } from 'reactflow';
import { useData } from '../../../../contexts/DataContext';
import { User, EmailTemplate, NodeExecutionType } from '../../../../types';

interface ActionConfigProps {
    node: Node;
    updateNodeData: (data: Record<string, any>) => void;
}

const actionTypes: { value: NodeExecutionType, label: string }[] = [
    { value: 'sendEmail', label: 'Send an Email' },
    { value: 'createTask', label: 'Create a Task' },
    { value: 'wait', label: 'Wait for a duration' },
];

const ActionConfig: React.FC<ActionConfigProps> = ({ node, updateNodeData }) => {
    const { emailTemplatesQuery, teamMembersQuery } = useData();
    const { data: emailTemplates = [] } = emailTemplatesQuery;
    const { data: teamMembers = [] } = teamMembersQuery;

    // FIX: Local state for task title input to prevent re-render issues
    const [taskTitle, setTaskTitle] = useState(node.data.taskTitle || '');

    useEffect(() => {
        // Sync local state when the selected node changes
        setTaskTitle(node.data.taskTitle || '');
    }, [node.id, node.data.taskTitle]);

    const handleTaskTitleBlur = () => {
        // Only update the global state when the user is done editing
        if (node.data.taskTitle !== taskTitle) {
            updateNodeData({ taskTitle });
        }
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as NodeExecutionType;
        const newLabel = actionTypes.find(t => t.value === newType)?.label || 'Action';
        // Reset specific properties when type changes
        const newData: Record<string, any> = { nodeType: newType, label: newLabel };
        if (newType === 'wait') {
            newData.days = 1;
        }
        updateNodeData(newData);
    };

    const renderActionOptions = () => {
        switch (node.data.nodeType as NodeExecutionType) {
            case 'sendEmail':
                return (
                    <Select
                        id="email-template"
                        label="Email Template"
                        value={node.data.emailTemplateId || ''}
                        onChange={(e) => updateNodeData({ emailTemplateId: e.target.value })}
                    >
                        <option value="">Select a template...</option>
                        {emailTemplates.map((t: EmailTemplate) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </Select>
                );
            case 'createTask':
                return (
                    <>
                        <Input
                            id="task-title"
                            label="Task Title"
                            value={taskTitle} // Use local state for value
                            onChange={(e) => setTaskTitle(e.target.value)} // Update local state on change
                            onBlur={handleTaskTitleBlur} // Update global state on blur
                            placeholder="e.g., Follow up with {{contactName}}"
                        />
                        <Select
                            id="task-assignee"
                            label="Assign To"
                            value={node.data.assigneeId || ''}
                            onChange={(e) => updateNodeData({ assigneeId: e.target.value })}
                        >
                            <option value="">Select a team member...</option>
                            {teamMembers.map((m: User) => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </Select>
                    </>
                );
            case 'wait':
                return (
                    <Input
                        id="wait-days"
                        label="Wait for (days)"
                        type="number"
                        min="1"
                        value={node.data.days || 1}
                        onChange={(e) => updateNodeData({ days: parseInt(e.target.value) || 1 })}
                    />
                );
            default:
                return <p className="text-xs text-text-secondary">Select an action type to configure.</p>;
        }
    };

    return (
        <div className="space-y-4">
            <Select id="action-type" label="Action Type" value={node.data.nodeType} onChange={handleTypeChange}>
                {actionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
            <div className="space-y-2 pt-2 border-t border-border-subtle">
                {renderActionOptions()}
            </div>
            <p className="text-xs text-text-secondary">This action will be executed when the previous node in the workflow is completed.</p>
        </div>
    );
};

export default ActionConfig;