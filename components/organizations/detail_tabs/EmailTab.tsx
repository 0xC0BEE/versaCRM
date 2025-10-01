import React, { useState, useEffect } from 'react';
import { AnyContact, EmailTemplate } from '../../../types';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Textarea from '../../ui/Textarea';
import { Send, Bot, Loader } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useApp } from '../../../contexts/AppContext';
import toast from 'react-hot-toast';
import { GoogleGenAI, Type } from '@google/genai';

interface EmailTabProps {
    contact: AnyContact;
    setActiveTab: (tab: string) => void;
    isReadOnly: boolean;
}

const EmailTab: React.FC<EmailTabProps> = ({ contact, setActiveTab, isReadOnly }) => {
    const { createInteractionMutation, emailTemplatesQuery } = useData();
    const { data: templates = [] } = emailTemplatesQuery;
    const { authenticatedUser } = useAuth();
    const { industryConfig } = useApp();

    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

    useEffect(() => {
        if (selectedTemplateId) {
            const template = templates.find((t: EmailTemplate) => t.id === selectedTemplateId);
            if (template) {
                // Replace placeholders
                let populatedSubject = template.subject.replace('{{contactName}}', contact.contactName);
                let populatedBody = template.body
                    .replace('{{contactName}}', contact.contactName)
                    .replace('{{userName}}', authenticatedUser?.name || '')
                    .replace('{{organizationName}}', industryConfig.organizationName);

                setSubject(populatedSubject);
                setBody(populatedBody);
            }
        }
    }, [selectedTemplateId, templates, contact, authenticatedUser, industryConfig]);

     const handleGenerateDraft = async () => {
        if (!aiPrompt.trim()) {
            toast.error("Please enter a prompt for the AI.");
            return;
        }
        setIsGeneratingDraft(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
            const fullPrompt = `You are a CRM assistant. The user wants to write an email to a contact named ${contact.contactName}.
            User's prompt: "${aiPrompt}".
            Generate a professional and friendly email.
            Return a JSON object with two keys: "subject" (a string) and "body" (a string).`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            subject: { type: Type.STRING },
                            body: { type: Type.STRING },
                        }
                    },
                    // FIX: Disable model thinking to ensure a fast response and prevent long hangs.
                    thinkingConfig: { thinkingBudget: 0 },
                }
            });

            // FIX: The model can sometimes return the JSON wrapped in markdown.
            // This robustly extracts the JSON string before parsing to prevent errors.
            let jsonString = response.text.trim();
            const match = jsonString.match(/```json\n([\s\S]*?)\n```/);
            if (match && match[1]) {
                jsonString = match[1];
            }

            const parsed = JSON.parse(jsonString);
            setSubject(parsed.subject || '');
            setBody(parsed.body || '');
            toast.success("Draft generated!");

        } catch (error) {
            console.error("AI Draft Error:", error);
            toast.error("Failed to generate draft. The AI response might be malformed.");
        } finally {
            setIsGeneratingDraft(false);
        }
    };

    const handleSend = () => {
        if (!subject.trim() || !body.trim()) {
            toast.error("Subject and body are required.");
            return;
        }

        const notes = `Subject: ${subject}\n\n${body}`;

        createInteractionMutation.mutate({
            type: 'Email',
            notes,
            date: new Date().toISOString(),
            contactId: contact.id,
            userId: authenticatedUser!.id,
            organizationId: contact.organizationId,
        }, {
            onSuccess: () => {
                toast.success("Email sent and logged successfully!");
                setSubject('');
                setBody('');
                setSelectedTemplateId('');
                setActiveTab('History');
            }
        });
    };

    if (isReadOnly) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>Cannot send email to a new contact before they are saved.</p>
            </div>
        );
    }
    
    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1 pr-4 space-y-4">
            <div className="p-4 border rounded-lg dark:border-dark-border bg-gray-50 dark:bg-gray-900/50">
                <h4 className="font-semibold text-sm flex items-center mb-2">
                    <Bot size={16} className="mr-2 text-primary-500" />
                    Draft with AI
                </h4>
                <div className="flex items-center gap-2">
                    <Input 
                        id="ai-prompt"
                        label=""
                        placeholder="e.g., Follow up on our last meeting"
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        className="flex-grow"
                        disabled={isGeneratingDraft}
                    />
                    <Button size="md" variant="secondary" onClick={handleGenerateDraft} disabled={isGeneratingDraft}>
                        {isGeneratingDraft ? <Loader size={16} className="animate-spin" /> : 'Generate'}
                    </Button>
                </div>
            </div>
            <div>
                <Select
                    id="template-select"
                    label="Or Use a Template"
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                >
                    <option value="">-- No Template --</option>
                    {templates.map((template: EmailTemplate) => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                </Select>
            </div>
            <Input id="email-to" label="To" value={contact.email} disabled />
            <Input id="email-from" label="From" value={authenticatedUser?.email || ''} disabled />
            <Input id="email-subject" label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            <Textarea id="email-body" label="Body" value={body} onChange={(e) => setBody(e.target.value)} rows={8} required />
            <div className="flex justify-end">
                <Button onClick={handleSend} leftIcon={<Send size={16} />} disabled={createInteractionMutation.isPending}>
                    {createInteractionMutation.isPending ? 'Sending...' : 'Send Email'}
                </Button>
            </div>
        </div>
    );
};

export default EmailTab;