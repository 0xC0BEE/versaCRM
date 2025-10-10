
import React, { useState } from 'react';
import Tabs from '../ui/Tabs';
import ApiKeysSettings from './ApiKeysSettings';
import IntegrationsSettings from './IntegrationsSettings';

const ApiAndAppsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('API Keys');
    const tabs = ['API Keys', 'Integrations'];

    return (
        <div>
            <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="mt-6">
                {activeTab === 'API Keys' && <ApiKeysSettings />}
                {activeTab === 'Integrations' && <IntegrationsSettings />}
            </div>
        </div>
    );
};

export default ApiAndAppsPage;
