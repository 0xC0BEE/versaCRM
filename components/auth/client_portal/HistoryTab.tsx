import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
// FIX: Imported correct type.
import { Interaction } from '../../../types';
import InteractionsTimeline from '../../interactions/InteractionsTimeline';

const HistoryTab: React.FC = () => {
    const { authenticatedUser } = useAuth();
    // FIX: Corrected mapping from user to contactId.
    const contactId = authenticatedUser?.contactId;

    const { data: interactions, isLoading } = useQuery<Interaction[], Error>({
        queryKey: ['contactInteractions', contactId],
        // FIX: Used correct api method.
        queryFn: () => api.getInteractionsByContact(contactId!),
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

export default HistoryTab;
