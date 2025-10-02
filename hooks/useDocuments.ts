import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
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
        mutationFn: apiClient.uploadDocument,
        onSuccess: () => {
            toast.success('Document uploaded!');
            queryClient.invalidateQueries({ queryKey: ['documents', contactId] });
        },
        onError: () => toast.error('Failed to upload document.'),
    });

    const deleteDocumentMutation = useMutation({
        mutationFn: apiClient.deleteDocument,
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
