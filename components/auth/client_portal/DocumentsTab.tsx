import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
// FIX: Corrected the import path for types to be a valid relative path.
import { Document as DocType } from '../../../types';
import { format } from 'date-fns';
import Button from '../../ui/Button';
import FilePreviewModal from '../../ui/FilePreviewModal';
import { File, FileImage, FileText, Download, Eye } from 'lucide-react';
import { useDocuments } from '../../../hooks/useDocuments';

const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
        return <FileImage className="h-6 w-6 text-purple-500" />;
    }
    if (fileType === 'application/pdf') {
        return <FileText className="h-6 w-6 text-red-500" />;
    }
    return <File className="h-6 w-6 text-gray-500" />;
};

const ClientDocumentsTab: React.FC = () => {
    const { authenticatedUser } = useAuth();
    const contactId = authenticatedUser?.contactId;
    const { documentsQuery } = useDocuments(contactId!);

    const { data: documents = [], isLoading } = documentsQuery;
    const [previewingFile, setPreviewingFile] = useState<DocType | null>(null);

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
            <h3 className="text-lg font-semibold mb-4">Your Documents</h3>
            <p className="text-sm text-gray-500 mb-4">Here you can view and download documents shared with you.</p>
            
            {isLoading ? (
                <p>Loading your documents...</p>
            ) : documents.length > 0 ? (
                <div className="divide-y dark:divide-dark-border border dark:border-dark-border rounded-lg">
                    {documents.map((doc: DocType) => (
                        <div key={doc.id} className="p-3 flex justify-between items-center">
                            <div className="flex items-center gap-3 flex-grow min-w-0">
                                {getFileIcon(doc.fileType)}
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-800 dark:text-white truncate">{doc.fileName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Uploaded on {format(new Date(doc.uploadDate), 'PP')}
                                    </p>
                                </div>
                            </div>
                            <div className="space-x-1 flex-shrink-0 ml-4">
                                <Button size="sm" variant="secondary" onClick={() => handlePreview(doc)}><Eye size={14} /></Button>
                                <Button size="sm" variant="secondary" onClick={() => handleDownload(doc)}><Download size={14} /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <File className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No documents have been shared with you yet.</p>
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

export default ClientDocumentsTab;