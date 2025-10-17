import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Project, Task, Document as DocType, User, ClientChecklist, ClientChecklistItem } from '../../../types';
import Button from '../../ui/Button';
import Tabs from '../../ui/Tabs';
import { ArrowLeft, CheckCircle, File, FileImage, FileText, Download, Eye, MessageSquare, ListChecks } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';
import { useDocuments } from '../../../hooks/useDocuments';
import { format, formatDistanceToNow } from 'date-fns';
import FilePreviewModal from '../../ui/FilePreviewModal';
import { useAuth } from '../../../contexts/AuthContext';
import Textarea from '../../ui/Textarea';
import toast from 'react-hot-toast';

interface ClientProjectDetailViewProps {
    project: Project;
    phaseName: string;
    onBack: () => void;
}

const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="h-6 w-6 text-purple-500" />;
    if (fileType === 'application/pdf') return <FileText className="h-6 w-6 text-red-500" />;
    return <File className="h-6 w-6 text-text-secondary" />;
};

const ClientProjectDetailView: React.FC<ClientProjectDetailViewProps> = ({ project, phaseName, onBack }) => {
    const [activeTab, setActiveTab] = useState('Tasks');
    const [prefilledComment, setPrefilledComment] = useState('');

    const tabs = ['Tasks', 'Checklists', 'Shared Files', 'Discussion'];

    const renderContent = () => {
        switch (activeTab) {
            case 'Tasks': return <TasksTab project={project} setActiveTab={setActiveTab} setPrefilledComment={setPrefilledComment} />;
            case 'Checklists': return <ChecklistsTab project={project} />;
            case 'Shared Files': return <SharedFilesTab project={project} />;
            case 'Discussion': return <DiscussionTab project={project} prefilledComment={prefilledComment} setPrefilledComment={setPrefilledComment} />;
            default: return null;
        }
    };

    return (
        <div>
            <Button variant="secondary" size="sm" onClick={onBack} leftIcon={<ArrowLeft size={16} />} className="mb-4">
                Back to All Projects
            </Button>
            <div className="mb-4 p-4 bg-hover-bg rounded-lg">
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <p className="text-sm text-text-secondary">Current Stage: <span className="font-semibold text-primary">{phaseName}</span></p>
            </div>
            <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="mt-4">
                {renderContent()}
            </div>
        </div>
    );
};

