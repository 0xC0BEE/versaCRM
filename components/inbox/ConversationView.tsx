import React from 'react';
import { Conversation } from '../../types';
import { format } from 'date-fns';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import { Send } from 'lucide-react';

interface ConversationViewProps {
    conversation: Conversation;
    userMap: Map<string, { name: string, email: string }>;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversation, userMap }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border-subtle flex-shrink-0">
                <h2 className="font-semibold text-lg">{conversation.subject}</h2>
                <p className="text-sm text-text-secondary">
                    With: {conversation.participants.map(p => p.name).join(', ')}
                </p>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-6">
                {conversation.messages.map(message => {
                    const sender = userMap.get(message.senderId);
                    return (
                        <div key={message.id} className="border border-border-subtle rounded-lg">
                            <div className="bg-hover-bg/50 p-2 text-xs text-text-secondary border-b border-border-subtle flex justify-between">
                                <div><strong>From:</strong> {sender?.name || 'Unknown'} &lt;{sender?.email || '...'} &gt;</div>
                                <div>{format(new Date(message.timestamp), 'PPpp')}</div>
                            </div>
                            <div className="p-4 text-sm whitespace-pre-wrap">
                                {message.body}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex-shrink-0 p-4 border-t border-border-subtle">
                <Textarea id="reply-box" label="Your Reply" rows={4} />
                <div className="flex justify-end mt-2">
                    <Button leftIcon={<Send size={16}/>}>Send Reply</Button>
                </div>
            </div>
        </div>
    );
};

export default ConversationView;