import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { Document as AppDocument } from '../types';
import toast from 'react-hot-toast';

export const useProjectDocuments = (projectId: string) => {
    const queryClient = useQueryClient();

    const documentsQuery = useQuery<AppDocument[], Error>({
        queryKey: ['documents', projectId],
        queryFn: () => apiClient.getDocuments({ projectId }),
        enabled: !!projectId,
    });

    const uploadDocumentMutation = useMutation({
        mutationFn: (docData: Omit<AppDocument, 'id'|'uploadDate'>) => apiClient.uploadDocument(docData),
        onSuccess: () => {
            toast.success('Document uploaded!');
            queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
        },
        onError: () => toast.error('Failed to upload document.'),
    });

    const deleteDocumentMutation = useMutation({
        mutationFn: (docId: string) => apiClient.deleteDocument(docId),
        onSuccess: () => {
            toast.success('Document deleted!');
            queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
        },
        onError: () => toast.error('Failed to delete document.'),
    });

    return {
        documentsQuery,
        uploadDocumentMutation,
        deleteDocumentMutation,
    };
};