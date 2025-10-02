import React, { useRef, useState } from 'react';
import { AnyContact, Document as DocType } from '../../../types';
import Button from '../../ui/Button';
import { Plus, File, FileImage, FileText, Download, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import FilePreviewModal from '../../ui/FilePreviewModal';
import { useDocuments } from '../../../hooks/useDocuments';

interface DocumentsTabProps {
    contact: AnyContact;
    isReadOnly: boolean;
}

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
        return <FileImage className="h-6 w-6 text-purple-500" />;
    }
    if (fileType === 'application/pdf') {
        return <FileText className="h-6 w-6 text-red-500" />;
    }
    return <File className="h-6 w-6 text-gray-500" />;
};

const DocumentsTab: React.FC<DocumentsTabProps> = ({ contact, isReadOnly }) => {
    const { authenticatedUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { documentsQuery, uploadDocumentMutation, deleteDocumentMutation } = useDocuments(contact.id);
    const { data: documents = [], isLoading } = documentsQuery;

    const [previewingFile, setPreviewingFile] = useState<DocType | null>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const dataUrl = await fileToDataUrl(file);
                uploadDocumentMutation.mutate({
                    contactId: contact.id,
                    organizationId: contact.organizationId,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    uploadDate: new Date().toISOString(),
                    uploadedByUserId: authenticatedUser!.id,
                    dataUrl,
                });
            } catch (error) {
                toast.error("Failed to read file for upload.");
            }
        }
    };

    const handleDelete = (doc: DocType) => {
        if (window.confirm(`Are you sure you want to delete "${doc.fileName}"?`)) {
            deleteDocumentMutation.mutate(doc.id);
        }
    }

    const handlePreview = (doc: DocType) => {
        if (doc.fileType.startsWith('image/')) {
            setPreviewingFile(doc);
        } else {
            // For non-image files, just download them.
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
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Documents</h4>
                {!isReadOnly && (
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={uploadDocumentMutation.isPending}
                        />
                        <Button 
                            size="sm" 
                            variant="secondary" 
                            leftIcon={<Plus size={14} />}
                            onClick={handleUploadClick}
                            disabled={uploadDocumentMutation.isPending}
                        >
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
                        <div key={doc.id} className="p-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <div className="flex items-center gap-3 flex-grow min-w-0">
                                {getFileIcon(doc.fileType)}
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-800 dark:text-white truncate">{doc.fileName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Uploaded on {format(new Date(doc.uploadDate), 'PP')} - {(doc.fileSize / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                            {!isReadOnly && (
                                <div className="space-x-1 flex-shrink-0 ml-4">
                                    <Button size="sm" variant="secondary" onClick={() => handlePreview(doc)}><Eye size={14} /></Button>
                                    <Button size="sm" variant="secondary" onClick={() => handleDownload(doc)}><Download size={14} /></Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(doc)} disabled={deleteDocumentMutation.isPending}><Trash2 size={14} /></Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p>No documents found.</p>
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
