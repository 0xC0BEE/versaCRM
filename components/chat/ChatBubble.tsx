import React from 'react';
import { Bot } from 'lucide-react';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

interface ChatBubbleProps {
    message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
    const isUser = message.sender === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot size={20} className="text-primary" />
                </div>
            )}
            <div className={`p-3 rounded-lg max-w-[80%] ${isUser ? 'bg-primary text-white' : 'bg-hover-bg'}`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            </div>
        </div>
    );
};

export default ChatBubble;