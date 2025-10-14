import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnyContact, NextBestAction } from '../../types';
import apiClient from '../../services/apiClient';
import { Loader, Wand2, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { useApp } from '../../contexts/AppContext';

interface NextBestActionDisplayProps {
    contact: AnyContact;
    onTakeAction: (action: NextBestAction) => void;
}

const NextBestActionDisplay: React.FC<NextBestActionDisplayProps> = ({ contact, onTakeAction }) => {
    const { isFeatureEnabled } = useApp();

    const { data: nextAction, isLoading, isError } = useQuery<NextBestAction, Error>({
        queryKey: ['nextBestAction', contact.id],
        queryFn: () => apiClient.getContactNextBestAction(contact.id),
        enabled: !!contact.id && isFeatureEnabled('aiNextBestAction'),
        staleTime: 2 * 60 * 1000, // Stale after 2 mins
    });

    if (!isFeatureEnabled('aiNextBestAction')) {
        return null;
    }

    if (isLoading) {
        return (
             <div className="p-3 bg-primary/5 rounded-lg flex items-center gap-3 animate-pulse">
                <Loader size={18} className="text-primary/50 animate-spin" />
                <div className="space-y-1">
                    <div className="h-3 w-24 bg-primary/10 rounded"></div>
                    <div className="h-2 w-32 bg-primary/10 rounded"></div>
                </div>
            </div>
        );
    }

    if (isError || !nextAction) {
        return null;
    }

    return (
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-0.5">
                    <Wand2 size={18} className="text-primary" />
                </div>
                <div className="flex-grow">
                    <h4 className="text-sm font-semibold text-primary">{nextAction.action}</h4>
                    <p className="text-xs text-primary/80">{nextAction.reason}</p>
                </div>
                 <Button size="sm" onClick={() => onTakeAction(nextAction)} className="self-start">
                    Take Action <ArrowRight size={14} className="ml-1" />
                </Button>
            </div>
        </div>
    );
};

export default NextBestActionDisplay;