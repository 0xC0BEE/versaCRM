import React, { useState } from 'react';
// FIX: Corrected import path for types.
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
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        setIsOver(false);
        onDrop(e, stage.id);
    }

    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-80 flex-shrink-0 bg-gray-100 dark:bg-dark-bg rounded-lg p-3 transition-colors ${isOver ? 'bg-primary-100 dark:bg-primary-900/50' : ''}`}
        >
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800 dark:text-white">{stage.name}</h3>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{deals.length}</span>
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">
                {totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
            <div className="space-y-3 h-full">
                {deals.map(deal => (
                    <DealCard 
                        key={deal.id} 
                        deal={deal} 
                        onClick={() => onCardClick(deal)}
                        onDragStart={(e) => onDragStart(e, deal.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default DealColumn;