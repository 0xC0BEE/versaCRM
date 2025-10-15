import React from 'react';
import { Conversation } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { Mail, Linkedin, Twitter } from 'lucide-react';

interface ConversationListItemProps {
    conversation: Conversation;
    isSelected: boolean;
    onSelect: () => void;
}

const getChannelIcon = (channel: 'Email' | 'LinkedIn' | 'X') => {
    switch (channel) {
        case 'LinkedIn':
            return <Linkedin size={14} className="text-blue-500" />;
        case 'X':
            return <Twitter size={14} className="text-sky-500" />;
        case 'Email':
        default:
            return <Mail size={14} className="text-gray-400" />;
    }
};

const ConversationListItem: React.FC<ConversationListItemProps> = ({ conversation, isSelected, onSelect }) => {
    const participants = conversation.participants.map(p => p.name).join(', ');

    return (
        <div
            onClick={onSelect}
            className={`p-4 cursor-pointer ${isSelected ? 'bg-primary/10' : 'hover:bg-hover-bg'}`}
        >
            <div className="flex justify-between items-start">
                <div className={`flex items-center gap-2 truncate ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                    {getChannelIcon(conversation.channel)}
                    <p className="text-sm font-semibold truncate">
                        {participants}
                    </p>
                </div>
                <p className="text-xs text-text-secondary flex-shrink-0 ml-2">
                    {formatDistanceToNow(new Date(conversation.lastMessageTimestamp), { addSuffix: true })}
                </p>
            </div>
            <p className="text-sm font-medium text-text-secondary mt-1 truncate">{conversation.subject}</p>
            <p className="text-xs text-text-secondary mt-1 truncate">{conversation.lastMessageSnippet}</p>
        </div>
    );
};

export default ConversationListItem;