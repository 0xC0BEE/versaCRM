import React, { useMemo } from 'react';
import { Deal, AnyContact, DealForecast, CustomObjectDefinition, CustomObjectRecord } from '../../types';
import { useData } from '../../contexts/DataContext';
import { Handshake, Link, Clock, Check, X } from 'lucide-react';
import DealForecastDisplay from './DealForecast';

interface DealCardProps {
    deal: Deal;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, dealId: string) => void;
    onClick: (deal: Deal) => void;
    isForecasting: boolean;
    onOpenForecast: (deal: Deal, forecast: DealForecast) => void;
    isDraggable: boolean;
}

const DealCard: React.FC<DealCardProps> = ({ deal, onDragStart, onClick, isForecasting, onOpenForecast, isDraggable }) => {
    const { contactsQuery, customObjectDefsQuery } = useData();
    const { data: contacts = [] } = contactsQuery;
    const { data: customObjectDefs = [] } = customObjectDefsQuery;
    
    // Fetch records for the specific definition needed for this deal
    const { data: relatedRecords = [] } = useData().customObjectRecordsQuery(deal.relatedObjectDefId || null);

    const contactName = useMemo(() => {
        const contact = (contacts as AnyContact[]).find(c => c.id === deal.contactId);
        return contact ? contact.contactName : 'Unknown Contact';
    }, [contacts, deal.contactId]);
    
    const relatedObjectName = useMemo(() => {
        if (!deal.relatedObjectDefId || !deal.relatedObjectRecordId) return null;

        const definition = (customObjectDefs as CustomObjectDefinition[]).find(d => d.id === deal.relatedObjectDefId);
        if (!definition || definition.fields.length === 0) return null;

        const record = (relatedRecords as CustomObjectRecord[]).find(r => r.id === deal.relatedObjectRecordId);
        if (!record) return null;

        const primaryFieldId = definition.fields[0].id;
        return record.fields[primaryFieldId] || 'Unnamed Record';

    }, [deal, customObjectDefs, relatedRecords]);
    
    const renderApprovalStatus = () => {
        if (!deal.approvalStatus) return null;
        
        let icon = <Clock size={12} />;
        let color = 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
        if (deal.approvalStatus === 'Approved') {
            icon = <Check size={12} />;
            color = 'bg-green-500/10 text-green-600 dark:text-green-400';
        } else if (deal.approvalStatus === 'Rejected') {
            icon = <X size={12} />;
            color = 'bg-red-500/10 text-red-600 dark:text-red-400';
        }
        
        return (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${color}`}>
                {icon}
                {deal.approvalStatus}
            </span>
        );
    }

    return (
        <div
            draggable={isDraggable}
            onDragStart={isDraggable ? (e) => onDragStart(e, deal.id) : undefined}
            onClick={() => onClick(deal)}
            className={`p-3 bg-card-bg rounded-lg border border-border-subtle shadow-sm-new ${isDraggable ? 'cursor-grab' : 'cursor-pointer'} hover:shadow-md-new hover:border-primary/50 transition-all`}
        >
            <h4 className="font-semibold text-sm text-text-primary truncate">{deal.name}</h4>
            <p className="text-xs text-text-secondary mt-1">{contactName}</p>
            {relatedObjectName && (
                <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                    <Link size={12}/>
                    {relatedObjectName}
                </p>
            )}
            <div className="mt-2 flex justify-between items-center">
                <p className="text-sm font-bold text-primary">
                    {deal.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
                {deal.approvalStatus ? renderApprovalStatus() : isForecasting ? (
                    <DealForecastDisplay deal={deal} onOpenForecast={onOpenForecast} />
                ) : (
                    <Handshake size={14} className="text-text-secondary" />
                )}
            </div>
        </div>
    );
};

export default DealCard;
