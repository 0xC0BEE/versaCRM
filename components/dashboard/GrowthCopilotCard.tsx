import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, FunctionDeclaration, GenerateContentResponse, Part, Type, Content } from '@google/genai';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { Bot, Loader, Send, User as UserIcon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import AiGeneratedChart from './AiGeneratedChart';
import { copilotTools } from '../../config/copilotTools';
import { Deal, DealStage, AnyContact, Ticket } from '../../types';

interface Message {
    sender: 'user' | 'ai';
    content: string | AiResponse;
}

interface AiResponse {
    insight: string;
    chartType: 'list' | 'bar' | 'kpi';
    data: any[];
}

const GrowthCopilotCard: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [proactiveSuggestions, setProactiveSuggestions] = useState<string[]>([]);
    
    const { contactsQuery, dealsQuery, ticketsQuery, dealStagesQuery } = useData();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const getCRMContext = useCallback(() => {
        return {
            contacts: (contactsQuery.data || []).slice(0, 10).map((c: any) => ({ name: c.contactName, status: c.status, leadSource: c.leadSource, createdAt: c.createdAt })),
            deals: (dealsQuery.data || []).slice(0, 10).map((d: any) => ({ name: d.name, value: d.value, stageId: d.stageId, expectedCloseDate: d.expectedCloseDate })),
            tickets: (ticketsQuery.data || []).slice(0, 10).map((t: any) => ({ subject: t.subject, status: t.status, priority: t.priority })),
        };
    }, [contactsQuery.data, dealsQuery.data, ticketsQuery.data]);


    const generateProactiveSuggestions = useCallback(async () => {
        setIsAnalyzing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const context = getCRMContext();
            
            const prompt = `You are a proactive CRM Growth Co-pilot. Your goal is to find the most interesting or urgent insights from a snapshot of CRM data and formulate them as questions a user would ask.

Analyze the following CRM data snapshot:
${JSON.stringify(context, null, 2)}

Based on your analysis, generate a JSON object containing an array of 2 to 3 insightful questions. These questions should be actionable and relevant to a business owner or sales manager.

Your response MUST be a single, valid JSON object and nothing else. Do not wrap it in markdown. The JSON object must have the following structure:
{
  "suggestions": [
    "First suggested question?",
    "Second suggested question?",
    "Third suggested question?"
  ]
}`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            let jsonStr = response.text.trim();
            if (jsonStr.startsWith('```json')) {
                jsonStr = jsonStr.slice(7, -3);
            } else if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.slice(3, -3);
            }
            
            const result = JSON.parse(jsonStr);
            setProactiveSuggestions(result.suggestions || []);

        } catch (error) {
            console.error("Proactive Suggestion Error:", error);
            // Fallback to static suggestions on error
            setProactiveSuggestions([
                "Which deals are at risk this month?",
                "Show me my most engaged new leads.",
                "What's the main reason for support tickets?",
            ]);
        } finally {
            setIsAnalyzing(false);
        }
    }, [getCRMContext]);

    useEffect(() => {
        // Only run on initial load when there are no messages
        if (messages.length === 0 && contactsQuery.data && dealsQuery.data && ticketsQuery.data) {
            generateProactiveSuggestions();
        }
    }, [generateProactiveSuggestions, contactsQuery.data, dealsQuery.data, ticketsQuery.data]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const executeFunctionCall = useCallback((name: string, args: any): any => {
        console.log(`[Co-pilot] Executing function: ${name}`, args);

        switch (name) {
            case 'findDeals': {
                let filteredDeals = dealsQuery.data || [];
                if (args.minValue) {
                    filteredDeals = filteredDeals.filter((d: Deal) => d.value >= args.minValue);
                }
                if (args.maxValue) {
                    filteredDeals = filteredDeals.filter((d: Deal) => d.value <= args.maxValue);
                }
                if (args.stageName) {
                    const stage = (dealStagesQuery.data || []).find((s: DealStage) => s.name.toLowerCase() === args.stageName.toLowerCase());
                    if (stage) {
                        filteredDeals = filteredDeals.filter((d: Deal) => d.stageId === stage.id);
                    }
                }
                return filteredDeals.map((d: Deal) => ({ name: d.name, value: d.value, stageId: d.stageId }));
            }
            case 'findContacts': {
                let filteredContacts = contactsQuery.data || [];
                if (args.status) {
                    filteredContacts = filteredContacts.filter((c: AnyContact) => c.status.toLowerCase() === args.status.toLowerCase());
                }
                if (args.leadSource) {
                    filteredContacts = filteredContacts.filter((c: AnyContact) => c.leadSource.toLowerCase() === args.leadSource.toLowerCase());
                }
                return filteredContacts.map((c: AnyContact) => ({ name: c.contactName, email: c.email, status: c.status, leadSource: c.leadSource }));
            }
            case 'summarizeTickets': {
                 let tickets = ticketsQuery.data || [];
                 if (args.groupBy === 'priority') {
                     const summary = tickets.reduce((acc: any, ticket: Ticket) => {
                         acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
                         return acc;
                     }, {});
                     return Object.entries(summary).map(([name, value]) => ({ name, value }));
                 }
                 if (args.groupBy === 'status') {
                     const summary = tickets.reduce((acc: any, ticket: Ticket) => {
                         acc[ticket.status] = (acc[ticket.status] || 0) + 1;
                         return acc;
                     }, {});
                     return Object.entries(summary).map(([name, value]) => ({ name, value }));
                 }
                 return { error: `Unsupported groupBy value: ${args.groupBy}` };
            }
            default:
                return { error: `Unknown function: ${name}` };
        }
    }, [contactsQuery.data, dealsQuery.data, ticketsQuery.data, dealStagesQuery.data]);


    const handleSend = async (prompt?: string) => {
        const query = prompt || input;
        if (!query.trim()) return;

        const userMessage: Message = { sender: 'user', content: query };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

            const fullPrompt = `You are a helpful CRM Growth Co-pilot. Analyze the user's query. Use the available tools to find the necessary information to answer the question. If you have the information from a tool call, or if you don't need tools, your final response MUST be a single, valid JSON object and nothing else. Do not wrap it in markdown. The JSON object must have the following structure:
{
  "insight": "A brief, natural language summary of the findings.",
  "chartType": "The best chart type: 'bar', 'list', or 'kpi'.",
  "data": [
    // An array of objects for the chart.
    // For 'bar' charts, each object should have 'name' (string) and 'numericValue' (number).
    // For 'list' charts, each object should have 'title' (string) and 'subtitle' (string).
    // For 'kpi' charts, it should be a single object with 'title' (string) and 'textValue' (string).
  ]
}

User Query: "${query}"
`;
            
            const firstResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    tools: [{ functionDeclarations: copilotTools }],
                },
            });

            const handleFinalResponse = (finalResponse: GenerateContentResponse) => {
                 let jsonStr = finalResponse.text.trim();
                if (jsonStr.startsWith('```json')) {
                    jsonStr = jsonStr.slice(7, -3);
                } else if (jsonStr.startsWith('```')) {
                    jsonStr = jsonStr.slice(3, -3);
                }
                const aiResponse: AiResponse = JSON.parse(jsonStr);
                const aiMessage: Message = { sender: 'ai', content: aiResponse };
                setMessages(prev => [...prev, aiMessage]);
            };

            if (firstResponse.functionCalls && firstResponse.functionCalls.length > 0) {
                const functionCall = firstResponse.functionCalls[0];
                const functionResult = executeFunctionCall(functionCall.name, functionCall.args);
                
                const history: Content[] = [
                    { role: 'user', parts: [{ text: fullPrompt }] },
                    { role: 'model', parts: [{ functionCall: functionCall }] },
                    { role: 'user', parts: [{ functionResponse: { name: functionCall.name, response: { result: functionResult } } }] },
                ];

                const secondResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: history,
                });
                handleFinalResponse(secondResponse);
            } else {
                handleFinalResponse(firstResponse);
            }

        } catch (error) {
            console.error("Growth Co-pilot Error:", error);
            toast.error("Sorry, I had trouble processing that request. Please try again.");
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
                    {isAnalyzing && (
                        <div className="text-center text-sm text-text-secondary pt-8 flex items-center justify-center">
                            <Loader size={16} className="animate-spin inline-block mr-2"/>
                            Co-pilot is analyzing your data...
                        </div>
                    )}

                    {!isAnalyzing && messages.length === 0 && (
                         <div className="text-center text-sm text-text-secondary pt-8">
                            <p className="mb-4">Here are some things you can ask:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {proactiveSuggestions.map((prompt, i) => (
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
                        disabled={isLoading || isAnalyzing}
                    />
                    <Button type="submit" size="md" disabled={isLoading || isAnalyzing || !input.trim()}>
                        <Send size={16} />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
};

export default GrowthCopilotCard;