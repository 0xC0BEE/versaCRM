import React from 'react';
// FIX: Corrected import path for types.
import { Deal } from '../../types';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';

interface DealCardProps {
    deal: Deal;
    onClick: () => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
}

const DealCard: React.FC<DealCardProps> = ({ deal, onClick, onDragStart }) => {
    const { contactsQuery } = useData();
    const { data: contacts = [] } = contactsQuery;
    const contact = contacts.find((c: any) => c.id === deal.contactId);

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onClick={onClick}
            className="p-4 bg-white dark:bg-dark-card rounded-md shadow-sm cursor-pointer border dark:border-dark-border hover:shadow-md"
        >
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{deal.name}</h4>
            <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                {deal.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
            {contact && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{contact.contactName}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
                Closes: {new Date(deal.expectedCloseDate).toLocaleDateString()}
            </p>
        </div>
    );
};

export default DealCard;