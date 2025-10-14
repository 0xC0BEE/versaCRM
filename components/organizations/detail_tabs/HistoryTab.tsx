import React, { useState } from 'react';
import { AnyContact, Interaction } from '../../../types';
import InteractionsTimeline from '../../common/InteractionsTimeline';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import Button from '../../ui/Button';
import { Plus } from 'lucide-react';
import InteractionEditModal from '../../interactions/InteractionEditModal';

interface HistoryTabProps {
    contact: AnyContact;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ contact }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { data: interactions = [], isLoading } = useQuery<Interaction[], Error>({
        queryKey: ['contactInteractions', contact.id],
        queryFn: () => apiClient.getInteractionsByContact(contact.id),
    });

    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Interaction History</h4>
                <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={() => setIsModalOpen(true)}>
                    Log Interaction
                </Button>
            </div>
            {isLoading ? (
                <div>Loading history...</div>
            ) : (
                <InteractionsTimeline interactions={interactions} />
            )}
            {isModalOpen && (
                <InteractionEditModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    contact={contact}
                />
            )}
        </div>
    );
};

export default HistoryTab;