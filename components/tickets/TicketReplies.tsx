import React, { useState, useMemo, useRef } from 'react';
import { Ticket, TicketReply, User, TicketAttachment, AnyContact } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Paperclip, Trash2, Download, Eye, File, FileImage, FileText, Lock } from 'lucide-react';
import { fileToDataUrl } from '../../utils/fileUtils';
import FilePreviewModal from '../ui/FilePreviewModal';

interface TicketRepliesProps {
    ticket: Ticket;
    showInternalNotes: boolean;
}

const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
        return <FileImage className="h-6 w-6 text-purple-500" />;
    }
    if (fileType === 'application/pdf') {
        return <FileText className="h-6 w-6 text-red-500" />;
    }
    return <File className="h-6 w-6 text-text-secondary" />;
};


const TicketReplies: React.FC<TicketRepliesProps> = ({ ticket, showInternalNotes }) => {
    const { addTicketReplyMutation, teamMembersQuery, contactsQuery } = useData();
    const { authenticatedUser } = useAuth();
    const [replyMessage, setReplyMessage] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [attachment, setAttachment] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewingFile, setPreviewingFile] = useState<{name: string, url: string} | null>(null);
    const [mentionQuery, setMentionQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const { data: teamMembers = [] } = teamMembersQuery;
    const { data: contacts = [] } = contactsQuery;

    const contact = useMemo(() => {
        return (contacts as AnyContact[]).find(c => c.id === ticket.contactId);
    }, [contacts, ticket.contactId]);

    const replies = useMemo(() => {
        return ticket.replies
            .filter(reply => showInternalNotes || !reply.isInternal)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [ticket.replies, showInternalNotes]);
    
    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setReplyMessage(value);

        if (!isInternal) {
            setShowSuggestions(false);
            return;
        }

        const cursorPosition = e.target.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPosition);
        const lastAt = textBeforeCursor.lastIndexOf('@');
        const lastSpace = textBeforeCursor.lastIndexOf(' ');

        if (lastAt > -1 && lastAt > lastSpace) {
            const query = textBeforeCursor.substring(lastAt + 1);
            setMentionQuery(query);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };
    
    const handleMentionSelect = (user: User) => {
        const textBeforeMention = replyMessage.substring(0, replyMessage.lastIndexOf('@'));
        const textAfterMention = replyMessage.substring(replyMessage.lastIndexOf('@') + mentionQuery.length + 1);
        const newReplyMessage = `${textBeforeMention}@${user.name} ${textAfterMention}`;
        
        setReplyMessage(newReplyMessage);
        setShowSuggestions(false);
    };

    const filteredSuggestions = useMemo(() => {
        if (!mentionQuery) return teamMembers;
        return teamMembers.filter((member: User) =>
            member.name.toLowerCase().includes(mentionQuery.toLowerCase())
        );
    }, [mentionQuery, teamMembers]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const handleAddReply = async () => {
        if (!replyMessage.trim() && !attachment) {
            toast.error("Reply cannot be empty.");
            return;
        }

        let attachmentData: TicketAttachment | undefined;
        if (attachment) {
            try {
                const dataUrl = await fileToDataUrl(attachment);
                attachmentData = {
                    name: attachment.name,
                    type: attachment.type,
                    dataUrl: dataUrl,
                };
            } catch (error) {
                toast.error("Failed to read file.");
                return;
            }
        }
        
        const messageToSend = replyMessage.trim() || (attachment ? "Attached file." : "");

        addTicketReplyMutation.mutate({
            ticketId: ticket.id,
            reply: {
                message: messageToSend,
                userId: authenticatedUser!.id,
                userName: authenticatedUser!.name,
                isInternal: showInternalNotes ? isInternal : false,
                attachment: attachmentData,
            },
        }, {
            onSuccess: () => {
                setReplyMessage('');
                setIsInternal(false);
                setAttachment(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        });
    };
    
    const handlePreview = (attach: { name: string, dataUrl: string, type: string }) => {
        if (attach.type.startsWith('image/')) {
            setPreviewingFile({ name: attach.name, url: attach.dataUrl });
        } else {
            handleDownload(attach);
        }
    };
    
    const handleDownload = (attach: { name: string, dataUrl: string }) => {
        const link = document.createElement('a');
        link.href = attach.dataUrl;
        link.download = attach.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-h-[65vh] flex flex-col">
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {/* Original Description */}
                <div className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center text-sm font-bold">
                        {contact?.contactName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-grow p-3 rounded-lg bg-hover-bg">
                        <p className="text-sm font-semibold text-text-primary">{contact?.contactName || 'Customer'}</p>
                        <p className="text-sm text-text-primary whitespace-pre-wrap mt-1">{ticket.description}</p>
                         <p className="text-xs text-text-secondary mt-2">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</p>
                    </div>
                </div>

                {/* Replies */}
                {replies.map(reply => {
                    const isTeamMember = teamMembers.some((m: User) => m.id === reply.userId) || reply.userId === 'system';
                    const userInitial = reply.userName.charAt(0);

                    let bubbleClass = '';
                    if (reply.isInternal) {
                        bubbleClass = 'bg-warning/10 border border-warning/20';
                    } else if (isTeamMember) {
                        bubbleClass = 'bg-primary/10';
                    } else {
                        bubbleClass = 'bg-hover-bg';
                    }

                    return (
                        <div key={reply.id} className={`flex gap-3`}>
                             <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white ${isTeamMember ? 'bg-primary' : 'bg-success'}`}>
                                {userInitial}
                            </div>
                            <div className={`flex-grow p-3 rounded-lg ${bubbleClass}`}>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-semibold text-text-primary">{reply.userName} {reply.isInternal && <span className="text-xs font-normal text-warning flex items-center gap-1"><Lock size={10}/>Internal Note</span>}</p>
                                    <p className="text-xs text-text-secondary">{formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}</p>
                                </div>
                                <p className="text-sm text-text-primary mt-1 whitespace-pre-wrap">{reply.message}</p>
                                {reply.attachment && (
                                    <div className="mt-2 p-2 bg-bg-primary rounded-md flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getFileIcon(reply.attachment.type)}
                                            <span className="text-xs font-medium text-text-primary">{reply.attachment.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button size="sm" variant="secondary" onClick={() => handlePreview(reply.attachment!)}><Eye size={14} /></Button>
                                            <Button size="sm" variant="secondary" onClick={() => handleDownload(reply.attachment!)}><Download size={14} /></Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="flex-shrink-0 pt-4 mt-4 border-t border-border-subtle relative">
                <Textarea 
                    id="reply-message" 
                    label="Your Reply" 
                    value={replyMessage} 
                    onChange={handleNotesChange}
                    rows={4}
                    disabled={addTicketReplyMutation.isPending}
                />
                 {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bottom-full mb-1 bg-card-bg border border-border-subtle rounded-md shadow-lg max-h-40 overflow-y-auto">
                        <ul>
                            {filteredSuggestions.map((user: User) => (
                                <li key={user.id}>
                                    <button
                                        onClick={() => handleMentionSelect(user)}
                                        className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-hover-bg"
                                    >
                                        {user.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                 <div className="mt-2 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden"/>
                         <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} leftIcon={<Paperclip size={14}/>} disabled={addTicketReplyMutation.isPending}>
                            Attach
                        </Button>
                        {attachment && (
                            <div className="text-xs flex items-center gap-1 bg-hover-bg p-1 rounded">
                                <span className="text-text-secondary">{attachment.name}</span>
                                <button onClick={() => { setAttachment(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="p-0.5 hover:bg-error/20 rounded-full text-text-secondary"><Trash2 size={12} /></button>
                            </div>
                        )}
                        {showInternalNotes && (
                            <label className="flex items-center text-sm text-text-secondary">
                                <input 
                                    type="checkbox" 
                                    checked={isInternal}
                                    onChange={e => setIsInternal(e.target.checked)}
                                    className="h-4 w-4 rounded border-border-subtle text-warning focus:ring-warning"
                                />
                                <span className="ml-2">Internal note only</span>
                            </label>
                        )}
                    </div>
                    <Button onClick={handleAddReply} disabled={addTicketReplyMutation.isPending}>
                        {addTicketReplyMutation.isPending ? 'Sending...' : 'Send Reply'}
                    </Button>
                </div>
            </div>
            {previewingFile && (
                <FilePreviewModal
                    isOpen={!!previewingFile}
                    onClose={() => setPreviewingFile(null)}
                    fileName={previewingFile.name}
                    fileUrl={previewingFile.url}
                />
            )}
        </div>
    );
};

export default TicketReplies;