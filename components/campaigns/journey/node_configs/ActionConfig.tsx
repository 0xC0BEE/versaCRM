import React from 'react';
import Select from '../../../ui/Select';
import Input from '../../../ui/Input';
import { Node } from 'reactflow';
import { useData } from '../../../../contexts/DataContext';
import { EmailTemplate, JourneyExecutionType } from '../../../../types';

interface ActionConfigProps {
    node: Node;
    updateNodeData: (data: Record<string, any>) => void;
}

const ActionConfig: React.FC<ActionConfigProps> = ({ node, updateNodeData }) => {
    const { emailTemplatesQuery } = useData();
    const { data: emailTemplates = [] } = emailTemplatesQuery;
    
    const handleDataChange = (field: string, value: any) => {
        updateNodeData({ [field]: value });
    };

    const renderActionOptions = () => {
        switch (node?.data?.nodeType as JourneyExecutionType) {
            case 'sendEmail':
                return (
                    <Select
                        id="email-template"
                        label="Email Template"
                        value={node?.data?.emailTemplateId || ''}
                        onChange={(e) => handleDataChange('emailTemplateId', e.target.value)}
                    >
                        <option value="">Select a template...</option>
                        {(emailTemplates as EmailTemplate[]).map((t: EmailTemplate) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </Select>
                );
            case 'wait':
                return (
                    <Input
                        id="wait-days"
                        label="Wait for (days)"
                        type="number"
                        min="1"
                        value={node?.data?.days || 1}
                        onChange={(e) => handleDataChange('days', parseInt(e.target.value) || 1)}
                    />
                );
            case 'createTask':
                return (
                    <Input
                        id="task-title"
                        label="Task Title"
                        value={node?.data?.taskTitle || ''}
                        onChange={(e) => handleDataChange('taskTitle', e.target.value)}
                        placeholder="e.g., Follow up with {{contactName}}"
                    />
                );
            default:
                return <p className="text-xs text-text-secondary">This action node has no specific options.</p>;
        }
    };

    return (
        <div className="space-y-4">
            {renderActionOptions()}
        </div>
    );
};

export default ActionConfig;