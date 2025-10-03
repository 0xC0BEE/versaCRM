import React, { useMemo, useState } from 'react';
import { Ticket, AnyContact, User, OrganizationSettings } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import toast from 'react-hot-toast';
import TicketReplies from './TicketReplies';
import Tabs from '../ui/Tabs';
import SLATimer from '../common/SLATimer';

interface TicketDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket | null;
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ isOpen, onClose, ticket }) => {
    const { createTicketMutation, updateTicketMutation, contactsQuery, teamMembersQuery, organizationSettingsQuery } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !ticket;
    const [activeTab, setActiveTab] = useState('Replies');
    
    const { data: contacts = [] } = contactsQuery;
    const { data: teamMembers = [] } = teamMembersQuery;
    const { data: orgSettings } = organizationSettingsQuery;

    const initialState = useMemo(() => ({
        subject: '',
        description: '',
        contactId: '',
        priority: 'Medium' as Ticket['priority'],
        assignedToId: '',
        status: 'New' as Ticket['status'],
    }), []);
    
    const formDependency = useMemo(() => {
        if (!ticket) return null;
        return {
            ...initialState,
            ...ticket,
            description: ticket.description || '',
            assignedToId: ticket.assignedToId || '',
        };
    }, [ticket, initialState]);

    const { formData, handleChange, resetForm } = useForm(initialState, formDependency);

    const handleSave = () => {
        if (isNew) {
             if (!formData.subject.trim() || !formData.description.trim() || !formData.contactId) {
                toast.error("Subject, Description, and Contact are required.");
                return;
            }
            createTicketMutation.mutate({ ...formData, organizationId: authenticatedUser!.organizationId! }, {
                onSuccess: () => {
                    resetForm();
                    onClose();
                }
            });
        } else {
             updateTicketMutation.mutate({ ...ticket!, ...formData }, {
                onSuccess: () => {
                    onClose();
                }
            });
        }
    };
    
    const isPending = createTicketMutation.isPending || updateTicketMutation.isPending;
    
    const renderDetailsForm = () => (
         <div className="space-y-4">
            <Input id="subject" label="Subject" value={formData.subject} onChange={e => handleChange('subject', e.target.value)} required disabled={isPending || !isNew} />
            {isNew && <Textarea id="description" label="Description" value={formData.description} onChange={e => handleChange('description', e.target.value)} rows={4} required disabled={isPending} />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Select id="contactId" label="Contact" value={formData.contactId} onChange={e => handleChange('contactId', e.target.value)} required disabled={isPending || !isNew}>
                    <option value="">Select a contact...</option>
                    {contacts.map((c: AnyContact) => <option key={c.id} value={c.id}>{c.contactName}</option>)}
                </Select>
                 <Select id="assignedToId" label="Assigned To" value={formData.assignedToId} onChange={e => handleChange('assignedToId', e.target.value)} disabled={isPending}>
                    <option value="">Unassigned</option>
                    {teamMembers.map((m: User) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </Select>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select id="priority" label="Priority" value={formData.priority} onChange={e => handleChange('priority', e.target.value as any)} disabled={isPending}>
                    <option>Low</option><option>Medium</option><option>High</option>
                </Select>
                <Select id="status" label="Status" value={formData.status} onChange={e => handleChange('status', e.target.value as any)} disabled={isPending}>
                    <option>New</option><option>Open</option><option>Pending</option><option>Closed</option>
                </Select>
            </div>
             <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Changes'}</Button>
            </div>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'New Ticket' : `Ticket: ${ticket?.subject}`} size="4xl">
           {isNew ? renderDetailsForm() : ticket ? (
               <>
                <div className="mb-4">
                    <SLATimer ticket={ticket} settings={orgSettings} />
                </div>
                <Tabs tabs={['Replies', 'Details']} activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="mt-4">
                    {activeTab === 'Replies' ? <TicketReplies ticket={ticket} showInternalNotes={true} /> : renderDetailsForm()}
                </div>
               </>
           ) : null}
        </Modal>
    );
};

export default TicketDetailModal;
