import React, { useState, useMemo } from 'react';
import { Project, Task, Document as DocType } from '../../../types';
import Button from '../../ui/Button';
import Tabs from '../../ui/Tabs';
import { ArrowLeft, CheckCircle, File, FileImage, FileText, Download, Eye } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';
// FIX: Corrected import to use the existing `useDocuments` hook.
import { useDocuments } from '../../../hooks/useDocuments';
import { format } from 'date-fns';
import FilePreviewModal from '../../ui/FilePreviewModal';

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
    const [previewingFile, setPreviewingFile] = useState<DocType | null>(null);

    const MilestonesTab = () => {
        const { tasksQuery } = useData();
        const { data: allTasks = [], isLoading } = tasksQuery;
        
        const milestones = useMemo(() => {
            return (allTasks as Task[])
                .filter(t => t.projectId === project.id && t.isCompleted && t.isVisibleToClient)
                .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
        }, [allTasks]);

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

    const SharedFilesTab = () => {
        // FIX: The hook expects an object with `projectId`, not just the ID.
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
            </div>
        );
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
            <Tabs tabs={['Milestones', 'Shared Files']} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="mt-4">
                {activeTab === 'Milestones' ? <MilestonesTab /> : <SharedFilesTab />}
            </div>
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

export default ClientProjectDetailView;