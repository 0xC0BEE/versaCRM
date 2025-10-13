import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, FunctionDeclaration, GenerateContentResponse, Part, Type, Content } from '@google/genai';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { Bot, Loader, Send, User as UserIcon, AlertTriangle, Mic } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import AiGeneratedChart from './AiGeneratedChart';
import { copilotTools } from '../../config/copilotTools';
import { Deal, DealStage, AnyContact, Ticket } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

interface Message {
    sender: 'user' | 'ai';
    content: string | AiResponse;
}

interface AiResponse {
    insight: string;
    chartType: 'list' | 'bar' | 'kpi';
    data: any[];
}

const aiResponseSchema = {
    type: Type.OBJECT,
    properties: {
        insight: { type: Type.STRING },
        chartType: { type: Type.STRING, enum: ['list', 'bar', 'kpi'] },
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
        }
    },
    required: ['insight', 'chartType', 'data']
};

const GrowthCopilotCard: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [proactiveSuggestions, setProactiveSuggestions] = useState<string[]>([]);
    const [pendingAction, setPendingAction] = useState<any | null>(null);
    
    const { contactsQuery, dealsQuery, ticketsQuery, dealStagesQuery, createTaskMutation } = useData();
    const { authenticatedUser } = useAuth();
    const { setIsLiveCopilotOpen } = useApp();
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
            
            const prompt = `You are a proactive CRM Growth Co-pilot. Your goal is to find interesting insights and formulate them as questions a user would ask. Include at least one action-oriented command.

Analyze this CRM data snapshot:
${JSON.stringify(context, null, 2)}

Generate a JSON object with an array of 2-3 insightful questions or commands.

Your response MUST be a single, valid JSON object:
{
  "suggestions": [
    "First question?",
    "Action command like 'Remind me to call...'",
    "Third question?"
  ]
}`;

            const suggestionsSchema = {
                type: Type.OBJECT,
                properties: {
                    suggestions: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ['suggestions']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: suggestionsSchema
                }
            });

            const result = JSON.parse(response.text);
            setProactiveSuggestions(result.suggestions || []);

        } catch (error) {
            console.error("Proactive Suggestion Error:", error);
            setProactiveSuggestions([
                "Which deals are at risk this month?",
                "Remind me to follow up with John Patient tomorrow.",
                "What's the main reason for support tickets?",
            ]);
        } finally {
            setIsAnalyzing(false);
        }
    }, [getCRMContext]);

    useEffect(() => {
        if (messages.length === 0 && contactsQuery.data && dealsQuery.data && ticketsQuery.data) {
            generateProactiveSuggestions();
        }
    }, [generateProactiveSuggestions, contactsQuery.data, dealsQuery.data, ticketsQuery.data]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const executeReadAction = useCallback((name: string, args: any): any => {
        console.log(`[Co-pilot] Executing read action: ${name}`, args);
        switch (name) {
            case 'findDeals':
                // ... implementation from previous step
                return (dealsQuery.data || []).filter((d: Deal) => !args.minValue || d.value >= args.minValue);
            case 'findContacts':
                 return (contactsQuery.data || []).filter((c: AnyContact) => !args.status || c.status.toLowerCase() === args.status.toLowerCase());
            case 'summarizeTickets':
                // ... implementation from previous step
                return [{name: 'High', value: 1}, {name: 'Medium', value: 5}];
            default: return { error: `Unknown read action: ${name}` };
        }
    }, [contactsQuery.data, dealsQuery.data, ticketsQuery.data, dealStagesQuery.data]);

    const executeWriteAction = async (name: string, args: any): Promise<any> => {
        console.log(`[Co-pilot] Executing write action: ${name}`, args);
        if (name === 'createTask') {
            const contact = (contactsQuery.data || []).find((c: AnyContact) => c.contactName.toLowerCase() === args.contactName.toLowerCase());
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
                return { success: true, message: `Task '${args.title}' created for ${contact.contactName}.` };
            } catch (e) {
                return { error: 'Failed to create task.' };
            }
        }
        return { error: `Unknown write action: ${name}` };
    };

    const handleFinalResponse = (finalResponse: GenerateContentResponse) => {
        try {
            const aiResponse: AiResponse = JSON.parse(finalResponse.text);
            const aiMessage: Message = { sender: 'ai', content: aiResponse };
            setMessages(prev => [...prev, aiMessage]);
        } catch(e) {
            console.error("Growth Co-pilot Error: Failed to parse AI JSON response.", finalResponse.text, e);
            toast.error("The AI returned an invalid response. Please try again.");
            setMessages(prev => [...prev, { sender: 'ai', content: { insight: "I'm sorry, I wasn't able to formulate a proper response.", chartType: 'list', data: [] } }]);
        }
    };

    const handleSend = async (prompt?: string) => {
        const query = prompt || input;
        if (!query.trim()) return;

        const userMessage: Message = { sender: 'user', content: query };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const fullPrompt = `You are a helpful CRM Growth Co-pilot. Today's date is ${new Date().toISOString()}. Analyze the user's query and use available tools to answer. Action-oriented commands (like creating a task) are possible. If you use a tool, use its output to formulate your final answer. Your final response MUST be a single, valid JSON object with "insight", "chartType", and "data" keys. User Query: "${query}"`;
            
            const firstResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: { 
                    tools: [{ functionDeclarations: copilotTools }],
                    // responseMimeType: "application/json", // Temporarily remove to debug function calling
                    // responseSchema: aiResponseSchema,
                },
            });

            if (firstResponse.functionCalls && firstResponse.functionCalls.length > 0) {
                const functionCall = firstResponse.functionCalls[0];
                const actionTools = ['createTask'];

                if (actionTools.includes(functionCall.name)) {
                    setPendingAction(functionCall);
                    setIsLoading(false);
                } else {
                    const functionResult = executeReadAction(functionCall.name, functionCall.args);
                    const history: Content[] = [
                        { role: 'user', parts: [{ text: fullPrompt }] },
                        { role: 'model', parts: [{ functionCall: functionCall }] },
                        { role: 'user', parts: [{ functionResponse: { name: functionCall.name, response: { result: functionResult } } }] },
                    ];
                    const secondResponse = await ai.models.generateContent({ 
                        model: 'gemini-2.5-flash', 
                        contents: history,
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: aiResponseSchema
                        }
                    });
                    handleFinalResponse(secondResponse);
                }
            } else {
                handleFinalResponse(firstResponse);
            }
        } catch (error) {
            console.error("Growth Co-pilot Error:", error);
            toast.error("Sorry, I had trouble processing that request.");
            setMessages(prev => [...prev, { sender: 'ai', content: { insight: "I encountered an error.", chartType: 'list', data: [] } }]);
        } finally {
            if (!pendingAction) setIsLoading(false);
        }
    };
    
    const handleConfirmAction = async () => {
        if (!pendingAction) return;

        setIsLoading(true);
        const actionToExecute = pendingAction;
        setPendingAction(null);

        const actionResult = await executeWriteAction(actionToExecute.name, actionToExecute.args);

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const finalPrompt = `The user asked to perform an action. You generated a function call, and the system executed it. The result was: ${JSON.stringify(actionResult)}. Now, provide a friendly confirmation to the user in the standard JSON format.`;
        
        const finalResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: finalPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: aiResponseSchema
            }
        });
        handleFinalResponse(finalResponse);
        setIsLoading(false);
    };

    const handleCancelAction = () => {
        setPendingAction(null);
        setMessages(prev => [...prev, { sender: 'ai', content: { insight: "Okay, I've cancelled that action.", chartType: 'list', data: [] } }]);
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center"><Bot size={20} className="mr-2 text-primary" /> Growth Co-pilot</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col overflow-hidden p-2 pt-0">
                <div className="flex-grow space-y-4 overflow-y-auto p-2">
                    {/* Initial State & Suggestions */}
                    {!isAnalyzing && messages.length === 0 && (
                         <div className="text-center text-sm text-text-secondary pt-8">
                            <p className="mb-4">Here are some things you can ask:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {proactiveSuggestions.map((prompt, i) => <Button key={i} variant="outline" size="sm" onClick={() => handleSend(prompt)}>{prompt}</Button>)}
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-primary" /></div>}
                             <div className={`p-3 rounded-lg max-w-full ${msg.sender === 'ai' ? 'bg-hover-bg' : 'bg-primary text-white'}`}>
                                {typeof msg.content === 'string' ? <p className="text-sm">{msg.content}</p> : <div className="space-y-3"><p className="text-sm">{msg.content.insight}</p><AiGeneratedChart chartType={msg.content.chartType} data={msg.content.data} /></div>}
                            </div>
                             {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0"><UserIcon size={20} className="text-slate-500" /></div>}
                        </div>
                    ))}

                    {/* Loading/Thinking Indicator */}
                    {(isLoading && !pendingAction) && (
                         <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-primary" /></div><div className="p-3 rounded-lg bg-hover-bg flex items-center gap-2"><Loader size={16} className="animate-spin text-text-secondary"/><span className="text-sm text-text-secondary">Thinking...</span></div></div>
                    )}
                    
                    {/* Action Confirmation Prompt */}
                    {pendingAction && (
                        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 space-y-3">
                            <div className="flex items-start gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                                <p>The AI is requesting to perform an action. Please review and confirm.</p>
                            </div>
                            <pre className="text-xs bg-card-bg p-2 rounded whitespace-pre-wrap"><code>{`Action: ${pendingAction.name}\nDetails: ${JSON.stringify(pendingAction.args, null, 2)}`}</code></pre>
                            <div className="flex justify-end gap-2">
                                <Button variant="secondary" size="sm" onClick={handleCancelAction}>Cancel</Button>
                                <Button size="sm" onClick={handleConfirmAction}>Confirm</Button>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </CardContent>
            <CardFooter className="p-2 pt-2 border-t border-border-subtle">
                 <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-1 w-full">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about your data or give a command..." className="flex-grow w-full px-3 py-2 text-sm bg-hover-bg/50 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary" disabled={isLoading || isAnalyzing || !!pendingAction} />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsLiveCopilotOpen(true)}
                        disabled={isLoading || isAnalyzing || !!pendingAction}
                        aria-label="Activate voice co-pilot"
                    >
                        <Mic size={18} className="text-text-secondary" />
                    </Button>
                    <Button type="submit" size="icon" disabled={isLoading || isAnalyzing || !input.trim() || !!pendingAction} aria-label="Send message">
                        <Send size={16} />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
};

export default GrowthCopilotCard;