import React from 'react';
import { Deal, DealStage } from '../../types';
import DealCard from './DealCard';

interface DealColumnProps {
    stage: DealStage;
    deals: Deal[];
    onCardClick: (deal: Deal) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, dealId: string) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, stageId: string) => void;
}

const DealColumn: React.FC<DealColumnProps> = ({ stage, deals, onCardClick, onDragStart, onDrop }) => {
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

    return (
        <div
            onDrop={(e) => onDrop(e, stage.id)}
            onDragOver={handleDragOver}
            className="w-72 flex-shrink-0 bg-hover-bg/50 rounded-lg"
        >
            <div className="p-3 border-b border-border-subtle">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-text-primary">{stage.name} ({deals.length})</h3>
                    <span className="text-sm font-medium text-text-secondary">
                        {totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
                </div>
            </div>
            <div className="p-3 h-full overflow-y-auto">
                {deals.map(deal => (
                    <DealCard
                        key={deal.id}
                        deal={deal}
                        onClick={onCardClick}
                        onDragStart={onDragStart}
                    />
                ))}
            </div>
        </div>
    );
};

export default DealColumn;