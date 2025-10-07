import React, { useState, useEffect, useRef } from 'react';
import { LiveChatSettings, User } from '../../types';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import ChatBubble from './ChatBubble';
// FIX: Imported Button component to resolve 'Cannot find name' error.
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

const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ settings, user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const { handleNewChatMessageMutation } = useData();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                sender: 'ai',
                text: settings.welcomeMessage,
                timestamp: new Date().toISOString()
            }]);
        }
    }, [isOpen, settings.welcomeMessage, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !user) return;

        const userMessage: Message = { sender: 'user', text: input, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);
        
        // If it's the first user message, trigger the backend to create a ticket
        if (messages.filter(m => m.sender === 'user').length === 0) {
            handleNewChatMessageMutation.mutate({
                orgId: user.organizationId,
                contactId: user.contactId, // Can be undefined for new visitors
                contactName: user.name,
                contactEmail: user.email,
                message: input,
            });

             const aiReply: Message = { sender: 'ai', text: "Thanks for your message! A new support ticket has been created and our team will get back to you shortly.", timestamp: new Date().toISOString() };
            setTimeout(() => setMessages(prev => [...prev, aiReply]), 500);
        }
        
        setInput('');
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
            
            <div className={`fixed bottom-6 right-6 z-50 w-80 h-[28rem] bg-card-bg rounded-card shadow-lg-new flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                {/* Header */}
                <div className="flex-shrink-0 flex justify-between items-center p-4 text-white rounded-t-card" style={headerStyle}>
                    <h3 className="font-semibold">Chat with us</h3>
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-white/20" aria-label="Close chat">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <ChatBubble key={index} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                
                 {/* Input */}
                 <div className="flex-shrink-0 p-3 border-t border-border-subtle">
                     <form onSubmit={handleSend} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-grow w-full px-3 py-2 text-sm bg-hover-bg/50 border border-border-subtle rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={handleNewChatMessageMutation.isPending}
                        />
                        <Button type="submit" size="md" disabled={!input.trim() || handleNewChatMessageMutation.isPending}>
                            <Send size={16} />
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default LiveChatWidget;