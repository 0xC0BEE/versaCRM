import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { TeamChannel, TeamChatMessage, User } from '../../types';
import { Hash, Lock, Send, Loader, Plus, Users } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Switch from '../ui/Switch';
import MultiSelectDropdown from '../ui/MultiSelectDropdown';
import toast from 'react-hot-toast';

const TeamChatPage: React.FC = () => {
    const { teamChannelsQuery, teamMembersQuery } = useData();
    const { authenticatedUser } = useAuth();
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
    const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false);

    const { data: channels = [], isLoading: channelsLoading } = teamChannelsQuery;
    const { data: teamMembers = [] } = teamMembersQuery;

    const userMap = useMemo(() => new Map((teamMembers as User[]).map(u => [u.id, u])), [teamMembers]);

    useEffect(() => {
        if (!selectedChannelId && channels.length > 0) {
            setSelectedChannelId(channels[0].id);
        }
    }, [channels, selectedChannelId]);

    const selectedChannel = useMemo(() => {
        return (channels as TeamChannel[]).find(c => c.id === selectedChannelId);
    }, [channels, selectedChannelId]);

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
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
            const isMe = msg.userId === authenticatedUser?.id;
            return (
                <div className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                     <div className="w-8 h-8 rounded-md bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-slate-500">{user?.name.charAt(0)}</div>
                    <div className={`flex-grow ${isMe ? 'text-right' : ''}`}>
                        <p className="text-sm">
                            {isMe ? (
                                <>
                                    <span className="text-xs text-text-secondary mr-2">{format(new Date(msg.timestamp), 'p')}</span>
                                    <span className="font-semibold text-text-primary">{user?.name}</span>
                                </>
                            ) : (
                                <>
                                    <span className="font-semibold text-text-primary">{user?.name}</span>
                                    <span className="text-xs text-text-secondary ml-2">{format(new Date(msg.timestamp), 'p')}</span>
                                </>
                            )}
                        </p>
                        <div className={`mt-1 p-2 rounded-md inline-block ${isMe ? 'bg-primary text-white' : 'bg-hover-bg'}`}>
                            <p className="text-sm whitespace-pre-wrap text-left">{msg.message}</p>
                        </div>
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
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? <div className="flex justify-center items-center h-full"><Loader className="animate-spin"/></div> : (
                        messages.map((msg: TeamChatMessage) => <Message key={msg.id} msg={msg} />)
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
            <div className="flex-1 bg-bg-primary">
                <MessagePane />
            </div>
            <CreateChannelModal />
            {selectedChannel && <ManageMembersModal />}
        </div>
    );
};

export default TeamChatPage;