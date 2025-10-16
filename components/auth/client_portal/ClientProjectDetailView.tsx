import React, { useState, useMemo, useRef } from 'react';
import { Project, Task, Document as DocType, User } from '../../../types';
import Button from '../../ui/Button';
import Tabs from '../../ui/Tabs';
import { ArrowLeft, CheckCircle, File, FileImage, FileText, Download, Eye } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState('Milestones');

    const tabs = ['Milestones', 'Shared Files', 'Discussion'];

    const renderContent = () => {
        switch (activeTab) {
            case 'Milestones': return <MilestonesTab project={project} />;
            case 'Shared Files': return <SharedFilesTab project={project} />;
            case 'Discussion': return <DiscussionTab project={project} />;
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

const MilestonesTab: React.FC<{ project: Project }> = ({ project }) => {
    const { tasksQuery } = useData();
    const { data: allTasks = [], isLoading } = tasksQuery;
    
    const milestones = useMemo(() => {
        return (allTasks as Task[])
            .filter(t => t.projectId === project.id && t.isCompleted && t.isVisibleToClient)
            .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    }, [allTasks, project.id]);

    if (isLoading) return <p>Loading milestones...</p>;

    return (
        <div>
            {milestones.length > 0 ? (
                <div className="space-y-3">
                    {milestones.map(task => (
                        <div key={task.id} className="p-3 bg-card-bg/50 rounded-md border border-border-subtle flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                            <div>
                                <p className="font-medium text-text-primary">{task.title}</p>
                                <p className="text-xs text-text-secondary">Completed on: {format(new Date(task.dueDate), 'PP')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-text-secondary">
                    <p>No completed milestones have been shared yet.</p>
                </div>
            )}
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

const DiscussionTab: React.FC<{ project: Project }> = ({ project }) => {
    const { authenticatedUser } = useAuth();
    const { teamMembersQuery, addProjectCommentMutation } = useData();
    const { data: teamMembers = [] } = teamMembersQuery;
    const [newComment, setNewComment] = useState('');

    const userMap = useMemo(() => new Map((teamMembers as User[]).map(u => [u.id, u])), [teamMembers]);

    const handlePostComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const assignee = userMap.get(project.assignedToId || '');
        let message = newComment;
        if (assignee) {
            message = `@${assignee.name} ${newComment}`;
        }
        
        addProjectCommentMutation.mutate({
            projectId: project.id,
            comment: { userId: authenticatedUser!.id, message }
        }, { onSuccess: () => setNewComment('') });
    };
    
    return (
        <div className="space-y-4">
             <form onSubmit={handlePostComment}>
                <Textarea id="new-comment" label="Ask a question or post an update" value={newComment} onChange={e => setNewComment(e.target.value)} rows={3} />
                <div className="flex justify-end mt-2">
                    <Button type="submit" size="sm" disabled={addProjectCommentMutation.isPending}>Post Comment</Button>
                </div>
            </form>
            <div className="space-y-3 pt-4 border-t border-border-subtle">
                {[...(project.comments || [])].reverse().map(comment => {
                    const user = userMap.get(comment.userId);
                    if (!user) return null;
                    const isClient = user.id === authenticatedUser?.id;

                    return (
                        <div key={comment.id} className={`flex items-start gap-3 ${isClient ? 'flex-row-reverse' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-slate-500">{user?.name.charAt(0)}</div>
                            <div className={`p-3 rounded-lg ${isClient ? 'bg-primary/10' : 'bg-hover-bg'}`}>
                                <p className="text-sm"><span className="font-semibold">{user?.name}</span><span className="text-xs text-text-secondary ml-2">{formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}</span></p>
                                <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{comment.message}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export default ClientProjectDetailView;