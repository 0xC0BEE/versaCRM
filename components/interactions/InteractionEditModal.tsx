import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
// FIX: Corrected import path for types.
import { AnyContact, Interaction, InteractionType, User } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
import { useForm } from '../../hooks/useForm';
import toast from 'react-hot-toast';

interface InteractionEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: AnyContact;
}

const InteractionEditModal: React.FC<InteractionEditModalProps> = ({ isOpen, onClose, contact }) => {
    const { industryConfig } = useApp();
    const { authenticatedUser } = useAuth();
    const { createInteractionMutation, teamMembersQuery } = useData();
    const { data: teamMembers = [] } = teamMembersQuery;

    const initialState = useMemo(() => ({
        type: industryConfig.interactionTypes[0] as InteractionType,
        date: new Date().toISOString().split('T')[0],
        notes: '',
    }), [industryConfig.interactionTypes]);

    const { formData, handleChange, resetForm } = useForm(initialState, isOpen ? initialState : null);

    // State for @mentions
    const [mentionQuery, setMentionQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        handleChange('notes', value);

        const lastAt = value.lastIndexOf('@');
        const lastSpace = value.lastIndexOf(' ');

        if (lastAt > -1 && lastAt > lastSpace) {
            const query = value.substring(lastAt + 1);
            setMentionQuery(query);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleMentionSelect = (user: User) => {
        const notes = formData.notes;
        const lastAt = notes.lastIndexOf('@');
        const newNotes = `${notes.substring(0, lastAt)}@${user.name} `;
        handleChange('notes', newNotes);
        setShowSuggestions(false);
    };

    const filteredSuggestions = useMemo(() => {
        if (!mentionQuery) return teamMembers;
        return teamMembers.filter(member =>
            member.name.toLowerCase().includes(mentionQuery.toLowerCase())
        );
    }, [mentionQuery, teamMembers]);

    const handleSave = () => {
        if (!formData.notes.trim()) {
            toast.error("Notes cannot be empty.");
            return;
        }

        createInteractionMutation.mutate({
            ...formData,
            contactId: contact.id,
            organizationId: contact.organizationId,
            userId: authenticatedUser!.id,
        }, {
            onSuccess: () => {
                resetForm();
                onClose();
            }
        });
    };

    const isPending = createInteractionMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Log Interaction with ${contact.contactName}`}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        id="interaction-type"
                        label="Interaction Type"
                        value={formData.type}
                        onChange={e => handleChange('type', e.target.value as InteractionType)}
                        disabled={isPending}
                    >
                        {industryConfig.interactionTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </Select>
                     <Input
                        id="interaction-date"
                        label="Date"
                        type="date"
                        value={formData.date}
                        onChange={e => handleChange('date', e.target.value)}
                        disabled={isPending}
                    />
                </div>
                <div className="relative">
                    <Textarea
                        id="interaction-notes"
                        label="Notes"
                        value={formData.notes}
                        onChange={handleNotesChange}
                        rows={5}
                        required
                        disabled={isPending}
                    />
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-card-bg border border-border-subtle rounded-md shadow-lg max-h-40 overflow-y-auto">
                            <ul>
                                {filteredSuggestions.map(user => (
                                    <li key={user.id}>
                                        <button
                                            onClick={() => handleMentionSelect(user)}
                                            className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-primary hover:text-white"
                                        >
                                            {user.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Interaction'}
                </Button>
            </div>
        </Modal>
    );
};

export default InteractionEditModal;
