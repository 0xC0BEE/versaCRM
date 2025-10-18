import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../ui/Modal';
import { DataHygieneSuggestion, FormattingSuggestion, AnyContact } from '../../types';
import Tabs from '../ui/Tabs';
import { useData } from '../../contexts/DataContext';
import Button from '../ui/Button';
import { Users, Check, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface DataHygieneModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialResults: DataHygieneSuggestion;
}

const DataHygieneModal: React.FC<DataHygieneModalProps> = ({ isOpen, onClose, initialResults }) => {
    const { contactsQuery, updateContactMutation } = useData();
    const { data: allContacts = [] } = contactsQuery;
    const [results, setResults] = useState(initialResults);
    const [activeTab, setActiveTab] = useState('Duplicates');

    useEffect(() => {
        setResults(initialResults);
    }, [initialResults]);

    const contactMap = useMemo(() => new Map((allContacts as AnyContact[]).map(c => [c.id, c])), [allContacts]);

    const handleApplyFix = (suggestion: FormattingSuggestion) => {
        const contactToUpdate = contactMap.get(suggestion.contactId);
        if (!contactToUpdate) return toast.error("Contact not found.");

        const updatedContact = { ...contactToUpdate };
        (updatedContact as any)[suggestion.field] = suggestion.newValue;

        updateContactMutation.mutate(updatedContact, {
            onSuccess: () => {
                toast.success("Formatting fix applied!");
                // Remove the applied suggestion from the local state
                setResults(prev => ({
                    ...prev,
                    formatting: prev.formatting.filter(f => f.contactId !== suggestion.contactId)
                }));
            }
        });
    };

    const DuplicatesTab = () => (
        <div className="space-y-4">
            {results.duplicates.length > 0 ? results.duplicates.map((group, index) => (
                <div key={index} className="p-4 border border-border-subtle rounded-lg bg-hover-bg">
                    <h4 className="font-semibold text-sm mb-2">Potential Duplicate Group {index + 1}</h4>
                    <ul className="space-y-2">
                        {group.map(contactId => {
                            const contact = contactMap.get(contactId);
                            return (
                                <li key={contactId} className="text-sm flex justify-between items-center">
                                    <span>{contact?.contactName} ({contact?.email})</span>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="text-right mt-3">
                        <Button size="sm" variant="secondary" onClick={() => toast('Merge functionality coming soon!', { icon: '🚧' })}>
                            Review & Merge
                        </Button>
                    </div>
                </div>
            )) : <p className="text-sm text-center py-8 text-text-secondary">No potential duplicates found.</p>}
        </div>
    );

    const FormattingTab = () => (
        <div className="space-y-3">
            {results.formatting.length > 0 ? results.formatting.map(suggestion => (
                <div key={suggestion.contactId} className="p-3 border border-border-subtle rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-medium text-sm">{suggestion.contactName}</p>
                        <p className="text-xs text-text-secondary">{suggestion.suggestion}</p>
                    </div>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleApplyFix(suggestion)}
                        disabled={updateContactMutation.isPending}
                        leftIcon={<Check size={14} />}
                    >
                        Apply Fix
                    </Button>
                </div>
            )) : <p className="text-sm text-center py-8 text-text-secondary">No formatting suggestions found.</p>}
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Data Hygiene Suggestions" size="2xl">
            <div className="min-h-[40vh] max-h-[60vh] overflow-y-auto">
                <Tabs
                    tabs={[`Duplicates (${results.duplicates.length})`, `Formatting (${results.formatting.length})`]}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
                <div className="mt-4">
                    {activeTab === 'Duplicates' ? <DuplicatesTab /> : <FormattingTab />}
                </div>
            </div>
        </Modal>
    );
};

export default DataHygieneModal;