import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { AnyContact, CannedResponse } from '../../types';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import { Send, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { replacePlaceholders } from '../../utils/textUtils';

interface ComposeViewProps {
    onCancel: () => void;
    onSent: () => void;
}

const ComposeView: React.FC<ComposeViewProps> = ({ onCancel, onSent }) => {
    const { contactsQuery, sendNewEmailMutation, cannedResponsesQuery } = useData();
    const { authenticatedUser } = useAuth();
    const { data: contacts = [] } = contactsQuery;
    
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [showCanned, setShowCanned] = useState(false);
    const { data: cannedResponses = [] } = cannedResponsesQuery;
    const cannedMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cannedMenuRef.current && !cannedMenuRef.current.contains(event.target as Node)) {
                setShowCanned(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelectCanned = (response: CannedResponse) => {
        const contact = (contacts as AnyContact[]).find(c => c.id === to);
        let processedBody = response.body;
        if (contact) {
            processedBody = replacePlaceholders(response.body, { contact: { contactName: contact.contactName } }, { userName: authenticatedUser?.name });
        }
        setBody(processedBody);
        setShowCanned(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!to || !subject.trim() || !body.trim()) {
            toast.error('Recipient, subject, and body are required.');
            return;
        }

        sendNewEmailMutation.mutate({
            contactId: to,
            userId: authenticatedUser!.id,
            subject,
            body,
        }, {
            onSuccess: () => {
                toast.success('Email sent!');
                onSent();
            }
        });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border-subtle flex-shrink-0">
                <h2 className="font-semibold text-lg">New Message</h2>
            </div>
            <form onSubmit={handleSubmit} className="flex-grow flex flex-col p-4 space-y-4 overflow-y-auto">
                <Select
                    id="compose-to"
                    label="To"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    required
                >
                    <option value="">Select a contact...</option>
                    {(contacts as AnyContact[]).map(contact => (
                        <option key={contact.id} value={contact.id}>
                            {contact.contactName} ({contact.email})
                        </option>
                    ))}
                </Select>
                <Input
                    id="compose-subject"
                    label="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                />
                <Textarea
                    id="compose-body"
                    label="Message"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                    rows={10}
                    className="flex-grow"
                />
                 <div className="flex-shrink-0 pt-4 border-t border-border-subtle flex justify-between items-center gap-2">
                    <div className="relative" ref={cannedMenuRef}>
                        <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            onClick={() => setShowCanned(!showCanned)}
                            leftIcon={<ClipboardList size={16}/>}
                        >
                            Canned Responses
                        </Button>
                        {showCanned && (
                            <div className="absolute bottom-full mb-2 w-72 bg-card-bg border border-border-subtle rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                                {cannedResponses.length > 0 ? (
                                    (cannedResponses as CannedResponse[]).map(res => (
                                        <button
                                            key={res.id}
                                            type="button"
                                            onClick={() => handleSelectCanned(res)}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-hover-bg"
                                        >
                                            <p className="font-medium">{res.name}</p>
                                            <p className="text-xs text-text-secondary truncate">{res.body}</p>
                                        </button>
                                    ))
                                ) : (
                                    <p className="p-3 text-sm text-text-secondary">No responses found.</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={onCancel} disabled={sendNewEmailMutation.isPending}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            leftIcon={<Send size={16}/>} 
                            disabled={!to || !subject.trim() || !body.trim() || sendNewEmailMutation.isPending}
                        >
                            {sendNewEmailMutation.isPending ? 'Sending...' : 'Send'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ComposeView;