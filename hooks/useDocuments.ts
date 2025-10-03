import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
// FIX: Corrected import path for types.
import { Document as AppDocument } from '../types';
import toast from 'react-hot-toast';

export const useDocuments = (contactId: string) => {
    const queryClient = useQueryClient();

    const documentsQuery = useQuery<AppDocument[], Error>({
        queryKey: ['documents', contactId],
        queryFn: () => apiClient.getDocuments(contactId),
        enabled: !!contactId,
    });

    const uploadDocumentMutation = useMutation({
        mutationFn: (docData: Omit<AppDocument, 'id'|'uploadDate'>) => apiClient.uploadDocument(docData),
        onSuccess: () => {
            toast.success('Document uploaded!');
            queryClient.invalidateQueries({ queryKey: ['documents', contactId] });
        },
        onError: () => toast.error('Failed to upload document.'),
    });

    const deleteDocumentMutation = useMutation({
        mutationFn: (docId: string) => apiClient.deleteDocument(docId),
        onSuccess: () => {
            toast.success('Document deleted!');
            queryClient.invalidateQueries({ queryKey: ['documents', contactId] });
        },
        onError: () => toast.error('Failed to delete document.'),
    });

    return {
        documentsQuery,
        uploadDocumentMutation,
        deleteDocumentMutation,
    };
};