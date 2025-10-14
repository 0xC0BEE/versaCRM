import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { Interaction } from '../../../types';
import InteractionsTimeline from '../../common/InteractionsTimeline';

const ClientHistoryTab: React.FC = () => {
    const { authenticatedUser } = useAuth();
    const contactId = authenticatedUser?.contactId;

    const { data: interactions, isLoading } = useQuery<Interaction[], Error>({
        queryKey: ['contactInteractions', contactId],
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