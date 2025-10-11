

import React, { useMemo, useState, useRef } from 'react';
import { Ticket, TicketAttachment } from '../../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useForm } from '../../../hooks/useForm';
import toast from 'react-hot-toast';
import TicketReplies from '../../tickets/TicketReplies';
import { Paperclip, Trash2 } from 'lucide-react';
import { fileToDataUrl } from '../../../utils/fileUtils';
import apiClient from '../../../services/apiClient';

interface ClientTicketDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket | null;
}

const ClientTicketDetailModal: React.FC<ClientTicketDetailModalProps> = ({ isOpen, onClose, ticket }) => {
    const { createTicketMutation, addTicketReplyMutation } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !ticket;
    
    const initialState = useMemo(() => ({
        subject: '',
        description: '',
    }), []);

    const { formData, handleChange, resetForm } = useForm(initialState, null);
    
    const [attachment, setAttachment] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };
    
    const handleSave = async () => {
         if (!formData.subject.trim() || !formData.description.trim()) {
            toast.error("Subject and Description are required.");
            return;
        }

        let attachmentData;
        if (attachment) {
            const dataUrl = await fileToDataUrl(attachment);
            attachmentData = {
                name: attachment.name,
                type: attachment.type,
                dataUrl: dataUrl,
            };
        }

        // Create the ticket first
        const newTicketData = {
            subject: formData.subject,
            description: formData.description,
            contactId: authenticatedUser!.contactId!,
            priority: 'Medium' as const, // Default priority for client tickets
            status: 'New' as const,
            organizationId: authenticatedUser!.organizationId!,
        };
        
        createTicketMutation.mutate(newTicketData, {
            onSuccess: async (createdTicket) => {
                // If there's an attachment, add it as the first reply
                if (attachmentData) {
                    // FIX: Updated the direct call to `apiClient.addTicketReply` to pass a single object argument (`{ ticketId, reply }`) to match the API client's updated, more consistent method signature.
                    addTicketReplyMutation.mutate({
                        ticketId: createdTicket.id,
                        reply: {
                            userId: authenticatedUser!.id,
                            userName: authenticatedUser!.name,
                            message: "Attached file.",
                            isInternal: false,
                            attachment: attachmentData,
                        }
                    });
                }
                resetForm();
                onClose();
            }
        });
    };
    
    const isPending = createTicketMutation.isPending;

    if (isNew) {
         return (
             <Modal isOpen={isOpen} onClose={onClose} title="Open a New Support Ticket">
                <div className="space-y-4">
                    <Input id="subject" label="Subject" value={formData.subject} onChange={e => handleChange('subject', e.target.value)} required disabled={isPending} />
                    <Textarea id="description" label="Please describe your issue" value={formData.description} onChange={e => handleChange('description', e.target.value)} rows={5} required disabled={isPending} />
                     <div className="flex items-center gap-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden"/>
                        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} leftIcon={<Paperclip size={14}/>}>
                            Attach File (optional)
                        </Button>
                        {attachment && (
                            <div className="text-xs flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded">
                                <span>{attachment.name}</span>
                                <button onClick={() => { setAttachment(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="p-0.5 hover:bg-red-200 rounded-full"><Trash2 size={12} /></button>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="mt-6 flex justify-end space-x-2">
                    <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Submitting...' : 'Submit Ticket'}</Button>
                </div>
            </Modal>
         );
    }
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Ticket: ${ticket.subject}`} size="3xl">
           <TicketReplies ticket={ticket} showInternalNotes={false} />
        </Modal>
    );
};

export default ClientTicketDetailModal;
