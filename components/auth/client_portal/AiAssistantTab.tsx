import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Bot, Send, User as UserIcon } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const AiAssistantTab: React.FC = () => {
    const { authenticatedUser } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: `Hello ${authenticatedUser?.name}! How can I help you today?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        try {
            // FIX: Initialize GoogleGenAI with named apiKey parameter
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
            // FIX: Use ai.chats.create
            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `You are a helpful AI assistant for VersaCRM. The user is ${authenticatedUser?.name}. Be friendly and concise.`
                }
            });
            chatRef.current = chat;
        } catch (error) {
            console.error("AI Initialization Error:", error);
            toast.error("Could not initialize the AI Assistant.");
        }
    }, [authenticatedUser]);

    const handleSend = async () => {
        if (!input.trim() || !chatRef.current) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);
        
        try {
            // FIX: Use chat.sendMessage and get text from response
            const response = await chatRef.current.sendMessage({ message: currentInput });
            const botMessage: Message = { sender: 'bot', text: response.text };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("AI Assistant Error:", error);
            toast.error("Sorry, I'm having trouble connecting. Please try again later.");
            // Re-add user message if there was an error
            setMessages(prev => prev.slice(0, -1)); // This is simplistic, a better UX would show an error on the message itself
            setInput(currentInput); 
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">AI Assistant</h3>
            <div className="h-96 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex flex-col space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-primary-500 flex-shrink-0 flex items-center justify-center text-white"><Bot size={20} /></div>}
                        <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'bot' ? 'bg-white dark:bg-dark-card' : 'bg-primary-100 dark:bg-primary-900'}`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                         {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center"><UserIcon size={20} /></div>}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-start gap-3">
                         <div className="w-8 h-8 rounded-full bg-primary-500 flex-shrink-0 flex items-center justify-center text-white"><Bot size={20} /></div>
                        <div className="max-w-md p-3 rounded-lg bg-white dark:bg-dark-card">
                            <p className="text-sm text-gray-500 animate-pulse">Thinking...</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-4 flex gap-2">
                <Input 
                    id="chat-input" 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a question..." 
                    className="flex-grow"
                    disabled={isLoading}
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                    <Send size={16} />
                </Button>
            </div>
        </div>
    );
};

export default AiAssistantTab;