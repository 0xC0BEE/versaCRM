import React, { useMemo, useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Workflow, WorkflowTrigger, WorkflowAction, ContactStatus, DealStage, EmailTemplate, CustomField, User } from '../../types';
import { ArrowLeft, Plus, Trash2, Zap, Check, Clock } from 'lucide-react';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import { useApp } from '../../contexts/AppContext';
import toast from 'react-hot-toast';
// FIX: Changed default import of 'Card' to a named import '{ Card }' to resolve module export error.
import { Card } from '../ui/Card';

interface WorkflowBuilderProps {
    workflow: Workflow | null;
    onClose: () => void;
}

const triggerTypes: { value: WorkflowTrigger['type'], label: string }[] = [
    { value: 'contactCreated', label: 'Contact is Created' },
    { value: 'contactStatusChanged', label: 'Contact Status Changes' },
    { value: 'dealCreated', label: 'Deal is Created' },
    { value: 'dealStageChanged', label: 'Deal Stage Changes' },
    { value: 'ticketCreated', label: 'Ticket is Created' },
    { value: 'ticketStatusChanged', label: 'Ticket Status Changes' },
];

const actionTypes: { value: WorkflowAction['type'], label: string }[] = [
    { value: 'createTask', label: 'Create a Task' },
    { value: 'sendEmail', label: 'Send an Email' },
    { value: 'updateContactField', label: 'Update a Contact Field' },
    { value: 'wait', label: 'Wait for a duration' },
    { value: 'sendWebhook', label: 'Send a Webhook' },
];

