import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, LiveSession } from '@google/genai';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Mic, MicOff, PhoneOff, Bot } from 'lucide-react';
import { encode, decode, decodeAudioData } from '../../utils/audioUtils';
import { copilotTools } from '../../config/copilotTools';
import toast from 'react-hot-toast';
import { AnyContact } from '../../types';

const LiveCopilotModal: React.FC = () => {
    const { isLiveCopilotOpen, setIsLiveCopilotOpen } = useApp();
    const { createTaskMutation } = useData();
    const { authenticatedUser } = useAuth();
    
    const [transcriptionHistory, setTranscriptionHistory] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [currentOutput, setCurrentOutput] = useState('');
    const [isListening, setIsListening] = useState(false);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTimeRef = useRef(0);

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
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            sourcesRef.current.forEach(source => source.stop());
            sourcesRef.current.clear();
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        
        setTranscriptionHistory([]);
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

    const startSession = async () => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    tools: [{ functionDeclarations: copilotTools }],
                    systemInstruction: `You are a helpful and friendly CRM assistant. Today's date is ${new Date().toISOString()}. Be concise.`
                },
                callbacks: {
                    onopen: async () => {
                        setIsListening(true);
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
                            if (message.serverContent.outputTranscription) setCurrentOutput(prev => prev + message.serverContent.outputTranscription.text);
                            
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
                                setTranscriptionHistory(prev => [...prev, `You: ${currentInput}`, `AI: ${currentOutput}`]);
                                setCurrentInput('');
                                setCurrentOutput('');
                            }
                        }

                        if (message.toolCall?.functionCalls) {
                            for (const fc of message.toolCall.functionCalls) {
                                if (fc.name === 'createTask') {
                                    try {
                                         await createTaskMutation.mutateAsync({
                                            title: fc.args.title,
                                            dueDate: fc.args.dueDate,
                                            contactId: fc.args.contactName, // Simplified for demo
                                            userId: authenticatedUser!.id,
                                            organizationId: authenticatedUser!.organizationId,
                                        });
                                        sessionPromiseRef.current?.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } } }));
                                    } catch (e) {
                                        toast.error("Failed to create task via voice.");
                                        sessionPromiseRef.current?.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "failed" } } }));
                                    }
                                }
                            }
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live Co-pilot Error:', e);
                        toast.error("Co-pilot connection error.");
                        handleClose();
                    },
                    onclose: () => {
                        console.log("Live Co-pilot session closed.");
                        handleClose();
                    },
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
                <div className="flex-grow overflow-y-auto pr-4 space-y-4">
                     {transcriptionHistory.map((line, index) => (
                        <p key={index} className={`text-sm ${line.startsWith('AI:') ? 'text-text-primary' : 'text-text-secondary'}`}>{line}</p>
                     ))}
                     {currentInput && <p className="text-sm text-text-secondary">You: {currentInput}</p>}
                     {currentOutput && <p className="text-sm text-text-primary">AI: {currentOutput}</p>}
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
