import React, { useState, useMemo, useEffect } from 'react';
import PageWrapper from '../layout/PageWrapper';
import { useData } from '../../contexts/DataContext';
import { Deal, DealStage, DealForecast, NextBestAction, AnyContact } from '../../types';
import Button from '../ui/Button';
import { Plus, Bot, ChevronDown } from 'lucide-react';
import DealColumn from './DealColumn';
import DealEditModal from './DealEditModal';
import DealForecastModal from './DealForecastModal';
import ContactDetailModal from '../organizations/ContactDetailModal';
import { useApp } from '../../contexts/AppContext';
import CreateProjectFromDealModal from './CreateProjectFromDealModal';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardContent } from '../ui/Card';
import DealCard from './DealCard';

const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    return isMobile;
};


const DealsPage: React.FC = () => {
    const { dealsQuery, dealStagesQuery, updateDealMutation, contactsQuery, organizationSettingsQuery } = useData();
    const { setCallContact, setIsCallModalOpen, isFeatureEnabled, initialRecordLink, setInitialRecordLink } = useApp();
    const { data: deals = [], isLoading: dealsLoading } = dealsQuery;
    const { data: stages = [], isLoading: stagesLoading } = dealStagesQuery;
    const { data: contacts = [] } = contactsQuery;
    const { data: settings } = organizationSettingsQuery;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [isForecasting, setIsForecasting] = useState(false);
    const [forecastModalData, setForecastModalData] = useState<{ deal: Deal, forecast: DealForecast } | null>(null);
    const [contactModalData, setContactModalData] = useState<{ contact: AnyContact | null, initialTab?: string, initialTemplateId?: string }>({ contact: null });
    const [dealToCreateProjectFrom, setDealToCreateProjectFrom] = useState<Deal | null>(null);
    const [openStages, setOpenStages] = useState<Record<string, boolean>>({});

    const isMobile = useIsMobile();

    const sortedStages = useMemo(() => {
        return (stages as DealStage[]).sort((a, b) => a.order - b.order);
    }, [stages]);
    
    const handleCardClick = (deal: Deal) => {
        setSelectedDeal(deal);
        setIsModalOpen(true);
    };

    useEffect(() => {
        if (initialRecordLink?.page === 'Deals' && initialRecordLink.recordId && deals.length > 0) {
            const dealToOpen = (deals as Deal[]).find(d => d.id === initialRecordLink.recordId);
            if (dealToOpen) {
                handleCardClick(dealToOpen);
            }
            setInitialRecordLink(null);
        }
    }, [initialRecordLink, deals, setInitialRecordLink]);
    
    const handleAdd = () => {
        setSelectedDeal(null);
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
            
            const wonStage = (stages as DealStage[]).find(s => s.id === stageId && s.name === 'Won');
            if (wonStage) {
                setDealToCreateProjectFrom(dealToMove);
                if (settings?.accounting?.isConnected) {
                    toast.success(`Invoice created in QuickBooks for "${dealToMove.name}"`);
                }
            }
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

    const toggleStage = (stageId: string) => {
        setOpenStages(prev => ({...prev, [stageId]: !prev[stageId]}));
    };

    const isLoading = dealsLoading || stagesLoading;
    
    const MobileView = () => (
        <div className="space-y-3">
            {sortedStages.map(stage => {
                const stageDeals = (deals as Deal[]).filter(d => d.stageId === stage.id);
                if (stageDeals.length === 0) return null;
                const totalValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);

                return (
                    <Card key={stage.id} className="overflow-hidden">
                        <CardHeader 
                            className="p-3 flex-row justify-between items-center cursor-pointer"
                            onClick={() => toggleStage(stage.id)}
                        >
                            <div>
                                <h3 className="font-semibold text-text-primary">{stage.name} ({stageDeals.length})</h3>
                                <p className="text-xs text-text-secondary font-medium">
                                    {totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </p>
                            </div>
                            <ChevronDown size={20} className={`transition-transform ${openStages[stage.id] ? 'rotate-180' : ''}`} />
                        </CardHeader>
                        {openStages[stage.id] && (
                            <CardContent className="p-3 border-t border-border-subtle">
                                <div className="space-y-3">
                                    {stageDeals.map(deal => (
                                        <DealCard
                                            key={deal.id}
                                            deal={deal}
                                            isDraggable={false}
                                            onDragStart={() => {}} // No-op on mobile
                                            onClick={handleCardClick}
                                            isForecasting={isForecasting}
                                            onOpenForecast={handleOpenForecast}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        )}
                    </Card>
                )
            })}
        </div>
    );

    const DesktopView = () => (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {sortedStages.map(stage => (
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
            ))}
        </div>
    );

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-text-heading">Deals Pipeline</h1>
                <div className="flex items-center gap-2">
                    {isFeatureEnabled('aiPredictiveForecasting') && (
                        <Button
                            variant={isForecasting ? 'primary' : 'secondary'}
                            onClick={() => setIsForecasting(!isForecasting)}
                            leftIcon={<Bot size={16} />}
                        >
                            AI Forecast
                        </Button>
                    )}
                    <Button onClick={handleAdd} leftIcon={<Plus size={16} />}>
                        New Deal
                    </Button>
                </div>
            </div>
            
            {isLoading ? (
                <p>Loading pipeline...</p>
            ) : isMobile ? <MobileView /> : <DesktopView />}

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

            {dealToCreateProjectFrom && (
                <CreateProjectFromDealModal
                    isOpen={!!dealToCreateProjectFrom}
                    onClose={() => setDealToCreateProjectFrom(null)}
                    deal={dealToCreateProjectFrom}
                />
            )}
        </PageWrapper>
    );
};

export default DealsPage;
