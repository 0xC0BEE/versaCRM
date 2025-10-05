import React, { useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Campaign, CampaignStep, ContactStatus, EmailTemplate } from '../../types';
import { ArrowLeft, Plus, Trash2, Send, Clock } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useForm } from '../../hooks/useForm';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import MultiSelect from '../ui/MultiSelect';

interface CampaignBuilderPageProps {
    campaign: Campaign | null;
    onClose: () => void;
    organizationId: string;
}

const statusOptions: { value: ContactStatus, label: string }[] = [
    { value: 'Lead', label: 'Lead' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Do Not Contact', label: 'Do Not Contact' },
];

const CampaignBuilderPage: React.FC<CampaignBuilderPageProps> = ({ campaign, onClose, organizationId }) => {
    const { createCampaignMutation, updateCampaignMutation, emailTemplatesQuery } = useData();
    const { data: emailTemplates = [] } = emailTemplatesQuery;
    const isNew = !campaign;

    const initialState = useMemo((): Omit<Campaign, 'id' | 'organizationId'> => ({
        name: '',
        status: 'Draft',
        targetAudience: { status: [] },
        steps: [{ type: 'sendEmail', emailTemplateId: '' }],
        stats: { recipients: 0, sent: 0, opened: 0, clicked: 0 }
    }), []);

    const { formData, setFormData, handleChange } = useForm(initialState, campaign);

    const handleStepChange = (index: number, field: string, value: any) => {
        const newSteps = [...formData.steps];
        
        // FIX: When changing step type, create a new default step object to ensure type correctness.
        if (field === 'type') {
            if (value === 'sendEmail') {
                newSteps[index] = { type: 'sendEmail', emailTemplateId: '' };
            } else if (value === 'wait') {
                newSteps[index] = { type: 'wait', days: 1 };
            }
        } else {
            const step = { ...newSteps[index] } as any;
            step[field] = value;
            newSteps[index] = step;
        }
        
        handleChange('steps', newSteps);
    };

    const addStep = () => {
        const newStep: CampaignStep = { type: 'wait', days: 1 };
        handleChange('steps', [...formData.steps, newStep]);
    };

    const removeStep = (index: number) => {
        handleChange('steps', formData.steps.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!formData.name.trim()) return toast.error("Campaign name is required.");
        if (formData.targetAudience.status.length === 0) return toast.error("Please select a target audience.");

        const saveData = { ...formData };
        if (isNew) {
            createCampaignMutation.mutate({ ...saveData, organizationId }, { onSuccess: onClose });
        } else {
            updateCampaignMutation.mutate(saveData as Campaign, { onSuccess: onClose });
        }
    };
    
    const isPending = createCampaignMutation.isPending || updateCampaignMutation.isPending;

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-4">
                <Button variant="secondary" onClick={onClose} leftIcon={<ArrowLeft size={16} />}>Back to Campaigns</Button>
                <div className="flex items-center gap-4">
                    <Input id="campaign-name" label="" placeholder="Enter Campaign Name..." value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-72" />
                    <Select id="campaign-status" label="" value={formData.status} onChange={e => handleChange('status', e.target.value as any)}>
                        <option>Draft</option>
                        <option>Active</option>
                    </Select>
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Campaign'}</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Config Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <Card title="Target Audience">
                        <MultiSelect 
                            label="Contact Status" 
                            options={statusOptions} 
                            selectedValues={formData.targetAudience.status} 
                            onChange={statuses => setFormData(prev => ({...prev, targetAudience: { status: statuses as ContactStatus[] }}))}
                        />
                    </Card>
                </div>

                {/* Steps Builder */}
                <div className="lg:col-span-2">
                    <Card title="Campaign Sequence">
                        <div className="space-y-4">
                            {formData.steps.map((step, index) => (
                                <div key={index} className="p-4 border border-border-subtle rounded-lg bg-hover-bg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            {step.type === 'sendEmail' ? <Send size={16} className="text-blue-500" /> : <Clock size={16} className="text-orange-500" />}
                                            Step #{index + 1}: <span className="capitalize ml-1">{step.type.replace(/([A-Z])/g, ' $1')}</span>
                                        </h4>
                                        <Button size="sm" variant="danger" onClick={() => removeStep(index)}><Trash2 size={14}/></Button>
                                    </div>
                                    
                                    {step.type === 'sendEmail' ? (
                                        <Select id={`step-template-${index}`} label="Email Template" value={step.emailTemplateId} onChange={e => handleStepChange(index, 'emailTemplateId', e.target.value)}>
                                            <option value="">Select a template...</option>
                                            {emailTemplates.map((t:EmailTemplate) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </Select>
                                    ) : (
                                         <Input id={`step-days-${index}`} label="Wait for (days)" type="number" min="1" value={step.days} onChange={e => handleStepChange(index, 'days', parseInt(e.target.value) || 1)} />
                                    )}
                                </div>
                            ))}
                             <Button variant="secondary" onClick={addStep} leftIcon={<Plus size={16}/>}>Add Step</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </PageWrapper>
    );
};

export default CampaignBuilderPage;