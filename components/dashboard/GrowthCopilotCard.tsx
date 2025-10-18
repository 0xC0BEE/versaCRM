import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse, Type, Content } from '@google/genai';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { Bot, Loader, Send, User as UserIcon, Mic } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { AnyContact, Deal, DealStage, Ticket } from '../../types';
import toast from 'react-hot-toast';
import { copilotTools } from '../../config/copilotTools';
import AiGeneratedChart from './AiGeneratedChart';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

type ChartType = 'list' | 'bar' | 'kpi';

type Message = {
    role: 'user' | 'model';
    text: string;
    chartType?: ChartType;
    chartData?: any[];
};

const GrowthCopilotCard: React.FC = () => {
    const [history, setHistory] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestionsGenerated, setSuggestionsGenerated] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { isLiveCopilotOpen, setIsLiveCopilotOpen, isFeatureEnabled, currentIndustry, industryConfig } = useApp();

    const { contactsQuery, dealsQuery, dealStagesQuery, ticketsQuery, createTaskMutation } = useData();
    const { authenticatedUser } = useAuth();
    
    const {data: contacts = [], isSuccess: contactsSuccess} = contactsQuery;
    const {data: deals = [], isSuccess: dealsSuccess} = dealsQuery;
    const {data: dealStages = []} = dealStagesQuery;
    const {data: tickets = []} = ticketsQuery;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isLoading]);
    
    const generateProactiveSuggestions = useCallback(async () => {
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const dataSnapshot = {
                contacts: (contacts as AnyContact[]).slice(0, 5).map(c => ({ name: c.contactName, status: c.status, leadScore: c.leadScore })),
                deals: (deals as Deal[]).slice(0, 5).map(d => ({ name: d.name, value: d.value, stage: (dealStages as DealStage[]).find(s => s.id === d.stageId)?.name })),
            };

            const basePrompt = `You are a proactive CRM assistant for a ${industryConfig.name} company. The user is a ${industryConfig.teamMemberName}. Analyze this data snapshot. Generate exactly 3 concise, actionable, and diverse questions a ${industryConfig.teamMemberName} might ask about this data. Frame them as if you are suggesting them to the user.`;

            let industrySpecificContext = '';
            if (currentIndustry === 'Health') {
                industrySpecificContext = `Focus on patient appointments, treatment plans, and practitioner schedules.`;
            } else if (currentIndustry === 'Finance') {
                industrySpecificContext = `Focus on client risk profiles, high-value deals, and financial planning.`;
            }

            const prompt = `${basePrompt}\n\n${industrySpecificContext}\n\nData Snapshot: ${JSON.stringify(dataSnapshot)}`;
            
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
            
            if (result.suggestions && result.suggestions.length > 0) {
                 setHistory([{
                    role: 'model',
                    text: "Here are some things you can ask:",
                    chartType: 'list',
                    chartData: result.suggestions.map((s: string) => ({ title: s })),
                }]);
            } else {
                 throw new Error("AI did not return suggestions.");
            }
        } catch (error) {
            console.error("Proactive Suggestion Error:", error);
            setHistory([{ role: 'model', text: "Hello! How can I assist you with your CRM data today? Ask me anything." }]);
        } finally {
            setIsLoading(false);
            setSuggestionsGenerated(true);
        }
    }, [contacts, deals, dealStages, currentIndustry, industryConfig]);

    useEffect(() => {
        if (isFeatureEnabled('aiCopilotProactive') && !suggestionsGenerated && contactsSuccess && dealsSuccess) {
            generateProactiveSuggestions();
        } else if (!suggestionsGenerated && (contactsSuccess || dealsSuccess)) {
            // If feature is disabled but data is ready, show a generic welcome.
            setHistory([{ role: 'model', text: "Hello! How can I help you with your CRM data today? Ask me anything." }]);
            setSuggestionsGenerated(true); // Mark as "done" to prevent re-running.
        }
    }, [suggestionsGenerated, contactsSuccess, dealsSuccess, generateProactiveSuggestions, isFeatureEnabled]);


    const executeTool = useCallback(async (name: string, args: any) => {
        console.log(`[Co-pilot] Executing tool: ${name}`, args);
        switch (name) {
            case 'findContacts': {
                let filteredContacts = [...contacts];
                if (args.status) {
                    filteredContacts = filteredContacts.filter((c: AnyContact) => c.status.toLowerCase() === args.status.toLowerCase());
                }
                if (args.leadSource) {
                    filteredContacts = filteredContacts.filter((c: AnyContact) => c.leadSource.toLowerCase() === args.leadSource.toLowerCase());
                }
                return filteredContacts.map((c: AnyContact) => ({ name: c.contactName, email: c.email, status: c.status }));
            }
            case 'findDeals': {
                let filteredDeals = [...deals];
                if (args.minValue) {
                    filteredDeals = filteredDeals.filter((d: Deal) => d.value >= args.minValue);
                }
                if (args.maxValue) {
                    filteredDeals = filteredDeals.filter((d: Deal) => d.value <= args.maxValue);
                }
                if (args.stageName) {
                    const stageId = (dealStages as DealStage[]).find(s => s.name.toLowerCase() === args.stageName.toLowerCase())?.id;
                    if (stageId) {
                        filteredDeals = filteredDeals.filter((d: Deal) => d.stageId === stageId);
                    }
                }
                return filteredDeals.map((d: Deal) => ({ name: d.name, value: d.value }));
            }
            case 'summarizeTickets': {
                if (args.groupBy === 'priority' || args.groupBy === 'status') {
                    return (tickets as Ticket[]).reduce((acc: Record<string, number>, ticket) => {
                        const key = ticket[args.groupBy as keyof Ticket] as string;
                        acc[key] = (acc[key] || 0) + 1;
                        return acc;
                    }, {});
                }
                return { error: 'Invalid groupBy parameter.' };
            }
            case 'createTask': {
                const contact = (contacts as AnyContact[]).find(c => c.contactName.toLowerCase() === args.contactName.toLowerCase());
                if (!contact) {
                    return { error: `Contact '${args.contactName}' not found.` };
                }
                try {
                    await createTaskMutation.mutateAsync({
                        title: args.title,
                        dueDate: args.dueDate,
                        contactId: contact.id,
                        userId: authenticatedUser!.id,
                        organizationId: authenticatedUser!.organizationId,
                    });
                    return { success: `Task '${args.title}' created successfully for ${contact.contactName}.` };
                } catch (e) {
                    return { error: "Failed to create task in the CRM." };
                }
            }
            default:
                return { error: `Unknown tool: ${name}` };
        }
    }, [contacts, deals, dealStages, tickets, createTaskMutation, authenticatedUser]);


    const handleSend = async (messageToSend?: string) => {
        const currentInput = messageToSend || input;
        if (!currentInput.trim()) return;

        const newUserMessage: Message = { role: 'user', text: currentInput };
        setHistory(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);
        
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
        
        try {
            const systemInstruction = {
                role: 'system',
                parts: [{ text: `You are a helpful CRM assistant. Your goal is to answer user queries by using the provided tools. If a tool returns data, provide a concise, natural language summary of the data and, if appropriate, format the most important information into a chart.
                
                Your response after a successful tool call MUST be a single JSON object with the keys 'summary' (string), 'chartType' ('list', 'bar', or 'kpi'), and 'chartData' (an array of objects formatted for that chart type).
                
                Chart Data Formats:
                - 'list': [{ "title": "string", "subtitle": "string" }]
                - 'bar': [{ "name": "string", "numericValue": "number" }]
                - 'kpi': [{ "title": "string", "textValue": "string" }]
                
                Always use a tool if the user's request matches a tool's description.`}]
            };

            const generateContentRequest = {
                model: 'gemini-2.5-flash',
                contents: [
                    ...history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })),
                    { role: 'user', parts: [{ text: currentInput }] }
                ] as Content[],
                tools: [{ functionDeclarations: copilotTools }],
                systemInstruction,
            };
            
            let response = await ai.models.generateContent(generateContentRequest);

            if (response.functionCalls && response.functionCalls.length > 0) {
                const fc = response.functionCalls[0];
                const toolResult = await executeTool(fc.name, fc.args);
                
                const toolResponseGenerateContentRequest = {
                    ...generateContentRequest,
                    contents: [
                        ...generateContentRequest.contents,
                        { role: 'model', parts: [{ functionCall: fc }] },
                        { role: 'user', parts: [{ functionResponse: { name: fc.name, response: { content: toolResult } } }] }
                    ],
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                summary: { type: Type.STRING },
                                chartType: { type: Type.STRING },
                                chartData: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {} } }
                            }
                        }
                    }
                };

                const secondResponse = await ai.models.generateContent(toolResponseGenerateContentRequest);
                response = secondResponse;
            }

            const text = response.text;
            let aiMessage: Message = { role: 'model', text: text };
            
            try {
                const jsonResponse = JSON.parse(text);
                if (jsonResponse.summary && jsonResponse.chartType && jsonResponse.chartData) {
                    aiMessage = {
                        role: 'model',
                        text: jsonResponse.summary,
                        chartType: jsonResponse.chartType,
                        chartData: jsonResponse.chartData,
                    };
                }
            } catch (e) {}

            setHistory(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("Co-pilot error:", error);
            toast.error("Sorry, I had trouble processing that. Please try rephrasing.");
            setHistory(prev => [...prev, { role: 'model', text: "I'm sorry, an error occurred." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (item: any) => {
        if (item.title) {
            handleSend(item.title);
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
            <CardContent ref={messagesEndRef} className="flex-grow overflow-y-auto pr-2 space-y-4">
                 {history.length === 0 && isLoading && (
                     <div className="flex items-center justify-center h-full text-text-secondary">
                        <Loader size={24} className="animate-spin mr-2" /> Generating suggestions...
                    </div>
                )}
                {history.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-primary" /></div>}
                        <div className={`p-3 rounded-lg max-w-md ${msg.role === 'model' ? 'bg-hover-bg' : 'bg-primary text-white'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            {msg.chartData && <div className="mt-2"><AiGeneratedChart chartType={msg.chartType!} data={msg.chartData} onItemClick={handleSuggestionClick} /></div>}
                        </div>
                         {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0"><UserIcon size={20} className="text-slate-500" /></div>}
                    </div>
                ))}
                {isLoading && history.length > 0 && (
                    <div className="flex items-start gap-3">
                         <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-primary" /></div>
                         <div className="p-3 rounded-lg bg-hover-bg flex items-center gap-2">
                            <Loader size={16} className="animate-spin text-text-secondary"/>
                            <span className="text-sm text-text-secondary">Thinking...</span>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-4">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 w-full">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your data or give a command..."
                        className="flex-grow w-full px-3 py-2 text-sm bg-hover-bg/50 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                    />
                    <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-text-secondary hover:text-primary" onClick={() => setIsLiveCopilotOpen(true)} disabled={isLoading}>
                        <Mic size={20} />
                    </Button>
                    <Button type="submit" size="icon" className="h-10 w-10" disabled={isLoading || !input.trim()}>
                        <Send size={16} />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
};

export default GrowthCopilotCard;