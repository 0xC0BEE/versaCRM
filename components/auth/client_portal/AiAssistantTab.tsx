


import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { AnyContact } from '../../../types';
import { GoogleGenAI, Type } from '@google/genai';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Bot, Loader, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const AiAssistantTab: React.FC = () => {
    const { authenticatedUser } = useAuth();
    const contactId = authenticatedUser?.contactId;
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { data: contact } = useQuery<AnyContact | null, Error>({
        queryKey: ['contactProfile', contactId],
        queryFn: () => apiClient.getContactById(contactId!),
        enabled: !!contactId,
    });
    
    useEffect(() => {
        if (contact && messages.length === 0) {
            setMessages([{ sender: 'ai', text: `Hi ${contact.contactName}! How can I help you today? You can ask about your appointments, orders, or tickets.` }]);
        }
    }, [contact, messages.length]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !contact) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // FIX: Initialize GoogleGenAI with named apiKey parameter
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const ticketsForContact = (await apiClient.getTickets(contact.organizationId)).filter(t => t.contactId === contact.id);

            const contextSummary = {
                name: contact.contactName,
                status: contact.status,
                interactions: (contact.interactions || []).map(i => ({ type: i.type, date: i.date })),
                orders: (contact.orders || []).map(o => ({ status: o.status, total: o.total, date: o.orderDate })),
                tickets: ticketsForContact.map(t => ({ subject: t.subject, status: t.status })),
            };

            const prompt = `You are a helpful AI assistant for a client portal. The client's name is ${contact.contactName}.
            Here is their data: ${JSON.stringify(contextSummary, null, 2)}.
            Answer the client's question based *only* on this data. Be friendly and concise.
            Client's question: "${input}"`;

            // FIX: Use ai.models.generateContent and await the response text property
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            // FIX: Access response text via .text property
            const aiMessage: Message = { sender: 'ai', text: response.text };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("AI Assistant Error:", error);
            toast.error("Sorry, I had trouble processing that. Please try again.");
            const errorMessage: Message = { sender: 'ai', text: "I'm sorry, I'm having trouble connecting right now." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">AI Assistant</h3>
            <div className="border border-border-subtle rounded-lg h-[60vh] flex flex-col">
                <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && (
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Bot size={20} className="text-primary" />
                                </div>
                            )}
                            <div className={`p-3 rounded-lg max-w-md ${msg.sender === 'ai' ? 'bg-hover-bg' : 'bg-primary text-white'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Bot size={20} className="text-primary" />
                            </div>
                            <div className="p-3 rounded-lg bg-hover-bg flex items-center gap-2">
                                <Loader size={16} className="animate-spin text-text-secondary"/>
                                <span className="text-sm text-text-secondary">Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-border-subtle">
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                        <Input 
                            id="ai-input" 
                            label="" 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask me anything about your account..."
                            className="flex-grow"
                            disabled={isLoading}
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()} leftIcon={<Send size={16}/>}>
                            Send
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AiAssistantTab;
