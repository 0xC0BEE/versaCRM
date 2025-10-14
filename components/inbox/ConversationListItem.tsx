import React from 'react';
import { Conversation } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListItemProps {
    conversation: Conversation;
    isSelected: boolean;
    onSelect: () => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({ conversation, isSelected, onSelect }) => {
    const participants = conversation.participants.map(p => p.name).join(', ');

    return (
        <div
            onClick={onSelect}
            className={`p-4 cursor-pointer ${isSelected ? 'bg-primary/10' : 'hover:bg-hover-bg'}`}
        >
            <div className="flex justify-between items-start">
                <p className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                    {participants}
                </p>
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