import React, { useState } from 'react';
import { AnyContact, Interaction } from '../../../types';
import InteractionsTimeline from '../../common/InteractionsTimeline';
import InteractionEditModal from '../../interactions/InteractionEditModal';
import Button from '../../ui/Button';
import { Plus } from 'lucide-react';

interface HistoryTabProps {
    contact: AnyContact;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ contact }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const interactions = contact.interactions || [];

    return (
        <div className="mt-4 max-h-[55vh] overflow-y-auto p-1">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Interaction History</h4>
                <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={() => setIsModalOpen(true)}>
                    Log Interaction
                </Button>
            </div>
            <InteractionsTimeline interactions={interactions} />
            <InteractionEditModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                contact={contact}
                interaction={null}
            />
        </div>
    );
};

export default HistoryTab;
