
import React from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
import InteractionsTimeline from '../common/InteractionsTimeline';
// FIX: Corrected import path for types.
import { Interaction } from '../../types';

const InteractionsPage: React.FC = () => {
    // FIX: Used the correct query for all interactions and destructured its result.
    const { allInteractionsQuery } = useData();
    const { data: interactions = [], isLoading } = allInteractionsQuery;

    return (
        <PageWrapper>
            <h1 className="text-2xl font-semibold text-text-heading mb-6">All Interactions</h1>
            <Card>
                {isLoading ? (
                    <div className="p-8 text-center">Loading interactions...</div>
                ) : (
                    <InteractionsTimeline interactions={interactions as Interaction[]} />
                )}
            </Card>
        </PageWrapper>
    );
};

export default InteractionsPage;