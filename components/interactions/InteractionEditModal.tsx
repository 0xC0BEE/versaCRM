import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { useApp } from '../../contexts/AppContext';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { AnyContact } from '../../types';
import toast from 'react-hot-toast';

interface InteractionEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: AnyContact;
}

const InteractionEditModal: React.FC<InteractionEditModalProps> = ({ isOpen, onClose, contact }) => {
    const { industryConfig } = useApp();
    const { createInteractionMutation } = useData();
    const { authenticatedUser } = useAuth();
    
    const getInitialState = () => ({
        type: industryConfig.interactionTypes[0] || 'Note',
        notes: '',
        date: new Date().toISOString(),
    });
    
    const [data, setData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setData(getInitialState());
        }
    }, [isOpen, industryConfig]);

    const handleSave = () => {
        if (!data.notes.trim()) {
            toast.error('Notes cannot be empty.');
            return;
        }

        createInteractionMutation.mutate({
            ...data,
            contactId: contact.id,
            userId: authenticatedUser!.id,
            organizationId: contact.organizationId,
            type: data.type as any, // Cast because string[] is not assignable to union type
        }, {
            onSuccess: () => {
                toast.success('Interaction logged successfully!');
                onClose();
            },
            onError: () => {
                toast.error('Failed to log interaction.');
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Log Interaction with ${contact.contactName}`}>
            <div className="space-y-4">
                <Select
                    id="interaction-type"
                    label="Interaction Type"
                    value={data.type}
                    onChange={e => setData(d => ({...d, type: e.target.value }))}
                >
                    {industryConfig.interactionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </Select>
                <Textarea 
                    id="interaction-notes"
                    label="Notes"
                    value={data.notes}
                    onChange={e => setData(d => ({...d, notes: e.target.value }))}
                    rows={5}
                    required
                />
            </div>
             <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} disabled={createInteractionMutation.isPending}>
                    {createInteractionMutation.isPending ? 'Saving...' : 'Save Interaction'}
                </Button>
            </div>
        </Modal>
    );
};

export default InteractionEditModal;
