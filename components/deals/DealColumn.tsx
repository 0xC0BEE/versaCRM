import React, { useMemo } from 'react';
import { Deal, DealStage, DealForecast } from '../../types';
import DealCard from './DealCard';

interface DealColumnProps {
    stage: DealStage;
    deals: Deal[];
    onCardClick: (deal: Deal) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, dealId: string) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, stageId: string) => void;
    isForecasting: boolean;
    onOpenForecast: (deal: Deal, forecast: DealForecast) => void;
}

const DealColumn: React.FC<DealColumnProps> = ({ stage, deals, onCardClick, onDragStart, onDrop, isForecasting, onOpenForecast }) => {
    
    const totalValue = useMemo(() => {
        return deals.reduce((sum, deal) => sum + deal.value, 0);
    }, [deals]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    return (
        <div 
            className="w-72 flex-shrink-0 bg-hover-bg rounded-lg p-3"
            onDrop={(e) => onDrop(e, stage.id)}
            onDragOver={handleDragOver}
        >
            <div className="px-1 mb-3">
                <h3 className="font-semibold text-text-primary">{stage.name} ({deals.length})</h3>
                <p className="text-xs text-text-secondary font-medium">
                    {totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
            </div>
            <div className="space-y-3 h-full overflow-y-auto">
                {deals.map(deal => (
                    <DealCard
                        key={deal.id}
                        deal={deal}
                        onDragStart={onDragStart}
                        onClick={onCardClick}
                        isForecasting={isForecasting}
                        onOpenForecast={onOpenForecast}
                    />
                ))}
            </div>
        </div>
    );
};

export default DealColumn;