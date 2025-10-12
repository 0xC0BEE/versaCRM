
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { Bot, Loader, Send, User as UserIcon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import AiGeneratedChart from './AiGeneratedChart';

interface Message {
    sender: 'user' | 'ai';
    content: string | AiResponse;
}

interface AiResponse {
    insight: string;
    chartType: 'list' | 'bar' | 'kpi';
    data: any[];
}

const suggestionPrompts = [
    "Which of my deals are at risk this month?",
    "Show me my most engaged new leads from the last 7 days.",
    "What's the main reason customers are creating support tickets?",
];

const GrowthCopilotCard: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { contactsQuery, dealsQuery, ticketsQuery } = useData();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (prompt?: string) => {
        const query = prompt || input;
        if (!query.trim()) return;

        const userMessage: Message = { sender: 'user', content: query };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

            // Prepare a concise data context
            const context = {
                contacts: (contactsQuery.data || []).slice(0, 10).map((c: any) => ({ name: c.contactName, status: c.status, leadSource: c.leadSource, createdAt: c.createdAt })),
                deals: (dealsQuery.data || []).slice(0, 10).map((d: any) => ({ name: d.name, value: d.value, stageId: d.stageId, expectedCloseDate: d.expectedCloseDate })),
                tickets: (ticketsQuery.data || []).slice(0, 10).map((t: any) => ({ subject: t.subject, status: t.status, priority: t.priority })),
            };

            const fullPrompt = `You are a helpful CRM Growth Co-pilot. Analyze the user's query based on the provided CRM data snapshot.

User Query: "${query}"

CRM Data Snapshot:
${JSON.stringify(context, null, 2)}

Your response MUST be a valid JSON object matching the specified schema.
- 'insight': A brief, natural language summary of the findings.
- 'chartType': The best chart type to visualize the data: 'bar', 'list', or 'kpi'.
- 'data': An array of objects for the chart, with properties varying by chartType:
    - For 'bar': Use 'name' (string) and 'numericValue' (number).
    - For 'list': Use 'title' (string) and 'subtitle' (string).
    - For 'kpi': Use 'title' (string) and 'textValue' (string) in a single-element array.
`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            insight: { type: Type.STRING },
                            chartType: { type: Type.STRING },
                            data: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING, nullable: true },
                                        subtitle: { type: Type.STRING, nullable: true },
                                        name: { type: Type.STRING, nullable: true },
                                        numericValue: { type: Type.NUMBER, nullable: true },
                                        textValue: { type: Type.STRING, nullable: true },
                                    }
                                }
                            },
                        },
                        required: ['insight', 'chartType', 'data'],
                    },
                },
            });
            
            const aiResponse: AiResponse = JSON.parse(response.text);
            const aiMessage: Message = { sender: 'ai', content: aiResponse };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("Growth Co-pilot Error:", error);
            toast.error("Sorry, I had trouble processing that request. Please try again.");
            // Add an error message to the chat
            const errorMessage: Message = { sender: 'ai', content: { insight: "I'm sorry, I encountered an error. Please try rephrasing your question.", chartType: 'list', data: [] } };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Bot size={20} className="mr-2 text-primary" />
                    Growth Co-pilot
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col overflow-hidden p-2 pt-0">
                <div className="flex-grow space-y-4 overflow-y-auto p-2">
                    {messages.length === 0 && (
                         <div className="text-center text-sm text-text-secondary pt-8">
                            <p className="mb-4">Ask me anything about your CRM data.</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {suggestionPrompts.map((prompt, i) => (
                                    <Button key={i} variant="outline" size="sm" onClick={() => handleSend(prompt)}>
                                        {prompt}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && (
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Bot size={20} className="text-primary" />
                                </div>
                            )}
                             <div className={`p-3 rounded-lg max-w-full ${msg.sender === 'ai' ? 'bg-hover-bg' : 'bg-primary text-white'}`}>
                                {typeof msg.content === 'string' ? (
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-sm whitespace-pre-wrap">{msg.content.insight}</p>
                                        <AiGeneratedChart chartType={msg.content.chartType} data={msg.content.data} />
                                    </div>
                                )}
                            </div>
                             {msg.sender === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                    <UserIcon size={20} className="text-slate-500" />
                                </div>
                            )}
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
                    <div ref={messagesEndRef} />
                </div>
            </CardContent>
            <CardFooter className="p-2 pt-2 border-t border-border-subtle">
                 <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 w-full">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about your deals, contacts, or tickets..."
                        className="flex-grow w-full px-3 py-2 text-sm bg-hover-bg/50 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="md" disabled={isLoading || !input.trim()}>
                        <Send size={16} />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
};

export default GrowthCopilotCard;
