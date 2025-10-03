import React, { useState, useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
// FIX: Corrected import path for types.
import { Deal, DealStage } from '../../types';
import DealColumn from './DealColumn';
import DealEditModal from './DealEditModal';
import LoadingSpinner from '../ui/LoadingSpinner';

const DealsPage: React.FC = () => {
    const { dealStagesQuery, dealsQuery, updateDealMutation } = useData();
    const { data: stages = [], isLoading: stagesLoading } = dealStagesQuery;
    const { data: deals = [], isLoading: dealsLoading } = dealsQuery;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

    const handleAddDeal = () => {
        setSelectedDeal(null);
        setIsModalOpen(true);
    };
    
    const handleEditDeal = (deal: Deal) => {
        setSelectedDeal(deal);
        setIsModalOpen(true);
    }
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, dealId: string) => {
        e.dataTransfer.setData("dealId", dealId);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, stageId: string) => {
        e.preventDefault();
        const dealId = e.dataTransfer.getData("dealId");
        const deal = deals.find((d: Deal) => d.id === dealId);
        
        if (deal && deal.stageId !== stageId) {
            updateDealMutation.mutate({ ...deal, stageId });
        }
    };
    
    const dealsByStage = useMemo(() => {
        const grouped: { [key: string]: Deal[] } = {};
        stages.forEach((stage: DealStage) => {
            grouped[stage.id] = [];
        });
        deals.forEach((deal: Deal) => {
            if (grouped[deal.stageId]) {
                grouped[deal.stageId].push(deal);
            }
        });
        return grouped;
    }, [deals, stages]);

    const isLoading = stagesLoading || dealsLoading;

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Deals Pipeline</h1>
                <Button onClick={handleAddDeal} leftIcon={<Plus size={16} />}>
                    New Deal
                </Button>
            </div>

            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {stages.sort((a:DealStage, b:DealStage) => a.order - b.order).map((stage: DealStage) => (
                        <DealColumn
                            key={stage.id}
                            stage={stage}
                            deals={dealsByStage[stage.id] || []}
                            onCardClick={handleEditDeal}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                        />
                    ))}
                </div>
            )}
            
            <DealEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                deal={selectedDeal}
            />
        </PageWrapper>
    );
};

export default DealsPage;