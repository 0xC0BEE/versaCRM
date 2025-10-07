import React, { useState, useEffect } from 'react';
import { PublicForm, PublicFormField, Campaign } from '../../types';
import PageWrapper from '../layout/PageWrapper';
import Button from '../ui/Button';
import { ArrowLeft, Code, TestTube2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import FormToolbox from './FormToolbox';
import FormPreview from './FormPreview';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import EmbedCodeModal from './EmbedCodeModal';
import PublicFormTestModal from './PublicFormTestModal';

interface FormBuilderPageProps {
    formToEdit: PublicForm | null;
    onClose: () => void;
}

const FormBuilderPage: React.FC<FormBuilderPageProps> = ({ formToEdit, onClose }) => {
    const { createFormMutation, updateFormMutation, campaignsQuery } = useData();
    const { authenticatedUser } = useAuth();
    const { data: campaigns = [] } = campaignsQuery;
    const isNew = !formToEdit;

    const [form, setForm] = useState<Omit<PublicForm, 'id' | 'organizationId'>>(() => formToEdit || {
        name: '',
        fields: [
            { id: 'contactName', label: 'Full Name', type: 'text', required: true },
            { id: 'email', label: 'Email Address', type: 'text', required: true },
        ],
        style: { buttonText: 'Submit', buttonColor: '#3b82f6' },
        actions: { successMessage: 'Thank you for your submission!' },
        submissions: 0,
    });
    
    const [modal, setModal] = useState<'embed' | 'test' | null>(null);

    useEffect(() => {
        if (formToEdit) setForm(formToEdit);
    }, [formToEdit]);

    const handleSave = () => {
        if (!form.name.trim()) return toast.error("Form name is required.");

        const formData = {
            ...form,
            organizationId: authenticatedUser!.organizationId!,
        };

        if (isNew) {
            createFormMutation.mutate(formData as any, { onSuccess: onClose });
        } else {
            updateFormMutation.mutate({ ...formToEdit!, ...formData }, { onSuccess: onClose });
        }
    };
    
    const handleFieldAdd = (field: PublicFormField) => {
        if (!form.fields.some(f => f.id === field.id)) {
            setForm(prev => ({ ...prev, fields: [...prev.fields, field] }));
        }
    };
    
    const isPending = createFormMutation.isPending || updateFormMutation.isPending;

    return (
        <PageWrapper>
             <div className="flex justify-between items-center mb-4">
                <Button variant="secondary" onClick={onClose} leftIcon={<ArrowLeft size={16} />}>Back to Forms</Button>
                <div className="flex items-center gap-4">
                    <Button variant="secondary" onClick={() => setModal('test')} leftIcon={<TestTube2 size={16}/>}>Preview & Test</Button>
                    <Button variant="secondary" onClick={() => setModal('embed')} leftIcon={<Code size={16}/>}>Get Embed Code</Button>
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Form'}</Button>
                </div>
            </div>
            
             <div className="grid grid-cols-12 gap-4 h-[calc(100vh-12rem)]">
                <Card className="col-span-3 p-4 overflow-y-auto">
                    <FormToolbox onFieldAdd={handleFieldAdd} />
                </Card>
                <div className="col-span-5 h-full flex items-center justify-center p-4 bg-card-bg rounded-card border border-border-subtle">
                   <FormPreview form={form} setForm={setForm} />
                </div>
                <Card className="col-span-4 p-4 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-text-heading mb-4">Configuration</h3>
                    <div className="space-y-4">
                        <Input id="form-name" label="Form Name" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
                        <Input id="btn-text" label="Button Text" value={form.style.buttonText} onChange={e => setForm(p => ({...p, style: {...p.style, buttonText: e.target.value}}))} />
                        <Input id="btn-color" label="Button Color" type="color" value={form.style.buttonColor} onChange={e => setForm(p => ({...p, style: {...p.style, buttonColor: e.target.value}}))} className="w-24"/>
                        <Textarea id="success-msg" label="Success Message" value={form.actions.successMessage} onChange={e => setForm(p => ({...p, actions: {...p.actions, successMessage: e.target.value}}))} rows={3} />
                        <Select id="campaign-enroll" label="Enroll in Journey (Optional)" value={form.actions.enrollInCampaignId || ''} onChange={e => setForm(p => ({...p, actions: {...p.actions, enrollInCampaignId: e.target.value}}))}>
                            <option value="">-- None --</option>
                            {campaigns.map((c: Campaign) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                    </div>
                </Card>
            </div>
            
            {modal === 'embed' && (
                <EmbedCodeModal isOpen={true} onClose={() => setModal(null)} formId={formToEdit?.id || 'new-form'} />
            )}
            {modal === 'test' && (
                <PublicFormTestModal isOpen={true} onClose={() => setModal(null)} form={{ ...form, id: formToEdit?.id || 'new-form', organizationId: 'org_1' }} />
            )}
        </PageWrapper>
    );
};

export default FormBuilderPage;
