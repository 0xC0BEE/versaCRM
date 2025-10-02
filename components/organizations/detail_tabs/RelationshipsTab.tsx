import React, { useMemo } from 'react';
// FIX: Corrected the import path for types to be a valid relative path.
import { AnyContact } from '../../../types';
import Button from '../../ui/Button';
import { Plus, Users } from 'lucide-react';
// FIX: Corrected the import path for DataContext to be a valid relative path.
import { useData } from '../../../contexts/DataContext';

interface RelationshipsTabProps {
    contact: AnyContact;
    isReadOnly: boolean;
}

const RelationshipsTab: React.FC<RelationshipsTabProps> = ({ contact, isReadOnly }) => {
    const { contactsQuery } = useData();
    const { data: contacts = [] } = contactsQuery;
    const relationships = contact.relationships || [];

    const contactMap = useMemo(() => {
        return contacts.reduce((acc: Record<string, AnyContact>, c: AnyContact) => {
            acc[c.id] = c;
            return acc;
        }, {} as Record<string, AnyContact>);
    }, [contacts]);

    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Relationships</h4>
                {!isReadOnly && (
                    <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />}>Add Relationship</Button>
                )}
            </div>
            {relationships.length > 0 ? (
                <div className="space-y-3">
                    {relationships.map((rel, index) => {
                        const relatedContact = contactMap[rel.relatedContactId];
                        return (
                            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-dark-border">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white">{relatedContact?.contactName || 'Unknown Contact'}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{relatedContact?.email}</p>
                                    </div>
                                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                        {rel.relationshipType}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                     <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No relationships found.</p>
                </div>
            )}
        </div>
    );
};

export default RelationshipsTab;