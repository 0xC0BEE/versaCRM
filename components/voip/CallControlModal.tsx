import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Phone, PhoneOff, Mic, MicOff, Bot, Loader } from 'lucide-react';
import { Interaction } from '../../types';
import toast from 'react-hot-toast';
import { GoogleGenAI } from '@google/genai';

type CallStatus = 'dialing' | 'connected' | 'ended';

const CallControlModal: React.FC = () => {
    const { isCallModalOpen, setIsCallModalOpen, callContact, setCallContact } = useApp();
    const { createInteractionMutation, updateInteractionMutation } = useData();
    const { authenticatedUser } = useAuth();

    const [status, setStatus] = useState<CallStatus>('dialing');
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [callLog, setCallLog] = useState<Interaction | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);

    useEffect(() => {
        // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> for browser compatibility.
        let timer: ReturnType<typeof setInterval>;
        if (status === 'connected') {
            timer = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [status]);

    useEffect(() => {
        if (isCallModalOpen) {
            // Simulate dialing process
            setStatus('dialing');
            setDuration(0);
            setCallLog(null);
            const dialTimer = setTimeout(() => {
                setStatus('connected');
            }, 2000); // 2-second dial time
            return () => clearTimeout(dialTimer);
        }
    }, [isCallModalOpen]);
    
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleEndCall = useCallback(() => {
        setStatus('ended');
        
        if (callContact && authenticatedUser) {
            const notes = `VoIP call completed. Duration: ${formatDuration(duration)}.`;
            createInteractionMutation.mutate({
                contactId: callContact.id,
                organizationId: callContact.organizationId,
                userId: authenticatedUser.id,
                type: 'VoIP Call',
                date: new Date().toISOString(),
                notes,
            }, {
                onSuccess: (newInteraction) => {
                    setCallLog(newInteraction);
                }
            });
        }
    }, [duration, callContact, authenticatedUser, createInteractionMutation]);

    const handleGenerateSummary = async () => {
        if (!callLog) return;
        setIsSummarizing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const prompt = `Generate a concise, one-paragraph summary for a simulated business call with ${callContact?.contactName} that lasted ${formatDuration(duration)}. The summary should sound professional and plausible.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const summary = response.text;
            const updatedNotes = `${callLog.notes}\n\nAI Summary:\n${summary}`;
            
            updateInteractionMutation.mutate({ ...callLog, notes: updatedNotes }, {
                onSuccess: (updatedInteraction) => {
                    setCallLog(updatedInteraction);
                    toast.success("AI summary generated and saved!");
                }
            });

        } catch (error) {
            console.error("AI Summary Error:", error);
            toast.error("Failed to generate AI summary.");
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleClose = () => {
        setIsCallModalOpen(false);
        setCallContact(null);
    };

    return (
        <Modal isOpen={isCallModalOpen} onClose={handleClose} title="Live Call" size="sm">
            <div className="text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                    {callContact?.avatar ? (
                        <img src={callContact.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-bold text-slate-500 text-4xl">{callContact?.contactName.charAt(0)}</span>
                    )}
                </div>
                <h3 className="text-xl font-semibold">{callContact?.contactName}</h3>
                <p className="text-text-secondary">{callContact?.phone}</p>
                
                <div className="mt-6 text-2xl font-mono">
                    {status === 'dialing' && <p className="text-primary animate-pulse">Dialing...</p>}
                    {status === 'connected' && <p>{formatDuration(duration)}</p>}
                    {status === 'ended' && <p className="text-text-secondary">Call Ended ({formatDuration(duration)})</p>}
                </div>

                <div className="mt-8 flex justify-center space-x-4">
                    {status === 'connected' ? (
                        <>
                            <Button variant="secondary" onClick={() => setIsMuted(!isMuted)} className="!rounded-full w-16 h-16">
                                {isMuted ? <MicOff /> : <Mic />}
                            </Button>
                            <Button variant="danger" onClick={handleEndCall} className="!rounded-full w-16 h-16">
                                <PhoneOff />
                            </Button>
                        </>
                    ) : (
                         <Button variant="secondary" onClick={handleClose}>
                           {status === 'ended' ? 'Close' : 'Cancel'}
                        </Button>
                    )}
                </div>

                {status === 'ended' && callLog && (
                    <div className="mt-6 text-left p-4 bg-hover-bg rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Call Log</h4>
                        <p className="text-sm text-text-secondary whitespace-pre-wrap">{callLog.notes}</p>
                        <div className="mt-4 text-center">
                            <Button size="sm" variant="secondary" onClick={handleGenerateSummary} disabled={isSummarizing || updateInteractionMutation.isPending}>
                                {isSummarizing ? <Loader size={16} className="animate-spin" /> : <Bot size={16}/>}
                                <span className="ml-2">Generate AI Summary</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default CallControlModal;
