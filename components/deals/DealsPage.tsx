import React, { useState, useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
import { useData } from '../../contexts/DataContext';
import { Deal, DealStage, DealForecast, NextBestAction, AnyContact } from '../../types';
import Button from '../ui/Button';
import { Plus, Bot } from 'lucide-react';
import DealColumn from './DealColumn';
import DealEditModal from './DealEditModal';
import DealForecastModal from './DealForecastModal';
import ContactDetailModal from '../organizations/ContactDetailModal';
import { useApp } from '../../contexts/AppContext';

const DealsPage: React.FC = () => {
    const { dealsQuery, dealStagesQuery, updateDealMutation, contactsQuery } = useData();
    const { setCallContact, setIsCallModalOpen } = useApp();
    const { data: deals = [], isLoading: dealsLoading } = dealsQuery;
    const { data: stages = [], isLoading: stagesLoading } = dealStagesQuery;
    const { data: contacts = [] } = contactsQuery;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [isForecasting, setIsForecasting] = useState(false);
    const [forecastModalData, setForecastModalData] = useState<{ deal: Deal, forecast: DealForecast } | null>(null);
    const [contactModalData, setContactModalData] = useState<{ contact: AnyContact | null, initialTab?: string, initialTemplateId?: string }>({ contact: null });

    const sortedStages = useMemo(() => {
        return (stages as DealStage[]).sort((a, b) => a.order - b.order);
    }, [stages]);
    
    const handleAdd = () => {
        setSelectedDeal(null);
        setIsModalOpen(true);
    };

    const handleCardClick = (deal: Deal) => {
        setSelectedDeal(deal);
        setIsModalOpen(true);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, dealId: string) => {
        e.dataTransfer.setData('dealId', dealId);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, stageId: string) => {
        e.preventDefault();
        const dealId = e.dataTransfer.getData('dealId');
        const dealToMove = (deals as Deal[]).find(d => d.id === dealId);
        if (dealToMove && dealToMove.stageId !== stageId) {
            updateDealMutation.mutate({ ...dealToMove, stageId });
        }
    };
    
    const handleOpenForecast = (deal: Deal, forecast: DealForecast) => {
        setForecastModalData({ deal, forecast });
    };

    const handleTakeAction = (action: Omit<NextBestAction, 'contactId'>) => {
        const deal = forecastModalData?.deal;
        if (!deal) return;
        
        const contact = (contacts as AnyContact[]).find(c => c.id === deal.contactId);
        if (!contact) return;

        setForecastModalData(null); // Close forecast modal

        if (action.action === 'Email') {
            setContactModalData({
                contact: contact,
                initialTab: 'Email',
                initialTemplateId: action.templateId,
            });
        } else if (action.action === 'Call') {
            setCallContact(contact);
            setIsCallModalOpen(true);
        }
    };

    const isLoading = dealsLoading || stagesLoading;

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
                    <Button onClick={handleAdd} leftIcon={<Plus size={16} />}>
                        New Deal
                    </Button>
                </div>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4">
                {isLoading ? (
                    <p>Loading pipeline...</p>
                ) : (
                    sortedStages.map(stage => (
                        <DealColumn
                            key={stage.id}
                            stage={stage}
                            deals={(deals as Deal[]).filter(d => d.stageId === stage.id)}
                            onCardClick={handleCardClick}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                            isForecasting={isForecasting}
                            onOpenForecast={handleOpenForecast}
                        />
                    ))
                )}
            </div>

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
                    onTakeAction={handleTakeAction}
                />
            )}
            
            {contactModalData.contact && (
                 <ContactDetailModal
                    isOpen={!!contactModalData.contact}
                    onClose={() => setContactModalData({ contact: null })}
                    contact={contactModalData.contact}
                    onSave={() => {}} // Not needed for this action
                    onDelete={() => {}} // Not needed for this action
                    isSaving={false}
                    isDeleting={false}
                    initialActiveTab={contactModalData.initialTab}
                    initialTemplateId={contactModalData.initialTemplateId}
                />
            )}
        </PageWrapper>
    );
};

export default DealsPage;