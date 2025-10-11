import React from 'react';
import { Deal, DealForecast, NextBestAction } from '../../types';
import Modal from '../ui/Modal';
import { Bot, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

interface DealForecastModalProps {
    isOpen: boolean;
    onClose: () => void;
    deal: Deal;
    forecast: DealForecast;
    onTakeAction: (action: Omit<NextBestAction, 'contactId'>) => void;
}

const DealForecastModal: React.FC<DealForecastModalProps> = ({ isOpen, onClose, deal, forecast, onTakeAction }) => {
    
    const getProbabilityPresentation = (prob: number) => {
        if (prob > 70) return { color: 'text-success', text: 'High' };
        if (prob > 40) return { color: 'text-warning', text: 'Medium' };
        return { color: 'text-error', text: 'Low' };
    };

    const probInfo = getProbabilityPresentation(forecast.probability);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`AI Forecast: ${deal.name}`} size="lg">
            <div className="space-y-6">
                <div className="text-center p-6 bg-hover-bg rounded-lg">
                    <p className="text-sm font-medium text-text-secondary">Predicted Win Probability</p>
                    <p className={`text-4xl font-bold ${probInfo.color}`}>
                        {forecast.probability}% <span className="text-2xl">({probInfo.text})</span>
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                            <TrendingUp size={18} className="text-success" />
                            Positive Factors
                        </h4>
                        <ul className="space-y-1 text-sm text-text-secondary list-disc list-inside">
                            {forecast.factors.positive.map((factor, i) => <li key={i}>{factor}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                            <TrendingDown size={18} className="text-error" />
                            Negative Factors (Risks)
                        </h4>
                        <ul className="space-y-1 text-sm text-text-secondary list-disc list-inside">
                             {forecast.factors.negative.map((factor, i) => <li key={i}>{factor}</li>)}
                        </ul>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Bot size={18} className="text-primary" />
                        Next Best Action
                    </h4>
                    <div className="p-3 bg-primary/10 rounded-md text-primary text-sm font-medium flex items-start gap-2">
                        <ArrowRight size={16} className="mt-0.5 flex-shrink-0" />
                        <p>{forecast.nextBestAction.reason}</p>
                    </div>
                </div>

            </div>
            <div className="mt-6 pt-4 border-t border-border-subtle flex justify-end">
                <Button onClick={() => onTakeAction(forecast.nextBestAction)} disabled={!forecast.nextBestAction}>
                    {forecast.nextBestAction.action} <ArrowRight size={16} className="ml-2" />
                </Button>
            </div>
        </Modal>
    );
};

export default DealForecastModal;