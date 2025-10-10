import React from 'react';
import { AnyContact, ContactChurnPrediction } from '../../types';
import Modal from '../ui/Modal';
import { Bot, TrendingUp, TrendingDown, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ChurnPredictionModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: AnyContact;
    prediction: ContactChurnPrediction;
}

const ChurnPredictionModal: React.FC<ChurnPredictionModalProps> = ({ isOpen, onClose, contact, prediction }) => {
    
    const getRiskPresentation = (risk: ContactChurnPrediction['risk']) => {
        if (risk === 'High') return { color: 'text-error', text: 'High Risk' };
        if (risk === 'Medium') return { color: 'text-warning', text: 'Medium Risk' };
        return { color: 'text-success', text: 'Low Risk' };
    };

    const riskInfo = getRiskPresentation(prediction.risk);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`AI Churn Prediction: ${contact.contactName}`} size="lg">
            <div className="space-y-6">
                <div className="text-center p-6 bg-hover-bg rounded-lg">
                    <p className="text-sm font-medium text-text-secondary">Predicted Churn Risk</p>
                    <p className={`text-4xl font-bold ${riskInfo.color}`}>
                        {riskInfo.text}
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                            <ShieldCheck size={18} className="text-success" />
                            Retention Factors
                        </h4>
                        <ul className="space-y-1 text-sm text-text-secondary list-disc list-inside">
                            {prediction.factors.positive.map((factor, i) => <li key={i}>{factor}</li>)}
                            {prediction.factors.positive.length === 0 && <li>No significant positive factors identified.</li>}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                            <AlertTriangle size={18} className="text-error" />
                            Churn Risks
                        </h4>
                        <ul className="space-y-1 text-sm text-text-secondary list-disc list-inside">
                             {prediction.factors.negative.map((factor, i) => <li key={i}>{factor}</li>)}
                             {prediction.factors.negative.length === 0 && <li>No significant risks identified.</li>}
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
                        <p>{prediction.nextBestAction}</p>
                    </div>
                </div>

            </div>
        </Modal>
    );
};

export default ChurnPredictionModal;