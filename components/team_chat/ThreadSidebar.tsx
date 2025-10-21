import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { TeamChatMessage, User } from '../../types';
import { X, Send, Loader } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';

interface ThreadSidebarProps {
    channelId: string;
    threadId: string;
    onClose: () => void;
}

const ThreadSidebar: React.FC<ThreadSidebarProps> = ({ channelId, threadId, onClose }) => {
    const { teamChannelMessagesQuery, postTeamChatMessageMutation, teamMembersQuery } = useData();
    const { authenticatedUser } = useAuth();
    const { data: messages = [], isLoading: messagesLoading } = teamChannelMessagesQuery(channelId);
    const { data: teamMembers = [] } = teamMembersQuery;

    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const userMap = useMemo(() => new Map((teamMembers as User[]).map(u => [u.id, u])), [teamMembers]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const { originalMessage, replies } = useMemo(() => {
        const allThreadMessages = (messages as TeamChatMessage[]).filter(m => m.id === threadId || m.threadId === threadId);
        const original = allThreadMessages.find(m => m.id === threadId);
        const replies = allThreadMessages.filter(m => m.threadId === threadId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return { originalMessage: original, replies };
    }, [messages, threadId]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !authenticatedUser) return;
        postTeamChatMessageMutation.mutate({
            channelId,
            userId: authenticatedUser.id,
            message: newMessage,
            threadId,
        });
        setNewMessage('');
    };

    const Message: React.FC<{ msg: TeamChatMessage }> = ({ msg }) => {
        const user = userMap.get(msg.userId);
        return (
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-slate-500">{user?.name.charAt(0)}</div>
                <div className="flex-grow">
                    <p className="text-sm">
                        <span className="font-semibold text-text-primary">{user?.name}</span>
                        <span className="text-xs text-text-secondary ml-2">{format(new Date(msg.timestamp), 'p')}</span>
                    </p>
                    <div className="mt-1">
                        <p className="text-sm whitespace-pre-wrap text-left text-text-secondary">{msg.message}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-96 flex-shrink-0 border-l border-border-subtle flex flex-col bg-card-bg">
            <div className="p-4 border-b border-border-subtle flex justify-between items-center">
                <div>
                    <h3 className="font-semibold">Thread</h3>
                    <p className="text-xs text-text-secondary">Replying in #{originalMessage?.channelId}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
                    <X size={18} />
                </Button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                    <div className="flex justify-center items-center h-full"><Loader className="animate-spin" /></div>
                ) : (
                    <>
                        {originalMessage && <Message msg={originalMessage} />}
                        <div className="border-t border-border-subtle pt-4 mt-4 space-y-4">
                            {replies.map(reply => <Message key={reply.id} msg={reply} />)}
                        </div>
                    </>
                )}
                 <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border-subtle">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Textarea
                        id="new-thread-message"
                        label=""
                        placeholder="Reply..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        rows={1}
                        className="flex-grow"
                    />
                    <Button type="submit" leftIcon={<Send size={16} />} disabled={postTeamChatMessageMutation.isPending}>
                        Send
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ThreadSidebar;