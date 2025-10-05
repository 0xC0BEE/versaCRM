import React from 'react';
import { Deal, AnyContact } from '../../types';
import { useData } from '../../contexts/DataContext';
import { DollarSign, User } from 'lucide-react';

interface DealCardProps {
    deal: Deal;
    onClick: (deal: Deal) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, dealId: string) => void;
}

const DealCard: React.FC<DealCardProps> = ({ deal, onClick, onDragStart }) => {
    const { contactsQuery } = useData();
    const { data: contacts = [] } = contactsQuery;

    const contact = (contacts as AnyContact[]).find(c => c.id === deal.contactId);

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, deal.id)}
            onClick={() => onClick(deal)}
            className="p-3 mb-3 bg-card-bg rounded-input shadow-sm-new border border-border-subtle cursor-pointer hover:shadow-md-new hover:-translate-y-0.5 transition-all"
        >
            <h4 className="font-semibold text-sm text-text-primary">{deal.name}</h4>
            <p className="text-sm text-text-secondary mt-1 flex items-center">
                <DollarSign size={14} className="mr-1" />
                {deal.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
            {contact && (
                <p className="text-sm text-text-secondary mt-1 flex items-center">
                    <User size={14} className="mr-1" />
                    {contact.contactName}
                </p>
            )}
        </div>
    );
};

export default DealCard;