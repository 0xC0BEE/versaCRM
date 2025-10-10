import React, { useState, useMemo, useEffect } from 'react';
import { AnyContact, EmailTemplate } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import Button from '../../ui/Button';
import Select from '../../ui/Select';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { replacePlaceholders } from '../../../utils/textUtils';

interface EmailTabProps {
    contact: AnyContact;
    initialTemplateId?: string;
}

const EmailTab: React.FC<EmailTabProps> = ({ contact, initialTemplateId }) => {
    const { createInteractionMutation, emailTemplatesQuery } = useData();
    const { authenticatedUser } = useAuth();
    const { data: templates = [] } = emailTemplatesQuery;

    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId || '');

    const applyTemplate = (templateId: string) => {
        const template = (templates as EmailTemplate[]).find(t => t.id === templateId);
        if (template) {
            const orgName = 'Your Company'; // Placeholder
            const userName = authenticatedUser?.name || 'Support';
            let processedSubject = replacePlaceholders(template.subject, contact);
            let processedBody = replacePlaceholders(template.body, contact);
            processedBody = processedBody.replace(/\{\{userName\}\}/g, userName);
            processedSubject = processedSubject.replace(/\{\{organizationName\}\}/g, orgName);
            processedBody = processedBody.replace(/\{\{organizationName\}\}/g, orgName);
            
            setSubject(processedSubject);
            setBody(processedBody);
        } else {
            setSubject('');
            setBody('');
        }
    };

    useEffect(() => {
        if (initialTemplateId) {
            setSelectedTemplateId(initialTemplateId);
            applyTemplate(initialTemplateId);
        }
    }, [initialTemplateId]);

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
        setSelectedTemplateId(templateId);
        applyTemplate(templateId);
    };

    const handleSendEmail = () => {
        if (!subject.trim() || !body.trim()) {
            toast.error("Subject and body cannot be empty.");
            return;
        }

        createInteractionMutation.mutate({
            contactId: contact.id,
            organizationId: contact.organizationId,
            userId: authenticatedUser!.id,
            type: 'Email',
            date: new Date().toISOString(),
            notes: `Subject: ${subject}\n\n${body}`,
        }, {
            onSuccess: () => {
                toast.success("Email sent and logged!");
                setSubject('');
                setBody('');
                setSelectedTemplateId('');
            }
        });
    };

    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1 pr-4 space-y-4">
            <h4 className="font-semibold">Compose Email</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    id="email-to"
                    label="To"
                    value={contact.email}
                    disabled
                />
                <Select
                    id="email-template"
                    label="Use Template (Optional)"
                    value={selectedTemplateId}
                    onChange={handleTemplateChange}
                >
                    <option value="">-- No Template --</option>
                    {(templates as EmailTemplate[]).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </Select>
            </div>
            <Input
                id="email-subject"
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={createInteractionMutation.isPending}
            />
            <Textarea
                id="email-body"
                label="Body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                disabled={createInteractionMutation.isPending}
            />
            <div className="flex justify-end">
                <Button
                    onClick={handleSendEmail}
                    disabled={createInteractionMutation.isPending}
                    leftIcon={<Send size={16} />}
                >
                    {createInteractionMutation.isPending ? 'Sending...' : 'Send Email'}
                </Button>
            </div>
        </div>
    );
};

export default EmailTab;