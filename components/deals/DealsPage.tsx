import React, { useState, useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Button from '../ui/Button';
import { Plus, Bot } from 'lucide-react';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
// FIX: Corrected import path for types.
import { Deal, DealStage, DealForecast } from '../../types';
import DealColumn from './DealColumn';
// FIX: Corrected import path for DealEditModal.
import DealEditModal from './DealEditModal';
import LoadingSpinner from '../ui/LoadingSpinner';
import DealForecastModal from './DealForecastModal';

const DealsPage: React.FC = () => {
    const { dealStagesQuery, dealsQuery, updateDealMutation } = useData();
    const { data: stages = [], isLoading: stagesLoading } = dealStagesQuery;
    const { data: deals = [], isLoading: dealsLoading } = dealsQuery;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [isForecasting, setIsForecasting] = useState(false);
    const [forecastModalData, setForecastModalData] = useState<{deal: Deal, forecast: DealForecast} | null>(null);

    const handleAddDeal = () => {
        setSelectedDeal(null);
        setIsModalOpen(true);
    };
    
    const handleEditDeal = (deal: Deal) => {
        setSelectedDeal(deal);
        setIsModalOpen(true);
    }

    const handleOpenForecast = (deal: Deal, forecast: DealForecast) => {
        setForecastModalData({ deal, forecast });
    };
    
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
                <h1 className="text-2xl font-semibold text-text-heading">Deals Pipeline</h1>
                <div className="flex items-center gap-2">
                    <Button 
                        variant={isForecasting ? 'primary' : 'secondary'}
                        onClick={() => setIsForecasting(!isForecasting)} 
                        leftIcon={<Bot size={16} />}
                    >
                        AI Forecast
                    </Button>
                    <Button onClick={handleAddDeal} leftIcon={<Plus size={16} />}>
                        New Deal
                    </Button>
                </div>
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
                            isForecasting={isForecasting}
                            onOpenForecast={handleOpenForecast}
                        />
                    ))}
                </div>
            )}
            
            <DealEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                deal={selectedDeal}
            />

            {forecastModalData && (
                <DealForecastModal
                    isOpen={!!forecastModalData}
                    onClose={() => setForecastModalData(null)}
                    deal={forecastModalData.deal}
                    forecast={forecastModalData.forecast}
                />
            )}
        </PageWrapper>
    );
};

export default DealsPage;