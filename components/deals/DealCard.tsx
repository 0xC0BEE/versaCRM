import React, { useMemo } from 'react';
import { Deal, AnyContact, DealForecast } from '../../types';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
import { Handshake } from 'lucide-react';
import DealForecastDisplay from './DealForecast';

interface DealCardProps {
    deal: Deal;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, dealId: string) => void;
    onClick: (deal: Deal) => void;
    isForecasting: boolean;
    onOpenForecast: (deal: Deal, forecast: DealForecast) => void;
}

const DealCard: React.FC<DealCardProps> = ({ deal, onDragStart, onClick, isForecasting, onOpenForecast }) => {
    const { contactsQuery } = useData();
    const { data: contacts = [] } = contactsQuery;

    const contactName = useMemo(() => {
        const contact = (contacts as AnyContact[]).find(c => c.id === deal.contactId);
        return contact ? contact.contactName : 'Unknown Contact';
    }, [contacts, deal.contactId]);

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, deal.id)}
            onClick={() => onClick(deal)}
            className="p-3 bg-card-bg rounded-lg border border-border-subtle shadow-sm-new cursor-pointer hover:shadow-md-new hover:border-primary/50 transition-all mb-3"
        >
            <h4 className="font-semibold text-sm text-text-primary truncate">{deal.name}</h4>
            <p className="text-xs text-text-secondary mt-1">{contactName}</p>
            <div className="mt-2 flex justify-between items-center">
                <p className="text-sm font-bold text-primary">
                    {deal.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
                 {isForecasting ? (
                    <DealForecastDisplay deal={deal} onOpenForecast={onOpenForecast} />
                ) : (
                    <Handshake size={14} className="text-text-secondary" />
                )}
            </div>
        </div>
    );
};

export default DealCard;