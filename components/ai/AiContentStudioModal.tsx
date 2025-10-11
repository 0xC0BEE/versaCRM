
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Tabs from '../ui/Tabs';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { GoogleGenAI } from '@google/genai';
import toast from 'react-hot-toast';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Loader, Wand2 } from 'lucide-react';

interface AiContentStudioModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ContentType = 'Email Template' | 'Landing Page Copy';
type Tone = 'Professional' | 'Friendly' | 'Persuasive' | 'Informative';

const AiContentStudioModal: React.FC<AiContentStudioModalProps> = ({ isOpen, onClose }) => {
    const { createEmailTemplateMutation } = useData();
    const { authenticatedUser } = useAuth();
    const [activeTab, setActiveTab] = useState<ContentType>('Email Template');
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState<Tone>('Professional');
    const [result, setResult] = useState<{ subject?: string, body: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error("Please provide a topic or goal.");
            return;
        }

        setIsLoading(true);
        setResult(null);

        let prompt = `You are a marketing content expert for a CRM. Generate content based on the user's request.\n`;
        if (activeTab === 'Email Template') {
            prompt += `Generate a compelling subject line and body for an email template. The goal of the email is: "${topic}". The tone should be ${tone}.`;
        } else {
            prompt += `Generate a headline, a subtitle, and body text for a landing page. The topic of the page is: "${topic}". The tone should be ${tone}. Structure the response with "Headline:", "Subtitle:", and "Body:" sections.`;
        }

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const text = response.text;
            
            if (activeTab === 'Email Template') {
                const subjectMatch = text.match(/Subject: (.*)/);
                const bodyText = subjectMatch ? text.substring(text.indexOf('\n') + 1) : text;
                setResult({ subject: subjectMatch ? subjectMatch[1] : `Re: ${topic}`, body: bodyText.trim() });
            } else {
                setResult({ body: text });
            }

        } catch (error) {
            toast.error("Failed to generate content. Please try again.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveTemplate = () => {
        if (!result || !result.subject) return;

        createEmailTemplateMutation.mutate({
            name: `AI: ${topic.substring(0, 20)}...`,
            subject: result.subject,
            body: result.body,
            organizationId: authenticatedUser!.organizationId,
        }, {
            onSuccess: () => {
                toast.success("Email template saved!");
                onClose();
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Content Studio" size="3xl">
            <div className="flex flex-col md:flex-row gap-6 min-h-[60vh]">
                {/* Left: Config Panel */}
                <div className="w-full md:w-1/3 space-y-4">
                    <Tabs tabs={['Email Template', 'Landing Page Copy']} activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t as ContentType); setResult(null); }} />
                    <Textarea
                        id="ai-topic"
                        label={activeTab === 'Email Template' ? 'Email Goal or Topic' : 'Landing Page Topic'}
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder={activeTab === 'Email Template' ? "e.g., Follow up after a demo" : "e.g., Announce our new Spring promotion for product X"}
                        rows={4}
                    />
                    <Select id="ai-tone" label="Tone of Voice" value={tone} onChange={e => setTone(e.target.value as Tone)}>
                        <option>Professional</option>
                        <option>Friendly</option>
                        <option>Persuasive</option>
                        <option>Informative</option>
                    </Select>
                    <Button onClick={handleGenerate} disabled={isLoading} className="w-full" leftIcon={isLoading ? <Loader size={16} className="animate-spin" /> : <Wand2 size={16} />}>
                        {isLoading ? 'Generating...' : 'Generate Content'}
                    </Button>
                </div>

                {/* Right: Results Panel */}
                <div className="w-full md:w-2/3 p-4 bg-hover-bg rounded-lg">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-text-secondary">
                            <Loader size={24} className="animate-spin mr-2" /> Generating...
                        </div>
                    ) : result ? (
                        <div className="space-y-4">
                            {activeTab === 'Email Template' && result.subject && (
                                <Input id="result-subject" label="Generated Subject" value={result.subject} readOnly />
                            )}
                            <Textarea id="result-body" label={activeTab === 'Email Template' ? 'Generated Body' : 'Generated Content'} value={result.body} readOnly rows={15} />
                            
                            <div className="flex justify-end">
                                {activeTab === 'Email Template' && (
                                    <Button onClick={handleSaveTemplate} disabled={createEmailTemplateMutation.isPending}>
                                        Save as Template
                                    </Button>
                                )}
                                 {activeTab === 'Landing Page Copy' && (
                                    <Button onClick={() => { navigator.clipboard.writeText(result.body); toast.success("Copied to clipboard!"); }}>
                                        Copy Content
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-text-secondary">
                            <p>Your generated content will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default AiContentStudioModal;
