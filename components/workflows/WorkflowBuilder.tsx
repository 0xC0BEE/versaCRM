import React, { useState, useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Workflow, WorkflowTrigger, WorkflowAction, ContactStatus, User } from '../../types';
import { ArrowLeft, Plus, Trash2, Send, CheckSquare, Zap, Edit2, Webhook } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useForm } from '../../hooks/useForm';
import toast from 'react-hot-toast';
import { useApp } from '../../contexts/AppContext';
import Textarea from '../ui/Textarea';

interface WorkflowBuilderProps {
    workflow: Workflow | null;
    onClose: () => void;
    organizationId: string;
}

const statusOptions: ContactStatus[] = ['Lead', 'Active', 'Inactive', 'Do Not Contact'];

const defaultWebhookPayload = `{
  "contactName": "{{contactName}}",
  "contactEmail": "{{contactEmail}}",
  "status": "{{contactStatus}}",
  "event": "contactStatusChanged"
}`;

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ workflow, onClose, organizationId }) => {
    const { createWorkflowMutation, updateWorkflowMutation, emailTemplatesQuery, teamMembersQuery } = useData();
    const { industryConfig } = useApp();
    const { data: emailTemplates = [] } = emailTemplatesQuery;
    const { data: teamMembers = [] } = teamMembersQuery;

    const isNew = !workflow;
    const [selectedNode, setSelectedNode] = useState<{ type: 'trigger' | 'action', index?: number } | null>({ type: 'trigger' });

    const initialState = useMemo((): Omit<Workflow, 'id' | 'organizationId'> => ({
        name: '',
        isActive: true,
        trigger: { type: 'contactCreated' },
        actions: [{ type: 'createTask' }]
    }), []);
    
    const { formData, setFormData, handleChange } = useForm(initialState, workflow);

    const handleTriggerChange = (field: keyof WorkflowTrigger, value: any) => {
        const newTrigger = { ...formData.trigger, [field]: value };
        if (field === 'type' && value === 'contactCreated') {
            delete newTrigger.fromStatus;
            delete newTrigger.toStatus;
        }
        handleChange('trigger', newTrigger);
    };
    
    const handleActionChange = (index: number, field: keyof WorkflowAction, value: any) => {
        const newActions = [...formData.actions];
        const action = { ...newActions[index] as any };
        action[field] = value;
        
        if (field === 'type') {
            // Clear out old properties when type changes
            const clearedAction: { type: WorkflowAction['type']} = { type: value };
            if (value === 'sendWebhook') {
                (clearedAction as any).payloadTemplate = defaultWebhookPayload;
            }
            newActions[index] = clearedAction;
        } else {
             newActions[index] = action;
        }
        
        handleChange('actions', newActions);
    };

    const addAction = () => {
        const newAction: WorkflowAction = { type: 'createTask' };
        handleChange('actions', [...formData.actions, newAction]);
    };
    
    const removeAction = (index: number) => {
        handleChange('actions', formData.actions.filter((_, i) => i !== index));
        setSelectedNode({ type: 'trigger' });
    };
    
    const handleSave = () => {
        if (!formData.name.trim()) return toast.error("Workflow name is required.");
        if (formData.actions.length === 0) return toast.error("Workflow must have at least one action.");

        if (isNew) {
            createWorkflowMutation.mutate({ ...formData, organizationId }, { onSuccess: onClose });
        } else {
            updateWorkflowMutation.mutate(formData as Workflow, { onSuccess: onClose });
        }
    };

    const isPending = createWorkflowMutation.isPending || updateWorkflowMutation.isPending;

    const renderConfigPanel = () => {
        if (!selectedNode) return null;

        if (selectedNode.type === 'trigger') {
            return (
                <div className="p-4 space-y-4">
                    <h3 className="font-semibold text-lg">Configure Trigger</h3>
                    <p className="text-sm text-gray-500">When this event happens...</p>
                    <Select id="trigger-type" label="Event" value={formData.trigger.type} onChange={e => handleTriggerChange('type', e.target.value)}>
                        <option value="contactCreated">Contact is Created</option>
                        <option value="contactStatusChanged">Contact Status is Changed</option>
                    </Select>
                    {formData.trigger.type === 'contactStatusChanged' && (
                        <div className="grid grid-cols-2 gap-2">
                            <Select id="trigger-from" label="From" value={formData.trigger.fromStatus || ''} onChange={e => handleTriggerChange('fromStatus', e.target.value)}>
                                <option value="">Any</option>
                                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </Select>
                            <Select id="trigger-to" label="To" value={formData.trigger.toStatus || ''} onChange={e => handleTriggerChange('toStatus', e.target.value)}>
                                <option value="">Any</option>
                                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </Select>
                        </div>
                    )}
                </div>
            );
        }

        if (selectedNode.type === 'action' && selectedNode.index !== undefined) {
            const index = selectedNode.index;
            const action = formData.actions[index];
            if (!action) return null;

            return (
                <div className="p-4 space-y-4">
                    <h3 className="font-semibold text-lg">Configure Action #{index + 1}</h3>
                    <p className="text-sm text-gray-500">...do this action.</p>
                    <Select id={`action-type-${index}`} label="Action Type" value={action.type} onChange={e => handleActionChange(index, 'type', e.target.value)}>
                        <option value="createTask">Create Task</option>
                        <option value="sendEmail">Send Email</option>
                        <option value="updateContactField">Update a Contact Field</option>
                        <option value="sendWebhook">Send Webhook</option>
                    </Select>
                    {action.type === 'createTask' && (
                        <>
                            <Input id={`action-title-${index}`} label="Task Title" value={action.taskTitle || ''} onChange={e => handleActionChange(index, 'taskTitle', e.target.value)} placeholder="e.g. Follow up with {{contactName}}" />
                            <Select id={`action-assignee-${index}`} label="Assign To" value={action.assigneeId || ''} onChange={e => handleActionChange(index, 'assigneeId', e.target.value)}>
                                <option value="">Select a team member...</option>
                                {teamMembers.map((m: User) => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </Select>
                        </>
                    )}
                    {action.type === 'sendEmail' && (
                        <Select id={`action-template-${index}`} label="Email Template" value={action.emailTemplateId || ''} onChange={e => handleActionChange(index, 'emailTemplateId', e.target.value)}>
                            <option value="">Select an email template...</option>
                            {emailTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </Select>
                    )}
                    {action.type === 'updateContactField' && (
                        <>
                             <Select id={`action-field-${index}`} label="Field to Update" value={action.fieldId || ''} onChange={e => handleActionChange(index, 'fieldId', e.target.value)}>
                                <option value="">Select a field...</option>
                                {industryConfig.customFields.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                            </Select>
                            <Input id={`action-value-${index}`} label="New Value" value={action.newValue || ''} onChange={e => handleActionChange(index, 'newValue', e.target.value)} placeholder="Enter the new value for the field" />
                        </>
                    )}
                    {action.type === 'sendWebhook' && (
                         <>
                            <Input id={`action-url-${index}`} label="Webhook URL" value={action.webhookUrl || ''} onChange={e => handleActionChange(index, 'webhookUrl', e.target.value)} placeholder="https://yourapi.com/hook" />
                            <Textarea id={`action-payload-${index}`} label="Payload Template (JSON)" value={action.payloadTemplate || ''} onChange={e => handleActionChange(index, 'payloadTemplate', e.target.value)} rows={8} />
                             <p className="text-xs text-gray-500">Use placeholders like <code>&#123;&#123;contactName&#125;&#125;</code>, <code>&#123;&#123;contactEmail&#125;&#125;</code>, etc.</p>
                        </>
                    )}
                </div>
            );
        }
        return null;
    };
    
    const getNodeClasses = (type: 'trigger' | 'action', index?: number) => {
        const isSelected = selectedNode?.type === type && selectedNode?.index === index;
        return `w-full max-w-sm p-4 border-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card hover:border-primary-400'}`;
    };

    const actionIcons: Record<WorkflowAction['type'], React.ReactNode> = {
        createTask: <CheckSquare className="text-blue-500" />,
        sendEmail: <Send className="text-green-500" />,
        updateContactField: <Edit2 className="text-orange-500" />,
        sendWebhook: <Webhook className="text-indigo-500" />,
    };

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-4">
                <Button variant="secondary" onClick={onClose} leftIcon={<ArrowLeft size={16} />}>Back to Workflows</Button>
                <div className="flex items-center gap-4">
                    <Input id="wf-name" label="" placeholder="Enter Workflow Name..." value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-72" />
                    <label htmlFor="wf-active" className="flex items-center gap-2 text-sm font-medium">
                        <input type="checkbox" id="wf-active" checked={formData.isActive} onChange={e => handleChange('isActive', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        Active
                    </label>
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Workflow'}</Button>
                </div>
            </div>

            <div className="flex h-[calc(100vh-12rem)]">
                {/* Visual Builder Area */}
                <div className="flex-grow bg-gray-50 dark:bg-gray-900/50 rounded-lg p-8 overflow-y-auto">
                    <div className="flex flex-col items-center space-y-4">
                        {/* Trigger Node */}
                        <div className={getNodeClasses('trigger')} onClick={() => setSelectedNode({ type: 'trigger' })}>
                             <div className="flex items-center gap-3">
                                <Zap className="text-yellow-500" />
                                <div>
                                    <p className="font-semibold">Trigger</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{formData.trigger.type}</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>

                        {/* Action Nodes */}
                        {formData.actions.map((action, index) => (
                            <React.Fragment key={index}>
                                <div className={getNodeClasses('action', index)} onClick={() => setSelectedNode({ type: 'action', index })}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            {actionIcons[action.type]}
                                            <div>
                                                <p className="font-semibold">Action #{index + 1}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{action.type}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); removeAction(index); }}><Trash2 size={14}/></Button>
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
                            </React.Fragment>
                        ))}
                        
                        <Button variant="secondary" onClick={addAction} leftIcon={<Plus size={16}/>}>Add Action</Button>
                    </div>
                </div>

                {/* Configuration Panel */}
                <div className="w-96 flex-shrink-0 ml-4 bg-white dark:bg-dark-card rounded-lg border dark:border-dark-border">
                    {renderConfigPanel()}
                </div>
            </div>
        </PageWrapper>
    );
};

export default WorkflowBuilder;