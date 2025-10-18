import React, { useMemo, useState } from 'react';
import { AnyContact, Relationship } from '../../../types';
import Button from '../../ui/Button';
import { Plus, Users, Trash2 } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';
import AddRelationshipModal from './AddRelationshipModal';
import toast from 'react-hot-toast';

interface RelationshipsTabProps {
    contact: AnyContact;
    isReadOnly: boolean;
}

const RelationshipsTab: React.FC<RelationshipsTabProps> = ({ contact, isReadOnly }) => {
    const { contactsQuery, deleteContactRelationshipMutation } = useData();
    const { data: contacts = [] } = contactsQuery;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const relationships = contact.relationships || [];

    const contactMap = useMemo(() => {
        return new Map((contacts as AnyContact[]).map(c => [c.id, c]));
    }, [contacts]);
    
    const handleDelete = (relatedContactId: string) => {
        if (window.confirm("Are you sure you want to remove this relationship?")) {
            deleteContactRelationshipMutation.mutate({ contactId: contact.id, relatedContactId }, {
                onSuccess: () => toast.success("Relationship removed.")
            });
        }
    };

    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Relationships</h4>
                {!isReadOnly && (
                    <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={() => setIsModalOpen(true)}>
                        Add Relationship
                    </Button>
                )}
            </div>
            {relationships.length > 0 ? (
                <div className="space-y-3">
                    {relationships.map((rel, index) => {
                        const relatedContact = contactMap.get(rel.relatedContactId);
                        return (
                            <div key={index} className="p-3 bg-card-bg/50 rounded-md border border-border-subtle flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-text-primary">{relatedContact ? relatedContact.contactName : 'Unknown Contact'}</p>
                                    <p className="text-xs text-text-secondary">{rel.relationshipType}</p>
                                </div>
                                {!isReadOnly && (
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(rel.relatedContactId)} disabled={deleteContactRelationshipMutation.isPending}>
                                        <Trash2 size={14} />
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 text-text-secondary">
                    <Users className="mx-auto h-12 w-12 text-text-secondary/50" />
                    <p className="mt-2">No relationships found.</p>
                </div>
            )}
            {isModalOpen && (
                <AddRelationshipModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    contact={contact}
                />
            )}
        </div>
    );
};

export default RelationshipsTab;