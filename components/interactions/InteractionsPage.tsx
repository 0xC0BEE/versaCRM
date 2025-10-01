import React from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
// FIX: Corrected the import path for DataContext to be a valid relative path.
import { useData } from '../../contexts/DataContext';
import InteractionsTimeline from '../common/InteractionsTimeline';
// FIX: Corrected the import path for types to be a valid relative path.
import { Interaction } from '../../types';

const InteractionsPage: React.FC = () => {
    const { interactionsQuery } = useData();
    const { data: interactions = [], isLoading } = interactionsQuery;

    return (
        <PageWrapper>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">All Interactions</h1>
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