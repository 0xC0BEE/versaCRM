import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
// FIX: Corrected the import path for apiClient from a file path to a relative module path.
import apiClient from '../../../services/apiClient';
// FIX: Corrected the import path for types to be a valid relative path.
import { Interaction } from '../../../types';
import InteractionsTimeline from '../../common/InteractionsTimeline';

const ClientHistoryTab: React.FC = () => {
    const { authenticatedUser } = useAuth();
    // FIX: Corrected mapping from user to contactId.
    const contactId = authenticatedUser?.contactId;

    const { data: interactions, isLoading } = useQuery<Interaction[], Error>({
        queryKey: ['contactInteractions', contactId],
        // FIX: Used correct api method.
        queryFn: () => apiClient.getInteractionsByContact(contactId!),
        enabled: !!contactId,
    });

    if (isLoading) return <div>Loading history...</div>;

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Your History</h3>
            <InteractionsTimeline interactions={interactions || []} />
        </div>
    );
};

export default ClientHistoryTab;
