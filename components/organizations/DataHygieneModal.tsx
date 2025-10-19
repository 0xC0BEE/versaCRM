import React, { useState, useMemo } from 'react';
import { DataHygieneSuggestion, FormattingSuggestion, AnyContact } from '../../types';
import Modal from '../ui/Modal';
import Tabs from '../ui/Tabs';
import Button from '../ui/Button';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';

interface DataHygieneModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialResults: DataHygieneSuggestion;
}

const DataHygieneModal: React.FC<DataHygieneModalProps> = ({ isOpen, onClose, initialResults }) => {
    const { contactsQuery, updateContactMutation } = useData();
    // In a real app with mutations that affect data, you might want to refetch,
    // but here we just use what's in cache. The data context handles invalidation.
    const { data: allContacts = [], refetch } = contactsQuery;

    const [activeTab, setActiveTab] = useState('Duplicates');
    
    const contactMap = useMemo(() => new Map((allContacts as AnyContact[]).map(c => [c.id, c])), [allContacts]);

    const { duplicates, formatting } = initialResults;
    const totalIssues = duplicates.length + formatting.length;

    const handleApplyFix = (suggestion: FormattingSuggestion) => {
        const contactToUpdate = contactMap.get(suggestion.contactId);
        if (!contactToUpdate) return toast.error("Contact not found.");
        
        const updatedContact = { ...contactToUpdate, [suggestion.field]: suggestion.newValue };
        updateContactMutation.mutate(updatedContact, {
            onSuccess: () => {
                toast.success("Formatting fix applied! The view will update shortly.");
                // The modal could close or update its state to show the item is fixed.
                // For simplicity, we'll let it close and the list refetches.
                onClose();
            },
        });
    };

    const isPending = updateContactMutation.isPending;

    const renderContent = () => {
        switch (activeTab) {
            case 'Duplicates':
                return (
                     <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {duplicates.length > 0 ? duplicates.map((group, index) => (
                            <div key={index} className="p-4 border border-border-subtle rounded-lg bg-hover-bg">
                                <h4 className="font-semibold text-sm mb-2">Potential Duplicate Group {index + 1}</h4>
                                <ul className="space-y-2">
                                    {group.map(contactId => {
                                        const contact = contactMap.get(contactId);
                                        return <li key={contactId} className="text-sm"><span>{contact?.contactName} ({contact?.email})</span></li>;
                                    })}
                                </ul>
                                <div className="text-right mt-3"><Button size="sm" variant="secondary" onClick={() => toast('Merge functionality coming soon!', { icon: '🚧' })}>Review & Merge</Button></div>
                            </div>
                        )) : <p className="text-sm text-center py-8 text-text-secondary">No potential duplicates found.</p>}
                    </div>
                );
            case 'Formatting':
                return (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {formatting.length > 0 ? formatting.map(suggestion => (
                            <div key={suggestion.contactId} className="p-3 border border-border-subtle rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-sm">{suggestion.contactName}</p>
                                    <p className="text-xs text-text-secondary">{suggestion.suggestion}</p>
                                </div>
                                <Button size="sm" variant="secondary" onClick={() => handleApplyFix(suggestion)} disabled={isPending} leftIcon={<Check size={14} />}>Apply Fix</Button>
                            </div>
                        )) : <p className="text-sm text-center py-8 text-text-secondary">No formatting suggestions found.</p>}
                    </div>
                );
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Data Hygiene Suggestions" size="2xl">
            <p className="text-sm text-text-secondary mb-4">
                AI has found {totalIssues} potential issue{totalIssues !== 1 ? 's' : ''} in your contact data.
            </p>
            <Tabs tabs={[`Duplicates (${duplicates.length})`, `Formatting (${formatting.length})`]} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="mt-4">
                {renderContent()}
            </div>
             <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={onClose}>Close</Button>
            </div>
        </Modal>
    );
};

export default DataHygieneModal;
