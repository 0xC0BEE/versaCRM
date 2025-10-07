import React, { useMemo } from 'react';
import { LeadScoringRule, InteractionType, ContactStatus } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useForm } from '../../hooks/useForm';
import toast from 'react-hot-toast';
import { useApp } from '../../contexts/AppContext';

interface LeadScoringRuleEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    rule: LeadScoringRule | null;
    onSave: (rule: LeadScoringRule) => void;
    isSaving: boolean;
}

const interactionTypes: InteractionType[] = ['Appointment', 'Call', 'Email', 'Note', 'Site Visit', 'Maintenance Request', 'Meeting'];
const statusOptions: ContactStatus[] = ['Lead', 'Active', 'Inactive', 'Do Not Contact', 'Needs Attention'];

const LeadScoringRuleEditModal: React.FC<LeadScoringRuleEditModalProps> = ({ isOpen, onClose, rule, onSave, isSaving }) => {
    const isNew = !rule;
    const { industryConfig } = useApp();

    const initialState = useMemo((): LeadScoringRule => ({
        id: rule?.id || '',
        event: rule?.event || 'interaction',
        points: rule?.points || 0,
        interactionType: rule?.interactionType || undefined,
        status: rule?.status || undefined,
    }), [rule]);

    const { formData, handleChange, setFormData } = useForm<LeadScoringRule>(initialState, rule);

    const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newEvent = e.target.value as 'interaction' | 'status_change';
        setFormData(prev => ({
            ...initialState, // Reset to clear conditional fields
            id: prev.id,
            points: prev.points,
            event: newEvent,
        }));
    };

    const handleSave = () => {
        if (formData.points === 0) {
            toast.error("Points must be a non-zero number.");
            return;
        }
        if (formData.event === 'interaction' && !formData.interactionType) {
            toast.error("Please select an interaction type.");
            return;
        }
        if (formData.event === 'status_change' && !formData.status) {
            toast.error("Please select a status.");
            return;
        }
        
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Add New Scoring Rule' : `Edit Rule`}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Select
                        id="rule-event"
                        label="When this event occurs"
                        value={formData.event}
                        onChange={handleEventChange}
                        disabled={isSaving}
                    >
                        <option value="interaction">An Interaction is logged</option>
                        <option value="status_change">A Contact's Status changes</option>
                    </Select>
                    <Input
                        id="rule-points"
                        label="Change score by"
                        type="number"
                        value={formData.points}
                        onChange={(e) => handleChange('points', parseInt(e.target.value) || 0)}
                        required
                        disabled={isSaving}
                    />
                </div>
                
                {formData.event === 'interaction' && (
                    <Select
                        id="rule-interaction-type"
                        label="If the Interaction Type is"
                        value={formData.interactionType || ''}
                        onChange={(e) => handleChange('interactionType', e.target.value as InteractionType)}
                        disabled={isSaving}
                    >
                        <option value="">-- Select Interaction Type --</option>
                        {industryConfig.interactionTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </Select>
                )}

                {formData.event === 'status_change' && (
                    <Select
                        id="rule-status"
                        label="If the new Status is"
                        value={formData.status || ''}
                        onChange={(e) => handleChange('status', e.target.value as ContactStatus)}
                        disabled={isSaving}
                    >
                        <option value="">-- Select Status --</option>
                        {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Select>
                )}
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Rule'}
                </Button>
            </div>
        </Modal>
    );
};

export default LeadScoringRuleEditModal;