const TasksTab: React.FC<{ project: Project, setActiveTab: (t: string) => void, setPrefilledComment: (c: string) => void }> = ({ project, setActiveTab, setPrefilledComment }) => {
    const { tasksQuery } = useData();
    const { data: allTasks = [], isLoading } = tasksQuery;
    
    const { pendingTasks, completedMilestones } = useMemo(() => {
        const clientVisibleTasks = (allTasks as Task[])
            .filter(t => t.projectId === project.id && t.isVisibleToClient)
            .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        
        const pending = clientVisibleTasks.filter(t => !t.isCompleted);
        const completed = clientVisibleTasks.filter(t => t.isCompleted);
        return { pendingTasks: pending, completedMilestones: completed };
    }, [allTasks, project.id]);

    const handleCommentClick = (taskTitle: string) => {
        setPrefilledComment(`[RE: Task "${taskTitle}"] `);
        setActiveTab('Discussion');
    };

    if (isLoading) return <p>Loading tasks...</p>;

    return (
        <div className="space-y-6">
            <div>
                <h4 className="font-semibold text-sm mb-2 text-text-secondary">To-Do</h4>
                {pendingTasks.length > 0 ? (
                    <div className="space-y-3">
                        {pendingTasks.map(task => (
                            <div key={task.id} className="p-3 bg-card-bg/50 rounded-md border border-border-subtle flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-text-primary">{task.title}</p>
                                    <p className="text-xs text-text-secondary">Due: {format(new Date(task.dueDate), 'PP')}</p>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => handleCommentClick(task.title)} leftIcon={<MessageSquare size={14}/>}>Comment</Button>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-4 text-text-secondary text-sm">
                        <p>No pending tasks.</p>
                    </div>
                )}
            </div>
             <div>
                <h4 className="font-semibold text-sm mb-2 text-text-secondary">Completed</h4>
                 {completedMilestones.length > 0 ? (
                    <div className="space-y-3">
                        {completedMilestones.map(task => (
                            <div key={task.id} className="p-3 bg-card-bg/50 rounded-md border border-border-subtle flex justify-between items-center opacity-70">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-text-primary line-through">{task.title}</p>
                                        <p className="text-xs text-text-secondary">Completed on: {format(new Date(task.dueDate), 'PP')}</p>
                                    </div>
                                </div>
                                 <Button size="sm" variant="ghost" onClick={() => handleCommentClick(task.title)} leftIcon={<MessageSquare size={14}/>}>Comment</Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-text-secondary text-sm">
                        <p>No completed milestones have been shared yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const SharedFilesTab: React.FC<{ project: Project }> = ({ project }) => {
    const [previewingFile, setPreviewingFile] = useState<DocType | null>(null);
    const { documentsQuery } = useDocuments({ projectId: project.id });
    const { data: documents = [], isLoading } = documentsQuery;

    const sharedFiles = useMemo(() => documents.filter((d: DocType) => d.isVisibleToClient), [documents]);
    
    const handlePreview = (doc: DocType) => doc.fileType.startsWith('image/') ? setPreviewingFile(doc) : handleDownload(doc);
    const handleDownload = (doc: DocType) => {
        const link = document.createElement('a');
        link.href = doc.dataUrl;
        link.download = doc.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) return <p>Loading files...</p>;

    return (
        <div>
             {sharedFiles.length > 0 ? (
                <div className="divide-y divide-border-subtle border border-border-subtle rounded-lg">
                    {sharedFiles.map((doc: DocType) => (
                        <div key={doc.id} className="p-3 flex justify-between items-center">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex-shrink-0">{getFileIcon(doc.fileType)}</div>
                                <p className="font-medium text-text-primary truncate">{doc.fileName}</p>
                            </div>
                            <div className="space-x-1 flex-shrink-0">
                                <Button size="sm" variant="secondary" onClick={() => handlePreview(doc)}><Eye size={14} /></Button>
                                <Button size="sm" variant="secondary" onClick={() => handleDownload(doc)}><Download size={14} /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-text-secondary">
                    <p>No files have been shared for this project yet.</p>
                </div>
            )}
            {previewingFile && (
                <FilePreviewModal
                    isOpen={!!previewingFile}
                    onClose={() => setPreviewingFile(null)}
                    fileUrl={previewingFile.dataUrl}
                    fileName={previewingFile.fileName}
                />
            )}
        </div>
    );
};

const DiscussionTab: React.FC<{ project: Project, prefilledComment: string, setPrefilledComment: (c: string) => void }> = ({ project, prefilledComment, setPrefilledComment }) => {
    const { authenticatedUser } = useAuth();
    const { teamMembersQuery, addProjectCommentMutation } = useData();
    const { data: teamMembers = [] } = teamMembersQuery;
    const [newComment, setNewComment] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (prefilledComment) {
            setNewComment(prefilledComment);
            setPrefilledComment(''); // Clear after using
            textareaRef.current?.focus();
        }
    }, [prefilledComment, setPrefilledComment]);


    const userMap = useMemo(() => new Map((teamMembers as User[]).map(u => [u.id, u])), [teamMembers]);

    const handlePostComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const assignee = userMap.get(project.assignedToId || '');
        let message = newComment;
        
        // If it's a new comment (not a reply to a task) then @mention the assignee
        if (!message.startsWith('[RE: Task')) {
            if (assignee) {
                message = `@${assignee.name} ${newComment}`;
            }
        }
        
        addProjectCommentMutation.mutate({
            projectId: project.id,
            comment: { userId: authenticatedUser!.id, message }
        }, { onSuccess: () => setNewComment('') });
    };
    
    return (
        <div className="space-y-4">
             <form onSubmit={handlePostComment}>
                <Textarea ref={textareaRef} id="new-comment" label="Ask a question or post an update" value={newComment} onChange={e => setNewComment(e.target.value)} rows={3} />
                <div className="flex justify-end mt-2">
                    <Button type="submit" size="sm" disabled={addProjectCommentMutation.isPending}>Post Comment</Button>
                </div>
            </form>
            <div className="space-y-3 pt-4 border-t border-border-subtle">
                {[...(project.comments || [])].reverse().map(comment => {
                    const user = userMap.get(comment.userId);
                    if (!user) return null;
                    const isClient = user.id === authenticatedUser?.id;
                    
                    const taskMentionRegex = /\[RE: Task "(.*?)"\](.*)/s;
                    const match = comment.message.match(taskMentionRegex);

                    return (
                        <div key={comment.id} className={`flex items-start gap-3 ${isClient ? 'flex-row-reverse' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-slate-500">{user?.name.charAt(0)}</div>
                            <div className={`p-3 rounded-lg ${isClient ? 'bg-primary/10' : 'bg-hover-bg'}`}>
                                <p className="text-sm"><span className="font-semibold">{user?.name}</span><span className="text-xs text-text-secondary ml-2">{formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}</span></p>
                                 {match ? (
                                     <div className="mt-1">
                                        <div className="p-2 bg-slate-200/50 dark:bg-slate-700/50 rounded-md text-xs italic border-l-2 border-slate-400 mb-2">
                                            In reply to task: "{match[1]}"
                                        </div>
                                        <p className="text-sm text-text-secondary whitespace-pre-wrap">{match[2].trim()}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{comment.message}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ChecklistsTab: React.FC<{ project: Project }> = ({ project }) => {
    const { updateClientChecklistMutation } = useData();
    
    const handleItemToggle = (checklist: ClientChecklist, itemToToggle: ClientChecklistItem) => {
        const updatedItems = checklist.items.map(item =>
            item.id === itemToToggle.id ? { ...item, isCompleted: !item.isCompleted } : item
        );
        const updatedChecklist = { ...checklist, items: updatedItems };
        
        updateClientChecklistMutation.mutate({ projectId: project.id, checklist: updatedChecklist });
    };

    return (
        <div className="space-y-4">
            {(project.checklists || []).map(checklist => {
                const completedCount = checklist.items.filter(i => i.isCompleted).length;
                const totalCount = checklist.items.length;
                const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                
                return (
                    <div key={checklist.id} className="p-4 border border-border-subtle rounded-lg">
                        <h4 className="font-semibold">{checklist.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-text-secondary my-2">
                            <div className="w-full bg-hover-bg rounded-full h-1.5">
                                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                            <span>{completedCount} / {totalCount}</span>
                        </div>
                        <div className="space-y-2">
                            {checklist.items.map(item => (
                                <label key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-hover-bg cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={item.isCompleted}
                                        onChange={() => handleItemToggle(checklist, item)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className={`text-sm ${item.isCompleted ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{item.text}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            })}
            {(project.checklists || []).length === 0 && (
                <div className="text-center py-8 text-text-secondary">
                    <ListChecks className="mx-auto h-12 w-12" />
                    <p className="mt-2">No checklists have been assigned to this project yet.</p>
                </div>
            )}
        </div>
    );
};


export default ClientProjectDetailView;