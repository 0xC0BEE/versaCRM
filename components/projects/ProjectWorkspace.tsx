// FIX: Imported the useEffect hook from React to resolve reference error.
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Project, AnyContact, Task, Deal, User, Document as DocType, ClientChecklist, ClientChecklistTemplate } from '../../types';
import PageWrapper from '../layout/PageWrapper';
import Button from '../ui/Button';
import { ArrowLeft, Edit, Plus, File, FileImage, FileText, Download, Eye, UploadCloud, Trash2, EyeOff, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Card } from '../ui/Card';
import Tabs from '../ui/Tabs';
import ProjectEditModal from './ProjectEditModal';
import TaskItem from '../tasks/TaskItem';
import Input from '../ui/Input';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import Textarea from '../ui/Textarea';
import { useDocuments } from '../../hooks/useDocuments';
import { fileToDataUrl } from '../../utils/fileUtils';
import FilePreviewModal from '../ui/FilePreviewModal';
import Modal from '../ui/Modal';

interface ProjectWorkspaceProps {
    projectId: string;
    onBack: () => void;
}

const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ projectId, onBack }) => {
    const { 
        projectsQuery, 
        contactsQuery, 
        dealsQuery, 
        teamMembersQuery,
        tasksQuery,
        createTaskMutation,
        updateTaskMutation,
        addProjectCommentMutation,
        updateProjectMutation
    } = useData();
    const { authenticatedUser } = useAuth();
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Tasks');

    const project = useMemo(() => (projectsQuery.data as Project[])?.find(p => p.id === projectId), [projectsQuery.data, projectId]);
    const contact = useMemo(() => (contactsQuery.data as AnyContact[])?.find(c => c.id === project?.contactId), [contactsQuery.data, project]);
    const userMap = useMemo(() => new Map((teamMembersQuery.data as User[] || []).map(u => [u.id, u])), [teamMembersQuery.data]);
    
    const projectTasks = useMemo(() => (tasksQuery.data as Task[] || []).filter(t => t.projectId === projectId), [tasksQuery.data, projectId]);

    const isLoading = projectsQuery.isLoading || contactsQuery.isLoading || dealsQuery.isLoading || teamMembersQuery.isLoading || tasksQuery.isLoading;
    
    if (isLoading) {
        return <PageWrapper><LoadingSpinner /></PageWrapper>;
    }

    if (!project) {
        return <PageWrapper><p>Project not found.</p></PageWrapper>;
    }

    const TasksTab = () => {
        const [newTaskTitle, setNewTaskTitle] = useState('');
        const handleAddTask = (e: React.FormEvent) => {
            e.preventDefault();
            if (!newTaskTitle.trim()) return;
            createTaskMutation.mutate({
                title: newTaskTitle,
                dueDate: new Date().toISOString(),
                userId: authenticatedUser!.id,
                organizationId: authenticatedUser!.organizationId,
                projectId,
                contactId: project?.contactId,
            }, { onSuccess: () => setNewTaskTitle('') });
        };
        
        const handleVisibilityToggle = (task: Task) => {
            updateTaskMutation.mutate({ ...task, isVisibleToClient: !task.isVisibleToClient });
        };

        return (
            <div className="space-y-4">
                <form onSubmit={handleAddTask} className="flex gap-2">
                    <Input id="new-task" label="" placeholder="Add a new task for this project..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="flex-grow" />
                    <Button type="submit" leftIcon={<Plus size={16} />} disabled={createTaskMutation.isPending}>Add Task</Button>
                </form>
                <div className="space-y-2">
                    {projectTasks.filter(t => !t.isCompleted).map(task => (
                        <div key={task.id} className="flex items-center gap-2">
                            <TaskItem task={task} onEdit={() => toast.error("Edit from here not implemented yet.")} />
                            <Button size="icon" variant="ghost" onClick={() => handleVisibilityToggle(task)} className="h-9 w-9" title="Toggle client visibility">
                                {task.isVisibleToClient ? <Eye size={16} className="text-primary"/> : <EyeOff size={16} className="text-text-secondary"/>}
                            </Button>
                        </div>
                    ))}
                    {projectTasks.filter(t => t.isCompleted).map(task => (
                        <div key={task.id} className="flex items-center gap-2">
                           <TaskItem task={task} onEdit={() => toast.error("Edit from here not implemented yet.")} />
                            <Button size="icon" variant="ghost" onClick={() => handleVisibilityToggle(task)} className="h-9 w-9" title="Toggle client visibility">
                                {task.isVisibleToClient ? <Eye size={16} className="text-primary"/> : <EyeOff size={16} className="text-text-secondary"/>}
                            </Button>
                        </div>
                    ))}
                    {projectTasks.length === 0 && <p className="text-sm text-center py-4 text-text-secondary">No tasks for this project yet.</p>}
                </div>
            </div>
        );
    };

    const DiscussionTab = () => {
        const [newComment, setNewComment] = useState('');
        const [mentionQuery, setMentionQuery] = useState('');
        const [showSuggestions, setShowSuggestions] = useState(false);
        const { data: teamMembers = [] } = teamMembersQuery;
        
        const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            setNewComment(value);

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
            const textBeforeMention = newComment.substring(0, newComment.lastIndexOf('@'));
            const textAfterMention = newComment.substring(newComment.lastIndexOf('@') + mentionQuery.length + 1);
            setNewComment(`${textBeforeMention}@${user.name} ${textAfterMention}`);
            setShowSuggestions(false);
        };

        const filteredSuggestions = useMemo(() => {
            if (!mentionQuery) return teamMembers;
            return teamMembers.filter((member: User) => member.name.toLowerCase().includes(mentionQuery.toLowerCase()));
        }, [mentionQuery, teamMembers]);

        const handlePostComment = (e: React.FormEvent) => {
            e.preventDefault();
            if (!newComment.trim()) return;
            addProjectCommentMutation.mutate({
                projectId,
                comment: { userId: authenticatedUser!.id, message: newComment }
            }, { onSuccess: () => setNewComment('') });
        };
        
        return (
            <div className="space-y-4">
                 <form onSubmit={handlePostComment} className="relative">
                    <Textarea id="new-comment" label="Add a comment" value={newComment} onChange={handleCommentChange} rows={3} />
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full bottom-full mb-1 bg-card-bg border border-border-subtle rounded-md shadow-lg max-h-40 overflow-y-auto">
                           {filteredSuggestions.map((user: User) => (
                                <button key={user.id} onClick={() => handleMentionSelect(user)} className="w-full text-left px-4 py-2 text-sm hover:bg-hover-bg">{user.name}</button>
                           ))}
                        </div>
                    )}
                    <div className="flex justify-end mt-2">
                        <Button type="submit" size="sm" disabled={addProjectCommentMutation.isPending}>Post Comment</Button>
                    </div>
                </form>
                <div className="space-y-3">
                    {[...(project.comments || [])].reverse().map(comment => {
                        const user = userMap.get(comment.userId);
                        const taskMentionRegex = /\[RE: Task "(.*?)"\](.*)/s;
                        const match = comment.message.match(taskMentionRegex);

                        return (
                            <div key={comment.id} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-slate-500">{user?.name.charAt(0)}</div>
                                <div>
                                    <p className="text-sm">
                                        <span className="font-semibold">{user?.name}</span>
                                        {user?.isClient && <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-sm bg-blue-500/10 text-blue-500">Client</span>}
                                        <span className="text-xs text-text-secondary ml-2">{formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}</span>
                                    </p>
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
    
    const FilesTab = () => {
        const { documentsQuery, uploadDocumentMutation, deleteDocumentMutation, updateDocumentMutation } = useDocuments({ projectId });
        const { data: documents = [], isLoading } = documentsQuery;
        const [previewingFile, setPreviewingFile] = useState<DocType | null>(null);
        const fileInputRef = useRef<HTMLInputElement>(null);

        const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                const dataUrl = await fileToDataUrl(file);
                uploadDocumentMutation.mutate({
                    projectId,
                    organizationId: authenticatedUser!.organizationId!,
                    fileName: file.name,
                    fileType: file.type,
                    dataUrl,
                    isVisibleToClient: false,
                });
            }
        };
        
        const handleVisibilityToggle = (doc: DocType) => {
            updateDocumentMutation.mutate({ ...doc, isVisibleToClient: !doc.isVisibleToClient });
        };
        
        const getFileIcon = (fileType: string) => {
            if (fileType.startsWith('image/')) return <FileImage className="h-6 w-6 text-purple-500" />;
            if (fileType === 'application/pdf') return <FileText className="h-6 w-6 text-red-500" />;
            return <File className="h-6 w-6 text-text-secondary" />;
        };

        const handlePreview = (doc: DocType) => {
            if (doc.fileType.startsWith('image/')) {
                setPreviewingFile(doc);
            } else {
                handleDownload(doc);
            }
        };

        const handleDownload = (doc: DocType) => {
            const link = document.createElement('a');
            link.href = doc.dataUrl;
            link.download = doc.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

         return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Project Files</h4>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                    <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} leftIcon={<UploadCloud size={14} />} disabled={uploadDocumentMutation.isPending}>Upload File</Button>
                </div>
                 {isLoading ? <p>Loading files...</p> : documents.length > 0 ? (
                    <div className="divide-y divide-border-subtle border border-border-subtle rounded-lg">
                        {documents.map((doc: DocType) => (
                             <div key={doc.id} className="p-3 flex justify-between items-center">
                                <div className="flex items-center gap-3 min-w-0"><div className="flex-shrink-0">{getFileIcon(doc.fileType)}</div><div className="truncate"><p className="font-medium text-text-primary truncate">{doc.fileName}</p><p className="text-xs text-text-secondary">Uploaded on {format(new Date(doc.uploadDate), 'PP')}</p></div></div>
                                <div className="space-x-1 flex-shrink-0">
                                    <Button size="sm" variant="ghost" onClick={() => handleVisibilityToggle(doc)} title="Toggle client visibility">
                                        {doc.isVisibleToClient ? <Eye size={14} className="text-primary"/> : <EyeOff size={14} className="text-text-secondary"/>}
                                    </Button>
                                    <Button size="sm" variant="secondary" onClick={() => handlePreview(doc)}><Eye size={14} /></Button>
                                    <Button size="sm" variant="secondary" onClick={() => handleDownload(doc)}><Download size={14} /></Button>
                                    <Button size="sm" variant="danger" onClick={() => deleteDocumentMutation.mutate(doc.id)} disabled={deleteDocumentMutation.isPending}><Trash2 size={14} /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <div className="text-center py-12 text-text-secondary"><File className="mx-auto h-12 w-12" /><p className="mt-2">No files uploaded yet.</p></div>}
                
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

    const NotesTab = () => {
        const [localNotes, setLocalNotes] = useState(project.notes || '');
        useEffect(() => setLocalNotes(project.notes || ''), [project.notes]);
        
        const handleSaveNotes = () => {
            updateProjectMutation.mutate({ ...project, notes: localNotes }, {
                onSuccess: () => toast.success("Notes saved!")
            });
        };

        return (
            <div>
                 <Textarea id="project-notes" label="Project Notes / Wiki" value={localNotes} onChange={e => setLocalNotes(e.target.value)} rows={15} />
                 <div className="flex justify-end mt-2">
                    <Button size="sm" onClick={handleSaveNotes} disabled={updateProjectMutation.isPending}>Save Notes</Button>
                 </div>
            </div>
        )
    };

    const ChecklistsTab = () => {
        const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

        const AssignedChecklist: React.FC<{ checklist: ClientChecklist }> = ({ checklist }) => {
            const completedCount = checklist.items.filter(item => item.isCompleted).length;
            const totalCount = checklist.items.length;
            const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

            return (
                <div className="p-4 border border-border-subtle rounded-lg">
                    <h5 className="font-semibold">{checklist.name}</h5>
                    <div className="flex items-center gap-2 text-xs text-text-secondary my-2">
                        <div className="w-full bg-hover-bg rounded-full h-1.5">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span>{completedCount} / {totalCount}</span>
                    </div>
                    <ul className="space-y-1 text-sm">
                        {checklist.items.map(item => (
                            <li key={item.id} className="flex items-center gap-2">
                                <CheckCircle size={14} className={item.isCompleted ? 'text-success' : 'text-gray-300'} />
                                <span className={item.isCompleted ? 'line-through text-text-secondary' : ''}>{item.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        };

        return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Client Checklists</h4>
                    <Button size="sm" variant="secondary" onClick={() => setIsAssignModalOpen(true)} leftIcon={<Plus size={14} />}>Assign Checklist</Button>
                </div>
                 <div className="space-y-4">
                    {(project.checklists || []).map(cl => <AssignedChecklist key={cl.id} checklist={cl} />)}
                    {(project.checklists || []).length === 0 && (
                        <p className="text-sm text-center py-4 text-text-secondary">No checklists assigned to this project yet.</p>
                    )}
                </div>
                {isAssignModalOpen && <AssignChecklistModal project={project} isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} />}
            </div>
        );
    };

    const AssignChecklistModal: React.FC<{ project: Project; isOpen: boolean; onClose: () => void }> = ({ project, isOpen, onClose }) => {
        const { clientChecklistTemplatesQuery, assignChecklistToProjectMutation } = useData();
        const { data: templates = [], isLoading } = clientChecklistTemplatesQuery;
        
        const handleAssign = (templateId: string) => {
            assignChecklistToProjectMutation.mutate({ projectId: project.id, templateId }, {
                onSuccess: () => {
                    toast.success("Checklist assigned!");
                    onClose();
                }
            });
        };

        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Assign a Checklist">
                {isLoading ? <LoadingSpinner/> : (
                    <div className="space-y-2">
                        {templates.map((template: ClientChecklistTemplate) => (
                            <div key={template.id} className="p-2 flex justify-between items-center rounded-md hover:bg-hover-bg">
                                <span>{template.name}</span>
                                <Button size="sm" onClick={() => handleAssign(template.id)} disabled={assignChecklistToProjectMutation.isPending}>Assign</Button>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        );
    };

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={onBack} leftIcon={<ArrowLeft size={16} />}>All Projects</Button>
                    <div><h1 className="text-2xl font-semibold text-text-heading">{project.name}</h1><p className="text-sm text-text-secondary">For contact: {contact?.contactName || '...'}</p></div>
                </div>
                <Button variant="secondary" onClick={() => setIsEditModalOpen(true)} leftIcon={<Edit size={16} />}>Edit Project</Button>
            </div>
            <Card>
                <div className="p-6">
                    <Tabs tabs={['Tasks', 'Discussion', 'Files', 'Checklists', 'Notes']} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="mt-6">
                        {activeTab === 'Tasks' && <TasksTab />}
                        {activeTab === 'Discussion' && <DiscussionTab />}
                        {activeTab === 'Files' && <FilesTab />}
                        {activeTab === 'Checklists' && <ChecklistsTab />}
                        {activeTab === 'Notes' && <NotesTab />}
                    </div>
                </div>
            </Card>
            <ProjectEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} project={project} />
        </PageWrapper>
    );
};

export default ProjectWorkspace;