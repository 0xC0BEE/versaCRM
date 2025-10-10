import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnyContact, ContactChurnPrediction } from '../../types';
import apiClient from '../../services/apiClient';
import { Loader } from 'lucide-react';

interface ChurnPredictionDisplayProps {
    contact: AnyContact;
    onOpenPrediction: (contact: AnyContact, prediction: ContactChurnPrediction) => void;
}

const ChurnPredictionDisplay: React.FC<ChurnPredictionDisplayProps> = ({ contact, onOpenPrediction }) => {
    const { data: prediction, isLoading } = useQuery<ContactChurnPrediction, Error>({
        queryKey: ['contactChurnPrediction', contact.id],
        queryFn: () => apiClient.getContactChurnPrediction(contact.id),
        staleTime: 5 * 60 * 1000,
        enabled: contact.status === 'Active' || contact.status === 'Needs Attention' || contact.status === 'Inactive',
    });

    if (isLoading) {
        return <Loader size={14} className="animate-spin text-text-secondary mx-auto" />;
    }

    if (!prediction) {
        return <span className="text-xs text-text-secondary">-</span>;
    }
    
    const getBackgroundColor = (risk: ContactChurnPrediction['risk']) => {
        if (risk === 'High') return 'bg-error/20 text-error-dark border-error/30';
        if (risk === 'Medium') return 'bg-warning/20 text-warning-dark border-warning/30';
        return 'bg-success/20 text-success-dark border-success/30';
    };

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onOpenPrediction(contact, prediction);
            }}
            className={`px-2 py-0.5 rounded-full text-xs font-bold border transition-all ${getBackgroundColor(prediction.risk)}`}
        >
            {prediction.risk}
        </button>
    );
};

export default ChurnPredictionDisplay;