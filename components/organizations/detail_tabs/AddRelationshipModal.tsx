import React, { useState, useMemo } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Select from '../../ui/Select';
import Input from '../../ui/Input';
import { AnyContact, Relationship } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import toast from 'react-hot-toast';

interface AddRelationshipModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: AnyContact;
}

const relationshipTypes = [
    'Spouse',
    'Child',
    'Parent',
    'Sibling',
    'Business Partner',
    'Accountant',
    'Lawyer',
    'Household Member',
    'Referred By',
    'Referred To',
];

const AddRelationshipModal: React.FC<AddRelationshipModalProps> = ({ isOpen, onClose, contact }) => {
    const { contactsQuery, addContactRelationshipMutation } = useData();
    const { data: allContacts = [] } = contactsQuery;

    const [relatedContactId, setRelatedContactId] = useState('');
    const [relationshipType, setRelationshipType] = useState(relationshipTypes[0]);
    
    const availableContacts = useMemo(() => {
        const existingRelations = new Set((contact.relationships || []).map(r => r.relatedContactId));
        return (allContacts as AnyContact[]).filter(c => c.id !== contact.id && !existingRelations.has(c.id));
    }, [allContacts, contact]);

    const handleSave = () => {
        if (!relatedContactId || !relationshipType) {
            toast.error("Please select a contact and a relationship type.");
            return;
        }

        const relationship: Relationship = {
            relatedContactId,
            relationshipType,
        };

        addContactRelationshipMutation.mutate({ contactId: contact.id, relationship }, {
            onSuccess: () => {
                toast.success("Relationship added.");
                onClose();
            }
        });
    };
    
    const isPending = addContactRelationshipMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Add Relationship for ${contact.contactName}`}>
            <div className="space-y-4">
                <Select
                    id="related-contact"
                    label="Contact"
                    value={relatedContactId}
                    onChange={e => setRelatedContactId(e.target.value)}
                    disabled={isPending}
                >
                    <option value="">Select a contact to link...</option>
                    {availableContacts.map(c => (
                        <option key={c.id} value={c.id}>{c.contactName}</option>
                    ))}
                </Select>
                 <Select
                    id="relationship-type"
                    label="Relationship Type"
                    value={relationshipType}
                    onChange={e => setRelationshipType(e.target.value)}
                    disabled={isPending}
                >
                    {relationshipTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </Select>
            </div>
             <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? 'Saving...' : 'Add Relationship'}
                </Button>
            </div>
        </Modal>
    );
};

export default AddRelationshipModal;