import React, { useState, useRef } from 'react';
import { AnyContact, Document as DocType } from '../../../types';
import { format } from 'date-fns';
import Button from '../../ui/Button';
import FilePreviewModal from '../../ui/FilePreviewModal';
import { File, FileImage, FileText, Download, Eye, Plus, Trash2, UploadCloud } from 'lucide-react';
import { useDocuments } from '../../../hooks/useDocuments';
import { fileToDataUrl } from '../../../utils/fileUtils';
import toast from 'react-hot-toast';

const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="h-6 w-6 text-purple-500" />;
    if (fileType === 'application/pdf') return <FileText className="h-6 w-6 text-red-500" />;
    return <File className="h-6 w-6 text-gray-500" />;
};

interface DocumentsTabProps {
    contact: AnyContact;
    isReadOnly: boolean;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ contact, isReadOnly }) => {
    const { documentsQuery, uploadDocumentMutation, deleteDocumentMutation } = useDocuments(contact.id);
    const { data: documents = [], isLoading } = documentsQuery;
    
    const [previewingFile, setPreviewingFile] = useState<DocType | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const dataUrl = await fileToDataUrl(file);
                uploadDocumentMutation.mutate({
                    contactId: contact.id,
                    organizationId: contact.organizationId,
                    fileName: file.name,
                    fileType: file.type,
                    dataUrl,
                });
            } catch (error) {
                toast.error("Failed to read file.");
            }
        }
        // Reset file input to allow uploading the same file again
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
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

    const handleDelete = (doc: DocType) => {
        if (window.confirm(`Are you sure you want to delete "${doc.fileName}"?`)) {
            deleteDocumentMutation.mutate(doc.id);
        }
    };

    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Documents</h4>
                {!isReadOnly && (
                    <>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                        <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} leftIcon={<UploadCloud size={14} />} disabled={uploadDocumentMutation.isPending}>
                            {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload Document'}
                        </Button>
                    </>
                )}
            </div>

            {isLoading ? (
                <p>Loading documents...</p>
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
                                {!isReadOnly && (
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(doc)} disabled={deleteDocumentMutation.isPending}><Trash2 size={14} /></Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <File className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No documents have been uploaded for this contact yet.</p>
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

export default DocumentsTab;
