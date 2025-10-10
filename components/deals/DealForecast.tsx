import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Deal, DealForecast } from '../../types';
import apiClient from '../../services/apiClient';
import { Loader } from 'lucide-react';

interface DealForecastDisplayProps {
    deal: Deal;
    onOpenForecast: (deal: Deal, forecast: DealForecast) => void;
}

const DealForecastDisplay: React.FC<DealForecastDisplayProps> = ({ deal, onOpenForecast }) => {
    const { data: forecast, isLoading } = useQuery<DealForecast, Error>({
        queryKey: ['dealForecast', deal.id],
        queryFn: () => apiClient.getDealForecast(deal.id),
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-12 h-6">
                <Loader size={14} className="animate-spin text-text-secondary" />
            </div>
        );
    }

    if (!forecast) {
        return null;
    }
    
    const getBackgroundColor = (prob: number) => {
        if (prob > 70) return 'bg-success/20 text-success-dark border-success/30';
        if (prob > 40) return 'bg-warning/20 text-warning-dark border-warning/30';
        return 'bg-error/20 text-error-dark border-error/30';
    };
    
    const glowColor = forecast.probability > 70 ? 'shadow-glow-success' : 'shadow-none';

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onOpenForecast(deal, forecast);
            }}
            className={`px-2 py-0.5 rounded-full text-xs font-bold border transition-all ${getBackgroundColor(forecast.probability)} ${glowColor}`}
        >
            {forecast.probability}%
        </button>
    );
};

export default DealForecastDisplay;