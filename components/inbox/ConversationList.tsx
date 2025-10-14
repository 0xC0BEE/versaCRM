import React from 'react';
import { Conversation } from '../../types';
import ConversationListItem from './ConversationListItem';

interface ConversationListProps {
    conversations: Conversation[];
    selectedConversationId: string | null;
    onSelectConversation: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedConversationId, onSelectConversation }) => {
    return (
        <div className="divide-y divide-border-subtle">
            {conversations.map(conversation => (
                <ConversationListItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={conversation.id === selectedConversationId}
                    onSelect={() => onSelectConversation(conversation.id)}
                />
            ))}
        </div>
    );
};

export default ConversationList;