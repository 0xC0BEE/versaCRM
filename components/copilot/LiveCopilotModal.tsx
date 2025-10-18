import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, LiveSession, Content } from '@google/genai';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Mic, MicOff, PhoneOff, Bot, User as UserIcon } from 'lucide-react';
import { encode, decode, decodeAudioData } from '../../utils/audioUtils';
import { copilotTools } from '../../config/copilotTools';
import toast from 'react-hot-toast';
import { AnyContact, Deal, DealStage, Ticket } from '../../types';
import AiGeneratedChart from '../dashboard/AiGeneratedChart';

type ChartType = 'list' | 'bar' | 'kpi';

type Message = {
    role: 'user' | 'model';
    text: string;
    chartType?: ChartType;
    chartData?: any[];
};


const LiveCopilotModal: React.FC = () => {
    const { isLiveCopilotOpen, setIsLiveCopilotOpen } = useApp();
    const { createTaskMutation, contactsQuery, dealsQuery, dealStagesQuery, ticketsQuery } = useData();
    const { authenticatedUser } = useAuth();
    
    const [history, setHistory] = useState<Message[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [currentOutput, setCurrentOutput] = useState('');
    const [isListening, setIsListening] = useState(false);

    const { data: contacts = [] } = contactsQuery;
    const { data: deals = [] } = dealsQuery;
    const { data: dealStages = [] } = dealStagesQuery;
    const { data: tickets = [] } = ticketsQuery;

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTimeRef = useRef(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, currentInput, currentOutput]);

    const cleanup = useCallback(() => {
        setIsListening(false);
        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close().catch(console.error);
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            sourcesRef.current.forEach(source => {
                try { source.stop(); } catch (e) {}
            });
            sourcesRef.current.clear();
            outputAudioContextRef.current.close().catch(console.error);
            outputAudioContextRef.current = null;
        }
        
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close()).catch(console.error);
            sessionPromiseRef.current = null;
        }
        
        setHistory([]);
        setCurrentInput('');
        setCurrentOutput('');
    }, []);

    const handleClose = () => {
        cleanup();
        setIsLiveCopilotOpen(false);
    };

    useEffect(() => {
        if (isLiveCopilotOpen) {
            startSession();
        } else {
            cleanup();
        }
        return () => cleanup();
    }, [isLiveCopilotOpen]);
    
    const executeTool = useCallback(async (name: string, args: any) => {
        console.log(`[Co-pilot] Executing tool: ${name}`, args);
        switch (name) {
            case 'findContacts': {
                let filteredContacts = [...contacts];
                if (args.status) filteredContacts = filteredContacts.filter((c: AnyContact) => c.status.toLowerCase() === args.status.toLowerCase());
                if (args.leadSource) filteredContacts = filteredContacts.filter((c: AnyContact) => c.leadSource.toLowerCase() === args.leadSource.toLowerCase());
                return filteredContacts.map((c: AnyContact) => ({ name: c.contactName, email: c.email, status: c.status }));
            }
            case 'findDeals': {
                let filteredDeals = [...deals];
                if (args.minValue) filteredDeals = filteredDeals.filter((d: Deal) => d.value >= args.minValue);
                if (args.maxValue) filteredDeals = filteredDeals.filter((d: Deal) => d.value <= args.maxValue);
                if (args.stageName) {
                    const stageId = (dealStages as DealStage[]).find(s => s.name.toLowerCase() === args.stageName.toLowerCase())?.id;
                    if (stageId) filteredDeals = filteredDeals.filter((d: Deal) => d.stageId === stageId);
                }
                return filteredDeals.map((d: Deal) => ({ name: d.name, value: d.value, stage: (dealStages as DealStage[]).find(s => s.id === d.stageId)?.name }));
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
                // Simplified contact matching for demo
                const contact = (contacts as AnyContact[]).find(c => c.contactName.toLowerCase().includes(args.contactName.toLowerCase()));
                if (!contact) return { error: `Contact '${args.contactName}' not found.` };
                try {
                    await createTaskMutation.mutateAsync({
                        title: args.title, dueDate: args.dueDate, contactId: contact.id,
                        userId: authenticatedUser!.id, organizationId: authenticatedUser!.organizationId,
                    });
                    return { success: `Task '${args.title}' created successfully for ${contact.contactName}.` };
                } catch (e) { return { error: "Failed to create task." }; }
            }
            default: return { error: `Unknown tool: ${name}` };
        }
    }, [contacts, deals, dealStages, tickets, createTaskMutation, authenticatedUser]);


    const startSession = async () => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const systemInstruction = `You are a helpful and friendly CRM assistant named Versa. Today's date is ${new Date().toISOString()}. Be concise.
Your goal is to answer user queries by using the provided tools.
When a tool call is successful and returns data to be shown to the user, your final response (both text and audio) MUST be a single valid JSON object with 'summary', 'chartType', and 'chartData' keys.
- 'summary': A concise, natural language summary of the tool's findings. This is what you will speak.
- 'chartType': 'list', 'bar', or 'kpi'.
- 'chartData': An array of objects formatted for that chart type.

Chart Data Formats:
- 'list': [{ "title": "string", "subtitle": "string" }]
- 'bar': [{ "name": "string", "numericValue": "number" }]
- 'kpi': [{ "title": "string", "textValue": "string" }]

If the user's request is a command (like creating a task) that doesn't return data to visualize, just provide a simple confirmation message as plain text.
If the user's request is conversational and doesn't require a tool, just respond naturally with plain text.`;

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {}, outputAudioTranscription: {},
                    tools: [{ functionDeclarations: copilotTools }],
                    systemInstruction,
                },
                callbacks: {
                    onopen: async () => {
                        setIsListening(true);
                        setHistory([{ role: 'model', text: 'Hello! How can I help?' }]);
                        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                        inputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 16000 });
                        outputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 24000 });
                        const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (audioEvent) => {
                            const inputData = audioEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent) {
                            if (message.serverContent.inputTranscription) setCurrentInput(prev => prev + message.serverContent.inputTranscription.text);
                            
                            if (message.serverContent.outputTranscription) {
                                // Accumulate the full text, which might be a JSON string.
                                const newTextChunk = message.serverContent.outputTranscription.text;
                                setCurrentOutput(prev => prev + newTextChunk);
                            }
                            
                            const audioData = message.serverContent.modelTurn?.parts[0]?.inlineData?.data;
                            if (audioData && outputAudioContextRef.current) {
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                                const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContextRef.current, 24000, 1);
                                const sourceNode = outputAudioContextRef.current.createBufferSource();
                                sourceNode.buffer = audioBuffer;
                                sourceNode.connect(outputAudioContextRef.current.destination);
                                sourceNode.addEventListener('ended', () => sourcesRef.current.delete(sourceNode));
                                sourceNode.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                sourcesRef.current.add(sourceNode);
                            }
                            
                            if (message.serverContent.turnComplete) {
                                const finalInput = currentInput;
                                const finalOutput = currentOutput;

                                setHistory(prev => [...prev, { role: 'user', text: finalInput }]);
                                
                                let aiMessage: Message = { role: 'model', text: finalOutput };
                                try {
                                    const jsonResponse = JSON.parse(finalOutput);
                                    if (jsonResponse.summary && jsonResponse.chartType && jsonResponse.chartData) {
                                        aiMessage = {
                                            role: 'model',
                                            text: jsonResponse.summary,
                                            chartType: jsonResponse.chartType,
                                            chartData: jsonResponse.chartData,
                                        };
                                    }
                                } catch (e) {
                                    // Not a JSON response, treat as plain text
                                }
                                setHistory(prev => [...prev, aiMessage]);
                                setCurrentInput('');
                                setCurrentOutput('');
                            }
                        }

                        if (message.toolCall?.functionCalls) {
                            for (const fc of message.toolCall.functionCalls) {
                                const toolResult = await executeTool(fc.name, fc.args);
                                sessionPromiseRef.current?.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { content: toolResult } } }));
                            }
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live Co-pilot Error:', e);
                        toast.error("Co-pilot connection error.");
                        handleClose();
                    },
                    onclose: () => handleClose(),
                },
            });
        } catch (error) {
            console.error('Failed to start Live Co-pilot session:', error);
            toast.error("Could not start co-pilot session. Check permissions.");
            handleClose();
        }
    };
    
    return (
        <Modal isOpen={isLiveCopilotOpen} onClose={handleClose} title="Live Co-pilot" size="2xl">
            <div className="flex flex-col h-[60vh]">
                <div ref={messagesEndRef} className="flex-grow overflow-y-auto pr-4 space-y-4">
                     {history.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                             {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-primary" /></div>}
                            <div className={`p-3 rounded-lg max-w-md ${msg.role === 'model' ? 'bg-hover-bg' : 'bg-primary text-white'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                {msg.chartData && <div className="mt-2"><AiGeneratedChart chartType={msg.chartType!} data={msg.chartData} /></div>}
                            </div>
                            {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0"><UserIcon size={20} className="text-slate-500" /></div>}
                        </div>
                     ))}
                     {currentInput && <div className="flex items-start gap-3 justify-end"><div className="p-3 rounded-lg max-w-md bg-primary/80 text-white/90"><p className="text-sm whitespace-pre-wrap">{currentInput}</p></div><div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0"><UserIcon size={20} className="text-slate-500" /></div></div>}
                     {currentOutput && <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-primary" /></div><div className="p-3 rounded-lg max-w-md bg-hover-bg"><p className="text-sm whitespace-pre-wrap">{currentOutput}</p></div></div>}
                </div>
                <div className="flex-shrink-0 text-center pt-4">
                    <div className={`relative w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-colors duration-300 ${isListening ? 'bg-primary/20' : 'bg-hover-bg'}`}>
                        <div className={`absolute inset-0 rounded-full bg-primary/30 animate-pulse ${isListening ? 'scale-100' : 'scale-0'}`} style={{transition: 'transform 0.5s'}}></div>
                        <Bot size={40} className="text-primary" />
                    </div>
                     <p className={`mt-4 text-sm font-medium ${isListening ? 'text-primary' : 'text-text-secondary'}`}>{isListening ? 'Listening...' : 'Connecting...'}</p>
                </div>

                 <div className="mt-6 flex justify-center">
                    <Button variant="danger" onClick={handleClose} className="!rounded-full w-16 h-16">
                        <PhoneOff />
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default LiveCopilotModal;