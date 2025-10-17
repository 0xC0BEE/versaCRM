import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { TeamChannel, TeamChatMessage, User } from '../../types';
import { Hash, Lock, Send, Loader, Plus, Users, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Switch from '../ui/Switch';
import MultiSelectDropdown from '../ui/MultiSelectDropdown';
import toast from 'react-hot-toast';
import ThreadSidebar from './ThreadSidebar';
import { useApp } from '../../contexts/AppContext';

const TeamChatPage: React.FC = () => {
    const { teamChannelsQuery, teamMembersQuery } = useData();
    const { authenticatedUser } = useAuth();
    const { initialRecordLink, setInitialRecordLink } = useApp();

    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
    const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

    const { data: channels = [], isLoading: channelsLoading } = teamChannelsQuery;
    const { data: teamMembers = [] } = teamMembersQuery;

    const userMap = useMemo(() => new Map((teamMembers as User[]).map(u => [u.id, u])), [teamMembers]);

    useEffect(() => {
        if (!selectedChannelId && channels.length > 0) {
            setSelectedChannelId(channels[0].id);
        }
    }, [channels, selectedChannelId]);
    
    useEffect(() => {
        if (initialRecordLink?.page === 'TeamChat' && initialRecordLink.recordId) {
            // check if channel exists before setting
            if ((channels as TeamChannel[]).some((c: TeamChannel) => c.id === initialRecordLink.recordId)) {
                setSelectedChannelId(initialRecordLink.recordId);
            }
            setInitialRecordLink(null); // Clear after use
        }
    }, [initialRecordLink, channels, setInitialRecordLink]);

    const selectedChannel = useMemo(() => {
        return (channels as TeamChannel[]).find(c => c.id === selectedChannelId);
    }, [channels, selectedChannelId]);
    
    // When channel changes, close any open thread
    useEffect(() => {
        setActiveThreadId(null);
    }, [selectedChannelId]);

    const ChannelList = () => (
        <div className="flex flex-col h-full bg-card-bg border-r border-border-subtle">
            <div className="p-4 border-b border-border-subtle flex justify-between items-center">
                <h2 className="text-lg font-semibold">Channels</h2>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsCreateChannelModalOpen(true)}>
                    <Plus size={18} />
                </Button>
            </div>
            <div className="flex-grow overflow-y-auto">
                {channelsLoading ? <p className="p-4 text-sm text-text-secondary">Loading...</p> : (
                    <div className="p-2">
                        {channels.map((channel: TeamChannel) => (
                            <button
                                key={channel.id}
                                onClick={() => setSelectedChannelId(channel.id)}
                                className={`w-full text-left flex items-center gap-2 p-2 rounded-md text-sm ${selectedChannelId === channel.id ? 'bg-primary/10 text-primary font-semibold' : 'text-text-secondary hover:bg-hover-bg'}`}
                            >
                                {channel.isPrivate ? <Lock size={14} /> : <Hash size={14} />}
                                <span>{channel.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const MessagePane = () => {
        const { teamChannelMessagesQuery, postTeamChatMessageMutation } = useData();
        const { data: messages = [], isLoading: messagesLoading } = teamChannelMessagesQuery(selectedChannelId);
        const [newMessage, setNewMessage] = useState('');
        const messagesEndRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }, [messages]);

        const { mainMessages, threads } = useMemo(() => {
            const threads = new Map<string, TeamChatMessage[]>();
            const mainMessages: TeamChatMessage[] = [];

            (messages as TeamChatMessage[]).forEach(message => {
                if (message.threadId) {
                    if (!threads.has(message.threadId)) {
                        threads.set(message.threadId, []);
                    }
                    threads.get(message.threadId)!.push(message);
                } else {
                    mainMessages.push(message);
                }
            });
            threads.forEach(replies => replies.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
            mainMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            return { mainMessages, threads };
        }, [messages]);

        const handleSendMessage = (e: React.FormEvent) => {
            e.preventDefault();
            if (!newMessage.trim() || !selectedChannelId || !authenticatedUser) return;
            postTeamChatMessageMutation.mutate({
                channelId: selectedChannelId,
                userId: authenticatedUser.id,
                message: newMessage,
            }, {
                onSuccess: () => setNewMessage('')
            });
        };

        const Message: React.FC<{ msg: TeamChatMessage }> = ({ msg }) => {
            const user = userMap.get(msg.userId);
            const replies = threads.get(msg.id) || [];
            
            return (
                <div className="group relative flex items-start gap-3 p-2 rounded-md hover:bg-hover-bg">
                     <div className="w-8 h-8 rounded-md bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-slate-500">{user?.name.charAt(0)}</div>
                    <div className="flex-grow">
                        <p className="text-sm">
                            <span className="font-semibold text-text-primary">{user?.name}</span>
                            <span className="text-xs text-text-secondary ml-2">{format(new Date(msg.timestamp), 'p')}</span>
                        </p>
                        <div className="mt-1">
                            <p className="text-sm whitespace-pre-wrap text-left text-text-secondary">{msg.message}</p>
                        </div>
                        {replies.length > 0 && (
                            <div className="mt-2">
                                <button onClick={() => setActiveThreadId(msg.id)} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5">
                                    <div className="flex -space-x-1">
                                        {[...new Set(replies.map(r => r.userId))].slice(0, 3).map(userId => (
                                            <div key={userId} className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[8px] border border-card-bg">{userMap.get(userId)?.name.charAt(0)}</div>
                                        ))}
                                    </div>
                                    <span>{replies.length} {replies.length > 1 ? 'replies' : 'reply'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" size="sm" onClick={() => setActiveThreadId(msg.id)} leftIcon={<MessageSquare size={14}/>}>
                            Reply
                        </Button>
                    </div>
                </div>
            );
        };
        
        if (!selectedChannel) {
             return <div className="flex-grow flex items-center justify-center text-text-secondary">Select a channel to start chatting</div>;
        }

        return (
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border-subtle">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        {selectedChannel.isPrivate ? <Lock size={16} /> : <Hash size={16} />}
                        {selectedChannel.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                        <p>{selectedChannel.description}</p>
                        <button onClick={() => setIsManageMembersModalOpen(true)} className="flex items-center gap-1 hover:text-primary">
                            <Users size={14} /> {selectedChannel.memberIds.length} members
                        </button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-2">
                    {messagesLoading ? <div className="flex justify-center items-center h-full"><Loader className="animate-spin"/></div> : (
                        mainMessages.map((msg: TeamChatMessage) => <Message key={msg.id} msg={msg} />)
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-border-subtle">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Textarea id="new-message" label="" placeholder={`Message #${selectedChannel.name}`} value={newMessage} onChange={e => setNewMessage(e.target.value)} rows={1} className="flex-grow" />
                        <Button type="submit" leftIcon={<Send size={16}/>} disabled={postTeamChatMessageMutation.isPending}>Send</Button>
                    </form>
                </div>
            </div>
        );
    };

    const CreateChannelModal = () => {
        const { createTeamChannelMutation } = useData();
        const [name, setName] = useState('');
        const [description, setDescription] = useState('');
        const [isPrivate, setIsPrivate] = useState(false);

        const handleCreate = () => {
            if (!name.trim()) return toast.error("Channel name is required.");
            createTeamChannelMutation.mutate({
                organizationId: authenticatedUser!.organizationId,
                name: name.toLowerCase().replace(/\s+/g, '-'),
                description,
                isPrivate,
                memberIds: [authenticatedUser!.id] // Creator is always a member
            }, {
                onSuccess: (newChannel) => {
                    toast.success(`Channel #${newChannel.name} created!`);
                    setIsCreateChannelModalOpen(false);
                    setSelectedChannelId(newChannel.id);
                }
            });
        };

        return (
            <Modal isOpen={isCreateChannelModalOpen} onClose={() => setIsCreateChannelModalOpen(false)} title="Create a new channel">
                <div className="space-y-4">
                    <Input id="channel-name" label="Channel Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., project-alpha" />
                    <Textarea id="channel-desc" label="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                    <div className="flex items-center gap-4">
                        <label htmlFor="is-private" className="font-medium text-sm">Private Channel</label>
                        <Switch id="is-private" checked={isPrivate} onChange={setIsPrivate} />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setIsCreateChannelModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={createTeamChannelMutation.isPending}>Create Channel</Button>
                </div>
            </Modal>
        );
    };

    const ManageMembersModal = () => {
        const { updateTeamChannelMembersMutation } = useData();
        const [members, setMembers] = useState(selectedChannel?.memberIds || []);
        
        const memberOptions = (teamMembers as User[]).map(m => ({ value: m.id, label: m.name }));

        const handleSave = () => {
            if (!selectedChannel) return;
            updateTeamChannelMembersMutation.mutate({ channelId: selectedChannel.id, memberIds: members }, {
                onSuccess: () => {
                    toast.success("Members updated!");
                    setIsManageMembersModalOpen(false);
                }
            });
        };

        return (
            <Modal isOpen={isManageMembersModalOpen} onClose={() => setIsManageMembersModalOpen(false)} title={`Manage members in #${selectedChannel?.name}`}>
                <MultiSelectDropdown
                    options={memberOptions}
                    selectedValues={members}
                    onChange={setMembers}
                    placeholder="Add or remove members..."
                />
                 <div className="mt-6 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setIsManageMembersModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={updateTeamChannelMembersMutation.isPending}>Save Changes</Button>
                </div>
            </Modal>
        );
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            <div className="w-64 flex-shrink-0">
                <ChannelList />
            </div>
            <div className="flex-1 bg-bg-primary flex">
                <div className="flex-1 flex flex-col">
                    <MessagePane />
                </div>
                {activeThreadId && selectedChannelId && (
                    <ThreadSidebar 
                        channelId={selectedChannelId} 
                        threadId={activeThreadId}
                        onClose={() => setActiveThreadId(null)}
                    />
                )}
            </div>
            <CreateChannelModal />
            {selectedChannel && <ManageMembersModal />}
        </div>
    );
};

export default TeamChatPage;