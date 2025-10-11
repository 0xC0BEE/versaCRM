import React, { useState, useEffect, useRef } from 'react';
import { LiveChatSettings, User } from '../../types';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import ChatBubble from './ChatBubble';
import Button from '../ui/Button';

interface LiveChatWidgetProps {
    settings: LiveChatSettings;
    user: User | null;
}

interface Message {
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
}

type ChatStage = 'initial' | 'collecting_email' | 'chatting' | 'submitted';

const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ settings, user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [stage, setStage] = useState<ChatStage>('initial');
    const [capturedEmail, setCapturedEmail] = useState('');
    const firstUserMessageRef = useRef('');

    const { handleNewChatMessageMutation } = useData();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                sender: 'ai',
                text: settings.welcomeMessage,
                timestamp: new Date().toISOString()
            }]);
            setStage(user ? 'chatting' : 'initial');
            setCapturedEmail(user?.email || '');
            firstUserMessageRef.current = '';
        }
    }, [isOpen, settings.welcomeMessage, user, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { sender: 'user', text: input, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');

        if (user) { // Logged-in client
            if (messages.filter(m => m.sender === 'user').length === 0) {
                handleNewChatMessageMutation.mutate({
                    orgId: user.organizationId,
                    contactId: user.contactId,
                    contactName: user.name,
                    contactEmail: user.email,
                    message: currentInput,
                });
                const aiReply: Message = { sender: 'ai', text: "Thanks! A support ticket has been created and our team will get back to you shortly.", timestamp: new Date().toISOString() };
                setTimeout(() => setMessages(prev => [...prev, aiReply]), 500);
            }
        } else { // Anonymous visitor
            switch (stage) {
                case 'initial':
                    firstUserMessageRef.current = currentInput;
                    setStage('collecting_email');
                    const emailRequest: Message = { sender: 'ai', text: "Thanks for reaching out! What's your email address so we can follow up?", timestamp: new Date().toISOString() };
                    setTimeout(() => setMessages(prev => [...prev, emailRequest]), 500);
                    break;
                case 'collecting_email':
                    // Rudimentary email validation
                    if (!/^\S+@\S+\.\S+$/.test(currentInput)) {
                        const invalidEmail: Message = { sender: 'ai', text: "That doesn't look like a valid email. Could you please provide a correct one?", timestamp: new Date().toISOString() };
                        setTimeout(() => setMessages(prev => [...prev, invalidEmail]), 500);
                        return;
                    }
                    setCapturedEmail(currentInput);
                    setStage('chatting');
                    handleNewChatMessageMutation.mutate({
                        orgId: 'org_1', // Hardcoded for this demo
                        contactName: 'New Lead',
                        contactEmail: currentInput,
                        message: firstUserMessageRef.current,
                    });
                    const finalReply: Message = { sender: 'ai', text: "Perfect, thank you! A new support ticket has been created and our team will get back to you shortly.", timestamp: new Date().toISOString() };
                    setTimeout(() => setMessages(prev => [...prev, finalReply]), 500);
                    setStage('submitted');
                    break;
                case 'chatting':
                case 'submitted':
                    // Do nothing after submission for this simple version
                    break;
            }
        }
    };
    
    const fabStyle = { backgroundColor: settings.color };
    const headerStyle = { backgroundColor: settings.color };

    return (
        <>
            <div className={`fixed bottom-6 right-6 z-50 transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg-new hover:scale-105"
                    style={fabStyle}
                    aria-label="Open chat"
                >
                    <MessageSquare size={32} />
                </button>
            </div>
            
            <div className={`fixed bottom-6 right-6 z-50 w-80 h-[28rem] bg-card-bg rounded-lg shadow-lg-new flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                <div className="flex-shrink-0 flex justify-between items-center p-4 text-white rounded-t-lg" style={headerStyle}>
                    <h3 className="font-semibold">Chat with us</h3>
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-white/20" aria-label="Close chat">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <ChatBubble key={index} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                
                 <div className="flex-shrink-0 p-3 border-t border-border-subtle">
                     <form onSubmit={handleSend} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={stage === 'collecting_email' ? 'Enter your email...' : 'Type your message...'}
                            className="flex-grow w-full px-3 py-2 text-sm bg-hover-bg/50 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={handleNewChatMessageMutation.isPending || stage === 'submitted'}
                        />
                        <Button type="submit" size="md" disabled={!input.trim() || handleNewChatMessageMutation.isPending || stage === 'submitted'}>
                            <Send size={16} />
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default LiveChatWidget;
