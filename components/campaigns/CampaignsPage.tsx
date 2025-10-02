import React from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import { Bot } from 'lucide-react';

const CampaignsPage: React.FC = () => {
    return (
        <PageWrapper>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Campaigns</h1>
            <Card>
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                    <Bot className="mx-auto h-16 w-16 text-gray-400" />
                    <h2 className="mt-4 text-lg font-semibold">Campaigns Coming Soon</h2>
                    <p className="mt-2 text-sm">This feature is under construction. Check back later to manage your marketing campaigns!</p>
                </div>
            </Card>
        </PageWrapper>
    );
};

export default CampaignsPage;