const statusOptions: ContactStatus[] = ['Lead', 'Active', 'Inactive', 'Do Not Contact'];

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ workflow, onClose }) => {
    const { createWorkflowMutation, updateWorkflowMutation, dealStagesQuery, emailTemplatesQuery, teamMembersQuery } = useData();
    const { industryConfig } = useApp();
    const { authenticatedUser } = useAuth();
    const isNew = !workflow;

    const [selectedNode, setSelectedNode] = useState<{ type: 'trigger' | 'action', index?: number }>({ type: 'trigger' });

    const { data: dealStages = [] } = dealStagesQuery;
    const { data: emailTemplates = [] } = emailTemplatesQuery;
    const { data: teamMembers = [] } = teamMembersQuery;

    const initialState = useMemo((): Omit<Workflow, 'id'> => ({
        name: '',
        organizationId: authenticatedUser!.organizationId!,
        isActive: true,
        trigger: { type: 'contactCreated' },
        actions: [],
    }), [authenticatedUser]);

    const { formData, handleChange, setFormData } = useForm(initialState, workflow);

    const handleTriggerChange = (field: string, value: any) => {
        let newTrigger: WorkflowTrigger;
        if (field === 'type') {
            newTrigger = { type: value };
        } else {
            newTrigger = { ...formData.trigger, [field]: value };
        }
        handleChange('trigger', newTrigger);
    };
    
    const handleActionChange = (index: number, field: string, value: any) => {
        const newActions = [...formData.actions];
        if (field === 'type') {
            // When changing type, reset the action to a default state for that type
            switch (value) {
                case 'createTask': newActions[index] = { type: 'createTask' }; break;
                case 'sendEmail': newActions[index] = { type: 'sendEmail' }; break;
                case 'updateContactField': newActions[index] = { type: 'updateContactField' }; break;
                case 'wait': newActions[index] = { type: 'wait', days: 1 }; break;
                case 'sendWebhook': newActions[index] = { type: 'sendWebhook' }; break;
                default: newActions[index] = { type: 'createTask' }; // Fallback
            }
        } else {
            (newActions[index] as any)[field] = value;
        }
        handleChange('actions', newActions);
    };

    const addAction = () => {
        const newAction = { type: 'createTask' } as WorkflowAction;
        handleChange('actions', [...formData.actions, newAction]);
        setSelectedNode({ type: 'action', index: formData.actions.length });
    };

    const removeAction = (index: number) => {
        handleChange('actions', formData.actions.filter((_, i) => i !== index));
        setSelectedNode({ type: 'trigger' }); // Reset selection to trigger
    };

    const handleSave = () => {
        if (!formData.name.trim()) return toast.error("Workflow name is required.");
        if (formData.actions.length === 0) return toast.error("A workflow must have at least one action.");

        if (isNew) {
            createWorkflowMutation.mutate(formData, { onSuccess: onClose });
        } else {
            updateWorkflowMutation.mutate(formData as Workflow, { onSuccess: onClose });
        }
    };
    
    const isPending = createWorkflowMutation.isPending || updateWorkflowMutation.isPending;
    
    const renderConfigPanel = () => {
        if (selectedNode.type === 'trigger') {
             return (
                <Card>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Configure Trigger</h3>
                    <div className="space-y-4">
                        {/* FIX: Added missing id prop. */}
                        <Select id="trigger-type" label="When this event happens..." value={formData.trigger.type} onChange={e => handleTriggerChange('type', e.target.value)}>
                            {triggerTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </Select>
                        {renderTriggerOptions()}
                    </div>
                </Card>
            );
        } else if (selectedNode.type === 'action' && selectedNode.index !== undefined) {
            const action = formData.actions[selectedNode.index];
            return (
                 <Card>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Configure Action #{selectedNode.index + 1}</h3>
                     <div className="space-y-4">
                        {/* FIX: Added missing id prop. */}
                        <Select id={`action-type-${selectedNode.index}`} label="Then do this..." value={action.type} onChange={e => handleActionChange(selectedNode.index!, 'type', e.target.value)}>
                            {actionTypes.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </Select>
                        {renderActionOptions(action, selectedNode.index)}
                    </div>
                </Card>
            );
        }
        return null;
    };
    
    const renderTriggerOptions = () => {
        const { trigger } = formData;
        switch(trigger.type) {
            case 'contactStatusChanged':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        {/* FIX: Added missing id prop. */}
                        <Select id="trigger-from-status" label="From Status (Optional)" value={trigger.fromStatus || ''} onChange={e => handleTriggerChange('fromStatus', e.target.value)}>
                            <option value="">Any</option>
                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                        {/* FIX: Added missing id prop. */}
                        <Select id="trigger-to-status" label="To Status (Optional)" value={trigger.toStatus || ''} onChange={e => handleTriggerChange('toStatus', e.target.value)}>
                            <option value="">Any</option>
                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </div>
                );
            case 'dealStageChanged':
                return (
                     <div className="grid grid-cols-2 gap-2">
                        {/* FIX: Added missing id prop. */}
                        <Select id="trigger-from-stage" label="From Stage (Optional)" value={trigger.fromStageId || ''} onChange={e => handleTriggerChange('fromStageId', e.target.value)}>
                            <option value="">Any</option>
                            {dealStages.map((s: DealStage) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                        {/* FIX: Added missing id prop. */}
                        <Select id="trigger-to-stage" label="To Stage (Optional)" value={trigger.toStageId || ''} onChange={e => handleTriggerChange('toStageId', e.target.value)}>
                             <option value="">Any</option>
                            {dealStages.map((s: DealStage) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                    </div>
                );
            case 'ticketStatusChanged':
                 return (
                    <div className="grid grid-cols-2 gap-2">
                        {/* FIX: Added missing id prop. */}
                        <Select id="trigger-ticket-from-status" label="From Status (Optional)" value={trigger.fromStatus || ''} onChange={e => handleTriggerChange('fromStatus', e.target.value)}>
                            <option value="">Any</option>
                            {['New', 'Open', 'Pending', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                        {/* FIX: Added missing id prop. */}
                        <Select id="trigger-ticket-to-status" label="To Status (Optional)" value={trigger.toStatus || ''} onChange={e => handleTriggerChange('toStatus', e.target.value)}>
                            <option value="">Any</option>
                            {['New', 'Open', 'Pending', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </div>
                );
            default: return null;
        }
    };
    
    const renderActionOptions = (action: WorkflowAction, index: number) => {
        switch(action.type) {
            case 'createTask':
                return (
                    <>
                        {/* FIX: Added missing id prop. */}
                        <Input id={`action-task-title-${index}`} label="Task Title" value={action.taskTitle || ''} onChange={e => handleActionChange(index, 'taskTitle', e.target.value)} placeholder="e.g., Follow up with {{contactName}}"/>
                        {/* FIX: Added missing id prop. */}
                        <Select id={`action-assignee-${index}`} label="Assign To" value={action.assigneeId || ''} onChange={e => handleActionChange(index, 'assigneeId', e.target.value)}>
                            <option value="">Select a team member...</option>
                            {teamMembers.map((m: User) => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </Select>
                    </>
                );
            case 'sendEmail':
                return (
                    // FIX: Added missing id prop.
                    <Select id={`action-email-template-${index}`} label="Email Template" value={action.emailTemplateId || ''} onChange={e => handleActionChange(index, 'emailTemplateId', e.target.value)}>
                        <option value="">Select a template...</option>
                        {emailTemplates.map((t: EmailTemplate) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </Select>
                );
            case 'updateContactField':
                return (
                    <>
                        {/* FIX: Added missing id prop. */}
                        <Select id={`action-field-id-${index}`} label="Field to Update" value={action.fieldId || ''} onChange={e => handleActionChange(index, 'fieldId', e.target.value)}>
                            <option value="">Select a field...</option>
                            {industryConfig.customFields.map((f: CustomField) => <option key={f.id} value={f.id}>{f.label}</option>)}
                        </Select>
                         {/* FIX: Added missing id prop. */}
                         <Input id={`action-new-value-${index}`} label="New Value" value={action.newValue || ''} onChange={e => handleActionChange(index, 'newValue', e.target.value)} placeholder="Enter the new value for the field"/>
                    </>
                );
             case 'wait':
                return (
                    <Input id={`action-wait-days-${index}`} label="Wait for (days)" type="number" min="1" value={action.days || 1} onChange={e => handleActionChange(index, 'days', parseInt(e.target.value) || 1)} />
                );
            case 'sendWebhook':
                return (
                    <>
                         {/* FIX: Added missing id prop. */}
                         <Input id={`action-webhook-url-${index}`} label="Webhook URL" value={action.webhookUrl || ''} onChange={e => handleActionChange(index, 'webhookUrl', e.target.value)} placeholder="https://yourapi.com/endpoint"/>
                         {/* FIX: Added missing id prop. */}
                         <Input id={`action-payload-template-${index}`} label="Payload (JSON Template)" value={action.payloadTemplate || ''} onChange={e => handleActionChange(index, 'payloadTemplate', e.target.value)} placeholder='{ "contact_name": "{{contactName}}" }'/>
                    </>
                );
            default: return null;
        }
    };


    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-4">
                <Button variant="secondary" onClick={onClose} leftIcon={<ArrowLeft size={16} />}>Back to Workflows</Button>
                <div className="flex items-center gap-4">
                    <Input id="workflow-name" label="" placeholder="Enter Workflow Name..." value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-72" />
                    <label className="flex items-center text-sm font-medium text-text-primary cursor-pointer">
                        <input type="checkbox" checked={formData.isActive} onChange={e => handleChange('isActive', e.target.checked)} className="h-4 w-4 rounded border-border-subtle text-primary focus:ring-primary"/>
                        <span className="ml-2">Active</span>
                    </label>
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Workflow'}</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Workflow Nodes */}
                <div className="lg:col-span-2 flex flex-col items-center">
                    <div className="w-full max-w-sm space-y-2">
                        {/* Trigger Node */}
                        <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedNode.type === 'trigger' ? 'border-primary bg-primary/5' : 'border-border-subtle bg-card-bg hover:border-primary/50'}`}
                            onClick={() => setSelectedNode({ type: 'trigger' })}
                        >
                            <div className="font-bold text-text-primary flex items-center"><Zap size={16} className="mr-2 text-yellow-500"/> Trigger</div>
                            <p className="text-sm text-text-secondary mt-1">{triggerTypes.find(t => t.value === formData.trigger.type)?.label}</p>
                        </div>

                        {/* Connection line */}
                        <div className="h-8 w-px bg-border-subtle mx-auto"></div>
                        
                        {/* Action Nodes */}
                        {formData.actions.map((action, index) => (
                            <React.Fragment key={index}>
                                 <div
                                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedNode.type === 'action' && selectedNode.index === index ? 'border-primary bg-primary/5' : 'border-border-subtle bg-card-bg hover:border-primary/50'}`}
                                    onClick={() => setSelectedNode({ type: 'action', index })}
                                >
                                    <div className="font-bold text-text-primary flex items-center">
                                         {action.type === 'wait' ? <Clock size={16} className="mr-2 text-orange-500" /> : <Check size={16} className="mr-2 text-green-500" />}
                                        Action #{index + 1}
                                    </div>
                                    <p className="text-sm text-text-secondary mt-1">{actionTypes.find(a => a.value === action.type)?.label}</p>
                                     <button
                                        onClick={(e) => { e.stopPropagation(); removeAction(index); }}
                                        className="absolute top-1 right-1 p-1 rounded-full hover:bg-error/20 text-text-secondary hover:text-error"
                                    >
                                        <Trash2 size={14}/>
                                    </button>
                                </div>
                                <div className="h-8 w-px bg-border-subtle mx-auto"></div>
                            </React.Fragment>
                        ))}

                        {/* Add Action Button */}
                         <button
                            onClick={addAction}
                            className="w-full p-3 rounded-lg border-2 border-dashed border-border-subtle text-text-secondary hover:border-primary hover:text-primary transition-all flex items-center justify-center"
                        >
                           <Plus size={16} className="mr-2" /> Add Action
                        </button>
                    </div>
                </div>

                {/* Config Panel */}
                <div className="lg:col-span-1">
                    {renderConfigPanel()}
                </div>
            </div>
        </PageWrapper>
    );
};

export default WorkflowBuilder;