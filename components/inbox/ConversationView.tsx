import React, { useState, useRef, useEffect } from 'react';
import { Conversation, CannedResponse } from '../../types';
import { format } from 'date-fns';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import { Send, ClipboardList, Wand2, Loader, Mail, Linkedin, Twitter } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { replacePlaceholders } from '../../utils/textUtils';
import { GoogleGenAI, Type } from '@google/genai';
import { useApp } from '../../contexts/AppContext';

interface ConversationViewProps {
    conversation: Conversation;
    userMap: Map<string, { name: string, email: string }>;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversation, userMap }) => {
    const [reply, setReply] = useState('');
    const [showCanned, setShowCanned] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
    
    const { sendEmailReplyMutation, cannedResponsesQuery } = useData();
    const { data: cannedResponses = [] } = cannedResponsesQuery;
    const { authenticatedUser } = useAuth();
    const { isFeatureEnabled } = useApp();
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

    // Clear suggestions when conversation changes
    useEffect(() => {
        setSuggestions([]);
        setReply('');
    }, [conversation.id]);

    const handleSelectCanned = (response: CannedResponse) => {
        const contact = conversation.participants.find(p => p.id === conversation.contactId);
        let processedBody = response.body;
        if (contact) {
            processedBody = replacePlaceholders(processedBody, { contact: { contactName: contact.name } }, { userName: authenticatedUser?.name });
        }
        setReply(processedBody);
        setShowCanned(false);
    };

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim()) return;

        sendEmailReplyMutation.mutate({
            contactId: conversation.contactId,
            userId: authenticatedUser!.id,
            subject: conversation.subject,
            body: reply,
        }, {
            onSuccess: () => {
                toast.success('Reply sent!');
                setReply('');
                setSuggestions([]);
            }
        });
    };
    
    const handleGenerateSuggestions = async () => {
        setIsGeneratingSuggestions(true);
        setSuggestions([]);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const conversationContext = conversation.messages
                .slice(-3) // Get last 3 messages
                .map(msg => {
                    const sender = userMap.get(msg.senderId);
                    return `${sender?.name || 'Unknown'}: ${msg.body.split('\n\n')[1] || msg.body}`;
                })
                .join('\n---\n');

            const prompt = `You are an AI assistant helping a user reply to an email. The conversation subject is "${conversation.subject}".
            The user you are assisting is "${authenticatedUser?.name}".
            Here is the recent conversation history:
            ${conversationContext}

            Based on the last message, generate 3 concise, distinct, and professional reply suggestions.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            suggestions: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        }
                    }
                }
            });

            const result = JSON.parse(response.text);
            if (result.suggestions && Array.isArray(result.suggestions)) {
                setSuggestions(result.suggestions.slice(0, 3));
            } else {
                throw new Error("Invalid response format from AI.");
            }

        } catch (error) {
            console.error("AI Suggestion Error:", error);
            toast.error("Failed to generate AI suggestions.");
        } finally {
            setIsGeneratingSuggestions(false);
        }
    };

    const getChannelIcon = (channel: 'Email' | 'LinkedIn' | 'X') => {
        switch(channel) {
            case 'LinkedIn': return <Linkedin size={16} className="text-blue-500" />;
            case 'X': return <Twitter size={16} className="text-sky-500" />;
            default: return <Mail size={16} className="text-gray-400" />;
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border-subtle flex-shrink-0">
                <h2 className="font-semibold text-lg">{conversation.subject}</h2>
                <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
                    {getChannelIcon(conversation.channel)}
                    <span>Conversation via {conversation.channel} with {conversation.participants.map(p => p.name).join(', ')}</span>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-6">
                {conversation.messages.map(message => {
                    const sender = userMap.get(message.senderId);
                    return (
                        <div key={message.id} className="border border-border-subtle rounded-lg">
                            <div className="bg-hover-bg/50 p-2 text-xs text-text-secondary border-b border-border-subtle flex justify-between">
                                <div><strong>From:</strong> {sender?.name || 'Unknown'} &lt;{sender?.email || '...'} &gt;</div>
                                <div>{format(new Date(message.timestamp), 'PPpp')}</div>
                            </div>
                            <div className="p-4 text-sm whitespace-pre-wrap">
                                {message.body}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex-shrink-0 p-4 border-t border-border-subtle">
                <form onSubmit={handleSendReply}>
                    {suggestions.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                            {suggestions.map((suggestion, index) => (
                                <Button
                                    key={index}
                                    size="sm"
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                        setReply(suggestion);
                                        setSuggestions([]);
                                    }}
                                >
                                    {suggestion}
                                </Button>
                            ))}
                        </div>
                    )}
                    <Textarea
                        id="reply-box"
                        label="Your Reply"
                        rows={4}
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        disabled={sendEmailReplyMutation.isPending}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2">
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
                             {isFeatureEnabled('aiReplySuggestions') && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    type="button"
                                    onClick={handleGenerateSuggestions}
                                    leftIcon={isGeneratingSuggestions ? <Loader size={16} className="animate-spin" /> : <Wand2 size={16}/>}
                                    disabled={isGeneratingSuggestions}
                                >
                                    AI Suggestions
                                </Button>
                            )}
                        </div>
                        <Button
                            leftIcon={<Send size={16}/>}
                            type="submit"
                            disabled={!reply.trim() || sendEmailReplyMutation.isPending}
                        >
                            {sendEmailReplyMutation.isPending ? 'Sending...' : 'Send Reply'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConversationView;