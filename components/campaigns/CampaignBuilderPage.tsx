import React, { useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Campaign, CampaignStep, ContactStatus } from '../../types';
import { ArrowLeft, Plus, Trash2, Send, Clock, Edit } from 'lucide-react';
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

    const handleStepChange = (index: number, field: keyof CampaignStep, value: any) => {
        const newSteps = [...formData.steps];
        const step = { ...newSteps[index] };
        (step as any)[field] = value;
        newSteps[index] = step;
        handleChange('steps', newSteps);
    };

    const addStep = (type: 'sendEmail' | 'wait') => {
        const newStep: CampaignStep = type === 'sendEmail'
            ? { type: 'sendEmail', emailTemplateId: '' }
            : { type: 'wait', days: 1 };
        handleChange('steps', [...formData.steps, newStep]);
    };

    const removeStep = (index: number) => {
        handleChange('steps', formData.steps.filter((_, i) => i !== index));
    };
    
    const handleSave = (newStatus: Campaign['status']) => {
        if (!formData.name.trim()) return toast.error("Campaign name is required.");
        if (formData.targetAudience.status.length === 0) return toast.error("Please select a target audience.");
        if (formData.steps.some(s => s.type === 'sendEmail' && !s.emailTemplateId)) {
            return toast.error("Please select an email template for all email steps.");
        }

        const saveData = { ...formData, status: newStatus };

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
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => handleSave('Draft')} disabled={isPending}>Save as Draft</Button>
                        <Button onClick={() => handleSave('Active')} disabled={isPending}>
                            {isNew ? 'Activate Campaign' : 'Save and Activate'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <Card title="1. Target Audience">
                        <p className="text-sm text-gray-500 mb-2">Select contacts based on their status.</p>
                        <MultiSelect 
                            label=""
                            options={statusOptions}
                            selectedValues={formData.targetAudience.status}
                            onChange={(values) => setFormData(p => ({ ...p, targetAudience: { status: values as ContactStatus[] } }))}
                        />
                    </Card>
                </div>

                {/* Sequence Builder */}
                <div className="lg:col-span-2">
                     <Card title="2. Build Sequence">
                        <div className="space-y-4">
                            {formData.steps.map((step, index) => (
                                <div key={index} className="p-4 border dark:border-dark-border rounded-lg bg-gray-50 dark:bg-gray-800/50 relative">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-grow">
                                            {step.type === 'sendEmail' ? (
                                                <>
                                                    <h4 className="font-semibold flex items-center"><Send size={16} className="mr-2"/> Send Email</h4>
                                                    <Select
                                                        id={`step-template-${index}`}
                                                        label="Email Template"
                                                        value={step.emailTemplateId || ''}
                                                        onChange={e => handleStepChange(index, 'emailTemplateId', e.target.value)}
                                                        className="mt-2"
                                                    >
                                                        <option value="">Select a template...</option>
                                                        {emailTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                    </Select>
                                                </>
                                            ) : (
                                                <>
                                                    <h4 className="font-semibold flex items-center"><Clock size={16} className="mr-2"/> Wait</h4>
                                                     <div className="flex items-center gap-2 mt-2">
                                                        <Input
                                                            id={`step-days-${index}`}
                                                            type="number"
                                                            label=""
                                                            min="1"
                                                            value={step.days || 1}
                                                            onChange={e => handleStepChange(index, 'days', parseInt(e.target.value))}
                                                            className="w-24"
                                                        />
                                                        <span>days</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <Button size="sm" variant="danger" onClick={() => removeStep(index)} className="absolute top-2 right-2">
                                        <Trash2 size={14}/>
                                    </Button>
                                </div>
                            ))}
                            <div className="flex gap-2 justify-center pt-4 border-t dark:border-dark-border">
                                <Button variant="secondary" onClick={() => addStep('sendEmail')} leftIcon={<Plus size={16}/>}>Add Email</Button>
                                <Button variant="secondary" onClick={() => addStep('wait')} leftIcon={<Plus size={16}/>}>Add Wait Step</Button>
                            </div>
                        </div>
                     </Card>
                </div>
            </div>
        </PageWrapper>
    );
};

export default CampaignBuilderPage;