import React, { useMemo, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Input from '../ui/Input';
import { Interaction, AnyContact, InteractionType } from '../../types';
import { useForm } from '../../hooks/useForm';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface InteractionEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: AnyContact;
    interaction: Interaction | null;
}

const InteractionEditModal: React.FC<InteractionEditModalProps> = ({ isOpen, onClose, contact, interaction }) => {
    const { createInteractionMutation, updateInteractionMutation } = useData();
    const { authenticatedUser } = useAuth();
    const { industryConfig } = useApp();
    const isNew = !interaction;

    const initialState = useMemo(() => ({
        type: industryConfig.interactionTypes[0] as InteractionType,
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        notes: '',
    }), [industryConfig.interactionTypes]);

    const formDependency = useMemo(() => {
        if (!interaction) return null;
        return {
            ...interaction,
            date: format(new Date(interaction.date), "yyyy-MM-dd'T'HH:mm"),
        };
    }, [interaction]);

    const { formData, handleChange } = useForm(initialState, formDependency);

    useEffect(() => {
        if (createInteractionMutation.isSuccess || updateInteractionMutation.isSuccess) {
            onClose();
            createInteractionMutation.reset();
            updateInteractionMutation.reset();
        }
    }, [createInteractionMutation.isSuccess, updateInteractionMutation.isSuccess, onClose, createInteractionMutation, updateInteractionMutation]);

    const handleSave = () => {
        if (!formData.notes.trim()) {
            toast.error("Notes are required for an interaction.");
            return;
        }

        const interactionData = {
            ...formData,
            contactId: contact.id,
            organizationId: contact.organizationId,
            userId: authenticatedUser!.id,
            date: new Date(formData.date).toISOString(),
        };

        if (isNew) {
            createInteractionMutation.mutate(interactionData);
        } else {
            updateInteractionMutation.mutate({ ...interaction!, ...interactionData });
        }
    };
    
    const isPending = createInteractionMutation.isPending || updateInteractionMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'Log New Interaction' : 'Edit Interaction'}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Select
                        id="interaction-type"
                        label="Type"
                        value={formData.type}
                        onChange={(e) => handleChange('type', e.target.value as InteractionType)}
                    >
                        {industryConfig.interactionTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </Select>
                    <Input
                        id="interaction-date"
                        label="Date & Time"
                        type="datetime-local"
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                    />
                </div>
                <Textarea
                    id="interaction-notes"
                    label="Notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={6}
                    required
                />
            </div>
            <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Saving...' : (isNew ? 'Log Interaction' : 'Save Changes')}
                </Button>
            </div>
        </Modal>
    );
};

export default InteractionEditModal;