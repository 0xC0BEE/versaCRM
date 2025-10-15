import React, { useState, useRef } from 'react';
import { Document as DocType } from '../../../types';
import { format } from 'date-fns';
import Button from '../../ui/Button';
import FilePreviewModal from '../../ui/FilePreviewModal';
import { File, FileImage, FileText, Download, Eye, UploadCloud } from 'lucide-react';
import { useDocuments } from '../../../hooks/useDocuments';
import { fileToDataUrl } from '../../../utils/fileUtils';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';

const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="h-6 w-6 text-purple-500" />;
    if (fileType === 'application/pdf') return <FileText className="h-6 w-6 text-red-500" />;
    return <File className="h-6 w-6 text-text-secondary" />;
};

const ClientDocumentsTab: React.FC = () => {
    const { authenticatedUser } = useAuth();
    const contactId = authenticatedUser?.contactId;

    const { documentsQuery, uploadDocumentMutation } = useDocuments({ contactId: contactId! });
    const { data: documents = [], isLoading } = documentsQuery;
    
    const [previewingFile, setPreviewingFile] = useState<DocType | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const dataUrl = await fileToDataUrl(file);
                uploadDocumentMutation.mutate({
                    contactId: contactId!,
                    organizationId: authenticatedUser!.organizationId!,
                    fileName: file.name,
                    fileType: file.type,
                    dataUrl,
                    isVisibleToClient: true, // Files uploaded by client are visible to them
                });
            } catch (error) {
                toast.error("Failed to read file.");
            }
        }
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

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Your Documents</h3>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} leftIcon={<UploadCloud size={14} />} disabled={uploadDocumentMutation.isPending}>
                    {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload Document'}
                </Button>
            </div>

            {isLoading ? (
                <p>Loading documents...</p>
            ) : documents.length > 0 ? (
                <div className="divide-y divide-border-subtle border border-border-subtle rounded-lg">
                    {documents.map((doc: DocType) => (
                        <div key={doc.id} className="p-3 flex justify-between items-center">
                            <div className="flex items-center gap-3 flex-grow min-w-0">
                                {getFileIcon(doc.fileType)}
                                <div className="min-w-0">
                                    <p className="font-medium text-text-primary truncate">{doc.fileName}</p>
                                    <p className="text-xs text-text-secondary">
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
                <div className="text-center py-12 text-text-secondary">
                    <File className="mx-auto h-12 w-12 text-text-secondary/50" />
                    <p className="mt-2">No documents have been uploaded yet.</p>
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