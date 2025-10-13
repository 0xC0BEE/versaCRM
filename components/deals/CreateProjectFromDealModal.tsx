import React, { useState, useMemo } from 'react';
import { Deal, AnyContact, ProjectTemplate } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import toast from 'react-hot-toast';

interface CreateProjectFromDealModalProps {
    isOpen: boolean;
    onClose: () => void;
    deal: Deal;
}

const CreateProjectFromDealModal: React.FC<CreateProjectFromDealModalProps> = ({ isOpen, onClose, deal }) => {
    const { createProjectMutation } = useData();
    const { authenticatedUser } = useAuth();
    
    // In a real app, you'd fetch these. For now, hardcoded.
    const MOCK_PROJECT_TEMPLATES = [
        { id: 'pt_1', name: 'Standard Client Onboarding' },
        { id: 'pt_2', name: 'Equipment Installation' },
    ];

    const initialState = useMemo(() => ({
        name: deal.name,
        contactId: deal.contactId,
        dealId: deal.id,
        templateId: MOCK_PROJECT_TEMPLATES[0]?.id || '',
        assignedToId: deal.assignedToId || authenticatedUser?.id || '',
    }), [deal, authenticatedUser]);
    
    const { formData, handleChange } = useForm(initialState, isOpen ? initialState : null);

    const handleSave = () => {
        if (!formData.name.trim()) {
            toast.error("Project name is required.");
            return;
        }

        createProjectMutation.mutate({
            ...formData,
            organizationId: authenticatedUser!.organizationId,
        }, { 
            onSuccess: () => {
                toast.success(`Project "${formData.name}" created successfully!`);
                onClose();
            }
        });
    };
    
    const isPending = createProjectMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Create Project from Deal: ${deal.name}`}>
            <div className="space-y-4">
                <Input
                    id="project-name"
                    label="Project Name"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    required
                    disabled={isPending}
                />
                <Select
                    id="project-template"
                    label="Use Project Template (Optional)"
                    value={formData.templateId}
                    onChange={e => handleChange('templateId', e.target.value)}
                    disabled={isPending}
                >
                    <option value="">-- No Template --</option>
                    {MOCK_PROJECT_TEMPLATES.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </Select>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Creating...' : 'Create Project'}
                </Button>
            </div>
        </Modal>
    );
};

export default CreateProjectFromDealModal;