import React from 'react';
import PageWrapper from '../layout/PageWrapper';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import { useApp } from '../../contexts/AppContext';

// FIX: Added props interface to accept isTabbedView
interface DashboardPageProps {
    isTabbedView?: boolean;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ isTabbedView = false }) => {
    const { authenticatedUser } = useAuth();
    const { currentIndustry } = useApp();

    const content = (
        <>
            {!isTabbedView && <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Dashboard</h1>}
            <Card>
                <h2 className="text-xl font-semibold">Welcome, {authenticatedUser?.name}!</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">You are logged in as a <span className="font-medium text-primary-600">{authenticatedUser?.role}</span>.</p>
                {authenticatedUser?.role === 'Super Admin' && (
                     <p className="mt-1 text-gray-600 dark:text-gray-400">Currently viewing the <span className="font-medium text-primary-600">{currentIndustry}</span> industry dashboard.</p>
                )}
            </Card>
        </>
    );

    if (isTabbedView) {
        return content;
    }

    return (
        <PageWrapper>
           {content}
        </PageWrapper>
    );
};

export default DashboardPage;
