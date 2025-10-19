import React, { useState, useEffect } from 'react';
import Select from '../../ui/Select';
import Input from '../../ui/Input';
import { Node } from 'reactflow';
import { useData } from '../../../contexts/DataContext';
import { User, EmailTemplate, NodeExecutionType, ContactStatus, Survey } from '../../../types';

interface ActionConfigProps {
    node: Node;
    updateNodeData: (data: Record<string, any>) => void;
}

const allActionTypes: { value: NodeExecutionType, label: string }[] = [
    { value: 'sendEmail', label: 'Send an Email' },
    { value: 'createTask', label: 'Create a Task' },
    { value: 'updateContactField', label: 'Update Contact Field' },
    { value: 'wait', label: 'Wait for a duration' },
    { value: 'sendSurvey', label: 'Send a Survey' },
];

const statusOptions: ContactStatus[] = ['Lead', 'Active', 'Needs Attention', 'Inactive', 'Do Not Contact'];

const ActionConfig: React.FC<ActionConfigProps> = ({ node, updateNodeData }) => {
    const { emailTemplatesQuery, teamMembersQuery, surveysQuery } = useData();
    const { data: emailTemplates = [] } = emailTemplatesQuery;
    const { data: teamMembers = [] } = teamMembersQuery;
    const { data: surveys = [] } = surveysQuery;

    const [localData, setLocalData] = useState(node?.data || {});

    useEffect(() => {
        setLocalData(node?.data || {});
    }, [node?.id, node?.data]);

    const handleLocalChange = (field: string, value: any) => {
        setLocalData(prev => ({ ...prev, [field]: value }));
    };

    const handlePersistChange = (field: string, value: any) => {
        if (node?.data?.[field] !== value) {
            updateNodeData({ [field]: value });
        }
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as NodeExecutionType;
        const newLabel = allActionTypes.find(t => t.value === newType)?.label || 'Action';
        const newData: Record<string, any> = { nodeType: newType, label: newLabel };
        if (newType === 'wait') {
            newData.days = 1;
        }
        if (newType === 'sendSurvey') {
            newData.surveyId = '';
        }
        updateNodeData(newData);
    };

    const renderActionOptions = () => {
        const nodeType = node.type === 'approval' ? 'approval' : localData.nodeType;

        switch (nodeType as NodeExecutionType) {
            case 'sendEmail':
                return (
                    <Select
                        id="email-template"
                        label="Email Template"
                        value={localData.emailTemplateId || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleLocalChange('emailTemplateId', value);
                            handlePersistChange('emailTemplateId', value);
                        }}
                    >
                        <option value="">Select a template...</option>
                        {(emailTemplates as EmailTemplate[]).map((t: EmailTemplate) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </Select>
                );
            case 'sendSurvey':
                return (
                    <Select
                        id="survey-id"
                        label="Survey to Send"
                        value={localData.surveyId || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleLocalChange('surveyId', value);
                            handlePersistChange('surveyId', value);
                        }}
                    >
                        <option value="">Select a survey...</option>
                        {(surveys as Survey[]).map((s: Survey) => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
                    </Select>
                );
            case 'createTask':
                return (
                    <>
                        <Input
                            id="task-title"
                            label="Task Title"
                            value={localData.taskTitle || ''}
                            onChange={(e) => handleLocalChange('taskTitle', e.target.value)}
                            onBlur={() => handlePersistChange('taskTitle', localData.taskTitle)}
                            placeholder="e.g., Follow up with {{contactName}}"
                        />
                        <Select
                            id="task-assignee"
                            label="Assign To"
                            value={localData.assigneeId || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                handleLocalChange('assigneeId', value);
                                handlePersistChange('assigneeId', value);
                            }}
                        >
                            <option value="">Select a team member...</option>
                            {(teamMembers as User[]).map((m: User) => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </Select>
                    </>
                );
            case 'updateContactField':
                return (
                    <>
                        <Select
                            id="update-field-id"
                            label="Field to Update"
                            value={localData.fieldId || ''}
                             onChange={(e) => {
                                const value = e.target.value;
                                handleLocalChange('fieldId', value);
                                handlePersistChange('fieldId', value);
                            }}
                        >
                            <option value="">Select a field...</option>
                            <option value="status">Status</option>
                        </Select>
                        {localData.fieldId === 'status' && (
                            <Select
                                id="update-field-value"
                                label="New Status"
                                value={localData.newValue || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    handleLocalChange('newValue', value);
                                    handlePersistChange('newValue', value);
                                }}
                            >
                                <option value="">Select a status...</option>
                                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </Select>
                        )}
                    </>
                );
            case 'wait':
                return (
                    <Input
                        id="wait-days"
                        label="Wait for (days)"
                        type="number"
                        min="1"
                        value={localData.days || 1}
                        onChange={(e) => handleLocalChange('days', parseInt(e.target.value) || 1)}
                        onBlur={() => handlePersistChange('days', localData.days)}
                    />
                );
            case 'approval':
                return (
                    <Select
                        id="approver-id"
                        label="Request approval from"
                        value={localData.approverId || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleLocalChange('approverId', value);
                            handlePersistChange('approverId', value);
                        }}
                    >
                        <option value="">Select an approver...</option>
                        {(teamMembers as User[]).map((m: User) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </Select>
                );
            default:
                return <p className="text-xs text-text-secondary">Select an action type to configure.</p>;
        }
    };

    return (
        <div className="space-y-4">
            {node.type === 'action' && (
                <Select id="action-type" label="Action Type" value={localData.nodeType} onChange={handleTypeChange}>
                    {allActionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
            )}
            <div className={`space-y-2 ${node.type === 'action' ? 'pt-2 border-t border-border-subtle' : ''}`}>
                {renderActionOptions()}
            </div>
            <p className="text-xs text-text-secondary">This action will be executed when the previous node in the workflow is completed.</p>
        </div>
    );
};

export default ActionConfig;