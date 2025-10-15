import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { Document as AppDocument } from '../types';
import toast from 'react-hot-toast';

interface UseDocumentsOptions {
    contactId?: string;
    projectId?: string;
}

export const useDocuments = (options: UseDocumentsOptions) => {
    const { contactId, projectId } = options;
    const queryClient = useQueryClient();

    const queryKey = ['documents', { contactId, projectId }];

    const documentsQuery = useQuery<AppDocument[], Error>({
        queryKey,
        queryFn: () => apiClient.getDocuments({ contactId, projectId }),
        enabled: !!contactId || !!projectId,
    });

    const uploadDocumentMutation = useMutation({
        mutationFn: (docData: Omit<AppDocument, 'id'|'uploadDate'>) => apiClient.uploadDocument(docData),
        onSuccess: () => {
            toast.success('Document uploaded!');
            queryClient.invalidateQueries({ queryKey });
        },
        onError: () => toast.error('Failed to upload document.'),
    });

    const updateDocumentMutation = useMutation({
        mutationFn: (docData: AppDocument) => apiClient.updateDocument(docData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
        onError: () => toast.error('Failed to update document.'),
    });

    const deleteDocumentMutation = useMutation({
        mutationFn: (docId: string) => apiClient.deleteDocument(docId),
        onSuccess: () => {
            toast.success('Document deleted!');
            queryClient.invalidateQueries({ queryKey });
        },
        onError: () => toast.error('Failed to delete document.'),
    });

    return {
        documentsQuery,
        uploadDocumentMutation,
        updateDocumentMutation,
        deleteDocumentMutation,
    };
};
