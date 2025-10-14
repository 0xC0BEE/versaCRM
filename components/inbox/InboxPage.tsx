import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Conversation, AnyContact, User } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import ContactInspector from './ContactInspector';
import { Inbox, MessageSquare } from 'lucide-react';
import ComposeView from './ComposeView';
import Button from '../ui/Button';

const InboxPage: React.FC = () => {
    const { inboxQuery, contactsQuery, teamMembersQuery } = useData();
    const { data: conversations = [], isLoading: inboxLoading } = inboxQuery;
    const { data: contacts = [], isLoading: contactsLoading } = contactsQuery;
    const { data: teamMembers = [], isLoading: teamMembersLoading } = teamMembersQuery;

    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [isComposing, setIsComposing] = useState(false);

    const isLoading = inboxLoading || contactsLoading || teamMembersLoading;

    const selectedConversation = useMemo(() => {
        if (!selectedConversationId) return null;
        return (conversations as Conversation[]).find(c => c.id === selectedConversationId) || null;
    }, [conversations, selectedConversationId]);

    const selectedContact = useMemo(() => {
        if (!selectedConversation) return null;
        return (contacts as AnyContact[]).find(c => c.id === selectedConversation.contactId) || null;
    }, [contacts, selectedConversation]);

    const userMap = useMemo(() => {
        const map = new Map<string, {name: string, email: string}>();
        (teamMembers as User[]).forEach(u => map.set(u.id, {name: u.name, email: u.email}));
        (contacts as AnyContact[]).forEach(c => map.set(c.id, {name: c.contactName, email: c.email}));
        return map;
    }, [teamMembers, contacts]);

    useEffect(() => {
        if (!isComposing && !selectedConversationId && conversations.length > 0) {
            setSelectedConversationId(conversations[0].id);
        }
    }, [conversations, selectedConversationId, isComposing]);

    const handleSelectConversation = (id: string) => {
        setIsComposing(false);
        setSelectedConversationId(id);
    };

    const handleCompose = () => {
        setSelectedConversationId(null);
        setIsComposing(true);
    };

    const handleCancelCompose = () => {
        setIsComposing(false);
        if (conversations.length > 0) {
            setSelectedConversationId(conversations[0].id);
        }
    };

    const handleSent = () => {
        setIsComposing(false);
    };

    if (isLoading) {
        return <div className="flex h-[calc(100vh-4rem)]"><LoadingSpinner /></div>;
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 border-r border-border-subtle overflow-y-auto">
                <div className="p-4 border-b border-border-subtle flex justify-between items-center">
                    <h1 className="text-xl font-semibold">Inbox</h1>
                    <Button size="sm" variant="secondary" onClick={handleCompose} leftIcon={<MessageSquare size={14}/>}>
                        Compose
                    </Button>
                </div>
                <ConversationList
                    conversations={conversations as Conversation[]}
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={handleSelectConversation}
                />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                {isComposing ? (
                    <ComposeView onCancel={handleCancelCompose} onSent={handleSent} />
                ) : selectedConversation ? (
                    <div className="flex-1 flex overflow-hidden">
                        <div className="flex-1 overflow-y-auto">
                            <ConversationView conversation={selectedConversation} userMap={userMap} />
                        </div>
                        {selectedContact && (
                            <div className="hidden lg:block w-1/3 flex-shrink-0 border-l border-border-subtle overflow-y-auto">
                                <ContactInspector contact={selectedContact} />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-text-secondary">
                         <div className="text-center">
                            <Inbox size={48} className="mx-auto" />
                            <p className="mt-2">Select a conversation or compose a new message</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InboxPage;