import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Ticket, AnyContact, User, CustomObjectDefinition, CustomObjectRecord } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import toast from 'react-hot-toast';
import TicketReplies from './TicketReplies';
import Tabs from '../ui/Tabs';
import { GoogleGenAI } from '@google/genai';
import { useDebounce } from '../../hooks/useDebounce';
import { Wand2 } from 'lucide-react';

interface TicketDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket | null;
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ isOpen, onClose, ticket }) => {
    const { 
        contactsQuery, 
        teamMembersQuery, 
        customObjectDefsQuery,
        createTicketMutation,
        updateTicketMutation
    } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !ticket;
    const [activeTab, setActiveTab] = useState('Replies');
    
    const { data: contacts = [] } = contactsQuery;
    const { data: teamMembers = [] } = teamMembersQuery;
    const { data: customObjectDefs = [] } = customObjectDefsQuery;
    const allRecordsQuery = useData().customObjectRecordsQuery(null);
    const { data: allRecords = [] } = allRecordsQuery;

    const [aiSuggestion, setAiSuggestion] = useState<{ defId: string, recordId: string, recordName: string } | null>(null);

    // Form state for both new and edit modes
    const initialState = useMemo(() => ({
        contactId: '',
        subject: '',
        description: '',
        status: 'New' as Ticket['status'],
        priority: 'Medium' as Ticket['priority'],
        assignedToId: '',
        relatedObjectDefId: '',
        relatedObjectRecordId: '',
    }), []);
    
    const { formData, setFormData, handleChange } = useForm(initialState, ticket);
    const debouncedSubject = useDebounce(formData.subject, 500);

    const [selectedDefId, setSelectedDefId] = useState(ticket?.relatedObjectDefId || '');
    const { data: relatedRecords = [] } = useData().customObjectRecordsQuery(selectedDefId);

    const generateSuggestion = useCallback(async (subject: string) => {
        if (!subject.trim() || !allRecords || allRecords.length === 0) {
            setAiSuggestion(null);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const recordsWithPrimaryField = allRecords.map((rec: CustomObjectRecord) => {
                const def = customObjectDefs.find((d: CustomObjectDefinition) => d.id === rec.objectDefId);
                const primaryFieldId = def?.fields[0]?.id;
                return {
                    defId: rec.objectDefId,
                    recordId: rec.id,
                    name: primaryFieldId ? rec.fields[primaryFieldId] : 'Unnamed Record'
                };
            }).filter((rec: {name: string}) => rec.name !== 'Unnamed Record');

            if (recordsWithPrimaryField.length === 0) return;

            const prompt = `From the ticket subject "${subject}", find the best matching record from this list: ${JSON.stringify(recordsWithPrimaryField)}. Respond with ONLY the JSON object for the single best match, or an empty JSON object {} if no good match is found.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const text = response.text;
            const match = JSON.parse(text.trim());
            
            if (match.recordId) {
                setAiSuggestion({ ...match, recordName: match.name });
            } else {
                setAiSuggestion(null);
            }
        } catch (error) {
            console.error("AI Suggestion error:", error);
            setAiSuggestion(null);
        }

    }, [allRecords, customObjectDefs]);

    useEffect(() => {
        if (isNew && isOpen) {
            generateSuggestion(debouncedSubject);
        }
    }, [debouncedSubject, isNew, isOpen, generateSuggestion]);


     useEffect(() => {
        if (isOpen) {
            if (ticket) {
                setFormData(ticket);
                setSelectedDefId(ticket.relatedObjectDefId || '');
            } else {
                setFormData(initialState);
                setSelectedDefId('');
            }
            setActiveTab('Replies');
            setAiSuggestion(null);
        }
    }, [isOpen, ticket, setFormData, initialState]);


    const handleSaveNew = () => {
        if (!formData.subject.trim() || !formData.description.trim() || !formData.contactId) {
            toast.error("Contact, Subject, and Description are required.");
            return;
        }
        createTicketMutation.mutate({ ...formData, organizationId: authenticatedUser!.organizationId }, {
            onSuccess: () => {
                onClose();
            }
        });
    };
    
    const handleUpdateDetails = () => {
        if (!ticket) return;
        updateTicketMutation.mutate({ ...ticket, ...formData }, {
            onSuccess: () => {
                toast.success("Ticket details updated.");
            }
        });
    };
    
    const handleDefChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDefId = e.target.value;
        setSelectedDefId(newDefId);
        handleChange('relatedObjectDefId', newDefId);
        handleChange('relatedObjectRecordId', ''); // Reset record selection
    };
    
    const applyAiSuggestion = () => {
        if (aiSuggestion) {
            setSelectedDefId(aiSuggestion.defId);
            setFormData(prev => ({
                ...prev,
                relatedObjectDefId: aiSuggestion.defId,
                relatedObjectRecordId: aiSuggestion.recordId,
            }));
            setAiSuggestion(null);
            toast.success("AI suggestion applied!");
        }
    };

    const isPending = createTicketMutation.isPending || updateTicketMutation.isPending;
    const primaryFieldId = (customObjectDefs as CustomObjectDefinition[]).find(d => d.id === selectedDefId)?.fields[0]?.id;

    const renderDetailsTab = () => (
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select id="ticket-status" label="Status" value={formData.status} onChange={e => handleChange('status', e.target.value as Ticket['status'])}>
                    <option>New</option><option>Open</option><option>Pending</option><option>Closed</option>
                </Select>
                <Select id="ticket-priority" label="Priority" value={formData.priority} onChange={e => handleChange('priority', e.target.value as Ticket['priority'])}>
                    <option>Low</option><option>Medium</option><option>High</option>
                </Select>
                 <Select id="ticket-assignee" label="Assigned To" value={formData.assignedToId} onChange={e => handleChange('assignedToId', e.target.value)}>
                    <option value="">Unassigned</option>
                    {(teamMembers as User[]).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </Select>
            </div>
             <div className="pt-4 border-t border-border-subtle">
                 <label className="block text-sm font-medium text-text-primary mb-1">Link to Record (Optional)</label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select id="related-object-def" label="" value={formData.relatedObjectDefId} onChange={handleDefChange}>
                        <option value="">Select Object Type...</option>
                        {(customObjectDefs as CustomObjectDefinition[]).map(def => <option key={def.id} value={def.id}>{def.nameSingular}</option>)}
                    </Select>
                    {selectedDefId && (
                        <Select id="related-object-record" label="" value={formData.relatedObjectRecordId} onChange={e => handleChange('relatedObjectRecordId', e.target.value)} disabled={relatedRecords.isLoading}>
                            <option value="">Select Record...</option>
                            {primaryFieldId && (relatedRecords as CustomObjectRecord[]).map(rec => (
                                <option key={rec.id} value={rec.id}>{rec.fields[primaryFieldId]}</option>
                            ))}
                        </Select>
                    )}
                </div>
            </div>
             <div className="flex justify-end mt-4">
                <Button onClick={handleUpdateDetails} disabled={isPending}>Save Details</Button>
            </div>
        </div>
    );

    if (isNew) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Create New Ticket">
                <div className="space-y-4">
                    <Select id="ticket-contact" label="Contact" value={formData.contactId} onChange={e => handleChange('contactId', e.target.value)} required disabled={isPending}>
                        <option value="">Select a contact...</option>
                        {(contacts as AnyContact[]).map(c => <option key={c.id} value={c.id}>{c.contactName}</option>)}
                    </Select>
                    <Input id="ticket-subject" label="Subject" value={formData.subject} onChange={e => handleChange('subject', e.target.value)} required disabled={isPending} />
                    <Textarea id="ticket-description" label="Description" value={formData.description} onChange={e => handleChange('description', e.target.value)} rows={5} required disabled={isPending} />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select id="ticket-priority" label="Priority" value={formData.priority} onChange={e => handleChange('priority', e.target.value as Ticket['priority'])}>
                            <option>Low</option><option>Medium</option><option>High</option>
                        </Select>
                        <Select id="ticket-assignee" label="Assigned To" value={formData.assignedToId} onChange={e => handleChange('assignedToId', e.target.value)}>
                            <option value="">Unassigned</option>
                            {(teamMembers as User[]).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </Select>
                    </div>
                    <div className="pt-2 border-t border-border-subtle">
                         <label className="block text-sm font-medium text-text-primary mt-2 mb-1">Link to Record (Optional)</label>
                         {aiSuggestion && (
                             <div className="p-2 mb-2 bg-primary/10 rounded-md flex items-center justify-between">
                                <p className="text-sm text-primary flex items-center gap-2"><Wand2 size={16}/> AI Suggestion: Link to "{aiSuggestion.recordName}"?</p>
                                <Button size="sm" onClick={applyAiSuggestion}>Link Now</Button>
                             </div>
                         )}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select id="related-object-def" label="" value={formData.relatedObjectDefId} onChange={handleDefChange}>
                                <option value="">Select Object Type...</option>
                                {(customObjectDefs as CustomObjectDefinition[]).map(def => <option key={def.id} value={def.id}>{def.nameSingular}</option>)}
                            </Select>
                            {selectedDefId && (
                                <Select id="related-object-record" label="" value={formData.relatedObjectRecordId} onChange={e => handleChange('relatedObjectRecordId', e.target.value)} disabled={relatedRecords.isLoading}>
                                    <option value="">Select Record...</option>
                                    {primaryFieldId && (relatedRecords as CustomObjectRecord[]).map(rec => (
                                        <option key={rec.id} value={rec.id}>{rec.fields[primaryFieldId]}</option>
                                    ))}
                                </Select>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                    <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button onClick={handleSaveNew} disabled={isPending}>{isPending ? 'Creating...' : 'Create Ticket'}</Button>
                </div>
            </Modal>
        );
    }
    
    // Existing ticket view
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Ticket: ${ticket.subject}`} size="4xl">
           <Tabs tabs={['Replies', 'Details']} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="mt-4">
                {activeTab === 'Replies' && <TicketReplies ticket={ticket} showInternalNotes={true} />}
                {activeTab === 'Details' && renderDetailsTab()}
            </div>
        </Modal>
    );
};

export default TicketDetailModal;